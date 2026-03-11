"""
MAVLink Communication Module
Gửi LANDING_TARGET message tới Flight Controller (Pixhawk / CubeOrange)
để kích hoạt Precision Landing trong ArduCopter.

Cần bật trong Mission Planner / QGC:
  PLND_ENABLED  = 1
  PLND_TYPE     = 1   (companion computer)
  PLND_EST_TYPE = 0   (raw sensor)
"""

import time
import logging
import threading
from typing import Optional

from pymavlink import mavutil

import config
from aruco_detector import LandingResult

logger = logging.getLogger(__name__)


class MAVLinkComm:
    """
    Quản lý kết nối MAVLink và gửi dữ liệu landing target.
    Thread-safe: có thể gọi send() từ nhiều thread.
    """

    def __init__(self):
        self._conn: Optional[mavutil.mavfile] = None
        self._lock = threading.Lock()
        self._connected = False
        self._last_heartbeat = 0.0

    # ──────────────────────────────────────────────────
    # Connection
    # ──────────────────────────────────────────────────

    def connect(self, timeout: float = 30.0) -> bool:
        """
        Kết nối tới Flight Controller qua UART hoặc UDP.
        Trả về True nếu thành công.
        """
        logger.info("Connecting MAVLink → %s @ %d baud",
                    config.MAVLINK_CONNECTION, config.MAVLINK_BAUD)
        try:
            self._conn = mavutil.mavlink_connection(
                config.MAVLINK_CONNECTION,
                baud=config.MAVLINK_BAUD,
                source_system=config.SYSTEM_ID,
                source_component=config.COMPONENT_ID,
            )

            # Chờ heartbeat đầu tiên
            logger.info("Waiting for heartbeat ...")
            self._conn.wait_heartbeat(timeout=timeout)
            self._connected = True
            self._last_heartbeat = time.time()
            logger.info(
                "MAVLink connected | system=%d component=%d",
                self._conn.target_system, self._conn.target_component
            )
            return True

        except Exception as exc:
            logger.error("MAVLink connect failed: %s", exc)
            self._connected = False
            return False

    def disconnect(self):
        """Đóng kết nối MAVLink."""
        if self._conn:
            self._conn.close()
            self._conn = None
        self._connected = False
        logger.info("MAVLink disconnected")

    @property
    def is_connected(self) -> bool:
        return self._connected and self._conn is not None

    # ──────────────────────────────────────────────────
    # Core: Send LANDING_TARGET
    # ──────────────────────────────────────────────────

    def send_landing_target(self, result: LandingResult) -> bool:
        """
        Gửi MAVLink LANDING_TARGET (#149) cho precision landing.

        ArduCopter dùng angle_x / angle_y (radian) và distance (m)
        để tính toán vị trí và dẫn hướng drone về tâm marker.

        Frame: MAV_FRAME_BODY_NED
          angle_x > 0  → marker lệch sang phải
          angle_y > 0  → marker lệch về phía trước
        """
        if not self.is_connected:
            logger.warning("MAVLink not connected, skipping send")
            return False

        if not result.detected:
            return False

        time_usec = int(time.time() * 1e6)

        with self._lock:
            try:
                self._conn.mav.landing_target_send(
                    time_usec,              # time_usec: timestamp (us)
                    result.marker_id,       # target_num: ID marker
                    mavutil.mavlink.MAV_FRAME_BODY_NED,  # frame
                    result.angle_x,         # angle_x (rad) - lệch ngang
                    result.angle_y,         # angle_y (rad) - lệch dọc
                    result.altitude,        # distance (m) - khoảng cách
                    0.0,                    # size_x (m) - kích thước marker X
                    0.0,                    # size_y (m) - kích thước marker Y
                )
                return True

            except Exception as exc:
                logger.error("send_landing_target failed: %s", exc)
                self._connected = False
                return False

    # ──────────────────────────────────────────────────
    # Optional: gửi VISION_POSITION_ESTIMATE (EKF3)
    # ──────────────────────────────────────────────────

    def send_vision_position(self, result: LandingResult) -> bool:
        """
        Gửi vị trí ước lượng từ camera vào EKF của ArduCopter.
        Dùng khi muốn drone tự biết tọa độ tương đối mà không cần GPS.

        Chỉ dùng khi đã cấu hình:
          AHRS_EKF_TYPE = 3 (EKF3)
          EK3_SRC1_POSXY = 6 (ExternalNav)
        """
        if not self.is_connected or not result.detected:
            return False

        time_usec = int(time.time() * 1e6)

        with self._lock:
            try:
                self._conn.mav.vision_position_estimate_send(
                    time_usec,
                    result.x_offset,    # x (m) - NED frame
                    result.y_offset,    # y (m)
                    -result.altitude,   # z (m) - âm = trên mặt đất
                    0.0,                # roll  (rad)
                    0.0,                # pitch (rad)
                    0.0,                # yaw   (rad)
                    covariance=[0.0] * 21,  # covariance matrix
                    reset_counter=0,
                )
                return True
            except Exception as exc:
                logger.error("send_vision_position failed: %s", exc)
                return False

    # ──────────────────────────────────────────────────
    # Diagnostics
    # ──────────────────────────────────────────────────

    def request_data_streams(self):
        """
        Yêu cầu FC gửi thêm dữ liệu telemetry để monitor.
        Gọi một lần sau khi connect.
        """
        if not self.is_connected:
            return

        # Yêu cầu nhận GLOBAL_POSITION_INT @ 4Hz
        self._conn.mav.request_data_stream_send(
            self._conn.target_system,
            self._conn.target_component,
            mavutil.mavlink.MAV_DATA_STREAM_POSITION,
            4,   # Hz
            1,   # start
        )

    def get_altitude_from_fc(self) -> Optional[float]:
        """
        Lấy altitude hiện tại từ FC (GLOBAL_POSITION_INT).
        Trả về độ cao tương đối (m), None nếu không có.
        """
        if not self.is_connected:
            return None
        try:
            msg = self._conn.recv_match(
                type="GLOBAL_POSITION_INT", blocking=False
            )
            if msg:
                return msg.relative_alt / 1000.0   # mm → m
        except Exception:
            pass
        return None

    def get_flight_mode(self) -> Optional[str]:
        """Lấy flight mode hiện tại."""
        if not self.is_connected:
            return None
        try:
            msg = self._conn.recv_match(type="HEARTBEAT", blocking=False)
            if msg:
                return mavutil.mode_string_v10(msg)
        except Exception:
            pass
        return None
