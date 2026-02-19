# 📚 LAUNDRY LOCKER BACKEND - TÀI LIỆU API HOÀN CHỈNH

> **Phiên bản:** 1.0.0  
> **Cập nhật:** 2024  
> **Base URL:** `http://localhost:8080/api`  
> **Swagger UI:** `http://localhost:8080/swagger-ui.html`

---

## 📑 MỤC LỤC

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Xác Thực (Authentication)](#2-xác-thực-authentication)
3. [Quản Lý Người Dùng (User)](#3-quản-lý-người-dùng-user)
4. [Quản Lý Đơn Hàng (Order)](#4-quản-lý-đơn-hàng-order)
5. [Thanh Toán (Payment)](#5-thanh-toán-payment)
6. [Dịch Vụ Giặt (Service)](#6-dịch-vụ-giặt-service)
7. [Locker & Box](#7-locker--box)
8. [Cửa Hàng (Store)](#8-cửa-hàng-store)
9. [Thông Báo (Notification)](#9-thông-báo-notification)
10. [Loyalty - Điểm Thưởng](#10-loyalty---điểm-thưởng)
11. [Partner API](#11-partner-api)
12. [Staff API](#12-staff-api)
13. [IoT API](#13-iot-api)
14. [Admin API](#14-admin-api)
15. [Luồng Nghiệp Vụ Chi Tiết](#15-luồng-nghiệp-vụ-chi-tiết)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                    LAUNDRY LOCKER SYSTEM                    │
├─────────────────────────────────────────────────────────────┤
│  Mobile App (Flutter)  │  Web Admin  │  IoT Devices         │
├─────────────────────────────────────────────────────────────┤
│                    REST API (Spring Boot)                    │
├─────────────────────────────────────────────────────────────┤
│  Auth  │ Order │ Payment │ Locker │ Notification │ Loyalty  │
├─────────────────────────────────────────────────────────────┤
│                PostgreSQL  │  Firebase  │  Redis             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Vai Trò Người Dùng (Roles)

| Role | Mô Tả | Quyền Hạn |
|------|-------|-----------|
| **USER** | Khách hàng | Tạo đơn, thanh toán, theo dõi đơn hàng |
| **PARTNER** | Đối tác/Chủ cửa hàng | Quản lý đơn hàng, nhân viên, thống kê doanh thu |
| **ADMIN** | Quản trị viên | Toàn quyền quản lý hệ thống |

### 1.3 Trạng Thái Đơn Hàng (Order Status)

```
INITIALIZED → WAITING → COLLECTED → PROCESSING → READY → RETURNED → COMPLETED
     │                                                                    │
     └──────────────────── CANCELED ─────────────────────────────────────┘
```

| Status | Ý Nghĩa |
|--------|---------|
| `INITIALIZED` | Đơn hàng được tạo, chờ khách hàng bỏ đồ vào locker |
| `WAITING` | Đồ đã được bỏ vào, chờ nhân viên lấy |
| `COLLECTED` | Nhân viên đã lấy đồ từ locker |
| `PROCESSING` | Đang giặt/xử lý |
| `READY` | Đã hoàn thành, sẵn sàng trả lại |
| `RETURNED` | Đã trả vào locker, chờ khách lấy |
| `COMPLETED` | Khách đã nhận đồ, hoàn tất |
| `CANCELED` | Đã hủy |

### 1.4 Format Response Chuẩn

```json
{
  "success": true,
  "code": "ORDER_CREATED",
  "message": "Order created successfully",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 2. XÁC THỰC (AUTHENTICATION)

### 2.1 Đăng Nhập Bằng Số Điện Thoại (Firebase)

#### Bước 1: Xác thực qua Firebase
> Client sử dụng Firebase SDK để xác thực số điện thoại và nhận `idToken`

#### Bước 2: Đăng nhập vào hệ thống

```http
POST /api/auth/phone/login
```

**Request Body:**
```json
{
  "idToken": "Firebase_ID_Token_here",
  "phoneNumber": "+84901234567"
}
```

**Response (Người dùng mới):**
```json
{
  "success": true,
  "code": "AUTH_PHONE_NEW_USER",
  "data": {
    "newUser": true,
    "tempToken": "temp_token_for_registration",
    "phoneNumber": "+84901234567"
  }
}
```

**Response (Người dùng đã có):**
```json
{
  "success": true,
  "code": "AUTH_PHONE_LOGIN_SUCCESS",
  "data": {
    "newUser": false,
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "fullName": "Nguyen Van A",
      "phoneNumber": "+84901234567",
      "email": "user@example.com",
      "roles": ["USER"]
    }
  }
}
```

---

#### Bước 3: Hoàn tất đăng ký (nếu là người dùng mới)

```http
POST /api/auth/complete-registration
```

**Request Body:**
```json
{
  "tempToken": "temp_token_from_step1",
  "fullName": "Nguyen Van A",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "code": "AUTH_REGISTRATION_COMPLETE",
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "fullName": "Nguyen Van A",
      "phoneNumber": "+84901234567",
      "email": "user@example.com"
    }
  }
}
```

---

### 2.2 Đăng Nhập Bằng Email OTP

#### Bước 1: Gửi OTP đến Email

```http
POST /api/auth/email/send-otp
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "code": "AUTH_OTP_SENT",
  "message": "OTP sent to email"
}
```

---

#### Bước 2: Xác thực OTP

```http
POST /api/auth/email/verify-otp
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otpCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "code": "AUTH_EMAIL_LOGIN_SUCCESS",
  "data": {
    "newUser": false,
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": { ... }
  }
}
```

---

### 2.3 Làm Mới Token

```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "code": "AUTH_REFRESH_SUCCESS",
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600
  }
}
```

---

### 2.4 Đăng Xuất

```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refreshToken": "your_refresh_token"
}
```

---

### 2.5 Quên Mật Khẩu

```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

### 2.6 Đặt Lại Mật Khẩu

```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otpCode": "123456",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

---

### 2.7 Admin Authentication (2FA)

#### Bước 1: Đăng nhập Admin

```http
POST /api/admin/auth/login
```

**Request Body:**
```json
{
  "email": "admin@laundrylocker.com",
  "password": "AdminPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "code": "ADMIN_AUTH_2FA_REQUIRED",
  "data": {
    "tempToken": "temp_token_for_2fa",
    "message": "OTP sent to email"
  }
}
```

#### Bước 2: Xác thực 2FA

```http
POST /api/admin/auth/verify-2fa
```

**Request Body:**
```json
{
  "tempToken": "temp_token_from_step1",
  "otpCode": "123456"
}
```

---

## 3. QUẢN LÝ NGƯỜI DÙNG (USER)

### 3.1 Lấy Thông Tin Profile

```http
GET /api/users/profile
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fullName": "Nguyen Van A",
    "phoneNumber": "+84901234567",
    "email": "user@example.com",
    "avatarUrl": "https://...",
    "address": "123 Nguyen Hue, Q1, HCM",
    "roles": ["USER"],
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

---

### 3.2 Cập Nhật Profile

```http
PUT /api/users/profile
```

**Request Body:**
```json
{
  "fullName": "Nguyen Van A Updated",
  "address": "456 Le Loi, Q1, HCM"
}
```

---

### 3.3 Cập Nhật Avatar

```http
PUT /api/users/avatar
```

**Request Body:**
```json
{
  "imageUrl": "https://storage.example.com/avatars/user1.jpg"
}
```

---

### 3.4 Đổi Mật Khẩu

```http
PUT /api/users/change-password
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

---

### 3.5 Đăng Ký FCM Token (Push Notification)

```http
POST /api/users/fcm-token
```

**Request Body:**
```json
{
  "fcmToken": "firebase_cloud_messaging_token",
  "deviceId": "device_unique_id",
  "deviceType": "ANDROID"
}
```

---

### 3.6 Xóa FCM Token

```http
DELETE /api/users/fcm-token?fcmToken=<token>
```

---

## 4. QUẢN LÝ ĐƠN HÀNG (ORDER)

### 4.1 Tạo Đơn Hàng Mới

```http
POST /api/orders
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body (Đơn giặt - LAUNDRY):**
```json
{
  "type": "LAUNDRY",
  "serviceCategory": "LAUNDRY",
  "lockerId": 1,
  "boxId": 5,
  "serviceIds": [1, 2, 3],
  "estimatedWeight": 5.5,
  "customerNote": "Quần áo trắng cần giặt riêng",
  "promotionCode": "SALE20"
}
```

**Request Body (Đơn lưu trữ - STORAGE):**
```json
{
  "type": "STORAGE",
  "serviceCategory": "STORAGE",
  "lockerId": 1,
  "boxIds": [5, 6],
  "intendedReceiveAt": "2024-01-20T15:00:00",
  "receiverId": 2,
  "receiverPhone": "+84901234568",
  "receiverName": "Nguyen Van B"
}
```

**Response:**
```json
{
  "success": true,
  "code": "ORDER_CREATED",
  "data": {
    "id": 100,
    "orderCode": "ORD-20240115-ABC123",
    "status": "INITIALIZED",
    "type": "LAUNDRY",
    "pinCode": "123456",
    "estimatedPrice": 150000,
    "locker": {
      "id": 1,
      "name": "Locker A - Vincom Q1"
    },
    "boxes": [{
      "id": 5,
      "boxNumber": "A05",
      "size": "MEDIUM"
    }],
    "services": [...],
    "createdAt": "2024-01-15T10:00:00",
    "expiresAt": "2024-01-15T12:00:00"
  }
}
```

---

### 4.2 Xác Nhận Đơn Hàng (Sau khi bỏ đồ)

```http
PUT /api/orders/{orderId}/confirm
```

**Response:**
```json
{
  "success": true,
  "code": "ORDER_CONFIRMED",
  "data": {
    "id": 100,
    "orderCode": "ORD-20240115-ABC123",
    "status": "WAITING",
    "confirmedAt": "2024-01-15T10:30:00"
  }
}
```

---

### 4.3 Lấy Danh Sách Đơn Hàng Của Tôi

```http
GET /api/orders/me?status=PROCESSING&page=0&size=10
```

**Query Parameters:**
| Param | Type | Mô tả |
|-------|------|-------|
| status | string | Lọc theo trạng thái (optional) |
| page | int | Số trang (default: 0) |
| size | int | Số item/trang (default: 10) |

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 100,
        "orderCode": "ORD-20240115-ABC123",
        "status": "PROCESSING",
        "totalAmount": 150000,
        "createdAt": "2024-01-15T10:00:00"
      }
    ],
    "totalElements": 25,
    "totalPages": 3,
    "number": 0
  }
}
```

---

### 4.4 Lấy Chi Tiết Đơn Hàng

```http
GET /api/orders/{orderId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 100,
    "orderCode": "ORD-20240115-ABC123",
    "status": "PROCESSING",
    "type": "LAUNDRY",
    "pinCode": "123456",
    "customer": {
      "id": 1,
      "fullName": "Nguyen Van A",
      "phoneNumber": "+84901234567"
    },
    "locker": {
      "id": 1,
      "name": "Locker A - Vincom Q1",
      "address": "123 Nguyen Hue, Q1"
    },
    "boxes": [...],
    "items": [
      {
        "serviceName": "Giặt sấy thường",
        "quantity": 1,
        "weight": 5.5,
        "unitPrice": 25000,
        "subtotal": 137500
      }
    ],
    "estimatedPrice": 150000,
    "actualPrice": 137500,
    "discountAmount": 27500,
    "totalAmount": 110000,
    "promotion": {
      "code": "SALE20",
      "discountPercent": 20
    },
    "payment": {
      "status": "COMPLETED",
      "method": "VNPAY",
      "paidAt": "2024-01-15T11:00:00"
    },
    "createdAt": "2024-01-15T10:00:00",
    "confirmedAt": "2024-01-15T10:30:00",
    "collectedAt": "2024-01-15T14:00:00"
  }
}
```

---

### 4.5 Lấy Đơn Hàng Theo Mã Order

```http
GET /api/orders/code/{orderCode}
```

**Ví dụ:** `GET /api/orders/code/ORD-20240115-ABC123`

---

### 4.6 Lấy Đơn Hàng Theo PIN Code

```http
GET /api/orders/pin/{pinCode}
```

**Ví dụ:** `GET /api/orders/pin/123456`

---

### 4.7 Lấy Trạng Thái Đơn Hàng

```http
GET /api/orders/{orderId}/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": 100,
    "orderCode": "ORD-20240115-ABC123",
    "status": "READY",
    "statusLabel": "Sẵn sàng lấy",
    "nextAction": "Vui lòng đến locker để lấy đồ",
    "pinCode": "123456",
    "boxInfo": "Hộp A05",
    "estimatedReadyAt": null,
    "canCancel": false
  }
}
```

---

### 4.8 Hủy Đơn Hàng

```http
PUT /api/orders/{orderId}/cancel?reason=1
```

**Reason Codes:**
| Code | Mô tả |
|------|-------|
| 1 | Đổi ý không muốn sử dụng |
| 2 | Tìm thấy dịch vụ khác |
| 3 | Thời gian chờ quá lâu |
| 4 | Lý do khác |

---

### 4.9 Hoàn Thành Đơn Hàng (Khách lấy đồ)

```http
PUT /api/orders/{orderId}/complete
```

---

### 4.10 Đánh Giá Đơn Hàng

```http
POST /api/orders/{orderId}/rate
```

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Dịch vụ rất tốt, quần áo thơm sạch!",
  "tags": ["FAST", "CLEAN", "FRIENDLY"]
}
```

