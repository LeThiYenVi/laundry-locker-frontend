"""
Generate ArUco Markers cho 6 ô locker
Chạy: python generate_markers.py

Output: thư mục  aruco_markers/
  marker_locker_0.png  → ô locker 0
  marker_locker_1.png  → ô locker 1
  ...
  marker_locker_5.png  → ô locker 5
  all_markers.png      → tờ in tất cả 6 marker (A4)
"""

import os
import cv2
import numpy as np

# ─────────────────────────────────────────────────────────────────
# CẤU HÌNH
# ─────────────────────────────────────────────────────────────────

# Phải khớp với config.py
ARUCO_DICT_TYPE = cv2.aruco.DICT_4X4_50

# ID tương ứng 6 ô locker (phải khớp với VALID_MARKER_IDS trong config.py)
LOCKER_MARKER_IDS = [0, 1, 2, 3, 4, 5]

# Kích thước marker xuất ra (pixel) - 1000px = sắc nét khi in A4
MARKER_SIZE_PX = 1000

# Viền trắng quanh marker (px) - BẮT BUỘC có, camera cần viền để nhận dạng
BORDER_PX = 100

OUTPUT_DIR = "aruco_markers"

# ─────────────────────────────────────────────────────────────────

def generate_single_marker(marker_id: int, output_dir: str) -> np.ndarray:
    """Tạo và lưu 1 marker, trả về ảnh đã có viền."""
    aruco_dict = cv2.aruco.getPredefinedDictionary(ARUCO_DICT_TYPE)

    # Generate marker (không có viền)
    marker_img = cv2.aruco.generateImageMarker(aruco_dict, marker_id, MARKER_SIZE_PX)

    # Thêm viền trắng (quan trọng!)
    marker_with_border = cv2.copyMakeBorder(
        marker_img,
        BORDER_PX, BORDER_PX, BORDER_PX, BORDER_PX,
        cv2.BORDER_CONSTANT,
        value=255,
    )

    # Chuyển sang BGR để thêm text màu
    out = cv2.cvtColor(marker_with_border, cv2.COLOR_GRAY2BGR)

    # Nhãn dưới marker
    label = f"LOCKER {marker_id}   |   ArUco 4x4  ID={marker_id}"
    font       = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 1.6
    thickness  = 3
    text_size  = cv2.getTextSize(label, font, font_scale, thickness)[0]

    # Vùng label phía dưới
    label_bar = np.full((80, out.shape[1], 3), 30, dtype=np.uint8)  # nền tối
    text_x = (label_bar.shape[1] - text_size[0]) // 2
    cv2.putText(label_bar, label, (text_x, 55),
                font, font_scale, (0, 220, 255), thickness)

    final = np.vstack([out, label_bar])

    fname = os.path.join(output_dir, f"marker_locker_{marker_id}.png")
    cv2.imwrite(fname, final)
    print(f"  Saved: {fname}  ({final.shape[1]}x{final.shape[0]} px)")

    return final


def generate_all_sheet(markers: list, output_dir: str):
    """
    Ghép tất cả marker vào 1 tờ A4 (2 cột × 3 hàng).
    Dễ in một lần.
    """
    cols = 2
    rows = 3

    # Resize tất cả marker về cùng kích thước
    thumb_size = 600   # px mỗi ô trong tờ tổng hợp
    thumbs = []
    for img in markers:
        h, w = img.shape[:2]
        scale = thumb_size / max(h, w)
        new_w = int(w * scale)
        new_h = int(h * scale)
        thumb = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
        # Pad để tất cả cùng kích thước
        pad_top    = (thumb_size - new_h) // 2
        pad_bottom = thumb_size - new_h - pad_top
        pad_left   = (thumb_size - new_w) // 2
        pad_right  = thumb_size - new_w - pad_left
        thumb = cv2.copyMakeBorder(
            thumb, pad_top, pad_bottom, pad_left, pad_right,
            cv2.BORDER_CONSTANT, value=(220, 220, 220)
        )
        thumbs.append(thumb)

    # Đủ 6 marker
    while len(thumbs) < rows * cols:
        thumbs.append(np.full((thumb_size, thumb_size, 3), 220, dtype=np.uint8))

    # Ghép lưới
    row_imgs = []
    for r in range(rows):
        row_img = np.hstack(thumbs[r * cols: r * cols + cols])
        row_imgs.append(row_img)
    sheet = np.vstack(row_imgs)

    # Tiêu đề
    header = np.full((100, sheet.shape[1], 3), 20, dtype=np.uint8)
    cv2.putText(header, "LAUNDRY LOCKER — ArUco Landing Markers",
                (30, 68), cv2.FONT_HERSHEY_SIMPLEX, 1.4, (255, 255, 255), 2)
    sheet = np.vstack([header, sheet])

    fname = os.path.join(output_dir, "all_markers.png")
    cv2.imwrite(fname, sheet)
    print(f"\n  Sheet saved: {fname}  ({sheet.shape[1]}x{sheet.shape[0]} px)")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Generating {len(LOCKER_MARKER_IDS)} ArUco markers → {OUTPUT_DIR}/\n")

    markers = []
    for mid in LOCKER_MARKER_IDS:
        img = generate_single_marker(mid, OUTPUT_DIR)
        markers.append(img)

    generate_all_sheet(markers, OUTPUT_DIR)

    print()
    print("=" * 55)
    print("XONG! Hướng dẫn in:")
    print("  1. Mở  aruco_markers/all_markers.png")
    print("  2. In trên A4, chọn 'Fit to page'")
    print("  3. Sau khi in, đo kích thước marker thực (cm)")
    print("     rồi cập nhật ARUCO_MARKER_SIZE_M trong config.py")
    print("  4. Cập nhật VALID_MARKER_IDS trong config.py:")
    print(f"     VALID_MARKER_IDS = {LOCKER_MARKER_IDS}")
    print("=" * 55)


if __name__ == "__main__":
    main()
