# 📘 Hướng Dẫn Sử Dụng API - Laundry Locker System

> **Base URL**: `http://localhost:8080`  
> **Swagger UI**: `http://localhost:8080/swagger-ui.html`  
> **Version**: 1.0  
> **Last Updated**: 2026-01-24

---

## 📋 Mục Lục

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Thiết Lập Môi Trường](#2-thiết-lập-môi-trường)
3. [Luồng 1: Xác Thực (Authentication)](#3-luồng-1-xác-thực-authentication)
4. [Luồng 2: Khám Phá (Browse)](#4-luồng-2-khám-phá-browse)
5. [Luồng 3: Đặt Hàng (Order - Customer)](#5-luồng-3-đặt-hàng-order---customer)
6. [Luồng 4: Điều Khiển Tủ (IoT)](#6-luồng-4-điều-khiển-tủ-iot)
7. [Luồng 5: Xử Lý Đơn (Staff)](#7-luồng-5-xử-lý-đơn-staff)
8. [Luồng 6: Thanh Toán (Payment)](#8-luồng-6-thanh-toán-payment)
9. [Luồng 7: Thông Báo (Notification)](#9-luồng-7-thông-báo-notification)
10. [Luồng 8: Quản Trị (Admin)](#10-luồng-8-quản-trị-admin)
11. [Hướng Dẫn Bổ Sung & Troubleshooting](#11-hướng-dẫn-bổ-sung--troubleshooting)

---

## 1. Tổng Quan Hệ Thống

### 1.1 Các Vai Trò (Roles)

| Role | Mô tả | Quyền hạn |
|------|-------|-----------|
| 🌐 **PUBLIC** | Chưa đăng nhập | Xem stores, lockers, services |
| 👤 **USER** | Khách hàng | Tạo/xem đơn, thanh toán, nhận thông báo |
| 👨‍💼 **STAFF** | Nhân viên | Thu gom, xử lý, trả đồ |
| 🔴 **ADMIN** | Quản trị | Full quyền + quản lý hệ thống |

### 1.2 Trạng Thái Đơn Hàng (Order Status)

```
INITIALIZED → WAITING → COLLECTED → PROCESSING → READY → RETURNED → COMPLETED
     ↓            ↓
  CANCELED    CANCELED
```

| Status | Mô tả | Ai thực hiện |
|--------|-------|--------------|
| `INITIALIZED` | Đơn mới tạo, chờ bỏ đồ | Customer tạo |
| `WAITING` | Đã bỏ đồ, chờ nhân viên | Customer xác nhận |
| `COLLECTED` | Nhân viên đã lấy đồ | Staff collect |
| `PROCESSING` | Đang giặt | Staff process |
| `READY` | Giặt xong, chờ trả | Staff ready |
| `RETURNED` | Đã trả vào tủ | Staff return |
| `COMPLETED` | Khách đã lấy đồ | Customer/Payment |
| `CANCELED` | Đã hủy | Customer/Admin |

---

## 2. Thiết Lập Môi Trường

### 2.1 Yêu Cầu

- Java 17+
- Maven 3.8+
- PostgreSQL 14+
- Docker (optional)

### 2.2 Khởi Động Server

```bash
# Chạy với Docker
docker-compose up -d

# Hoặc chạy local
cd laundry-locker-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 2.3 Biến Môi Trường cho Testing

```bash
# Windows PowerShell
$BASE = "http://localhost:8080"
$TOKEN = ""  # Sẽ lấy sau khi đăng nhập

# Linux/Mac
export BASE="http://localhost:8080"
export TOKEN=""
```

---

## 3. Luồng 1: Xác Thực (Authentication)

### 3.1 Đăng Nhập bằng Email OTP

**Bước 1: Gửi OTP đến email**

```bash
curl -X POST "$BASE/api/auth/email/send-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "code": "AUTH_OTP_SENT",
  "message": "OTP đã được gửi đến email"
}
```

**Bước 2: Xác thực OTP**

```bash
curl -X POST "$BASE/api/auth/email/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "otp": "123456"
  }'
```

**Response (User mới):**
```json
{
  "success": true,
  "code": "AUTH_EMAIL_NEW_USER",
  "data": {
    "newUser": true,
    "tempToken": "temp_xxx..."
  }
}
```

**Response (User đã có):**
```json
{
  "success": true,
  "code": "AUTH_EMAIL_LOGIN_SUCCESS",
  "data": {
    "newUser": false,
    "accessToken": "eyJhbGci...",
    "refreshToken": "refresh_xxx...",
    "expiresIn": 3600
  }
}
```

**Bước 3: Hoàn tất đăng ký (nếu user mới)**

```bash
curl -X POST "$BASE/api/auth/email/complete-registration" \
  -H "Content-Type: application/json" \
  -d '{
    "tempToken": "temp_xxx...",
    "fullName": "Nguyen Van A",
    "phoneNumber": "+84987654321"
  }'
```

**Response:**
```json
{
  "success": true,
  "code": "AUTH_REGISTRATION_COMPLETE",
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "refresh_xxx...",
    "expiresIn": 3600
  }
}
```

### 3.2 Đăng Nhập bằng Phone OTP (Firebase)

```bash
# Bước 1: Lấy Firebase ID Token từ app
# Bước 2: Gọi API
curl -X POST "$BASE/api/auth/phone-login" \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "FIREBASE_ID_TOKEN_HERE"
  }'
```

### 3.3 Refresh Token

```bash
curl -X POST "$BASE/api/auth/refresh-token" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "refresh_xxx..."
  }'
```

### 3.4 Logout

```bash
curl -X POST "$BASE/api/auth/logout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "refresh_xxx..."
  }'
```

### 3.5 OAuth2 Login (Browser)

| Provider | URL |
|----------|-----|
| Google | `$BASE/oauth2/authorization/google` |
| GitHub | `$BASE/oauth2/authorization/github` |
| Facebook | `$BASE/oauth2/authorization/facebook` |

---

## 4. Luồng 2: Khám Phá (Browse)

> **Không cần đăng nhập** - Các API public

### 4.1 Xem Danh Sách Cửa Hàng

```bash
curl -X GET "$BASE/api/stores"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cửa hàng Quận 1",
      "address": "123 Nguyễn Huệ, Q1, HCM",
      "phone": "0901234567",
      "openTime": "07:00",
      "closeTime": "22:00",
      "isActive": true
    }
  ]
}
```

### 4.2 Xem Chi Tiết Cửa Hàng

```bash
curl -X GET "$BASE/api/stores/1"
```

### 4.3 Xem Danh Sách Tủ

```bash
# Tất cả tủ
curl -X GET "$BASE/api/lockers"