---

### 4.11 Lấy Timeline Đơn Hàng

```http
GET /api/orders/{orderId}/timeline
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": 100,
    "timeline": [
      {
        "status": "INITIALIZED",
        "timestamp": "2024-01-15T10:00:00",
        "description": "Đơn hàng được tạo"
      },
      {
        "status": "WAITING",
        "timestamp": "2024-01-15T10:30:00",
        "description": "Đã xác nhận bỏ đồ"
      },
      {
        "status": "COLLECTED",
        "timestamp": "2024-01-15T14:00:00",
        "description": "Nhân viên đã lấy đồ"
      }
    ]
  }
}
```

---

## 5. THANH TOÁN (PAYMENT)

### 5.1 Tạo Thanh Toán Online

```http
POST /api/payments/create
```

**Request Body:**
```json
{
  "orderId": 100,
  "paymentMethod": "VNPAY",
  "bankCode": "VNBANK",
  "language": "vn"
}
```

**Payment Methods:**
- `VNPAY` - Thanh toán qua VNPay
- `MOMO` - Thanh toán qua MoMo

**Response:**
```json
{
  "success": true,
  "code": "PAYMENT_CREATED",
  "data": {
    "paymentId": 50,
    "orderId": 100,
    "amount": 110000,
    "paymentMethod": "VNPAY",
    "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "expiresAt": "2024-01-15T11:15:00"
  }
}
```

