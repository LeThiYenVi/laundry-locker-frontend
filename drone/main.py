"""
Main Entry Point - Precision Landing System
Raspberry Pi 5 + GS Camera (IMX296)

Pipeline:
  Camera → ArUco Detection → Pose Estimation → Landing Decision → MAVLink TX

Chạy:
  python main.py
  python main.py --no-mavlink   (chỉ test camera, không cần FC)
  python main.py --preview      (hiện cửa sổ preview, cần màn hình)
"""

import os
import sys
import time
import signal
import logging
import argparse
import threading
from typing import Optional

import cv2
import numpy as np

import config
from aruco_detector import ArucoDetector, LandingResult
from mavlink_comm import MAVLinkComm

# ─────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("main")


# ─────────────────────────────────────────────────────────────────
# Camera init (picamera2 ưu tiên, fallback về OpenCV V4L2)
# ─────────────────────────────────────────────────────────────────

def init_camera():
    """
    Khởi tạo camera. Ưu tiên picamera2 (native Pi 5 API).
    Nếu không có, fallback về /dev/video0 qua OpenCV.
    """
    try:
        from picamera2 import Picamera2
        cam = Picamera2()
        cfg = cam.create_video_configuration(
            main={
                "size":   (config.CAMERA_WIDTH, config.CAMERA_HEIGHT),
                "format": "BGR888",
            },
            controls={"FrameRate": config.CAMERA_FPS},
        )
        cam.configure(cfg)
        cam.start()
        logger.info(
            "Camera: picamera2 | %dx%d @ %dfps",
            config.CAMERA_WIDTH, config.CAMERA_HEIGHT, config.CAMERA_FPS
        )

        def read_frame():
            return cam.capture_array()

        def release():
            cam.stop()

        return read_frame, release, "picamera2"

    except ImportError:
        logger.warning("picamera2 không có, dùng OpenCV VideoCapture")
        cap = cv2.VideoCapture(0, cv2.CAP_V4L2)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH,  config.CAMERA_WIDTH)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.CAMERA_HEIGHT)
        cap.set(cv2.CAP_PROP_FPS,          config.CAMERA_FPS)
        cap.set(cv2.CAP_PROP_BUFFERSIZE,   1)    # giảm latency

        if not cap.isOpened():
            raise RuntimeError("Không mở được camera /dev/video0")

        def read_frame():
            ret, frame = cap.read()
            if not ret:
                raise RuntimeError("Camera read failed")
            return frame

        def release():
            cap.release()

        logger.info(
            "Camera: V4L2 | %dx%d",
            int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        )
        return read_frame, release, "v4l2"


# ─────────────────────────────────────────────────────────────────
# Load calibration kết quả nếu có
# ─────────────────────────────────────────────────────────────────

def load_calibration_if_exists():
    """
    Nếu calibration_result.npz tồn tại, ghi đè lên config
    để dùng giá trị chính xác thay vì placeholder.
    """
    cal_file = os.path.join(os.path.dirname(__file__), "calibration_result.npz")
    if not os.path.exists(cal_file):
        logger.warning(
            "Không tìm thấy calibration_result.npz - đang dùng giá trị mặc định. "
            "Chạy camera_calibration.py để hiệu chỉnh camera."
        )
        return

    data = np.load(cal_file)
    config.CAMERA_MATRIX = data["camera_matrix"]
    config.DIST_COEFFS   = data["dist_coeffs"]
    logger.info(
        "Loaded calibration | RMS=%.4f px", float(data["rms"])
    )


# ─────────────────────────────────────────────────────────────────
# Stats
# ─────────────────────────────────────────────────────────────────

class Stats:
    """Thống kê FPS và tỉ lệ phát hiện."""

    def __init__(self, window: int = 100):
        self._times    = []
        self._detected = []
        self._window   = window

    def record(self, dt: float, detected: bool):
        self._times.append(dt)
        self._detected.append(detected)
        if len(self._times) > self._window:
            self._times.pop(0)
            self._detected.pop(0)

    @property
    def fps(self) -> float:
        if not self._times:
            return 0.0
        return 1.0 / (sum(self._times) / len(self._times))

    @property
    def detection_rate(self) -> float:
        if not self._detected:
            return 0.0
        return sum(self._detected) / len(self._detected) * 100


# ─────────────────────────────────────────────────────────────────
# Main loop
# ─────────────────────────────────────────────────────────────────

