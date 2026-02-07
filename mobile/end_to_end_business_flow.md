# 📘 End-to-End Business Flow Documentation (Updated)

Tài liệu mô tả chi tiết luồng nghiệp vụ từ góc độ người dùng (User Journey) kết hợp với các xử lý kỹ thuật của hệ thống.

---

## 🎭 1. Các Vai Trò (Actors)

| Actor | Mô tả |
|-------|-------|
| 👤 **Khách hàng (Customer)** | Người sử dụng dịch vụ giặt ủi, tương tác qua App Mobile. |
| 🏪 **Partner** | Đối tác kinh doanh, quản lý cửa hàng giặt và điều phối nhân viên. |
| 👷 **Staff (Physical)** | Nhân viên thực tế KHÔNG có tài khoản, sử dụng mã truy cập 1 lần do Partner cung cấp. |
| 🔴 **Admin** | Quản trị hệ thống, quản lý người dùng, cửa hàng, giá cả. |
| 🤖 **Locker IoT** | Hệ thống tủ vật lý (Mô phỏng), đóng mở bằng mã PIN hoặc Staff Access Code. |

---

## 🎬 2. Kịch Bản Nghiệp Vụ (Scenario)

**Bối cảnh**: Khách hàng (Huy) muốn giặt 2kg quần áo và 1 áo vest. Huy sẽ mang đồ đến tủ thông minh tại "Cửa hàng Quận 1" (do Partner Minh quản lý).

### Bước 1: Khởi tạo (Authentication & Browse)
1.  **Đăng nhập**: Huy mở App, đăng nhập bằng Email/Password.
    *   *Backend*: Trả về `accessToken`.
2.  **Tìm kiếm**: Huy xem danh sách cửa hàng gần nhất.
    *   *API*: `GET /api/stores`
3.  **Kiểm tra tủ**: Huy chọn "Store Q1" và xem các ngăn tủ (Box) còn trống.
    *   *API*: `GET /api/lockers/{id}/boxes/available`
    *   *Kết quả*: Thấy Box số `A-05` (Size Medium) đang trống.

### Bước 2: Tạo đơn hàng (Order Creation)
1.  **Chọn dịch vụ**: Huy chọn dịch vụ "Giặt sấy" và "Gửi hàng thường".
2.  **Chọn boxes**: Huy có 2 túi đồ lớn, chọn 2 boxes: `A-05` và `A-06`.
3.  **Tạo đơn**: Huy nhấn "Tạo đơn hàng".
    *   *API*: `POST /api/orders`
    *   *Payload*: `{lockerId, boxIds: [5, 6], serviceIds: [1, 3], note: "Giặt kỹ áo vest"}`
    *   *Backend*:
        *   Tạo Order status `INITIALIZED`.
        *   Đánh dấu Box `A-05` và `A-06` là `OCCUPIED`.
        *   Trả về `orderId: 101` và `pinCode: 123456`.
    *   **Lưu ý**: Số lượng/cân nặng sẽ do Partner/Staff cập nhật sau khi cân.

### Bước 3: Gửi đồ (Drop-off)
1.  **Đến tủ**: Huy mang đồ đến tủ A, nhập mã PIN `123456` để mở các ngăn `A-05` và `A-06`.
2.  **Bỏ đồ**: Huy bỏ quần áo vào cả 2 ngăn, đóng cửa tủ.
3.  **Xác nhận**: Huy nhấn "Đã bỏ đồ" trên App.
    *   *API*: `PUT /api/orders/101/confirm`
    *   *Backend*:
        *   Cập nhật Order status -> `WAITING` (Chờ Partner xác nhận).
        *   **Push Noti** cho Partner (Minh): "Có đơn hàng mới #101 tại tủ A".

### Bước 4: Partner Xác Nhận & Tạo Mã Staff (Partner Accept)
1.  **Nhận đơn**: Partner Minh nhận thông báo, xem đơn hàng #101 trong Dashboard.
    *   *API*: `GET /api/partner/orders/pending`
2.  **Xác nhận đơn**: Minh nhấn "Chấp nhận đơn hàng" để tạo mã cho Staff.
    *   *API*: `POST /api/partner/orders/101/accept`
    *   *Backend*:
        *   Tạo Staff Access Code: `ABC12XYZ` (hết hạn sau 24h).
        *   Trả về mã code cho Partner hiển thị.
3.  **Giao mã cho Staff**: Minh đưa mã `ABC12XYZ` cho nhân viên Tùng (qua điện thoại hoặc trực tiếp).