---

### 5.2 VNPay IPN Callback (Server-to-Server)

```http
GET /api/payments/vnpay-ipn?vnp_TxnRef=...&vnp_ResponseCode=00&...
```

> ⚠️ Endpoint này được VNPay gọi tự động, không cần gọi thủ công

---

### 5.3 VNPay Return URL

```http
GET /api/payments/vnpay-return?vnp_TxnRef=...&vnp_ResponseCode=00&...
```

> ⚠️ Redirect URL sau khi thanh toán xong trên VNPay

---

### 5.4 Lấy Thông Tin Thanh Toán

```http
GET /api/payments/{paymentId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 50,
    "orderId": 100,
    "amount": 110000,
    "method": "VNPAY",
    "status": "COMPLETED",
    "transactionId": "VNP123456789",
    "paidAt": "2024-01-15T11:00:00",
    "createdAt": "2024-01-15T10:45:00"
  }
}
```

---

### 5.5 Lấy Thanh Toán Theo Order

```http
GET /api/payments/order/{orderId}
```

---

### 5.6 Yêu Cầu Hoàn Tiền

```http
POST /api/payments/{paymentId}/refund
```

**Request Body:**
```json
{
  "amount": 110000,
  "reason": "Đơn hàng bị hủy do lỗi hệ thống"
}
```