# Tủ theo cửa hàng
curl -X GET "$BASE/api/lockers?storeId=1"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "LOCKER-A",
      "name": "Tủ A - Tầng 1",
      "location": "Cổng chính",
      "totalBoxes": 20,
      "availableBoxes": 15
    }
  ]
}
```

### 4.4 Xem Ô Tủ Trống

```bash
curl -X GET "$BASE/api/lockers/1/boxes/available"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "boxNumber": 5,
      "status": "AVAILABLE",
      "description": "Ô cỡ Medium"
    }
  ]
}
```

### 4.5 Xem Dịch Vụ Giặt

```bash
# Tất cả dịch vụ
curl -X GET "$BASE/api/services"

# Dịch vụ theo cửa hàng
curl -X GET "$BASE/api/services?storeId=1"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Giặt sấy thường",
      "description": "Giặt + sấy khô + gấp",
      "price": 50000,
      "unit": "kg",
      "estimatedTime": 24
    },
    {
      "id": 2,
      "name": "Giặt khô (Dry Cleaning)",
      "description": "Giặt khô áo vest, áo dài",
      "price": 100000,
      "unit": "piece",
      "estimatedTime": 48
    }
  ]
}
```

---

## 5. Luồng 3: Đặt Hàng (Order - Customer)

> **Yêu cầu đăng nhập** - Role: USER

### 5.1 Tạo Đơn Hàng

**Lưu ý logic mới:**
- Người dùng có thể chọn **nhiều boxes** khi tạo đơn
- **Số lượng/cân nặng** sẽ do nhân viên cân và cập nhật sau khi thu gom
- Chỉ cần chọn dịch vụ, không cần nhập số lượng

```bash
curl -X POST "$BASE/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "LAUNDRY",
    "lockerId": 1,
    "boxIds": [5, 6],
    "customerNote": "Giặt kỹ áo trắng",
    "serviceIds": [1, 3]
  }'