### Bước 5: Staff Thu Gom (Staff Collection)
1.  **Đến tủ**: Tùng đến tủ A với mã `ABC12XYZ`.
2.  **Mở tủ**: Tùng nhập mã vào bàn phím IoT hoặc App Staff đơn giản.
    *   *API*: `POST /api/iot/unlock-with-code`
    *   *Payload*: `{orderId: 101, accessCode: "ABC12XYZ", staffName: "Tùng"}`
    *   *Backend*:
        *   Xác thực mã hợp lệ.
        *   Đánh dấu mã đã sử dụng.
        *   Cập nhật Order status -> `COLLECTED`.
        *   Giải phóng Box `A-05` và `A-06` -> `AVAILABLE`.
        *   **Push Noti** cho Huy: "Nhân viên đã lấy đồ của bạn".
3.  **Lấy đồ**: Tùng lấy túi đồ ra từ cả 2 ngăn, đóng tủ.

### Bước 6: Cân đồ & Xử lý (Processing)
1.  **Cân đồ**: Tùng mang đồ về xưởng và cân => 3.5kg.
2.  **Partner cập nhật**: Minh cập nhật cân nặng qua Dashboard.
    *   *API*: `PUT /api/partner/orders/101/weight`
    *   *Payload*: `{actualWeight: 3.5, weightUnit: "kg"}`
    *   *Backend*: Cập nhật `actualWeight` và tính lại `totalPrice`.
3.  **Bắt đầu xử lý**: Minh nhấn "Bắt đầu xử lý".
    *   *API*: `POST /api/partner/orders/101/process`
    *   *Backend*: Order status -> `PROCESSING`.
4.  **Giặt/Sấy/Gấp**: Quá trình giặt diễn ra...
5.  **Hoàn thành**: Đồ đã sạch, được đóng gói gọn gàng.
6.  **Sẵn sàng trả**: Minh nhấn "Đã xong" và tạo mã trả đồ.
    *   *API*: `POST /api/partner/orders/101/ready`
    *   *Backend*:
        *   Order status -> `READY`.
        *   Tạo Staff Access Code mới: `XYZ98ABC` cho việc trả đồ.
    *   **Push Noti** cho Huy: "Đồ của bạn đã giặt xong! Vui lòng chờ giao lại tủ".

### Bước 7: Trả đồ (Return)
1.  **Giao mã trả**: Minh đưa mã `XYZ98ABC` cho Tùng.
2.  **Đến tủ**: Tùng mang đồ sạch quay lại tủ A.
3.  **Mở tủ**: Tùng nhập mã để mở Box trống.
    *   *API*: `POST /api/iot/unlock-with-code`
    *   *Payload*: `{orderId: 101, accessCode: "XYZ98ABC", staffName: "Tùng"}`
    *   *Backend*:
        *   Đánh dấu mã đã sử dụng.
        *   Cập nhật Order status -> `RETURNED`.
        *   Đánh dấu Box trả -> `OCCUPIED`.
        *   Sinh mã PIN mới cho khách: `654321`.
        *   **Push Noti** cho Huy: "Đồ đã về tủ! Mã PIN: 654321".

### Bước 8: Thanh toán & Lấy đồ (Payment & Pickup)
1.  **Thanh toán**: Huy mở App, thấy đơn hàng đã xong, tổng tiền 150k.
2.  **Chọn phương thức**: Huy chọn VNPay (hoặc MoMo).
    *   *API*: `POST /api/payments/create` -> Redirect sang VNPay.
3.  **Hoàn tất**: Huy nhập thẻ, thanh toán thành công.
    *   *Callback*: VNPay gọi về Server -> Cập nhật Payment SUCCESS.
    *   *Backend*: Xác nhận PIN `654321` đã hiển thị cho Huy.
4.  **Lấy đồ**: Huy đến tủ, nhập `654321` để mở Box, lấy đồ sạch về.
5.  **Hoàn thành**: Huy nhấn "Đã lấy đồ".
    *   *API*: `POST /api/iot/pickup`
    *   *Backend*:
        *   Order status -> `COMPLETED`.
        *   Giải phóng Box -> `AVAILABLE`.

---

