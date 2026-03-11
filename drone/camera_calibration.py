"""
Camera Calibration Script
Hiệu chỉnh camera để có Camera Matrix và Distortion Coefficients chính xác.

Cách dùng:
  1. In checkerboard 9x7 (hoặc dùng CHECKERBOARD bên dưới)
  2. Chụp ~20 ảnh từ nhiều góc độ, khoảng cách khác nhau
  3. Để ảnh vào thư mục  calibration_images/
  4. Chạy: python camera_calibration.py --collect   (live capture từ camera)
         HOẶC
         python camera_calibration.py --calibrate  (từ ảnh đã có sẵn)
  5. Kết quả sẽ ghi vào calibration_result.npz và in ra config cho config.py
"""

import os
import sys
import glob
import argparse
import logging
import time

import cv2
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────
# Tham số checkerboard
# Số góc bên trong (inner corners), KHÔNG phải số ô
# Checkerboard 10x8 ô → inner corners = 9x7
# ─────────────────────────────────────────────────────────────────
CHECKERBOARD   = (9, 7)          # (cols, rows) inner corners
SQUARE_SIZE_M  = 0.025           # Kích thước mỗi ô (mét) - thường 2.5cm
IMAGE_DIR      = "calibration_images"
RESULT_FILE    = "calibration_result.npz"
NUM_CAPTURE    = 25              # Số ảnh cần chụp khi dùng --collect