```

**Request với 1 box (backward compatible):**
```bash
curl -X POST "$BASE/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "LAUNDRY",
    "lockerId": 1,
    "boxId": 5,
    "customerNote": "Giặt kỹ áo trắng",
    "serviceIds": [1]
  }'
```

**Response:**
```json
{
  "success": true,
  "code": "ORDER_CREATED",
  "data": {
    "id": 101,
    "status": "INITIALIZED",
    "pinCode": "123456",
    "sendBoxNumbers": [5, 6],
    "locker": { "id": 1, "code": "LOCKER-A" },
    "createdAt": "2026-01-24T10:30:00"
  }
}
```

> 📝 **Lưu lại**: `orderId = 101`, `pinCode = 123456`

### 5.2 Mở Tủ Bỏ Đồ (IoT)

```bash
curl -X POST "$BASE/api/iot/unlock" \
  -H "Content-Type: application/json" \
  -d '{
    "boxId": 5,
    "pinCode": "123456",
    "actionType": "DROP_OFF"
  }'
```

**Response:**
```json
{
  "success": true,
  "code": "BOX_UNLOCKED",
  "data": {
    "success": true,
    "boxId": 5,
    "boxNumber": 5,
    "lockerCode": "LOCKER-A",
    "orderId": 101,
    "unlockToken": "unlock_xxx...",
    "message": "Box unlocked successfully"
  }
}
```

### 5.3 Xác Nhận Đã Bỏ Đồ

```bash
curl -X PUT "$BASE/api/orders/101/confirm" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "code": "ORDER_CONFIRMED",
  "data": {
    "id": 101,
    "status": "WAITING",
    "message": "Đơn hàng đang chờ nhân viên đến lấy"
  }
}
```

### 5.4 Xem Đơn Hàng Của Tôi

```bash
# Tất cả đơn
curl -X GET "$BASE/api/orders/my-orders" \
  -H "Authorization: Bearer $TOKEN"

# Lọc theo status
curl -X GET "$BASE/api/orders/my-orders?status=WAITING" \
  -H "Authorization: Bearer $TOKEN"

# Phân trang
curl -X GET "$BASE/api/orders/my-orders?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.5 Xem Chi Tiết Đơn Hàng

```bash
curl -X GET "$BASE/api/orders/101" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.6 Hủy Đơn Hàng

```bash
curl -X PUT "$BASE/api/orders/101/cancel?reason=1" \
  -H "Authorization: Bearer $TOKEN"
```

> ⚠️ Chỉ hủy được khi status là `INITIALIZED` hoặc `WAITING`

---

## 6. Luồng 4: Điều Khiển Tủ (IoT)

### 6.1 Xác Thực PIN

```bash
curl -X POST "$BASE/api/iot/verify-pin" \
  -H "Content-Type: application/json" \
  -d '{
    "boxId": 5,
    "pinCode": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "code": "PIN_VALID",
  "data": {
    "valid": true,
    "orderId": 101,
    "boxId": 5,
    "boxNumber": 5,
    "lockerCode": "LOCKER-A",
    "orderStatus": "INITIALIZED"
  }
}
```

### 6.2 Mở Tủ

```bash
curl -X POST "$BASE/api/iot/unlock" \
  -H "Content-Type: application/json" \
  -d '{
    "boxId": 5,
    "pinCode": "123456",
    "actionType": "DROP_OFF"
  }'
```

### 6.3 Xác Nhận Lấy Đồ (Complete Order)

```bash
curl -X POST "$BASE/api/iot/pickup" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 101,
    "boxId": 8
  }'