---

### 5.7 Kiểm Tra Trạng Thái Hoàn Tiền

```http
GET /api/payments/refund/{refundId}
```

---

## 6. DỊCH VỤ GIẶT (SERVICE)

### 6.1 Lấy Tất Cả Dịch Vụ

```http
GET /api/services
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Giặt sấy thường",
      "description": "Giặt và sấy khô quần áo thông thường",
      "category": "LAUNDRY",
      "pricePerUnit": 25000,
      "unit": "KG",
      "estimatedTime": 24,
      "imageUrl": "https://...",
      "isActive": true
    },
    {
      "id": 2,
      "name": "Giặt khô",
      "description": "Giặt khô cho quần áo cao cấp",
      "category": "LAUNDRY",
      "pricePerUnit": 50000,
      "unit": "KG",
      "estimatedTime": 48,
      "imageUrl": "https://...",
      "isActive": true
    },
    {
      "id": 3,
      "name": "Lưu trữ - Hộp nhỏ",
      "description": "Lưu trữ đồ trong hộp nhỏ",
      "category": "STORAGE",
      "pricePerUnit": 5000,
      "unit": "HOUR",
      "imageUrl": "https://...",
      "isActive": true
    }
  ]
}
```

---

### 6.2 Lấy Dịch Vụ Theo Cửa Hàng

```http
GET /api/services?storeId=1
```

---

### 6.3 Lấy Chi Tiết Dịch Vụ

```http
GET /api/services/{id}
```

---

## 7. LOCKER & BOX

### 7.1 Lấy Tất Cả Locker

```http
GET /api/lockers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Locker A - Vincom Q1",
      "code": "LOC-001",
      "address": "123 Nguyen Hue, Q1, HCM",
      "latitude": 10.7751,
      "longitude": 106.7019,
      "storeId": 1,
      "storeName": "Cửa hàng Vincom Q1",
      "totalBoxes": 20,
      "availableBoxes": 15,
      "isActive": true,
      "isMaintenance": false,
      "imageUrl": "https://..."
    }
  ]
}
```

---

### 7.2 Lấy Locker Theo Cửa Hàng

```http
GET /api/lockers?storeId=1
```

---

### 7.3 Lấy Chi Tiết Locker

```http
GET /api/lockers/{id}
```

---

### 7.4 Lấy Các Box Trong Locker

```http
GET /api/lockers/{id}/boxes
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "boxNumber": "A05",
      "size": "MEDIUM",
      "status": "AVAILABLE",
      "lockerId": 1
    },
    {
      "id": 6,
      "boxNumber": "A06",
      "size": "LARGE",
      "status": "OCCUPIED",
      "lockerId": 1
    }
  ]
}
```

---

### 7.5 Lấy Box Trống

```http
GET /api/lockers/{id}/boxes/available
```

---

## 8. CỬA HÀNG (STORE)

### 8.1 Lấy Tất Cả Cửa Hàng

```http
GET /api/stores
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cửa hàng Vincom Q1",
      "address": "123 Nguyen Hue, Q1, HCM",
      "phone": "028-12345678",
      "email": "vincom-q1@laundrylocker.com",
      "latitude": 10.7751,
      "longitude": 106.7019,
      "openTime": "07:00",
      "closeTime": "22:00",
      "rating": 4.5,
      "totalRatings": 150,
      "imageUrl": "https://...",
      "isActive": true
    }
  ]
}
```

---

### 8.2 Tìm Cửa Hàng Gần Đây

```http
GET /api/stores/nearby?latitude=10.7751&longitude=106.7019&radiusMeters=5000&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cửa hàng Vincom Q1",
      "distance": 250,
      "distanceLabel": "250m",
      "address": "...",
      "availableLockers": 3
    }
  ]
}
```

---

### 8.3 Lấy Đánh Giá Cửa Hàng

```http
GET /api/stores/{storeId}/ratings?page=0&size=10
```

---

## 9. THÔNG BÁO (NOTIFICATION)

### 9.1 Lấy Thông Báo (Phân Trang)