## 🔐 3. Staff Access Code Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Customer     │     │     Partner     │     │  Staff (No Acc) │
│   (Has Account) │     │  (Has Account)  │     │  (Physical)     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │ 1. Create Order       │                       │
         │ 2. Drop items         │                       │
         │ 3. Confirm WAITING    │                       │
         │───────────────────────>                       │
         │                       │ 4. View pending       │
         │                       │ 5. Accept order       │
         │                       │ 6. Generate Code      │
         │                       │─────── Give code ─────>
         │                       │                       │
         │                       │                       │ 7. Go to locker
         │                       │                       │ 8. Enter code
         │                       │                       │ 9. Unlock & collect
         │<──────── Notification: "Items collected" ─────│
         │                       │                       │
         │                       │ 10. Update weight     │
         │                       │ 11. Process laundry   │
         │                       │ 12. Mark ready        │
         │                       │ 13. Generate return   │
         │                       │     code              │
         │                       │─────── Give code ─────>
         │                       │                       │
         │                       │                       │ 14. Return to locker
         │                       │                       │ 15. Enter code
         │<──────── Notification: "Items returned" ──────│
         │                       │                       │
         │ 16. Pay online        │                       │
         │ 17. Get PIN           │                       │
         │ 18. Pickup items      │                       │
         │ 19. Complete          │                       │
         ▼                       ▼                       ▼
```

---

## 🚦 4. Bảng Trạng Thái (State Transitions)

| Trạng Thái | Mô tả | Trigger (Hành động) | Người thực hiện |
|------------|-------|---------------------|-----------------|
| `INITIALIZED` | Đơn mới tạo, chưa bỏ đồ | Tạo đơn (`POST`) | Khách hàng |
| `WAITING` | Đồ đã trong tủ, chờ Partner xác nhận | Xác nhận bỏ đồ (`CONFIRM`) | Khách hàng |
| `COLLECTED` | Staff đã lấy đồ bằng Access Code | Mở tủ với code (`UNLOCK_WITH_CODE`) | Staff (Physical) |
| `PROCESSING` | Đang giặt/sấy tại xưởng | Bắt đầu giặt (`PROCESS`) | Partner |
| `READY` | Đã giặt xong, chờ đi trả | Hoàn thành giặt (`READY`) | Partner |
| `RETURNED` | Staff đã trả đồ vào tủ | Trả đồ với code (`UNLOCK_WITH_CODE`) | Staff (Physical) |
| `COMPLETED` | Khách đã thanh toán và lấy đồ | Xác nhận lấy (`PICKUP`) | Khách hàng |
| `CANCELED` | Đơn hàng bị hủy | Hủy (`CANCEL`) | Khách/Admin |

---

## 🎫 5. Staff Access Code Rules

| Thuộc tính | Mô tả |
|------------|-------|
| **Format** | 8 ký tự alphanumeric (VD: `ABC12XYZ`) |
| **Thời hạn** | Mặc định 24 giờ, có thể cấu hình |
| **Số lần dùng** | 1 lần duy nhất |
| **Loại action** | `COLLECT` (lấy đồ) hoặc `RETURN` (trả đồ) |
| **Trạng thái** | `ACTIVE` -> `USED` / `EXPIRED` / `CANCELLED` |

---

## 🔔 6. Cơ Chế Thông Báo (Notifications)

Hệ thống sử dụng WebSocket để đảm bảo thông tin luôn tức thời:

1.  **User Channel**: `/user/queue/notifications` (Dành riêng cho từng user).
2.  **Events**:
    *   `ORDER_UPDATE`: Khi trạng thái đơn hàng thay đổi.
    *   `PAYMENT_SUCCESS`: Khi thanh toán thành công.
    *   `PIN_CODE`: Gửi mã PIN lấy đồ (bảo mật).
    *   `ORDER_COLLECTED`: Staff đã lấy đồ.
    *   `ORDER_RETURNED`: Staff đã trả đồ về tủ.

---

## 💳 7. Quy Trình Thanh Toán (Payment Logic)

*   **Chặn thanh toán**: Hệ thống chỉ cho phép tạo thanh toán khi Order ở trạng thái `READY` hoặc `RETURNED`.
*   **Timeout**: Link thanh toán có hiệu lực trong 15 phút.
*   **Luồng**: Bất đồng bộ (Async) qua IPN callback.

---

## 🔄 8. So sánh Luồng Cũ vs Mới

| Khía cạnh | Luồng Cũ | Luồng Mới |
|-----------|----------|-----------|
| Staff | Có tài khoản riêng | KHÔNG có tài khoản |
| Xác thực Staff | Token JWT | Access Code 1 lần |
| Ai quản lý Staff | Admin/Staff tự nhận | Partner phân công |
| Mã mở tủ | Master PIN cố định | Mã động theo đơn |
| Bảo mật | Trung bình | Cao (mã hủy sau dùng) |