```

**Response:**
```json
{
  "success": true,
  "code": "PICKUP_CONFIRMED",
  "data": {
    "success": true,
    "orderId": 101,
    "orderStatus": "COMPLETED",
    "completedAt": "2026-01-25T14:30:00"
  }
}
```

### 6.4 Cập Nhật Trạng Thái Box (IoT Device)

```bash
curl -X POST "$BASE/api/iot/box-status" \
  -H "Content-Type: application/json" \
  -d '{
    "boxId": 5,
    "status": "AVAILABLE",
    "deviceId": "IOT-001",
    "isDoorOpen": false
  }'
```

---

## 7. Luồng 5: Xử Lý Đơn (Staff)

> **Yêu cầu đăng nhập** - Role: STAFF hoặc ADMIN

### 7.1 Xem Dashboard Tổng Hợp

```bash
curl -X GET "$BASE/api/staff/orders" \
  -H "Authorization: Bearer $STAFF_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "waitingCount": 5,
    "collectedCount": 3,
    "processingCount": 2,
    "readyCount": 4,
    "recentOrders": [...]
  }
}
```

### 7.2 Xem Đơn Chờ Thu Gom

```bash
curl -X GET "$BASE/api/staff/orders/waiting" \
  -H "Authorization: Bearer $STAFF_TOKEN"
```

### 7.3 Nhận Đơn Về Mình

```bash
curl -X POST "$BASE/api/staff/orders/101/assign" \
  -H "Authorization: Bearer $STAFF_TOKEN"
```

### 7.4 Thu Gom Đồ (Collect)

```bash
curl -X PUT "$BASE/api/orders/101/collect" \
  -H "Authorization: Bearer $STAFF_TOKEN"
```

**Response:** Order status → `COLLECTED`

### 7.5 Bắt Đầu Xử Lý (Process)

```bash
curl -X PUT "$BASE/api/orders/101/process" \
  -H "Authorization: Bearer $STAFF_TOKEN"
```

**Response:** Order status → `PROCESSING`

### 7.6 Đánh Dấu Hoàn Thành (Ready)

```bash
curl -X PUT "$BASE/api/orders/101/ready" \
  -H "Authorization: Bearer $STAFF_TOKEN"
```

**Response:** Order status → `READY`

### 7.7 Trả Đồ Vào Tủ (Return)

```bash
curl -X PUT "$BASE/api/orders/101/return?boxId=8" \
  -H "Authorization: Bearer $STAFF_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "code": "ORDER_RETURNED",
  "data": {
    "id": 101,
    "status": "RETURNED",
    "pinCode": "654321",
    "receiveBox": { "id": 8, "boxNumber": 8 }
  }
}
```

> 📝 **Mã PIN mới** `654321` được gửi cho khách để lấy đồ

---

## 8. Luồng 6: Thanh Toán (Payment)

### 8.1 Tạo Thanh Toán Online

```bash
# VNPay
curl -X POST "$BASE/api/payments/create" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 101,
    "paymentMethod": "VNPAY"
  }'

# MoMo
curl -X POST "$BASE/api/payments/create" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 101,
    "paymentMethod": "MOMO"
  }'
```

**Response:**
```json
{
  "success": true,
  "code": "PAYMENT_CREATED",
  "data": {
    "paymentId": 50,
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/...",
    "expireAt": "2026-01-24T11:00:00"
  }
}
```

> 🔗 Redirect user đến `paymentUrl` để thanh toán

### 8.2 Thanh Toán Tiền Mặt (Staff)

```bash
curl -X POST "$BASE/api/orders/101/checkout" \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "CASH",
    "note": "Khách thanh toán tiền mặt"
  }'
```

### 8.3 Xem Trạng Thái Thanh Toán

```bash
curl -X GET "$BASE/api/payments/50" \
  -H "Authorization: Bearer $TOKEN"
```

### 8.4 Xem Thanh Toán Theo Đơn

```bash
curl -X GET "$BASE/api/payments/order/101" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 9. Luồng 7: Thông Báo (Notification)

### 9.1 Kết Nối WebSocket