def collect_calibration_images():
    """
    Chụp ảnh hiệu chỉnh trực tiếp từ camera (chạy trên Pi).
    Nhấn SPACE để chụp, Q để thoát.
    """
    os.makedirs(IMAGE_DIR, exist_ok=True)

    try:
        from picamera2 import Picamera2
        cam = Picamera2()
        cam.configure(cam.create_still_configuration(
            main={"size": (1456, 1088), "format": "BGR888"}
        ))
        cam.start()
        use_picamera = True
    except ImportError:
        cam = cv2.VideoCapture(0)
        cam.set(cv2.CAP_PROP_FRAME_WIDTH,  1456)
        cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 1088)
        use_picamera = False

    count = 0
    logger.info("Chụp %d ảnh. SPACE=chụp | Q=thoát", NUM_CAPTURE)

    while count < NUM_CAPTURE:
        if use_picamera:
            frame = cam.capture_array()
        else:
            ret, frame = cam.read()
            if not ret:
                continue

        display = frame.copy()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        found, corners = cv2.findChessboardCorners(
            gray, CHECKERBOARD,
            cv2.CALIB_CB_ADAPTIVE_THRESH + cv2.CALIB_CB_FAST_CHECK
        )
        if found:
            cv2.drawChessboardCorners(display, CHECKERBOARD, corners, found)
            cv2.putText(display, f"FOUND - {count}/{NUM_CAPTURE}", (10, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 2)
        else:
            cv2.putText(display, f"NOT FOUND - {count}/{NUM_CAPTURE}", (10, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 2)

        cv2.imshow("Calibration", display)
        key = cv2.waitKey(1) & 0xFF

        if key == ord(' ') and found:
            fname = os.path.join(IMAGE_DIR, f"calib_{count:03d}.jpg")
            cv2.imwrite(fname, frame)
            logger.info("Saved %s", fname)
            count += 1
            time.sleep(0.3)

        elif key == ord('q'):
            break

    cv2.destroyAllWindows()
    if use_picamera:
        cam.stop()
    else:
        cam.release()

    logger.info("Đã chụp %d ảnh vào %s/", count, IMAGE_DIR)


def run_calibration(image_dir: str = IMAGE_DIR) -> bool:
    """
    Tính Camera Matrix từ ảnh checkerboard trong image_dir.
    Ghi kết quả vào RESULT_FILE và in ra config snippet.
    """
    # Chuẩn bị object points (3D) - z=0 vì marker phẳng
    objp = np.zeros((CHECKERBOARD[0] * CHECKERBOARD[1], 3), dtype=np.float32)
    objp[:, :2] = np.mgrid[0:CHECKERBOARD[0], 0:CHECKERBOARD[1]].T.reshape(-1, 2)
    objp *= SQUARE_SIZE_M

    obj_points = []   # 3D points
    img_points = []   # 2D points

    images = sorted(glob.glob(os.path.join(image_dir, "*.jpg")))
    images += sorted(glob.glob(os.path.join(image_dir, "*.png")))

    if not images:
        logger.error("Không tìm thấy ảnh trong %s/", image_dir)
        return False

    logger.info("Xử lý %d ảnh ...", len(images))
    img_shape = None
    success_count = 0

    for fpath in images:
        img  = cv2.imread(fpath)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img_shape = gray.shape[::-1]   # (width, height)

        ret, corners = cv2.findChessboardCorners(
            gray, CHECKERBOARD,
            cv2.CALIB_CB_ADAPTIVE_THRESH + cv2.CALIB_CB_NORMALIZE_IMAGE
        )

        if ret:
            # Sub-pixel refinement
            criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
            corners2 = cv2.cornerSubPix(gray, corners, (11, 11), (-1, -1), criteria)
            obj_points.append(objp)
            img_points.append(corners2)
            success_count += 1
            logger.info("  OK: %s", os.path.basename(fpath))
        else:
            logger.warning("  SKIP (không tìm thấy checkerboard): %s", os.path.basename(fpath))

    logger.info("Sử dụng %d/%d ảnh để calibration", success_count, len(images))

    if success_count < 10:
        logger.error("Cần ít nhất 10 ảnh hợp lệ (đang có %d)", success_count)
        return False

    # ── Calibrate ────────────────────────────────────
    rms, camera_matrix, dist_coeffs, rvecs, tvecs = cv2.calibrateCamera(
        obj_points, img_points, img_shape, None, None
    )

    logger.info("RMS reprojection error: %.4f px  (lý tưởng < 0.5)", rms)
    if rms > 1.0:
        logger.warning("RMS cao - thử chụp thêm ảnh ở nhiều góc độ hơn")

    # ── Lưu kết quả ─────────────────────────────────
    np.savez(
        RESULT_FILE,
        camera_matrix=camera_matrix,
        dist_coeffs=dist_coeffs,
        rms=rms,
    )
    logger.info("Đã lưu kết quả vào %s", RESULT_FILE)

    # ── In snippet để dán vào config.py ─────────────
    k  = camera_matrix
    dc = dist_coeffs.flatten()

    print("\n" + "=" * 60)
    print("DÁN VÀO config.py:")
    print("=" * 60)
    print("CAMERA_MATRIX = np.array([")
    print(f"    [{k[0,0]:.6f},    0.0, {k[0,2]:.6f}],")
    print(f"    [   0.0, {k[1,1]:.6f}, {k[1,2]:.6f}],")
    print(f"    [   0.0,    0.0,   1.0]")
    print("], dtype=np.float64)")
    print()
    print(f"DIST_COEFFS = np.array([{dc[0]:.8f}, {dc[1]:.8f},")
    print(f"                         {dc[2]:.8f}, {dc[3]:.8f}, {dc[4]:.8f}],")
    print("                        dtype=np.float64)")
    print("=" * 60)

    return True


def verify_calibration():
    """Kiểm tra file calibration đã lưu."""
    if not os.path.exists(RESULT_FILE):
        logger.error("Không tìm thấy %s - chạy --calibrate trước", RESULT_FILE)
        return

    data = np.load(RESULT_FILE)
    logger.info("Camera Matrix:\n%s", data["camera_matrix"])
    logger.info("Dist Coeffs: %s", data["dist_coeffs"])
    logger.info("RMS error: %.4f px", float(data["rms"]))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Camera Calibration Tool")
    group  = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--collect",    action="store_true",
                       help="Chụp ảnh calibration từ camera (chạy trên Pi)")
    group.add_argument("--calibrate",  action="store_true",
                       help="Tính calibration từ ảnh trong calibration_images/")
    group.add_argument("--verify",     action="store_true",
                       help="In kết quả calibration đã lưu")
    parser.add_argument("--image-dir", default=IMAGE_DIR,
                        help=f"Thư mục ảnh (mặc định: {IMAGE_DIR})")
    args = parser.parse_args()

    if args.collect:
        collect_calibration_images()
    elif args.calibrate:
        ok = run_calibration(args.image_dir)
        sys.exit(0 if ok else 1)
    elif args.verify:
        verify_calibration()