class PrecisionLandingSystem:

    def __init__(self, use_mavlink: bool = True, show_preview: bool = False):
        self._use_mavlink   = use_mavlink
        self._show_preview  = show_preview
        self._running       = False

        self._detector = ArucoDetector()
        self._mavlink: Optional[MAVLinkComm] = None
        self._stats = Stats()

        self._read_frame = None
        self._release_cam = None

        # Rate limiter cho MAVLink TX
        self._mav_interval  = 1.0 / config.LANDING_TARGET_HZ
        self._last_mav_time = 0.0

        # Graceful shutdown
        signal.signal(signal.SIGINT,  self._handle_signal)
        signal.signal(signal.SIGTERM, self._handle_signal)

    def _handle_signal(self, signum, frame):
        logger.info("Nhận tín hiệu %d, đang dừng...", signum)
        self._running = False

    def start(self):
        load_calibration_if_exists()

        # Init camera
        self._read_frame, self._release_cam, cam_backend = init_camera()

        # Init MAVLink
        if self._use_mavlink:
            self._mavlink = MAVLinkComm()
            if not self._mavlink.connect():
                logger.error("Không kết nối được MAVLink. Chạy với --no-mavlink để bỏ qua.")
                sys.exit(1)
            self._mavlink.request_data_streams()

        self._running = True
        logger.info("=== Precision Landing System STARTED ===")
        logger.info(
            "Marker size: %.2fm | Land alt: ≤%.2fm | Land radius: ≤%.2fm",
            config.ARUCO_MARKER_SIZE_M,
            config.ALTITUDE_LAND_THRESHOLD_M,
            config.RADIUS_LAND_THRESHOLD_M,
        )

        self._loop()

    def _loop(self):
        frame_start = time.time()

        while self._running:
            t0 = time.time()

            # ── Capture ─────────────────────────────
            try:
                frame = self._read_frame()
            except Exception as exc:
                logger.error("Camera error: %s", exc)
                break

            # ── Detect + Pose ────────────────────────
            result: LandingResult = self._detector.process_frame(frame)

            # ── MAVLink TX ───────────────────────────
            now = time.time()
            if (self._mavlink and result.detected
                    and (now - self._last_mav_time) >= self._mav_interval):
                self._mavlink.send_landing_target(result)
                self._last_mav_time = now

            # ── Stats ────────────────────────────────
            dt = time.time() - t0
            self._stats.record(dt, result.detected)

            if config.VERBOSE and (time.time() - frame_start) >= 5.0:
                alt_fc = None
                mode   = None
                if self._mavlink:
                    alt_fc = self._mavlink.get_altitude_from_fc()
                    mode   = self._mavlink.get_flight_mode()

                logger.info(
                    "FPS=%.1f | detect=%.0f%% | FC_alt=%s | mode=%s",
                    self._stats.fps,
                    self._stats.detection_rate,
                    f"{alt_fc:.2f}m" if alt_fc is not None else "N/A",
                    mode or "N/A",
                )
                frame_start = time.time()

            # ── Preview ──────────────────────────────
            if self._show_preview or config.SHOW_PREVIEW:
                annotated = self._detector.draw_overlay(frame, result)
                # HUD: FPS
                cv2.putText(
                    annotated,
                    f"FPS {self._stats.fps:.1f} | detect {self._stats.detection_rate:.0f}%",
                    (10, config.CAMERA_HEIGHT - 15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (180, 180, 180), 1
                )
                cv2.imshow("Precision Landing", annotated)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    self._running = False

            # ── Debug frame save ─────────────────────
            if config.SAVE_DEBUG_FRAMES and result.detected:
                os.makedirs(config.DEBUG_FRAME_DIR, exist_ok=True)
                fname = os.path.join(
                    config.DEBUG_FRAME_DIR,
                    f"frame_{int(time.time()*1000)}.jpg"
                )
                cv2.imwrite(fname, frame)

        self._cleanup()

    def _cleanup(self):
        logger.info("Đang dọn dẹp ...")
        if self._release_cam:
            self._release_cam()
        if self._mavlink:
            self._mavlink.disconnect()
        cv2.destroyAllWindows()
        logger.info("=== Precision Landing System STOPPED ===")


# ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Precision Landing System - ArUco + MAVLink"
    )
    parser.add_argument(
        "--no-mavlink", action="store_true",
        help="Chạy chỉ với camera, không kết nối Flight Controller"
    )
    parser.add_argument(
        "--preview", action="store_true",
        help="Hiện cửa sổ preview (cần kết nối màn hình hoặc VNC)"
    )
    args = parser.parse_args()

    system = PrecisionLandingSystem(
        use_mavlink  = not args.no_mavlink,
        show_preview = args.preview,
    )
    system.start()


if __name__ == "__main__":
    main()