```javascript
// JavaScript Client
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
    // Subscribe to personal notifications
    stompClient.subscribe('/user/queue/notifications', function(message) {
        const notification = JSON.parse(message.body);
        console.log('New notification:', notification);
    });
});
```

### 9.2 Lấy Danh Sách Thông Báo

```bash
# Phân trang
curl -X GET "$BASE/api/notifications?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"

# Tất cả
curl -X GET "$BASE/api/notifications/all" \
  -H "Authorization: Bearer $TOKEN"
```

### 9.3 Lấy Thông Báo Chưa Đọc

```bash
curl -X GET "$BASE/api/notifications/unread" \
  -H "Authorization: Bearer $TOKEN"
```

### 9.4 Đếm Thông Báo Chưa Đọc

```bash
curl -X GET "$BASE/api/notifications/unread/count" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": { "count": 5 }
}
```

### 9.5 Đánh Dấu Đã Đọc

```bash
# Một thông báo
curl -X PUT "$BASE/api/notifications/1/read" \
  -H "Authorization: Bearer $TOKEN"

# Tất cả
curl -X PUT "$BASE/api/notifications/read-all" \
  -H "Authorization: Bearer $TOKEN"
```

### 9.6 Xóa Thông Báo

```bash
curl -X DELETE "$BASE/api/notifications/1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 10. Luồng 8: Quản Trị (Admin)

> **Yêu cầu đăng nhập** - Role: ADMIN

### 10.1 Dashboard Overview

```bash
curl -X GET "$BASE/api/admin/dashboard/overview" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 10.2 Quản Lý Đơn Hàng

```bash
# Xem tất cả đơn
curl -X GET "$BASE/api/admin/orders?page=0&size=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Lọc theo status
curl -X GET "$BASE/api/admin/orders?status=PROCESSING" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Force đổi status
curl -X PUT "$BASE/api/admin/orders/101/status?status=COMPLETED" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 10.3 Thống Kê Đơn Hàng

```bash
curl -X GET "$BASE/api/admin/orders/statistics" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 1250,
    "completedOrders": 1100,
    "canceledOrders": 50,
    "pendingOrders": 100,
    "totalRevenue": 125000000,
    "averageOrderValue": 113636,
    "ordersToday": 45,
    "ordersThisWeek": 280,
    "ordersThisMonth": 1100
  }
}
```

### 10.4 Báo Cáo Doanh Thu

```bash
curl -X GET "$BASE/api/admin/orders/revenue" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 10.5 Quản Lý Users

```bash
# Danh sách users
curl -X GET "$BASE/api/admin/users?page=0&size=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Cập nhật roles
curl -X PUT "$BASE/api/admin/users/5/roles" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "roles": ["USER", "STAFF"] }'

# Enable/Disable user
curl -X PUT "$BASE/api/admin/users/5/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "enabled": false }'
```

### 10.6 Quản Lý Stores

```bash
# Tạo store
curl -X POST "$BASE/api/admin/stores" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cửa hàng Quận 3",
    "address": "456 Võ Văn Tần, Q3",
    "phone": "0909123456"
  }'

# Cập nhật
curl -X PUT "$BASE/api/admin/stores/2" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Cửa hàng Q3 - Updated" }'
```

### 10.7 Quản Lý Lockers & Boxes

```bash
# Tạo locker
curl -X POST "$BASE/api/admin/lockers" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": 1,
    "code": "LOCKER-B",
    "name": "Tủ B",
    "location": "Tầng 2"
  }'

# Thêm box vào locker
curl -X POST "$BASE/api/admin/lockers/1/boxes" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "boxNumber": 21,
    "description": "Ô cỡ Large"
  }'

# Bật chế độ bảo trì
curl -X PUT "$BASE/api/admin/lockers/1/maintenance" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "maintenance": true }'
```

### 10.8 Quản Lý Services

```bash
# Tạo dịch vụ
curl -X POST "$BASE/api/admin/services" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Giặt Express",
    "description": "Giao trong 4 giờ",
    "price": 80000,
    "unit": "kg"
  }'

# Cập nhật giá
curl -X PUT "$BASE/api/admin/services/3/price" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "price": 85000 }'
```

