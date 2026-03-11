"""
Cấu hình hệ thống Precision Landing
Raspberry Pi 5 + GS Camera (Raspberry Pi Global Shutter Camera IMX296)
"""

import numpy as np

# ─────────────────────────────────────────────────────────────────
# CAMERA SETTINGS
# ─────────────────────────────────────────────────────────────────

# Độ phân giải capture (GS Camera hỗ trợ tối đa 1456x1088)
CAMERA_WIDTH  = 1456
CAMERA_HEIGHT = 1088
CAMERA_FPS    = 60          # GS Camera có thể lên 60fps ở full res

# Camera Intrinsic Matrix [fx, 0, cx; 0, fy, cy; 0, 0, 1]
# !! Thay bằng giá trị calibration thực tế của camera sau khi chạy camera_calibration.py !!
CAMERA_MATRIX = np.array([
    [1000.0,    0.0, 728.0],
    [   0.0, 1000.0, 544.0],
    [   0.0,    0.0,   1.0]
], dtype=np.float64)

# Distortion Coefficients [k1, k2, p1, p2, k3]
# !! Thay bằng giá trị calibration thực tế !!
DIST_COEFFS = np.array([0.0, 0.0, 0.0, 0.0, 0.0], dtype=np.float64)

# ─────────────────────────────────────────────────────────────────
# ARUCO MARKER SETTINGS
# ─────────────────────────────────────────────────────────────────

# Kích thước thực của ArUco marker (đơn vị: mét)
# Đặt marker 30cm x 30cm cho bãi đỗ locker
ARUCO_MARKER_SIZE_M = 0.30      # 30 cm

# Loại dictionary ArUco đang dùng
# DICT_4X4_50  → mã 4x4, tối đa 50 marker (nhỏ gọn, nhận dạng nhanh)
# DICT_5X5_100 → độ chính xác cao hơn
ARUCO_DICT_TYPE = "DICT_4X4_50"

# ID của marker hợp lệ trên bãi đỗ (None = chấp nhận tất cả ID)
# 6 ô locker → 6 ID (khớp với generate_markers.py)
VALID_MARKER_IDS = [0, 1, 2, 3, 4, 5]  # Locker 0 → 5

# ─────────────────────────────────────────────────────────────────
# LANDING THRESHOLDS
# ─────────────────────────────────────────────────────────────────

# Độ cao tối đa cho phép bắt đầu tiếp cận (mét)
# Drone ở dưới mức này mới gửi tín hiệu LANDING_TARGET
ALTITUDE_APPROACH_MAX_M = 8.0   # 8m - bắt đầu nhận marker

# Độ cao "cho phép hạ cánh" (mét) - drone coi như đã "tới nơi"
ALTITUDE_LAND_THRESHOLD_M = 0.3  # 30cm - ra lệnh LAND

# Bán kính tối đa cho phép hạ cánh (mét)
# Nếu drone lệch tâm marker > giá trị này thì KHÔNG cho đáp
RADIUS_LAND_THRESHOLD_M = 0.15   # 15cm (tâm marker ± 15cm)

# Bán kính cảnh báo - drone cần hiệu chỉnh thêm
RADIUS_WARN_THRESHOLD_M = 0.30   # 30cm

# ─────────────────────────────────────────────────────────────────
# MAVLINK SETTINGS
# ─────────────────────────────────────────────────────────────────

# Kết nối tới Flight Controller (Pixhawk/CubeOrange)
# UART trực tiếp (GPIO14/15 của Pi 5)
MAVLINK_CONNECTION = "/dev/ttyAMA0"
MAVLINK_BAUD       = 57600

# Hoặc dùng UDP nếu dùng companion computer qua mạng
# MAVLINK_CONNECTION = "udp:127.0.0.1:14550"

# Tần số gửi LANDING_TARGET message (Hz)
LANDING_TARGET_HZ = 30

# System ID / Component ID của companion computer
SYSTEM_ID    = 1
COMPONENT_ID = 191   # MAV_COMP_ID_ONBOARD_COMPUTER

# ─────────────────────────────────────────────────────────────────
# DISPLAY / DEBUG
# ─────────────────────────────────────────────────────────────────

# Hiện cửa sổ preview (False khi chạy headless trên Pi)
SHOW_PREVIEW = False

# In log ra console
VERBOSE = True

# Lưu frame khi phát hiện marker (dùng để debug)
SAVE_DEBUG_FRAMES = False
DEBUG_FRAME_DIR   = "/tmp/drone_debug"
