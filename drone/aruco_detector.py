"""
ArUco Detector + Pose Estimator
Phát hiện marker, tính toán:
  - altitude  : khoảng cách thẳng đứng từ drone tới marker (m)
  - x_offset  : độ lệch ngang trái/phải (m)
  - y_offset  : độ lệch ngang trước/sau (m)
  - radius    : sqrt(x² + y²) - bán kính lệch tâm (m)
  - angle_x   : góc lệch trục X (rad) → dùng cho LANDING_TARGET
  - angle_y   : góc lệch trục Y (rad) → dùng cho LANDING_TARGET
  - can_land  : True/False - drone được phép hạ cánh không
"""

import math
import time
import logging
from dataclasses import dataclass, field
from typing import Optional, Tuple

import cv2
import numpy as np

import config

logger = logging.getLogger(__name__)

# Map tên dict sang hằng số OpenCV
ARUCO_DICT_MAP = {
    "DICT_4X4_50":   cv2.aruco.DICT_4X4_50,
    "DICT_4X4_100":  cv2.aruco.DICT_4X4_100,
    "DICT_5X5_50":   cv2.aruco.DICT_5X5_50,
    "DICT_5X5_100":  cv2.aruco.DICT_5X5_100,
    "DICT_6X6_50":   cv2.aruco.DICT_6X6_50,
    "DICT_6X6_100":  cv2.aruco.DICT_6X6_100,
}


@dataclass
class LandingResult:
    """Kết quả phân tích một frame."""
    detected: bool = False
    marker_id: int = -1
    timestamp: float = field(default_factory=time.time)

    # Tọa độ trong hệ tọa độ camera (mét)
    # Camera nhìn xuống: Z = chiều sâu (altitude), X = phải, Y = xuống
    x_offset: float = 0.0    # lệch ngang (+ = phải)
    y_offset: float = 0.0    # lệch dọc   (+ = xuồng ảnh / phía trước drone)
    altitude: float = 0.0    # khoảng cách tới marker (trục Z camera)

    # Bán kính lệch tâm trên mặt phẳng marker
    radius: float = 0.0

    # Góc lệch (radian) để gửi LANDING_TARGET
    angle_x: float = 0.0
    angle_y: float = 0.0

    # Trạng thái hạ cánh
    can_land: bool = False           # trong bán kính cho phép
    altitude_ok: bool = False        # độ cao đủ thấp để đáp
    status: str = "NO_MARKER"        # mô tả trạng thái

    # Góc quay của marker (euler, degrees)
    roll_deg:  float = 0.0
    pitch_deg: float = 0.0
    yaw_deg:   float = 0.0

    # Dữ liệu vẽ lên ảnh
    corners: Optional[np.ndarray] = None
    rvec: Optional[np.ndarray] = None
    tvec: Optional[np.ndarray] = None