---

## 11. Luồng 9: Partner (Đối Tác)

> **Yêu cầu đăng nhập** - Role: USER (để đăng ký), PARTNER (sau khi được duyệt)

### 11.1 Tổng Quan Partner

Partner là các đơn vị kinh doanh dịch vụ giặt ủi hợp tác với hệ thống Laundry Locker. Flow hoạt động:

```
USER đăng ký → Admin duyệt → Trở thành PARTNER → Quản lý Store/Order
```

### 11.2 Đăng Ký Partner

> Bất kỳ User đã đăng nhập có thể đăng ký trở thành Partner

```bash
curl -X POST "$BASE/api/partner" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Giặt Ủi ABC",
    "businessRegistrationNumber": "0123456789",
    "taxId": "0123456789",
    "businessAddress": "123 Nguyễn Huệ, Q1, HCM",
    "contactPhone": "+84901234567",
    "contactEmail": "contact@abc-laundry.com",
    "notes": "Kinh doanh giặt ủi từ năm 2020"
  }'
```

**Response:**
```json
{
  "success": true,
  "code": "PARTNER_REGISTERED",
  "data": {
    "id": 1,
    "businessName": "Giặt Ủi ABC",
    "status": "PENDING",
    "createdAt": "2026-01-25T10:00:00"
  }
}
```

> ⏳ Sau khi đăng ký, Partner ở trạng thái `PENDING` và chờ Admin duyệt.

### 11.3 Xem Profile Partner

```bash
curl -X GET "$BASE/api/partner" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### 11.4 Dashboard Partner

```bash
curl -X GET "$BASE/api/partner/dashboard" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStores": 2,
    "totalOrders": 150,
    "pendingOrders": 5,
    "todayOrders": 12,
    "todayRevenue": 2500000,
    "monthlyRevenue": 75000000
  }
}
```

### 11.5 Xem Đơn Hàng Chờ Xử Lý

```bash
curl -X GET "$BASE/api/partner/orders/pending?page=0&size=10" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### 11.6 Xem Tất Cả Đơn Hàng

```bash
# Tất cả đơn
curl -X GET "$BASE/api/partner/orders?page=0&size=10" \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Lọc theo status
curl -X GET "$BASE/api/partner/orders?status=PROCESSING&page=0&size=10" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### 11.7 Nhận Đơn (Accept Order)

Khi Partner nhận đơn, hệ thống tự động sinh mã truy cập (Access Code) cho nhân viên đi thu gom.

```bash
curl -X POST "$BASE/api/partner/orders/101/accept?expirationHours=24&notes=Nhân viên A thu gom" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "code": "ORDER_ACCEPTED",
  "data": {
    "id": 50,
    "orderId": 101,
    "accessCode": "ABC123",
    "purpose": "COLLECTION",
    "expiresAt": "2026-01-26T10:00:00",
    "status": "ACTIVE"
  }
}
```

### 11.8 Cập Nhật Trạng Thái Đơn

```bash
# Bắt đầu xử lý (COLLECTED → PROCESSING)
curl -X POST "$BASE/api/partner/orders/101/process" \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Hoàn thành (PROCESSING → READY) - Sinh Access Code cho việc trả đồ
curl -X POST "$BASE/api/partner/orders/101/ready?expirationHours=24" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### 11.9 Quản Lý Access Code

```bash
# Tạo mã mới
curl -X POST "$BASE/api/partner/access-codes/generate" \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 101,
    "purpose": "DELIVERY",
    "expirationHours": 24,
    "notes": "Giao cho nhân viên B"
  }'

# Xem danh sách mã
curl -X GET "$BASE/api/partner/access-codes?page=0&size=10" \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Xem mã theo đơn hàng
curl -X GET "$BASE/api/partner/access-codes/order/101" \
  -H "Authorization: Bearer $PARTNER_TOKEN"

# Hủy mã
curl -X POST "$BASE/api/partner/access-codes/50/cancel" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### 11.10 Xem Danh Sách Store

```bash
curl -X GET "$BASE/api/partner/stores" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### 11.11 Xem Chi Tiết Đơn Hàng