```http
GET /api/notifications?page=0&size=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Đơn hàng đã sẵn sàng",
        "body": "Đơn hàng ORD-20240115-ABC123 đã sẵn sàng để lấy",
        "type": "ORDER_READY",
        "orderId": 100,
        "isRead": false,
        "createdAt": "2024-01-15T16:00:00"
      }
    ],
    "totalElements": 50
  }
}
```

---

### 9.2 Lấy Thông Báo Chưa Đọc

```http
GET /api/notifications/unread
```

---

### 9.3 Đếm Số Thông Báo Chưa Đọc

```http
GET /api/notifications/unread/count
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

### 9.4 Đánh Dấu Đã Đọc

```http
PUT /api/notifications/{id}/read
```

---

### 9.5 Đánh Dấu Tất Cả Đã Đọc

```http
PUT /api/notifications/read-all
```

---

### 9.6 Xóa Thông Báo

```http
DELETE /api/notifications/{id}
```

---

## 10. LOYALTY - ĐIỂM THƯỞNG

### 10.1 Lấy Tổng Quan Loyalty

```http
GET /api/loyalty/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "points": {
      "currentBalance": 15000,
      "totalEarned": 25000,
      "totalRedeemed": 10000,
      "expiringPoints": 5000,
      "expiringDate": "2024-02-15"
    },
    "stampCards": [
      {
        "id": 1,
        "serviceName": "Giặt sấy thường",
        "currentStamps": 4,
        "requiredStamps": 6,
        "rewardDescription": "1 lần giặt miễn phí"
      }
    ],
    "tier": "SILVER",
    "nextTier": "GOLD",
    "pointsToNextTier": 5000
  }
}
```

---

### 10.2 Lấy Thông Tin Điểm

```http
GET /api/loyalty/points
```

---

### 10.3 Lấy Lịch Sử Điểm

```http
GET /api/loyalty/points/history?page=0&size=20
```

---

### 10.4 Đổi Điểm

```http
POST /api/loyalty/points/redeem
```

**Request Body:**
```json
{
  "orderId": 100,
  "pointsToRedeem": 5000
}
```

> 💡 **Quy đổi:** 1 điểm = 1 VND

---

### 10.5 Lấy Thẻ Tem

```http
GET /api/loyalty/stamps
```

---

### 10.6 Đổi Tem Lấy Thưởng

```http
POST /api/loyalty/stamps/redeem
```

**Request Body:**
```json
{
  "stampCardId": 1,
  "orderId": 100
}
```

---

### 10.7 Xem Phần Thưởng Có Thể Đổi

```http
GET /api/loyalty/rewards
```

---

### 10.8 Xem Điểm Sắp Hết Hạn

```http
GET /api/loyalty/points/expiring
```

---

## 11. PARTNER API

> 🔐 **Yêu cầu quyền:** `PARTNER`

### 11.1 Đăng Ký Làm Partner

```http
POST /api/partner
```

**Request Body:**
```json
{
  "businessName": "Công ty TNHH Giặt Là ABC",
  "businessLicense": "0123456789",
  "taxCode": "0123456789-001",
  "bankAccount": "1234567890",
  "bankName": "Vietcombank"
}
```

---

### 11.2 Lấy Thông Tin Partner

```http
GET /api/partner
```

---

### 11.3 Dashboard Partner

```http
GET /api/partner/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "todayOrders": 25,
    "pendingOrders": 5,
    "processingOrders": 10,
    "completedOrders": 200,
    "todayRevenue": 5000000,
    "monthRevenue": 150000000,
    "rating": 4.8
  }
}
```

---

### 11.4 Lấy Đơn Hàng Chờ Xử Lý

```http
GET /api/partner/orders/pending?page=0&size=20
```

---

### 11.5 Chấp Nhận Đơn Hàng

```http
POST /api/partner/orders/{orderId}/accept?expirationHours=24
```

**Response:** Trả về mã truy cập cho nhân viên đi lấy đồ

```json
{
  "success": true,
  "data": {
    "orderId": 100,
    "accessCode": "ACC-123456",
    "expiresAt": "2024-01-16T10:00:00",
    "boxInfo": "Locker A - Box A05"
  }
}
```

---

### 11.6 Cập Nhật Trạng Thái Đang Xử Lý

```http
POST /api/partner/orders/{orderId}/process
```

---

### 11.7 Đánh Dấu Hoàn Thành & Tạo Mã Trả Đồ

```http
POST /api/partner/orders/{orderId}/ready?expirationHours=24
```

---

### 11.8 Cập Nhật Cân Nặng Thực Tế

```http
PUT /api/partner/orders/{orderId}/weight
```

**Request Body:**
```json
{
  "actualWeight": 5.5,
  "notes": "Có 2 áo cần xử lý riêng"
}
```

---

### 11.9 Quản Lý Staff Access Code

```http
GET /api/partner/access-codes
POST /api/partner/access-codes/generate
POST /api/partner/access-codes/{codeId}/cancel
```

---

### 11.10 Quản Lý Nhân Viên

```http
GET /api/partner/staff
POST /api/partner/staff/{staffId}
DELETE /api/partner/staff/{staffId}
```

---

### 11.11 Thống Kê Doanh Thu

```http
GET /api/partner/revenue?fromDate=2024-01-01T00:00:00&toDate=2024-01-31T23:59:59
```

---

## 12. STAFF API

> 🔐 **Yêu cầu quyền:** `PARTNER` hoặc `ADMIN`

### 12.1 Tổng Quan Đơn Hàng

```http
GET /api/staff/orders
```

---

### 12.2 Đơn Hàng Chờ Lấy

```http
GET /api/staff/orders/waiting
```

---

### 12.3 Đơn Hàng Đang Xử Lý

```http
GET /api/staff/orders/processing
```

---

### 12.4 Đơn Hàng Sẵn Sàng Trả

```http
GET /api/staff/orders/ready
```

---

### 12.5 Nhận Đơn Hàng

```http
POST /api/staff/orders/{orderId}/assign
```

---

### 12.6 Mở Khóa Box

```http
POST /api/staff/unlock-box
```

**Request Body:**
```json
{
  "lockerId": 1,
  "boxNumber": "A05",
  "masterPin": "999999"
}
```

---

## 13. IoT API

### 13.1 Xác Thực PIN

```http
POST /api/iot/verify-pin
```

**Request Body:**
```json
{
  "lockerId": 1,
  "boxNumber": "A05",
  "pinCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "orderType": "CUSTOMER_PICKUP",
    "orderId": 100,
    "message": "PIN hợp lệ. Vui lòng mở cửa."
  }
}
```

---

### 13.2 Mở Khóa Box

```http
POST /api/iot/unlock
```

**Request Body:**
```json
{
  "lockerId": 1,
  "boxNumber": "A05",
  "pinCode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "unlockToken": "UNL-TOKEN-123",
    "boxId": 5,
    "message": "Box đã được mở"
  }
}
```

---

### 13.3 Xác Nhận Lấy Đồ

```http
POST /api/iot/pickup
```

**Request Body:**
```json
{
  "orderId": 100,
  "lockerId": 1,
  "boxId": 5
}
```

---

### 13.4 Cập Nhật Trạng Thái Box

```http
POST /api/iot/box-status
```

**Request Body:**
```json
{
  "lockerId": 1,
  "boxId": 5,
  "status": "CLOSED",
  "sensorData": {
    "temperature": 25,
    "humidity": 60
  }
}
```

---

### 13.5 Mở Khóa Bằng Staff Access Code

```http
POST /api/iot/unlock-with-code
```

**Request Body:**
```json
{
  "lockerId": 1,
  "boxNumber": "A05",
  "accessCode": "ACC-123456"
}
```

---

## 14. ADMIN API

> 🔐 **Yêu cầu quyền:** `ADMIN`

### 14.1 Dashboard

```http
GET /api/admin/dashboard/overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 10000,
    "newUsersToday": 50,
    "totalOrders": 50000,
    "ordersToday": 200,
    "totalRevenue": 5000000000,
    "revenueToday": 25000000,
    "activeLockers": 100,
    "pendingPartners": 5
  }
}
```

---

### 14.2 Quản Lý Users

```http
GET    /api/admin/users
POST   /api/admin/users
GET    /api/admin/users/{id}
PUT    /api/admin/users/{id}
PUT    /api/admin/users/{id}/status
PUT    /api/admin/users/{id}/roles
DELETE /api/admin/users/{id}
```

---

### 14.3 Quản Lý Orders

```http
GET /api/admin/orders?status=PROCESSING&page=0&size=20
GET /api/admin/orders/{id}
PUT /api/admin/orders/{id}/status?status=COMPLETED
GET /api/admin/orders/statistics
GET /api/admin/orders/revenue
```

---

### 14.4 Quản Lý Stores

```http
GET    /api/admin/stores
POST   /api/admin/stores
GET    /api/admin/stores/{id}
PUT    /api/admin/stores/{id}
PUT    /api/admin/stores/{id}/status
PUT    /api/admin/stores/{id}/image
DELETE /api/admin/stores/{id}
```

---

### 14.5 Quản Lý Lockers

```http
GET    /api/admin/lockers
POST   /api/admin/lockers
GET    /api/admin/lockers/{id}
PUT    /api/admin/lockers/{id}
PUT    /api/admin/lockers/{id}/maintenance
POST   /api/admin/lockers/{id}/boxes
PUT    /api/admin/lockers/boxes/{boxId}/status
DELETE /api/admin/lockers/{id}
```

---

### 14.6 Quản Lý Services

```http
GET    /api/admin/services
POST   /api/admin/services
GET    /api/admin/services/{id}
PUT    /api/admin/services/{id}
PUT    /api/admin/services/{id}/price
PUT    /api/admin/services/{id}/status
DELETE /api/admin/services/{id}
```

---

### 14.7 Quản Lý Promotions

```http
GET    /api/admin/promotions
POST   /api/admin/promotions
GET    /api/admin/promotions/{promotionId}
PUT    /api/admin/promotions/{promotionId}
DELETE /api/admin/promotions/{promotionId}
GET    /api/admin/promotions/active
GET    /api/admin/promotions/status/{status}
GET    /api/admin/promotions/validate/{code}
GET    /api/admin/promotions/search?keyword=SALE
```

---

### 14.8 Quản Lý Partners

```http
GET  /api/admin/partners?status=PENDING
GET  /api/admin/partners/{partnerId}
POST /api/admin/partners/{partnerId}/approve
POST /api/admin/partners/{partnerId}/reject?reason=...
POST /api/admin/partners/{partnerId}/suspend
```

---

### 14.9 Quản Lý Payments

```http
GET /api/admin/payments?status=COMPLETED
GET /api/admin/payments/{paymentId}
PUT /api/admin/payments/{paymentId}/status?status=REFUNDED
```

---

### 14.10 Quản Lý Loyalty

```http
GET  /api/admin/loyalty/users/{userId}
POST /api/admin/loyalty/users/{userId}/adjust-points
GET  /api/admin/loyalty/users/{userId}/history
GET  /api/admin/loyalty/statistics
```

---

### 14.11 System Health

```http
GET /api/admin/system/health
```

---

### 14.12 Scheduler Management

```http
GET  /api/admin/scheduler/status
POST /api/admin/scheduler/auto-cancel
POST /api/admin/scheduler/release-boxes
POST /api/admin/scheduler/pickup-reminders
```

---

### 14.13 Audit Logs

```http
GET /api/admin/audit-logs
GET /api/admin/audit-logs/entity/{entityType}/{entityId}
GET /api/admin/audit-logs/user/{userId}
GET /api/admin/audit-logs/statistics
```

---

## 15. LUỒNG NGHIỆP VỤ CHI TIẾT

### 15.1 Luồng Đặt Đơn Giặt (LAUNDRY) - Customer

```
┌──────────────────────────────────────────────────────────────────────┐
│                    LUỒNG ĐẶT ĐƠN GIẶT (LAUNDRY)                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1️⃣  Khách hàng chọn cửa hàng & locker                              │
│      GET /api/stores/nearby                                          │
│      GET /api/lockers?storeId=1                                      │
│      GET /api/lockers/1/boxes/available                              │
│                                                                      │
│  2️⃣  Chọn dịch vụ                                                   │
│      GET /api/services?storeId=1                                     │
│                                                                      │
│  3️⃣  Tạo đơn hàng                                                   │
│      POST /api/orders                                                │
│      → Nhận PIN CODE để mở box                                       │
│      → Status: INITIALIZED                                           │
│                                                                      │
│  4️⃣  Đến locker, dùng PIN mở box, bỏ đồ vào                        │
│      POST /api/iot/unlock {pinCode}                                  │
│                                                                      │
│  5️⃣  Xác nhận đã bỏ đồ                                              │
│      PUT /api/orders/{id}/confirm                                    │
│      → Status: WAITING                                               │
│                                                                      │
│  6️⃣  Theo dõi trạng thái                                            │
│      GET /api/orders/{id}/status                                     │
│      GET /api/notifications                                          │
│                                                                      │
│  7️⃣  Nhận thông báo đơn hoàn thành → đến lấy                        │
│      → Status: RETURNED                                              │
│      → Dùng PIN mới để mở box lấy đồ                                 │
│                                                                      │
│  8️⃣  Hoàn thành & đánh giá                                          │
│      PUT /api/orders/{id}/complete                                   │
│      POST /api/orders/{id}/rate                                      │
│      → Status: COMPLETED                                             │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 15.2 Luồng Xử Lý Đơn - Partner/Staff