class ArucoDetector:
    """
    Phát hiện ArUco marker và ước lượng pose 6-DOF.
    Sử dụng OpenCV contrib aruco module.
    """

    def __init__(self):
        dict_id = ARUCO_DICT_MAP.get(config.ARUCO_DICT_TYPE, cv2.aruco.DICT_4X4_50)
        self._aruco_dict = cv2.aruco.getPredefinedDictionary(dict_id)

        # Detector parameters
        params = cv2.aruco.DetectorParameters()
        params.adaptiveThreshWinSizeMin  = 3
        params.adaptiveThreshWinSizeMax  = 23
        params.adaptiveThreshWinSizeStep = 10
        params.cornerRefinementMethod    = cv2.aruco.CORNER_REFINE_SUBPIX

        self._detector = cv2.aruco.ArucoDetector(self._aruco_dict, params)

        self._camera_matrix = config.CAMERA_MATRIX
        self._dist_coeffs   = config.DIST_COEFFS
        self._marker_size   = config.ARUCO_MARKER_SIZE_M

        # 3D điểm góc marker trong hệ tọa độ marker (z=0)
        half = self._marker_size / 2.0
        self._obj_points = np.array([
            [-half,  half, 0.0],
            [ half,  half, 0.0],
            [ half, -half, 0.0],
            [-half, -half, 0.0],
        ], dtype=np.float32)

        logger.info(
            "ArucoDetector ready | dict=%s | marker=%.2fm",
            config.ARUCO_DICT_TYPE, self._marker_size
        )

    # ──────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────

    def process_frame(self, frame: np.ndarray) -> LandingResult:
        """
        Xử lý một frame BGR từ camera.
        Trả về LandingResult với đầy đủ thông tin.
        """
        result = LandingResult()

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        corners, ids, _ = self._detector.detectMarkers(gray)

        if ids is None or len(ids) == 0:
            result.status = "NO_MARKER"
            return result

        # Lọc theo VALID_MARKER_IDS
        best_corner, best_id = self._pick_best_marker(corners, ids)
        if best_corner is None:
            result.status = "INVALID_ID"
            return result

        result.detected  = True
        result.marker_id = int(best_id)
        result.corners   = best_corner

        # ── Pose estimation ──────────────────────────
        ok, rvec, tvec = cv2.solvePnP(
            self._obj_points,
            best_corner[0],
            self._camera_matrix,
            self._dist_coeffs,
            flags=cv2.SOLVEPNP_ITERATIVE,
        )
        if not ok:
            result.status = "POSE_FAIL"
            return result

        result.rvec = rvec
        result.tvec = tvec

        # ── Tọa độ (m) ──────────────────────────────
        # Camera nhìn thẳng xuống:
        #   tvec[0] = X camera = lệch sang phải (+ right)
        #   tvec[1] = Y camera = lệch xuống ảnh  (+ forward nếu camera down-facing)
        #   tvec[2] = Z camera = khoảng cách (altitude)
        tx, ty, tz = float(tvec[0]), float(tvec[1]), float(tvec[2])
        result.x_offset = tx
        result.y_offset = ty
        result.altitude  = tz
        result.radius    = math.sqrt(tx * tx + ty * ty)

        # ── Góc lệch (radian) cho LANDING_TARGET ────
        # angle = arctan(offset / distance)
        if tz > 1e-6:
            result.angle_x = math.atan2(tx, tz)
            result.angle_y = math.atan2(ty, tz)

        # ── Euler angles của marker ──────────────────
        rot_mat, _ = cv2.Rodrigues(rvec)
        result.roll_deg, result.pitch_deg, result.yaw_deg = \
            self._rotation_matrix_to_euler(rot_mat)

        # ── Đánh giá điều kiện hạ cánh ──────────────
        result.altitude_ok = (tz <= config.ALTITUDE_APPROACH_MAX_M)
        result.can_land    = (
            tz <= config.ALTITUDE_LAND_THRESHOLD_M
            and result.radius <= config.RADIUS_LAND_THRESHOLD_M
        )

        result.status = self._evaluate_status(result)

        if config.VERBOSE:
            logger.info(
                "[ID=%d] alt=%.3fm  offset=(%.3f, %.3f)m  r=%.3fm  → %s",
                result.marker_id, result.altitude,
                result.x_offset, result.y_offset,
                result.radius, result.status
            )

        return result

    def draw_overlay(self, frame: np.ndarray, result: LandingResult) -> np.ndarray:
        """
        Vẽ thông tin lên frame để debug / preview.
        Trả về frame đã annotate.
        """
        out = frame.copy()

        if not result.detected:
            cv2.putText(out, "NO MARKER", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
            return out

        # Vẽ viền marker
        cv2.aruco.drawDetectedMarkers(out, [result.corners], np.array([[result.marker_id]]))

        # Vẽ trục tọa độ marker
        if result.rvec is not None and result.tvec is not None:
            cv2.drawFrameAxes(
                out, self._camera_matrix, self._dist_coeffs,
                result.rvec, result.tvec, self._marker_size * 0.5
            )

        # HUD text
        color_status = (0, 255, 0) if result.can_land else (0, 165, 255)
        lines = [
            f"ID: {result.marker_id}          {result.status}",
            f"Alt : {result.altitude:.3f} m",
            f"Xoff: {result.x_offset:+.3f} m",
            f"Yoff: {result.y_offset:+.3f} m",
            f"Rad : {result.radius:.3f} m",
            f"angX: {math.degrees(result.angle_x):+.2f} deg",
            f"angY: {math.degrees(result.angle_y):+.2f} deg",
        ]
        for i, line in enumerate(lines):
            y = 30 + i * 28
            cv2.putText(out, line, (10, y),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.75,
                        color_status if i == 0 else (200, 200, 200), 2)

        # Vẽ vòng tròn bán kính cho phép lên ảnh (chiếu về pixel)
        self._draw_landing_circle(out, result)

        return out

    # ──────────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────────

    def _pick_best_marker(
        self, corners, ids
    ) -> Tuple[Optional[np.ndarray], int]:
        """
        Chọn marker lớn nhất (gần nhất) trong danh sách hợp lệ.
        """
        best_area  = -1.0
        best_corner = None
        best_id    = -1

        for corner, mid in zip(corners, ids.flatten()):
            if config.VALID_MARKER_IDS and int(mid) not in config.VALID_MARKER_IDS:
                continue
            pts  = corner[0]
            area = cv2.contourArea(pts)
            if area > best_area:
                best_area   = area
                best_corner = corner
                best_id     = int(mid)

        return best_corner, best_id

    @staticmethod
    def _rotation_matrix_to_euler(R: np.ndarray) -> Tuple[float, float, float]:
        """
        Chuyển rotation matrix → Euler angles (degrees).
        Trả về (roll, pitch, yaw).
        """
        sy = math.sqrt(R[0, 0] ** 2 + R[1, 0] ** 2)
        singular = sy < 1e-6
        if not singular:
            roll  = math.degrees(math.atan2( R[2, 1], R[2, 2]))
            pitch = math.degrees(math.atan2(-R[2, 0], sy))
            yaw   = math.degrees(math.atan2( R[1, 0], R[0, 0]))
        else:
            roll  = math.degrees(math.atan2(-R[1, 2], R[1, 1]))
            pitch = math.degrees(math.atan2(-R[2, 0], sy))
            yaw   = 0.0
        return roll, pitch, yaw

    @staticmethod
    def _evaluate_status(r: LandingResult) -> str:
        if r.altitude > config.ALTITUDE_APPROACH_MAX_M:
            return "TOO_HIGH"
        if r.can_land:
            return "LAND_OK"
        if r.radius <= config.RADIUS_LAND_THRESHOLD_M:
            return "DESCEND"           # trên tâm, cần hạ thêm
        if r.radius <= config.RADIUS_WARN_THRESHOLD_M:
            return "ADJUST_FINE"       # lệch nhẹ
        return "ADJUST"                # lệch nhiều, cần bay vào tâm

    def _draw_landing_circle(self, frame: np.ndarray, result: LandingResult):
        """
        Chiếu vòng tròn bán kính cho phép vào ảnh để visualize.
        """
        if result.altitude < 1e-3:
            return

        # Tính số pixel / mét tại độ cao hiện tại
        # px_per_m ≈ focal_length / altitude
        fx = self._camera_matrix[0, 0]
        px_per_m = fx / result.altitude

        # Tâm marker trong ảnh (pixel)
        cx_img = int(self._camera_matrix[0, 2])
        cy_img = int(self._camera_matrix[1, 2])

        # Điểm tâm marker chiếu lên ảnh
        if result.tvec is not None:
            # Project điểm gốc marker lên ảnh
            origin_3d = np.array([[0.0, 0.0, 0.0]], dtype=np.float64)
            img_pts, _ = cv2.projectPoints(
                origin_3d, result.rvec, result.tvec,
                self._camera_matrix, self._dist_coeffs
            )
            cx_img = int(img_pts[0][0][0])
            cy_img = int(img_pts[0][0][1])

        # Vẽ vòng tròn LAND threshold (xanh lá)
        r_land_px  = int(config.RADIUS_LAND_THRESHOLD_M * px_per_m)
        r_warn_px  = int(config.RADIUS_WARN_THRESHOLD_M * px_per_m)
        cv2.circle(frame, (cx_img, cy_img), r_land_px, (0, 255, 0),   2)
        cv2.circle(frame, (cx_img, cy_img), r_warn_px, (0, 165, 255), 1)
        cv2.drawMarker(frame, (cx_img, cy_img), (255, 255, 0),
                       cv2.MARKER_CROSS, 20, 2)