```bash
curl -X GET "$BASE/api/partner/orders/101" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### 11.12 Cập Nhật Cân Nặng Đơn Hàng

```bash
curl -X PUT "$BASE/api/partner/orders/101/weight" \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actualWeight": 2.5,
    "weightUnit": "kg",
    "staffNote": "Đã cân và xác nhận"
  }'
```

### 11.13 Cập Nhật Profile Partner

```bash
curl -X PUT "$BASE/api/partner" \
  -H "Authorization: Bearer $PARTNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Giặt Ủi Sạch Sẽ",
    "businessAddress": "123 Nguyễn Văn A, Q.1",
    "contactPhone": "0901234567",
    "contactEmail": "contact@giatui.vn"
  }'
```

### 11.14 Quản Lý Staff

#### Xem Danh Sách Staff
```bash
curl -X GET "$BASE/api/partner/staff" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

#### Thêm Staff
```bash
curl -X POST "$BASE/api/partner/staff/5" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

#### Xóa Staff
```bash
curl -X DELETE "$BASE/api/partner/staff/5" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### 11.15 Quản Lý Locker

#### Xem Tất Cả Locker
```bash
curl -X GET "$BASE/api/partner/lockers" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

#### Xem Ô Trống Trong Locker
```bash
curl -X GET "$BASE/api/partner/lockers/1/boxes/available" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

### 11.16 Báo Cáo Doanh Thu

```bash
curl -X GET "$BASE/api/partner/revenue?fromDate=2024-01-01T00:00:00&toDate=2024-01-31T23:59:59" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

**Response:**
```json
{
  "data": {
    "partnerId": 1,
    "businessName": "Giặt Ủi Sạch Sẽ",
    "fromDate": "2024-01-01T00:00:00",
    "toDate": "2024-01-31T23:59:59",
    "grossRevenue": 5000000,
    "partnerRevenue": 3500000,
    "platformFee": 1500000,
    "revenueSharePercent": 70,
    "totalOrders": 50,
    "completedOrders": 45,
    "canceledOrders": 5
  }
}
```

### 11.17 Thống Kê Đơn Hàng

```bash
curl -X GET "$BASE/api/partner/orders/statistics" \
  -H "Authorization: Bearer $PARTNER_TOKEN"
```

**Response:**
```json
{
  "data": {
    "partnerId": 1,
    "totalOrders": 150,
    "todayOrders": 5,
    "weekOrders": 25,
    "monthOrders": 80,
    "waitingOrders": 3,
    "collectedOrders": 2,
    "processingOrders": 5,
    "readyOrders": 2,
    "returnedOrders": 1,
    "completedOrders": 130,
    "canceledOrders": 7,
    "totalRevenue": 15000000,
    "todayRevenue": 500000,
    "weekRevenue": 2500000,
    "monthRevenue": 8000000,
    "averageOrderValue": 115385
  }
}
```

---

## 12. Quản Lý Partner (Admin)

> **Yêu cầu đăng nhập** - Role: ADMIN

### 12.1 Xem Danh Sách Partner

```bash
# Tất cả
curl -X GET "$BASE/api/admin/partners?page=0&size=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Lọc theo status (PENDING, APPROVED, REJECTED, SUSPENDED)
curl -X GET "$BASE/api/admin/partners?status=PENDING" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 12.2 Xem Chi Tiết Partner

```bash
curl -X GET "$BASE/api/admin/partners/1" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 12.3 Duyệt Partner

```bash
curl -X POST "$BASE/api/admin/partners/1/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Response:** Partner status → `APPROVED`, User được gán role `PARTNER`

### 12.4 Từ Chối Partner

```bash
curl -X POST "$BASE/api/admin/partners/1/reject?reason=Thiếu giấy phép kinh doanh" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 12.5 Đình Chỉ Partner

```bash
curl -X POST "$BASE/api/admin/partners/1/suspend" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 13. Hướng Dẫn Bổ Sung & Troubleshooting


### 11.1 Các Bước Cần Hoàn Thiện