```
┌──────────────────────────────────────────────────────────────────────┐
│                    LUỒNG XỬ LÝ ĐƠN HÀNG (PARTNER)                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1️⃣  Xem đơn hàng mới                                               │
│      GET /api/partner/orders/pending                                 │
│                                                                      │
│  2️⃣  Chấp nhận đơn → nhận mã truy cập                               │
│      POST /api/partner/orders/{id}/accept                            │
│      → Nhận Access Code cho nhân viên                                │
│                                                                      │
│  3️⃣  Nhân viên đến locker lấy đồ                                    │
│      POST /api/iot/unlock-with-code {accessCode}                     │
│      → Order Status: COLLECTED                                       │
│                                                                      │
│  4️⃣  Cân đo thực tế                                                 │
│      PUT /api/partner/orders/{id}/weight                             │
│                                                                      │
│  5️⃣  Bắt đầu xử lý                                                  │
│      POST /api/partner/orders/{id}/process                           │
│      → Status: PROCESSING                                            │
│                                                                      │
│  6️⃣  Hoàn thành giặt → đánh dấu sẵn sàng                            │
│      POST /api/partner/orders/{id}/ready                             │
│      → Nhận Access Code mới để trả đồ                                │
│      → Status: READY                                                 │
│                                                                      │
│  7️⃣  Trả đồ vào locker                                              │
│      POST /api/iot/unlock-with-code {newAccessCode}                  │
│      PUT /api/orders/{id}/return                                     │
│      → Status: RETURNED                                              │
│      → Thông báo gửi đến khách hàng                                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 15.3 Luồng Thanh Toán Online

```
┌──────────────────────────────────────────────────────────────────────┐
│                    LUỒNG THANH TOÁN VNPAY/MOMO                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1️⃣  Tạo yêu cầu thanh toán                                         │
│      POST /api/payments/create                                       │
│      {                                                               │
│        "orderId": 100,                                               │
│        "paymentMethod": "VNPAY"                                      │
│      }                                                               │
│      → Nhận paymentUrl                                               │
│                                                                      │
│  2️⃣  Redirect user đến trang thanh toán                             │
│      → VNPay/MoMo payment page                                       │
│                                                                      │
│  3️⃣  User hoàn thành thanh toán                                     │
│                                                                      │
│  4️⃣  VNPay gọi IPN callback (server-to-server)                      │
│      GET /api/payments/vnpay-ipn                                     │
│      → Cập nhật trạng thái thanh toán                                │
│                                                                      │
│  5️⃣  Redirect user về app                                           │
│      GET /api/payments/vnpay-return                                  │
│                                                                      │
│  6️⃣  App kiểm tra trạng thái                                        │
│      GET /api/payments/{paymentId}                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 15.4 Luồng Sử Dụng Promotion

