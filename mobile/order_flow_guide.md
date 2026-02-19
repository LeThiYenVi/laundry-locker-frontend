# 📦 Hướng Dẫn Chi Tiết Luồng Order API

> Tài liệu mô tả chi tiết luồng xử lý đơn hàng, bao gồm API endpoints, request/response mẫu và business rules.

---

## 📋 Mục Lục

1. [Tổng Quan](#1-tổng-quan)
2. [Các Loại Dịch Vụ](#2-các-loại-dịch-vụ)
3. [Luồng STORAGE (Gửi Đồ)](#3-luồng-storage-gửi-đồ)
4. [Luồng LAUNDRY (Giặt Đồ)](#4-luồng-laundry-giặt-đồ)
5. [Tính Phí Phạt Trễ](#5-tính-phí-phạt-trễ)
6. [Chương Trình Khuyến Mãi](#6-chương-trình-khuyến-mãi)
7. [API Reference](#7-api-reference)
8. [Order Status Flow](#8-order-status-flow)

---

## 1. Tổng Quan

### 1.1 Service Categories

| Category | Mô tả | Pricing | Payment Timing |
|----------|-------|---------|----------------|
| **STORAGE** 📦 | Gửi đồ vào locker (không giặt) | Fixed price | Thanh toán **trước** khi gửi |
| **LAUNDRY** 🧺 | Gửi đồ để giặt | Per-weight | Thanh toán **sau** khi nhận |

### 1.2 Order Status Flow

```
INITIALIZED → WAITING → COLLECTED → PROCESSING → READY → RETURNED → COMPLETED
     ↓
  CANCELED
```

### 1.3 Vai Trò Tham Gia

| Vai trò | Mô tả |
|---------|-------|
| **Customer (USER)** | Tạo order, thanh toán, nhận đồ |
| **Staff** | Lấy đồ từ locker, trả đồ về locker (sử dụng AccessCode) |
| **Partner** | Quản lý dịch vụ giặt, xử lý đơn hàng |

---

## 2. Các Loại Dịch Vụ

### 2.1 ServiceCategory Enum

```java
public enum ServiceCategory {
    STORAGE,    // Gửi đồ - giá cố định
    LAUNDRY     // Giặt đồ - tính theo cân
}
```

### 2.2 PricingType Enum

```java
public enum PricingType {
    FIXED,      // Giá cố định
    PER_WEIGHT, // Tính theo kg
    PER_PIECE   // Tính theo món
}
```

---

## 3. Luồng STORAGE (Gửi Đồ)

### 📌 Đặc điểm:
- **Pricing**: Fixed price (giá cố định theo thời gian lưu trữ)
- **Payment**: Thanh toán **TRƯỚC** khi gửi đồ
- **Processing**: Không qua Partner giặt
- **Promotion**: Có thể áp dụng mã khuyến mãi khi tạo order

### 3.1 Giai Đoạn 1: Tạo Order (Với Mã Khuyến Mãi)

**API**: `POST /api/v1/orders`

**Request:**
```json
{
  "lockerId": 1,
  "boxId": 5,
  "type": "STANDARD_DROPOFF",
  "serviceCategory": "STORAGE",
  "receiverId": null,
  "receiverName": "Nguyễn Văn B",
  "receiverPhone": "0987654321",
  "intendedReceiveAt": "2025-01-20T18:00:00",
  "customerNote": "Đồ dễ vỡ, xin nhẹ tay",
  "promotionCode": "NEWUSER50",
  "items": [
    {
      "serviceId": 1,
      "quantity": 1,
      "description": "Gói hàng"
    }
  ]
}
```

**Response** (Status: `INITIALIZED` - Với mã khuyến mãi):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 101,
    "type": "STANDARD_DROPOFF",
    "status": "INITIALIZED",
    "serviceCategory": "STORAGE",
    "pricingType": "FIXED",
    "pinCode": "845721",
    
    "senderId": 10,
    "senderName": "Nguyễn Văn A",
    "senderPhone": "0912345678",
    
    "receiverName": "Nguyễn Văn B",
    "receiverPhone": "0987654321",
    
    "lockerId": 1,
    "lockerName": "Locker Vincom Q1",
    "lockerCode": "LK001",
    "sendBoxNumber": 5,
    
    "originalPrice": 50000,
    "promotionCode": "NEWUSER50",
    "appliedPromotionCodes": ["NEWUSER50"],
    "promotionDiscount": 25000,
    "discount": 25000,
    "totalPrice": 25000,
    "storagePrice": 50000,
    
    "promotionInfo": {
      "code": "NEWUSER50",
      "title": "Giảm 50% cho người dùng mới",
      "discountType": "PERCENTAGE",
      "discountValue": 50,
      "maxDiscountAmount": 100000,
      "calculatedDiscount": 25000,
      "applied": true,
      "message": "Áp dụng thành công mã NEWUSER50"
    },
    
    "isPaid": false,
    "paymentRequired": true,
    "nextAction": "PAY_AND_DROP",
    "nextActionMessage": "Vui lòng thanh toán và đặt đồ vào locker",
    
    "intendedReceiveAt": "2025-01-20T18:00:00",
    "createdAt": "2025-01-19T10:00:00"
  }
}
```

### 3.2 Giai Đoạn 2: Thanh Toán

**API**: `POST /api/v1/orders/{orderId}/checkout`

**Request:**
```json
{
  "paymentMethod": "MOMO",
  "note": "Thanh toán qua MoMo"
}
```

**Response** (Payment completed - đã trừ khuyến mãi):
```json
{
  "success": true,
  "message": "Payment successful",
  "data": {
    "id": 201,
    "orderId": 101,
    "amount": 25000,
    "method": "MOMO",
    "status": "COMPLETED",
    "referenceId": "MOMO_123456789",
    "createdAt": "2025-01-19T10:05:00"
  }
}
```

### 3.3 Giai Đoạn 3: Đặt Đồ Vào Locker

**API**: `PUT /api/v1/orders/{orderId}/confirm`

> Customer dùng PIN code để mở locker, đặt đồ vào, sau đó xác nhận

**Response** (Status: `WAITING`):
```json
{
  "success": true,
  "message": "Order confirmed",
  "data": {
    "id": 101,
    "status": "WAITING",
    "isPaid": true,
    "paymentRequired": false,
    "nextAction": "WAIT_FOR_STAFF",
    "nextActionMessage": "Đang chờ nhân viên lấy đồ",
    "pinCode": "845721"
  }
}
```

### 3.4 Giai Đoạn 4: Staff Trả Đồ Về Locker (Cho Người Nhận)

**API**: `PUT /api/v1/orders/{orderId}/return?boxId={boxId}&staffId={staffId}`

**Response** (Status: `RETURNED`):
```json
{
  "success": true,
  "message": "Order returned to locker",
  "data": {
    "id": 101,
    "status": "RETURNED",
    "receiveBoxNumber": 8,
    "pinCode": "923456",
    
    "returnedAt": "2025-01-19T14:00:00",
    "pickupDeadline": "2025-01-20T14:00:00",
    
    "isOvertime": false,
    "overtimeHours": 0,
    
    "nextAction": "PICKUP",
    "nextActionMessage": "Đồ đã được trả, vui lòng đến lấy"
  }
}
```

### 3.5 Giai Đoạn 5: Người Nhận Lấy Đồ

**API**: `PUT /api/v1/orders/{orderId}/complete`

**Response** (Status: `COMPLETED`):
```json
{
  "success": true,
  "message": "Order completed",
  "data": {
    "id": 101,
    "status": "COMPLETED",
    "completedAt": "2025-01-19T16:00:00",
    
    "isOvertime": false,
    "overtimeHours": 0,
    "totalPrice": 25000,
    
    "nextAction": "DONE",
    "nextActionMessage": "Đơn hàng hoàn tất"
  }
}
```

---

## 4. Luồng LAUNDRY (Giặt Đồ)

### 📌 Đặc điểm:
- **Pricing**: Per-weight (tính theo kg)
- **Payment**: Thanh toán **SAU** khi staff trả đồ
- **Processing**: Qua Partner xử lý giặt

### 4.1 Giai Đoạn 1: Tạo Order

**API**: `POST /api/v1/orders`

**Request:**
```json
{
  "lockerId": 1,
  "boxId": 5,
  "type": "LAUNDRY",
  "serviceCategory": "LAUNDRY",
  "receiverId": null,
  "receiverName": null,
  "receiverPhone": null,
  "intendedReceiveAt": "2025-01-21T18:00:00",
  "estimatedWeight": 3.5,
  "customerNote": "Có 2 áo trắng cần giặt riêng",
  "items": [
    {
      "serviceId": 5,
      "quantity": 1,
      "description": "Giặt + sấy thường"
    }
  ]
}
```

**Response** (Status: `INITIALIZED`):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 102,
    "type": "LAUNDRY",
    "status": "INITIALIZED",
    "serviceCategory": "LAUNDRY",
    "pricingType": "PER_WEIGHT",
    "pinCode": "741852",
    
    "senderId": 10,
    "senderName": "Nguyễn Văn A",
    "senderPhone": "0912345678",
    
    "lockerId": 1,
    "lockerName": "Locker Vincom Q1",
    "sendBoxNumber": 5,
    
    "estimatedPrice": {
      "minPrice": 35000,
      "maxPrice": 52500,
      "estimatedWeight": 3.5,
      "note": "Giá ước tính dựa trên cân nặng bạn nhập. Giá chính xác sẽ được tính sau khi cân thực tế."
    },
    
    "totalPrice": null,
    
    "isPaid": false,
    "paymentRequired": false,
    "nextAction": "DROP_ITEMS",
    "nextActionMessage": "Vui lòng đặt đồ vào locker",
    
    "intendedReceiveAt": "2025-01-21T18:00:00",
    "createdAt": "2025-01-19T10:00:00"
  }
}
```

### 4.2 Giai Đoạn 2: Đặt Đồ Vào Locker

**API**: `PUT /api/v1/orders/{orderId}/confirm`

> Customer dùng PIN code để mở locker, đặt đồ vào, xác nhận

**Response** (Status: `WAITING`):
```json
{
  "success": true,
  "message": "Order confirmed",
  "data": {
    "id": 102,
    "status": "WAITING",
    "isPaid": false,
    "paymentRequired": false,
    "nextAction": "WAIT_FOR_STAFF",
    "nextActionMessage": "Đang chờ nhân viên lấy đồ"
  }
}
```

### 4.3 Giai Đoạn 3: Staff Lấy Đồ

**API**: `PUT /api/v1/orders/{orderId}/collect?staffId={staffId}`

**Response** (Status: `COLLECTED`):
```json
{
  "success": true,
  "message": "Order collected by staff",
  "data": {
    "id": 102,
    "status": "COLLECTED",
    "staffId": 20,
    "staffName": "Nhân viên A",
    
    "nextAction": "PROCESSING",
    "nextActionMessage": "Đồ đã được lấy, đang chuẩn bị xử lý"
  }
}
```

### 4.4 Giai Đoạn 4: Cân Đồ & Cập Nhật Giá

**API**: `PUT /api/v1/orders/{orderId}/weight`

**Request:**
```json
{
  "actualWeight": 4.2,
  "weightUnit": "kg"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Order weight updated",
  "data": {
    "id": 102,
    "status": "COLLECTED",
    "actualWeight": 4.2,
    "weightUnit": "kg",
    
    "totalPrice": 63000,
    "priceBreakdown": {
      "basePrice": 63000,
      "storageFee": 0,
      "overtimeFee": 0,
      "shippingFee": 0,
      "discount": 0,
      "note": "Giá tính theo cân thực tế: 4.2kg × 15,000đ/kg"
    },
    
    "nextAction": "PROCESSING",
    "nextActionMessage": "Đồ đã được lấy, đang chuẩn bị xử lý"
  }
}
```

### 4.5 Giai Đoạn 5: Xử Lý Giặt

**API**: `PUT /api/v1/orders/{orderId}/process?staffId={staffId}`

**Response** (Status: `PROCESSING`):
```json
{
  "success": true,
  "message": "Order is being processed",
  "data": {
    "id": 102,
    "status": "PROCESSING",
    "nextAction": "WAIT_FOR_READY",
    "nextActionMessage": "Đồ đang được giặt"
  }
}
```

### 4.6 Giai Đoạn 6: Giặt Xong

**API**: `PUT /api/v1/orders/{orderId}/ready?staffId={staffId}`

**Response** (Status: `READY`):
```json
{
  "success": true,
  "message": "Order is ready for return",
  "data": {
    "id": 102,
    "status": "READY",
    "nextAction": "WAIT_FOR_RETURN",
    "nextActionMessage": "Đồ đã giặt xong, đang chờ trả về locker"
  }
}
```

### 4.7 Giai Đoạn 7: Staff Trả Đồ Về Locker

**API**: `PUT /api/v1/orders/{orderId}/return?boxId={boxId}&staffId={staffId}`

**Response** (Status: `RETURNED`):
```json
{
  "success": true,
  "message": "Order returned to locker",
  "data": {
    "id": 102,
    "status": "RETURNED",
    "receiveBoxNumber": 12,
    "pinCode": "369147",
    
    "returnedAt": "2025-01-21T10:00:00",
    "pickupDeadline": "2025-01-22T10:00:00",
    
    "totalPrice": 63000,
    "isOvertime": false,
    "overtimeHours": 0,
    
    "isPaid": false,
    "paymentRequired": true,
    "nextAction": "PAY_AND_PICKUP",
    "nextActionMessage": "Đồ đã được trả, vui lòng thanh toán và lấy đồ"
  }
}
```

### 4.8 Giai Đoạn 8: Thanh Toán & Lấy Đồ

**API 1**: `POST /api/v1/orders/{orderId}/checkout`

**Request:**
```json
{
  "paymentMethod": "VNPAY",
  "note": "Thanh toán qua VNPay"
}
```

**API 2**: `PUT /api/v1/orders/{orderId}/complete`

**Response** (Status: `COMPLETED`):
```json
{
  "success": true,
  "message": "Order completed",
  "data": {
    "id": 102,
    "status": "COMPLETED",
    "completedAt": "2025-01-21T15:00:00",
    
    "isOvertime": false,
    "overtimeHours": 0,
    "totalPrice": 63000,
    
    "nextAction": "DONE",
    "nextActionMessage": "Đơn hàng hoàn tất"
  }
}
```

---

## 5. Tính Phí Phạt Trễ

### 5.1 Quy Tắc

| Tham số | Giá trị | Mô tả |
|---------|---------|-------|
| `pickup-hours-limit` | 24h | Thời gian tối đa để lấy đồ |
| `overtime-fee-per-hour` | 500đ/h | Phí phạt mỗi giờ trễ |
| `max-overtime-fee` | 50,000đ | Phí phạt tối đa |
| `max-overtime-percent` | 50% | Phí phạt tối đa theo % đơn hàng |

### 5.2 Công Thức

```
pickupDeadline = returnedAt + 24h

if (now > pickupDeadline):
    overtimeHours = (now - pickupDeadline) in hours
    rawFee = overtimeHours × 500đ
    percentMax = totalPrice × 50%
    capFee = min(percentMax, 50000đ)
    overtimeFee = min(rawFee, capFee)
```

### 5.3 Ví Dụ Tính Phí Phạt

**Trường hợp 1**: Đơn hàng 63,000đ, trễ 10 giờ
```
rawFee = 10 × 500 = 5,000đ
percentMax = 63,000 × 50% = 31,500đ
capFee = min(31,500, 50,000) = 31,500đ
overtimeFee = min(5,000, 31,500) = 5,000đ ✅
```

**Trường hợp 2**: Đơn hàng 63,000đ, trễ 100 giờ
```
rawFee = 100 × 500 = 50,000đ
percentMax = 63,000 × 50% = 31,500đ
capFee = min(31,500, 50,000) = 31,500đ
overtimeFee = min(50,000, 31,500) = 31,500đ ✅
```

**Trường hợp 3**: Đơn hàng 200,000đ, trễ 200 giờ
```
rawFee = 200 × 500 = 100,000đ
percentMax = 200,000 × 50% = 100,000đ
capFee = min(100,000, 50,000) = 50,000đ
overtimeFee = min(100,000, 50,000) = 50,000đ ✅
```

### 5.4 Response Khi Có Phí Phạt

```json
{
  "data": {
    "id": 102,
    "status": "RETURNED",
    
    "returnedAt": "2025-01-21T10:00:00",
    "pickupDeadline": "2025-01-22T10:00:00",
    
    "isOvertime": true,
    "overtimeHours": 5,
    
    "totalPrice": 63000,
    "extraFee": 2500,
    
    "priceBreakdown": {
      "basePrice": 63000,
      "storageFee": 0,
      "overtimeFee": 2500,
      "shippingFee": 0,
      "discount": 0,
      "note": "Phí phạt trễ: 5 giờ × 500đ/giờ = 2,500đ"
    }
  }
}
```

---

## 6. Chương Trình Khuyến Mãi

### 6.1 Tổng Quan

Hệ thống hỗ trợ áp dụng mã khuyến mãi vào đơn hàng với các tính năng:

- **Giảm giá theo phần trăm** (PERCENTAGE)
- **Giảm giá cố định** (FIXED_AMOUNT)
- **Dịch vụ miễn phí** (FREE_SERVICE)
- **Stackable promotions** (kết hợp nhiều mã)

### 6.2 Discount Types

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| `PERCENTAGE` | Giảm theo % đơn hàng | 50% off, max 100,000đ |
| `FIXED_AMOUNT` | Giảm số tiền cố định | Giảm 20,000đ |
| `FREE_SERVICE` | Miễn phí dịch vụ | Free giặt sấy |

### 6.3 Điều Kiện Áp Dụng

| Điều kiện | Mô tả |
|-----------|-------|
| `minOrderAmount` | Giá trị đơn hàng tối thiểu |
| `startDate` / `endDate` | Thời gian hiệu lực |
| `totalUsageLimit` | Số lần sử dụng tối đa (tổng) |
| `perUserLimit` | Số lần sử dụng tối đa (mỗi user) |
| `applicableServiceIds` | Dịch vụ được áp dụng |
| `applicableTiers` | Hạng thành viên được áp dụng |

### 6.4 API Áp Dụng Khuyến Mãi

#### 6.4.1 Áp Dụng Khi Tạo Order

**Request:**
```json
{
  "lockerId": 1,
  "type": "LAUNDRY",
  "serviceCategory": "LAUNDRY",
  "promotionCode": "NEWUSER50",
  "items": [...]
}
```

#### 6.4.2 Áp Dụng Nhiều Mã (Stackable)

**Request:**
```json
{
  "lockerId": 1,
  "type": "LAUNDRY", 
  "serviceCategory": "LAUNDRY",
  "promotionCodes": ["NEWUSER50", "FREESHIP"],
  "items": [...]
}
```

#### 6.4.3 Áp Dụng Sau Khi Tạo Order

**API**: `PUT /api/v1/orders/{orderId}/promotion?code={promotionCode}`

**Response:**
```json
{
  "success": true,
  "message": "Promotion applied successfully",
  "data": {
    "id": 102,
    "originalPrice": 100000,
    "promotionCode": "NEWUSER50",
    "promotionDiscount": 50000,
    "totalPrice": 50000,
    "promotionInfo": {
      "code": "NEWUSER50",
      "title": "Giảm 50% cho người dùng mới",
      "discountType": "PERCENTAGE",
      "discountValue": 50,
      "maxDiscountAmount": 100000,
      "calculatedDiscount": 50000,
      "applied": true,
      "message": "Áp dụng thành công"
    }
  }
}
```

#### 6.4.4 Xóa Mã Khuyến Mãi

**API**: `DELETE /api/v1/orders/{orderId}/promotion`

**Response:**
```json
{
  "success": true,
  "message": "Promotion removed",
  "data": {
    "id": 102,
    "originalPrice": null,
    "promotionCode": null,
    "discount": 0,
    "totalPrice": 100000
  }
}
```

### 6.5 Công Thức Tính Giảm Giá

#### PERCENTAGE:
```
discount = orderTotal × discountValue / 100
if (discount > maxDiscountAmount):
    discount = maxDiscountAmount
```

#### FIXED_AMOUNT:
```
discount = discountValue
if (discount > orderTotal):
    discount = orderTotal
```

### 6.6 Ví Dụ Tính Khuyến Mãi

**Mã NEWUSER50**: Giảm 50%, tối đa 100,000đ, đơn tối thiểu 50,000đ

| Order Total | Giảm Tính | Giảm Thực | Final |
|-------------|-----------|-----------|-------|
| 40,000đ | ❌ Không đủ điều kiện | 0đ | 40,000đ |
| 80,000đ | 80,000 × 50% = 40,000đ | 40,000đ | 40,000đ |
| 300,000đ | 300,000 × 50% = 150,000đ | 100,000đ (capped) | 200,000đ |

### 6.7 Promotion APIs

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| `GET` | `/api/admin/promotions` | Lấy danh sách KM | ADMIN |
| `GET` | `/api/admin/promotions/active` | KM đang hoạt động | ADMIN, USER |
| `GET` | `/api/admin/promotions/validate/{code}` | Kiểm tra mã | USER |
| `POST` | `/api/admin/promotions` | Tạo KM mới | ADMIN |
| `PUT` | `/api/admin/promotions/{id}` | Cập nhật KM | ADMIN |
| `DELETE` | `/api/admin/promotions/{id}` | Xóa KM | ADMIN |
| `PUT` | `/api/v1/orders/{id}/promotion` | Áp dụng mã vào order | USER |
| `DELETE` | `/api/v1/orders/{id}/promotion` | Xóa mã khỏi order | USER |

### 6.8 Response Với Promotion Info

```json
{
  "data": {
    "id": 102,
    "status": "INITIALIZED",
    
    "originalPrice": 100000,
    "promotionCode": "NEWUSER50",
    "appliedPromotionCodes": ["NEWUSER50"],
    "promotionDiscount": 50000,
    "discount": 50000,
    "totalPrice": 50000,
    
    "priceBreakdown": {
      "basePrice": 100000,
      "storageFee": 0,
      "overtimeFee": 0,
      "shippingFee": 0,
      "originalPrice": 100000,
      "promotionCode": "NEWUSER50",
      "promotionDiscount": 50000,
      "discount": 50000,
      "finalPrice": 50000,
      "appliedPromotions": [
        {
          "code": "NEWUSER50",
          "title": "Giảm 50% cho người dùng mới",
          "discountType": "PERCENTAGE",
          "discountValue": 50,
          "calculatedDiscount": 50000,
          "applied": true
        }
      ],
      "note": "Đã áp dụng mã NEWUSER50: Giảm 50,000đ"
    }
  }
}
```

### 6.9 Error Cases

| Error Code | Mô tả |
|------------|-------|
| `E_PROMO001` | Mã khuyến mãi đã tồn tại |
| `E_PROMO002` | Ngày kết thúc phải sau ngày bắt đầu |
| `E_PROMO004` | Mã khuyến mãi không hợp lệ |
| `E_PROMO005` | Mã khuyến mãi không còn hiệu lực |
| `E_ORDER011` | Không thể áp dụng KM ở giai đoạn này |
| `E_ORDER012` | Không thể xóa KM ở giai đoạn này |

---

## 7. API Reference

### 7.1 Order APIs

| Method | Endpoint | Mô tả | Role |
|--------|----------|-------|------|
| `POST` | `/api/v1/orders` | Tạo order | USER |
| `GET` | `/api/v1/orders/{id}` | Xem chi tiết order | USER, ADMIN |
| `PUT` | `/api/v1/orders/{id}/confirm` | Xác nhận đã đặt đồ | USER |
| `PUT` | `/api/v1/orders/{id}/collect` | Staff lấy đồ | PARTNER (Staff) |
| `PUT` | `/api/v1/orders/{id}/weight` | Cập nhật cân nặng | PARTNER (Staff) |
| `PUT` | `/api/v1/orders/{id}/process` | Bắt đầu xử lý | PARTNER |
| `PUT` | `/api/v1/orders/{id}/ready` | Đánh dấu sẵn sàng | PARTNER |
| `PUT` | `/api/v1/orders/{id}/return` | Trả đồ về locker | PARTNER (Staff) |
| `PUT` | `/api/v1/orders/{id}/complete` | Hoàn tất (khách lấy đồ) | USER |
| `PUT` | `/api/v1/orders/{id}/cancel` | Hủy order | USER, ADMIN |
| `POST` | `/api/v1/orders/{id}/checkout` | Thanh toán | USER |
| `PUT` | `/api/v1/orders/{id}/promotion` | Áp dụng mã KM | USER |
| `DELETE` | `/api/v1/orders/{id}/promotion` | Xóa mã KM | USER |

### 7.2 CreateOrderRequest Fields

| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `lockerId` | Long | ✅ | ID của locker |
| `boxId` | Long | ❌ | ID box cụ thể (tự động chọn nếu null) |
| `type` | OrderType | ✅ | Loại order |
| `serviceCategory` | ServiceCategory | ✅ | STORAGE hoặc LAUNDRY |
| `receiverId` | Long | ❌ | ID người nhận (nếu là user) |
| `receiverName` | String | ❌ | Tên người nhận |
| `receiverPhone` | String | ❌ | SĐT người nhận |
| `intendedReceiveAt` | LocalDateTime | ❌ | Thời gian dự kiến nhận |
| `estimatedWeight` | BigDecimal | ❌ | Cân nặng ước tính (LAUNDRY) |
| `promotionCode` | String | ❌ | Mã khuyến mãi |
| `promotionCodes` | List<String> | ❌ | Nhiều mã khuyến mãi (stackable) |
| `customerNote` | String | ❌ | Ghi chú |
| `items` | List | ❌ | Danh sách dịch vụ |

### 7.3 OrderResponse New Fields

| Field | Type | Mô tả |
|-------|------|-------|
| `serviceCategory` | ServiceCategory | STORAGE / LAUNDRY |
| `pricingType` | PricingType | FIXED / PER_WEIGHT |
| `receiverPhone` | String | SĐT người nhận |
| `promotionCode` | String | Mã KM đã áp dụng |
| `appliedPromotionCodes` | List<String> | Danh sách mã KM |
| `originalPrice` | BigDecimal | Giá gốc trước giảm |
| `promotionDiscount` | BigDecimal | Số tiền được giảm |
| `promotionInfo` | Object | Chi tiết khuyến mãi |
| `estimatedPrice` | Object | Giá ước tính (LAUNDRY) |
| `priceBreakdown` | Object | Chi tiết giá |
| `isOvertime` | Boolean | Có trễ giờ không |
| `overtimeHours` | Integer | Số giờ trễ |
| `pickupDeadline` | LocalDateTime | Hạn lấy đồ |
| `returnedAt` | LocalDateTime | Thời gian staff trả đồ |
| `isPaid` | Boolean | Đã thanh toán chưa |
| `paymentRequired` | Boolean | Có cần thanh toán không |
| `nextAction` | String | Hành động tiếp theo |
| `nextActionMessage` | String | Thông báo cho người dùng |

---

## 8. Order Status Flow

### 8.1 STORAGE Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STORAGE FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Create Order                                                    │
│     POST /orders                                                    │
│     → Status: INITIALIZED                                           │
│     → paymentRequired: true                                         │
│                                                                     │
│  2. Payment                                                         │
│     POST /orders/{id}/checkout                                      │
│     → isPaid: true                                                  │
│                                                                     │
│  3. Drop Items                                                      │
│     PUT /orders/{id}/confirm                                        │
│     → Status: WAITING                                               │
│                                                                     │
│  4. Staff Return                                                    │
│     PUT /orders/{id}/return                                         │
│     → Status: RETURNED                                              │
│     → pickupDeadline set                                            │
│                                                                     │
│  5. Customer Pickup                                                 │
│     PUT /orders/{id}/complete                                       │
│     → Status: COMPLETED                                             │
│     → Overtime fee calculated if late                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 LAUNDRY Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LAUNDRY FLOW                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Create Order (+ Promotion Code)                                 │
│     POST /orders                                                    │
│     → Status: INITIALIZED                                           │
│     → estimatedPrice provided                                       │
│     → promotionDiscount applied (if code valid)                     │
│                                                                     │
│  2. Drop Items                                                      │
│     PUT /orders/{id}/confirm                                        │
│     → Status: WAITING                                               │
│                                                                     │
│  3. Staff Collect                                                   │
│     PUT /orders/{id}/collect                                        │
│     → Status: COLLECTED                                             │
│                                                                     │
│  4. Update Weight                                                   │
│     PUT /orders/{id}/weight                                         │
│     → actualWeight, totalPrice calculated                           │
│     → promotionDiscount recalculated                                │
│                                                                     │
│  5. Process                                                         │
│     PUT /orders/{id}/process                                        │
│     → Status: PROCESSING                                            │
│                                                                     │
│  6. Ready                                                           │
│     PUT /orders/{id}/ready                                          │
│     → Status: READY                                                 │
│                                                                     │
│  7. Staff Return                                                    │
│     PUT /orders/{id}/return                                         │
│     → Status: RETURNED                                              │
│     → pickupDeadline set                                            │
│     → paymentRequired: true                                         │
│                                                                     │
│  8. Payment                                                         │
│     POST /orders/{id}/checkout                                      │
│     → isPaid: true                                                  │
│     → Final amount = totalPrice - promotionDiscount                 │
│                                                                     │
│  9. Customer Pickup                                                 │
│     PUT /orders/{id}/complete                                       │
│     → Status: COMPLETED                                             │
│     → Overtime fee calculated if late                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Ghi Chú

1. **PIN Code**: Được tạo mới mỗi lần order chuyển status cần mở locker
2. **Overtime Fee**: Chỉ tính khi customer lấy đồ trễ sau deadline
3. **Receiver**: Có thể là user khác hoặc nhập thông tin thủ công
4. **AccessCode**: Staff sử dụng để xác thực khi lấy/trả đồ
5. **Promotion**: Có thể áp dụng khi tạo order hoặc sau đó (trước khi thanh toán)
6. **Stackable Promotions**: Một số mã có thể kết hợp với nhau

---

*Cập nhật lần cuối: Tháng 2/2026*