#### ✅ Đã có:
- Authentication (Email OTP, Phone OTP, OAuth2)
- Store/Locker/Service management
- Order lifecycle (INITIALIZED → COMPLETED)
- Payment integration (VNPay, MoMo)
- Notifications (WebSocket)
- IoT control (PIN verify, unlock)
- Staff & Admin dashboards

#### 🔧 Cần bổ sung:

1. **FCM Push Notification**
   ```properties
   # application.properties
   firebase.credentials.path=classpath:firebase/firebase-service-account.json
   ```
   
2. **Rate Limiting cho IoT APIs**
   ```java
   // Thêm @RateLimiter annotation
   @RateLimiter(name = "iot", fallbackMethod = "rateLimitFallback")
   ```

3. **Email Templates**
   - OTP email template
   - Order status notification template

#### ✅ Đã hoàn thành - Scheduler Jobs:

Hệ thống đã có các Scheduler Jobs tự động:

1. **Auto-cancel Orders** (chạy mỗi 5 phút)
   - Tự động hủy đơn hàng `INITIALIZED` sau 30 phút không confirm
   - Giải phóng box đã đặt
   - Gửi thông báo cho khách

2. **Auto-release Boxes** (chạy mỗi 2 phút)
   - Giải phóng boxes từ đơn hàng `COMPLETED` sau 5 phút
   - Xóa PIN code để bảo mật

3. **Pickup Reminders** (chạy mỗi 1 giờ)
   - Gửi nhắc nhở cho khách có đơn `RETURNED` > 24 giờ

**Cấu hình Scheduler** (application-dev.properties):
```properties
# Timeout tự động hủy đơn (phút)
app.scheduler.order-confirm-timeout-minutes=30

# Delay giải phóng box sau hoàn thành (phút)
app.scheduler.box-release-delay-minutes=5

# Thời gian gửi nhắc nhở lấy đồ (giờ)
app.scheduler.pickup-reminder-hours=24

# Tần suất chạy jobs (ms)
app.scheduler.auto-cancel-rate-ms=300000
app.scheduler.box-release-rate-ms=120000
app.scheduler.reminder-rate-ms=3600000
```

**Admin APIs để trigger thủ công:**
```bash
# Trigger auto-cancel job
curl -X POST "$BASE/api/admin/scheduler/auto-cancel" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Trigger box release job
curl -X POST "$BASE/api/admin/scheduler/release-boxes" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Trigger pickup reminder job
curl -X POST "$BASE/api/admin/scheduler/pickup-reminders" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get scheduler status
curl -X POST "$BASE/api/admin/scheduler/status" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 11.2 Common Errors

| Error Code | Mô tả | Giải pháp |
|------------|-------|-----------|
| `E_ORDER001` | Order not found | Kiểm tra orderId |
| `E_ORDER002` | Invalid status for checkout | Đơn phải ở READY/RETURNED |
| `E_BOX001` | Box not found | Kiểm tra boxId |
| `E_BOX002` | No available box | Chọn locker khác |
| `E_BOX003` | Box not available | Box đang được sử dụng |
| `E_AUTH001` | Invalid OTP | OTP sai hoặc hết hạn |
| `E_AUTH002` | Token expired | Refresh token |

### 11.3 Testing Accounts

| Role | Email | Password/OTP |
|------|-------|--------------|
| Admin | admin@laundry.com | (OTP qua email) |
| Staff | staff@laundry.com | (OTP qua email) |
| User | user@laundry.com | (OTP qua email) |

### 11.4 Ngrok Setup (Payment Testing)

```bash
# Khởi động ngrok
ngrok http 8080

# Cập nhật application-dev.properties
app.backend.url=https://abc123.ngrok-free.app
```

---

## 📚 Tài Liệu Tham Khảo

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- API Docs JSON: `http://localhost:8080/v3/api-docs`
- [VNPay Sandbox](https://sandbox.vnpayment.vn/)
- [MoMo Sandbox](https://developers.momo.vn/)

---

*Tài liệu được tạo tự động - Version 1.0 - 2026-01-24*