```
┌──────────────────────────────────────────────────────────────────────┐
│                    LUỒNG ÁP DỤNG KHUYẾN MÃI                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1️⃣  Validate mã khuyến mãi (optional)                              │
│      GET /api/admin/promotions/validate/{code}                       │
│      → Kiểm tra mã còn hiệu lực không                                │
│                                                                      │
│  2️⃣  Tạo đơn hàng với mã khuyến mãi                                 │
│      POST /api/orders                                                │
│      {                                                               │
│        ...,                                                          │
│        "promotionCode": "SALE20"                                     │
│      }                                                               │
│                                                                      │
│  3️⃣  Hệ thống tự động:                                              │
│      - Kiểm tra điều kiện áp dụng                                    │
│      - Tính toán giảm giá                                            │
│      - Ghi nhận vào đơn hàng                                         │
│                                                                      │
│  4️⃣  Response trả về thông tin discount                             │
│      {                                                               │
│        "estimatedPrice": 100000,                                     │
│        "discountAmount": 20000,                                      │
│        "totalAmount": 80000,                                         │
│        "promotion": {                                                │
│          "code": "SALE20",                                           │
│          "discountPercent": 20                                       │
│        }                                                             │
│      }                                                               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 15.5 Luồng Sử Dụng Loyalty Points

```
┌──────────────────────────────────────────────────────────────────────┐
│                    LUỒNG TÍCH & ĐỔI ĐIỂM                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📥 TÍCH ĐIỂM (Tự động khi thanh toán)                               │
│  ────────────────────────────────────                                │
│  - Mỗi 10,000 VND = 1 điểm                                           │
│  - Điểm được cộng sau khi đơn COMPLETED                              │
│                                                                      │
│  📤 ĐỔI ĐIỂM                                                         │
│  ────────────                                                        │
│  1️⃣  Xem số điểm hiện có                                            │
│      GET /api/loyalty/points                                         │
│                                                                      │
│  2️⃣  Đổi điểm khi thanh toán                                        │
│      POST /api/loyalty/points/redeem                                 │
│      {                                                               │
│        "orderId": 100,                                               │
│        "pointsToRedeem": 5000                                        │
│      }                                                               │
│      → Giảm 5,000 VND trong đơn hàng                                 │
│                                                                      │
│  🎫 THẺ TEM                                                          │
│  ─────────                                                           │
│  - Mỗi đơn hàng = 1 tem                                              │
│  - 6 tem = 1 lần giặt miễn phí                                       │
│                                                                      │
│  POST /api/loyalty/stamps/redeem                                     │
│  {                                                                   │
│    "stampCardId": 1,                                                 │
│    "orderId": 100                                                    │
│  }                                                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📌 PHỤ LỤC

### A. HTTP Status Codes

| Code | Ý nghĩa |
|------|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Bad Request - Dữ liệu không hợp lệ |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền |
| 404 | Not Found - Không tìm thấy |
| 500 | Internal Server Error |

### B. Common Error Codes

| Code | Mô tả |
|------|-------|
| `AUTH_TOKEN_EXPIRED` | Token đã hết hạn |
| `AUTH_INVALID_TOKEN` | Token không hợp lệ |
| `ORDER_NOT_FOUND` | Không tìm thấy đơn hàng |
| `INVALID_ORDER_STATUS` | Trạng thái đơn hàng không hợp lệ |
| `BOX_NOT_AVAILABLE` | Box không khả dụng |
| `PAYMENT_FAILED` | Thanh toán thất bại |
| `PROMOTION_EXPIRED` | Mã khuyến mãi đã hết hạn |
| `INSUFFICIENT_POINTS` | Không đủ điểm |

### C. Pagination Format

```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

### D. Headers Required

```
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
Accept-Language: vi  (vi, en, ja)
```

---

> 📧 **Liên hệ hỗ trợ:** support@laundrylocker.com  
> 📚 **Swagger Documentation:** http://localhost:8080/swagger-ui.html
