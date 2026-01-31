# Partner API Documentation

## Overview

This document provides comprehensive API documentation for the **Partner Module** of the Laundry Locker Backend system. These APIs allow business partners to manage their stores, orders, staff, and access codes for locker operations.

## Base URL

```
/api/partner
```

## Authentication

All Partner APIs require authentication with the `PARTNER` role. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Exception: Registration

The registration endpoint (`POST /api/partner`) only requires a valid user authentication (any logged-in user can register as a partner).

---

## Response Format

All API responses follow a standard wrapper format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  params?: any[];
  errors?: Error[];
}

interface Error {
  field: string;
  message: string;
}
```

---

## Enums

### PartnerStatus
```typescript
enum PartnerStatus {
  PENDING = "PENDING",     // Initial status when partner registers
  APPROVED = "APPROVED",   // Partner has been approved by admin
  REJECTED = "REJECTED",   // Partner application was rejected
  SUSPENDED = "SUSPENDED"  // Partner account has been suspended
}
```

### AccessCodeAction
```typescript
enum AccessCodeAction {
  COLLECT = "COLLECT",  // Staff collects items from locker
  RETURN = "RETURN"     // Staff returns processed items to locker
}
```

### AccessCodeStatus
```typescript
enum AccessCodeStatus {
  ACTIVE = "ACTIVE",       // Code is active and can be used
  USED = "USED",           // Code has been used
  EXPIRED = "EXPIRED",     // Code has expired
  CANCELLED = "CANCELLED"  // Code was cancelled by partner
}
```

### OrderStatus
```typescript
enum OrderStatus {
  INITIALIZED = "INITIALIZED",   // Order created, waiting for customer to put items
  RESERVED = "RESERVED",         // Order reserved but not yet started
  WAITING = "WAITING",           // Items placed, waiting for staff to collect
  COLLECTED = "COLLECTED",       // Staff collected items from locker
  PROCESSING = "PROCESSING",     // Items being processed at store
  READY = "READY",               // Items ready to be returned
  RETURNED = "RETURNED",         // Items returned to locker
  COMPLETED = "COMPLETED",       // Customer received items, order completed
  CANCELED = "CANCELED"          // Order canceled
}
```

### OrderType
```typescript
enum OrderType {
  LAUNDRY = "LAUNDRY",       // Regular laundry service
  DRY_CLEAN = "DRY_CLEAN",   // Dry cleaning
  STORAGE = "STORAGE"        // Storage only
}
```

### BoxStatus
```typescript
enum BoxStatus {
  AVAILABLE = "AVAILABLE",       // Box is available for use
  OCCUPIED = "OCCUPIED",         // Box contains items
  RESERVED = "RESERVED",         // Box is reserved
  MAINTENANCE = "MAINTENANCE"    // Box is under maintenance
}
```

### LockerStatus
```typescript
enum LockerStatus {
  ACTIVE = "ACTIVE",             // Locker is operational
  INACTIVE = "INACTIVE",         // Locker is inactive
  MAINTENANCE = "MAINTENANCE",   // Locker is under maintenance
  DISCONNECTED = "DISCONNECTED"  // Locker is disconnected
}
```

### StoreStatus
```typescript
enum StoreStatus {
  ACTIVE = "ACTIVE",     // Store is open and operational
  INACTIVE = "INACTIVE", // Store is temporarily inactive
  CLOSED = "CLOSED"      // Store is permanently closed
}
```

### AuthProvider
```typescript
enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
  GITHUB = "GITHUB",
  ZALO = "ZALO",
  PHONE = "PHONE",
  EMAIL = "EMAIL"
}
```

---

## Data Models

### PartnerResponse
```typescript
interface PartnerResponse {
  id: number;
  userId: number;
  userName: string;
  businessName: string;
  businessRegistrationNumber: string;
  taxId: string;
  businessAddress: string;
  contactPhone: string;
  contactEmail: string;
  status: PartnerStatus;
  approvedAt: string;        // ISO 8601 date string
  approvedBy: number;
  rejectionReason: string;
  revenueSharePercent: number;
  storeCount: number;
  staffCount: number;
  notes: string;
  createdAt: string;         // ISO 8601 date string
  updatedAt: string;         // ISO 8601 date string
}
```

### PartnerDashboardResponse
```typescript
interface PartnerDashboardResponse {
  partnerId: number;
  businessName: string;
  
  // Store statistics
  totalStores: number;
  activeStores: number;
  
  // Staff statistics
  totalStaff: number;
  
  // Order statistics
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  canceledOrders: number;
  
  // Revenue statistics
  totalRevenue: number;      // BigDecimal as number
  partnerRevenue: number;
  platformFee: number;
  todayRevenue: number;
  monthRevenue: number;
}
```

### PartnerOrderStatisticsResponse
```typescript
interface PartnerOrderStatisticsResponse {
  partnerId: number;
  
  // Overall statistics
  totalOrders: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  
  // Status breakdown
  initializedOrders: number;
  waitingOrders: number;
  collectedOrders: number;
  processingOrders: number;
  readyOrders: number;
  returnedOrders: number;
  completedOrders: number;
  canceledOrders: number;
  
  // Revenue metrics
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  averageOrderValue: number;
  
  // Orders by store (storeId -> count)
  ordersByStore: { [storeId: string]: number };
}
```

### PartnerRevenueResponse
```typescript
interface PartnerRevenueResponse {
  partnerId: number;
  businessName: string;
  
  // Revenue period
  fromDate: string;          // ISO 8601 date string
  toDate: string;            // ISO 8601 date string
  
  // Revenue statistics
  grossRevenue: number;
  partnerRevenue: number;
  platformFee: number;
  revenueSharePercent: number;
  
  // Order statistics for the period
  totalOrders: number;
  completedOrders: number;
  canceledOrders: number;
  
  // Comparison with previous period
  previousPeriodRevenue: number;
  revenueGrowthPercent: number;
}
```

### StaffAccessCodeResponse
```typescript
interface StaffAccessCodeResponse {
  id: number;
  code: string;
  orderId: number;
  partnerId: number;
  action: AccessCodeAction;
  status: AccessCodeStatus;
  expiresAt: string;         // ISO 8601 date string
  usedAt: string;            // ISO 8601 date string
  staffName: string;
  notes: string;
  createdAt: string;         // ISO 8601 date string
  
  // Order info
  orderLockerCode: string;
  orderLockerName: string;
  orderBoxNumbers: string;
  customerName: string;
}
```

### StaffCodeUnlockResponse
```typescript
interface StaffCodeUnlockResponse {
  success: boolean;
  message: string;
  
  // Order info
  orderId: number;
  orderStatus: string;
  
  // Access code info
  action: AccessCodeAction;
  
  // Box info
  boxes: BoxInfo[];
  lockerCode: string;
  lockerName: string;
  lockerAddress: string;
  
  // Unlock token for IoT device
  unlockToken: string;
  unlockTimestamp: number;
}

interface BoxInfo {
  boxId: number;
  boxNumber: string;
  size: string;
}
```

### OrderResponse
```typescript
interface OrderResponse {
  id: number;
  type: OrderType;
  status: OrderStatus;
  pinCode: string;
  
  // Sender info
  senderId: number;
  senderName: string;
  senderPhone: string;
  
  // Receiver info
  receiverId: number;
  receiverName: string;
  
  // Locker info
  lockerId: number;
  lockerName: string;
  lockerCode: string;
  sendBoxNumber: number;
  receiveBoxNumber: number;
  
  // Multiple boxes support
  sendBoxNumbers: number[];
  receiveBoxNumbers: number[];
  
  // Staff info
  staffId: number;
  staffName: string;
  
  // Weight info
  actualWeight: number;
  weightUnit: string;
  
  // Pricing
  extraFee: number;
  discount: number;
  reservationFee: number;
  storagePrice: number;
  shippingFee: number;
  totalPrice: number;
  
  // Notes
  description: string;
  customerNote: string;
  staffNote: string;
  deliveryAddress: string;
  
  // Timestamps
  intendedReceiveAt: string;   // ISO 8601 date string
  receiveAt: string;           // ISO 8601 date string
  completedAt: string;         // ISO 8601 date string
  createdAt: string;           // ISO 8601 date string
  updatedAt: string;           // ISO 8601 date string
  
  // Order details
  orderDetails: OrderDetailResponse[];
}

interface OrderDetailResponse {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceImage: string;
  quantity: number;
  unit: string;
  price: number;
  description: string;
}
```

### StoreResponse
```typescript
interface StoreResponse {
  id: number;
  name: string;
  contactPhone: string;
  status: StoreStatus;
  address: string;
  longitude: number;
  latitude: number;
  image: string;
  description: string;
  createdAt: string;           // ISO 8601 date string
  updatedAt: string;           // ISO 8601 date string
}
```

### LockerResponse
```typescript
interface LockerResponse {
  id: number;
  code: string;
  name: string;
  image: string;
  status: LockerStatus;
  address: string;
  longitude: number;
  latitude: number;
  description: string;
  storeId: number;
  storeName: string;
  totalBoxes: number;
  availableBoxes: number;
  boxes: BoxResponse[];
  createdAt: string;           // ISO 8601 date string
  updatedAt: string;           // ISO 8601 date string
}
```

### BoxResponse
```typescript
interface BoxResponse {
  id: number;
  boxNumber: number;
  isActive: boolean;
  status: BoxStatus;
  description: string;
  lockerId: number;
  lockerCode: string;
}
```

### UserResponse
```typescript
interface UserResponse {
  id: number;
  email: string;
  name: string;
  imageUrl: string;
  provider: AuthProvider;
  emailVerified: boolean;
}
```

---

## Request DTOs

### PartnerRegistrationRequest
```typescript
interface PartnerRegistrationRequest {
  businessName: string;              // Required, 3-200 characters
  businessRegistrationNumber?: string;
  taxId?: string;
  businessAddress: string;           // Required
  contactPhone: string;              // Required
  contactEmail?: string;             // Valid email format
  notes?: string;
}
```

### PartnerUpdateRequest
```typescript
interface PartnerUpdateRequest {
  businessName?: string;             // 3-200 characters
  businessAddress?: string;
  contactPhone?: string;
  contactEmail?: string;             // Valid email format
  notes?: string;
}
```

### GenerateAccessCodeRequest
```typescript
interface GenerateAccessCodeRequest {
  orderId: number;                   // Required
  action: AccessCodeAction;          // Required: "COLLECT" or "RETURN"
  expirationHours?: number;          // Optional, default: 24 hours
  notes?: string;                    // Optional notes for staff
}
```

### StaffCodeUnlockRequest
```typescript
interface StaffCodeUnlockRequest {
  orderId: number;                   // Required
  accessCode: string;                // Required
  staffName?: string;                // Optional staff name for tracking
}
```

### UpdateOrderWeightRequest
```typescript
interface UpdateOrderWeightRequest {
  actualWeight: number;              // Required, min: 0.1
  weightUnit?: string;               // Default: "kg"
  items?: OrderItemRequest[];        // Updated service items
  staffNote?: string;                // Staff note about the order
}

interface OrderItemRequest {
  serviceId: number;                 // Required
  quantity: number;                  // Required, must be positive
  description?: string;
}
```

---

## API Endpoints

---

## 1. Partner Registration & Profile

### 1.1 Register as Partner

Register the current authenticated user as a business partner.

**Endpoint:**
```http
POST /api/partner
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessName": "Laundry Pro Inc.",
  "businessRegistrationNumber": "BR123456789",
  "taxId": "TAX987654321",
  "businessAddress": "123 Business Ave, District 1, HCMC",
  "contactPhone": "+84123456789",
  "contactEmail": "contact@laundrypro.com",
  "notes": "Premium laundry service provider"
}
```

**Validation:**
| Field | Constraints |
|-------|-------------|
| businessName | Required, 3-200 characters |
| businessAddress | Required |
| contactPhone | Required |
| contactEmail | Valid email format |

**Response (201 Created):**
```json
{
  "success": true,
  "code": "PARTNER_REGISTERED",
  "message": "Partner registered successfully",
  "data": {
    "id": 1,
    "userId": 10,
    "userName": "John Doe",
    "businessName": "Laundry Pro Inc.",
    "businessRegistrationNumber": "BR123456789",
    "taxId": "TAX987654321",
    "businessAddress": "123 Business Ave, District 1, HCMC",
    "contactPhone": "+84123456789",
    "contactEmail": "contact@laundrypro.com",
    "status": "PENDING",
    "approvedAt": null,
    "approvedBy": null,
    "rejectionReason": null,
    "revenueSharePercent": 70.00,
    "storeCount": 0,
    "staffCount": 0,
    "notes": "Premium laundry service provider",
    "createdAt": "2024-01-30T10:00:00",
    "updatedAt": "2024-01-30T10:00:00"
  }
}
```

---

### 1.2 Get My Partner Profile

Get the current user's partner profile information.

**Endpoint:**
```http
GET /api/partner
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "code": "PARTNER_RETRIEVED",
  "message": "Partner profile retrieved successfully",
  "data": {
    "id": 1,
    "userId": 10,
    "userName": "John Doe",
    "businessName": "Laundry Pro Inc.",
    "businessRegistrationNumber": "BR123456789",
    "taxId": "TAX987654321",
    "businessAddress": "123 Business Ave, District 1, HCMC",
    "contactPhone": "+84123456789",
    "contactEmail": "contact@laundrypro.com",
    "status": "APPROVED",
    "approvedAt": "2024-01-31T08:30:00",
    "approvedBy": 1,
    "rejectionReason": null,
    "revenueSharePercent": 70.00,
    "storeCount": 3,
    "staffCount": 5,
    "notes": "Premium laundry service provider",
    "createdAt": "2024-01-30T10:00:00",
    "updatedAt": "2024-01-31T08:30:00"
  }
}
```

---

### 1.3 Update Partner Profile

Update the partner's business profile information.

**Endpoint:**
```http
PUT /api/partner
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessName": "Laundry Pro Vietnam",
  "businessAddress": "456 New Business St, District 2, HCMC",
  "contactPhone": "+84987654321",
  "contactEmail": "newemail@laundrypro.com",
  "notes": "Updated business information"
}
```

**Validation:**
| Field | Constraints |
|-------|-------------|
| businessName | 3-200 characters |
| contactEmail | Valid email format |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "PARTNER_UPDATED",
  "message": "Partner profile updated successfully",
  "data": {
    "id": 1,
    "userId": 10,
    "userName": "John Doe",
    "businessName": "Laundry Pro Vietnam",
    "businessRegistrationNumber": "BR123456789",
    "taxId": "TAX987654321",
    "businessAddress": "456 New Business St, District 2, HCMC",
    "contactPhone": "+84987654321",
    "contactEmail": "newemail@laundrypro.com",
    "status": "APPROVED",
    "approvedAt": "2024-01-31T08:30:00",
    "approvedBy": 1,
    "rejectionReason": null,
    "revenueSharePercent": 70.00,
    "storeCount": 3,
    "staffCount": 5,
    "notes": "Updated business information",
    "createdAt": "2024-01-30T10:00:00",
    "updatedAt": "2024-01-31T12:00:00"
  }
}
```

---

## 2. Partner Dashboard

### 2.1 Get Partner Dashboard

Get comprehensive dashboard statistics for the partner.

**Endpoint:**
```http
GET /api/partner/dashboard
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "code": "DASHBOARD_RETRIEVED",
  "message": "Dashboard data retrieved successfully",
  "data": {
    "partnerId": 1,
    "businessName": "Laundry Pro Inc.",
    "totalStores": 3,
    "activeStores": 2,
    "totalStaff": 5,
    "totalOrders": 150,
    "pendingOrders": 10,
    "completedOrders": 135,
    "canceledOrders": 5,
    "totalRevenue": 75000000.00,
    "partnerRevenue": 52500000.00,
    "platformFee": 22500000.00,
    "todayRevenue": 2500000.00,
    "monthRevenue": 15000000.00
  }
}
```

---

## 3. Order Management

### 3.1 Get Pending Orders

Get all orders with `WAITING` status that are pending collection from partner's stores.

**Endpoint:**
```http
GET /api/partner/orders/pending?page=0&size=20&sort=createdAt,desc
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | Integer | No | Page number (default: 0) |
| size | Integer | No | Page size (default: 20) |
| sort | String | No | Sort field and direction (e.g., `createdAt,desc`) |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "ORDERS_RETRIEVED",
  "message": "Orders retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1001,
        "type": "LAUNDRY",
        "status": "WAITING",
        "pinCode": "123456",
        "senderId": 25,
        "senderName": "Alice Smith",
        "senderPhone": "+84999999999",
        "receiverId": null,
        "receiverName": null,
        "lockerId": 5,
        "lockerName": "Main Locker",
        "lockerCode": "LOCKER-001",
        "sendBoxNumber": 3,
        "receiveBoxNumber": null,
        "sendBoxNumbers": [3],
        "receiveBoxNumbers": [],
        "staffId": null,
        "staffName": null,
        "actualWeight": null,
        "weightUnit": "kg",
        "extraFee": 0.00,
        "discount": 0.00,
        "reservationFee": 10000.00,
        "storagePrice": 0.00,
        "shippingFee": 0.00,
        "totalPrice": 150000.00,
        "description": "Weekly laundry",
        "customerNote": "Please handle with care",
        "staffNote": null,
        "deliveryAddress": null,
        "intendedReceiveAt": null,
        "receiveAt": "2024-01-31T09:00:00",
        "completedAt": null,
        "createdAt": "2024-01-31T08:00:00",
        "updatedAt": "2024-01-31T09:00:00",
        "orderDetails": [
          {
            "id": 1,
            "serviceId": 1,
            "serviceName": "Wash & Fold",
            "serviceImage": "https://example.com/service1.jpg",
            "quantity": 5.0,
            "unit": "kg",
            "price": 30000.00,
            "description": null
          }
        ]
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      }
    },
    "totalElements": 10,
    "totalPages": 1,
    "first": true,
    "last": true,
    "size": 20,
    "number": 0,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "numberOfElements": 10,
    "empty": false
  }
}
```

---

### 3.2 Get Partner Orders

Get all orders for partner's stores with optional status filter.

**Endpoint:**
```http
GET /api/partner/orders?status=PROCESSING&page=0&size=20
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | OrderStatus | No | Filter by order status |
| page | Integer | No | Page number (default: 0) |
| size | Integer | No | Page size (default: 20) |

**Response (200 OK):** *(Same structure as Get Pending Orders)*

---

### 3.3 Get Order Detail

Get detailed information about a specific order.

**Endpoint:**
```http
GET /api/partner/orders/{orderId}
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| orderId | Long | Order ID |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "ORDER_RETRIEVED",
  "message": "Order retrieved successfully",
  "data": {
    "id": 1001,
    "type": "LAUNDRY",
    "status": "PROCESSING",
    "pinCode": "123456",
    "senderId": 25,
    "senderName": "Alice Smith",
    "senderPhone": "+84999999999",
    "receiverId": null,
    "receiverName": null,
    "lockerId": 5,
    "lockerName": "Main Locker",
    "lockerCode": "LOCKER-001",
    "sendBoxNumber": 3,
    "receiveBoxNumber": null,
    "sendBoxNumbers": [3],
    "receiveBoxNumbers": [],
    "staffId": 15,
    "staffName": "Staff Member",
    "actualWeight": 5.2,
    "weightUnit": "kg",
    "extraFee": 5000.00,
    "discount": 0.00,
    "reservationFee": 10000.00,
    "storagePrice": 0.00,
    "shippingFee": 0.00,
    "totalPrice": 161000.00,
    "description": "Weekly laundry",
    "customerNote": "Please handle with care",
    "staffNote": "Items collected successfully",
    "deliveryAddress": null,
    "intendedReceiveAt": null,
    "receiveAt": "2024-01-31T09:00:00",
    "completedAt": null,
    "createdAt": "2024-01-31T08:00:00",
    "updatedAt": "2024-01-31T10:00:00",
    "orderDetails": [
      {
        "id": 1,
        "serviceId": 1,
        "serviceName": "Wash & Fold",
        "serviceImage": "https://example.com/service1.jpg",
        "quantity": 5.2,
        "unit": "kg",
        "price": 31200.00,
        "description": null
      }
    ]
  }
}
```

---

### 3.4 Accept Order

Accept an order and generate a staff access code for collection.

**Endpoint:**
```http
POST /api/partner/orders/{orderId}/accept?expirationHours=24&notes=Collect before 6PM
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| orderId | Long | Order ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| expirationHours | Integer | No | Code expiration time in hours (default: 24) |
| notes | String | No | Notes for the staff |

**Response (201 Created):**
```json
{
  "success": true,
  "code": "ORDER_ACCEPTED",
  "message": "Order accepted successfully",
  "data": {
    "id": 101,
    "code": "ABC123XYZ",
    "orderId": 1001,
    "partnerId": 1,
    "action": "COLLECT",
    "status": "ACTIVE",
    "expiresAt": "2024-02-01T10:00:00",
    "usedAt": null,
    "staffName": null,
    "notes": "Collect before 6PM",
    "createdAt": "2024-01-31T10:00:00",
    "orderLockerCode": "LOCKER-001",
    "orderLockerName": "Main Locker",
    "orderBoxNumbers": "3",
    "customerName": "Alice Smith"
  }
}
```

---

### 3.5 Update Order to Processing

Mark an order as being processed at the store.

**Endpoint:**
```http
POST /api/partner/orders/{orderId}/process
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| orderId | Long | Order ID |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "ORDER_PROCESSING",
  "message": "Order marked as processing",
  "data": {
    "id": 1001,
    "type": "LAUNDRY",
    "status": "PROCESSING",
    "pinCode": "123456",
    "senderId": 25,
    "senderName": "Alice Smith",
    "senderPhone": "+84999999999",
    "receiverId": null,
    "receiverName": null,
    "lockerId": 5,
    "lockerName": "Main Locker",
    "lockerCode": "LOCKER-001",
    "sendBoxNumber": 3,
    "receiveBoxNumber": null,
    "sendBoxNumbers": [3],
    "receiveBoxNumbers": [],
    "staffId": 15,
    "staffName": "Staff Member",
    "actualWeight": 5.2,
    "weightUnit": "kg",
    "extraFee": 5000.00,
    "discount": 0.00,
    "reservationFee": 10000.00,
    "storagePrice": 0.00,
    "shippingFee": 0.00,
    "totalPrice": 161000.00,
    "description": "Weekly laundry",
    "customerNote": "Please handle with care",
    "staffNote": "Items collected successfully",
    "deliveryAddress": null,
    "intendedReceiveAt": null,
    "receiveAt": "2024-01-31T09:00:00",
    "completedAt": null,
    "createdAt": "2024-01-31T08:00:00",
    "updatedAt": "2024-01-31T11:00:00",
    "orderDetails": [
      {
        "id": 1,
        "serviceId": 1,
        "serviceName": "Wash & Fold",
        "serviceImage": "https://example.com/service1.jpg",
        "quantity": 5.2,
        "unit": "kg",
        "price": 31200.00,
        "description": null
      }
    ]
  }
}
```

---

### 3.6 Mark Order Ready

Mark an order as ready and generate a staff access code for returning items to the locker.

**Endpoint:**
```http
POST /api/partner/orders/{orderId}/ready?expirationHours=24&notes=Return to box 5
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| orderId | Long | Order ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| expirationHours | Integer | No | Code expiration time in hours (default: 24) |
| notes | String | No | Notes for the staff |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "ORDER_READY",
  "message": "Order marked as ready",
  "data": {
    "id": 102,
    "code": "DEF456UVW",
    "orderId": 1001,
    "partnerId": 1,
    "action": "RETURN",
    "status": "ACTIVE",
    "expiresAt": "2024-02-01T12:00:00",
    "usedAt": null,
    "staffName": null,
    "notes": "Return to box 5",
    "createdAt": "2024-01-31T12:00:00",
    "orderLockerCode": "LOCKER-001",
    "orderLockerName": "Main Locker",
    "orderBoxNumbers": "3",
    "customerName": "Alice Smith"
  }
}
```

---

### 3.7 Update Order Weight

Update the actual weight of an order after collection. This recalculates the total price.

**Endpoint:**
```http
PUT /api/partner/orders/{orderId}/weight
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| orderId | Long | Order ID |

**Request Body:**
```json
{
  "actualWeight": 5.5,
  "weightUnit": "kg",
  "items": [
    {
      "serviceId": 1,
      "quantity": 5.5,
      "description": "Updated weight"
    }
  ],
  "staffNote": "Actual weight is 5.5kg, slightly more than estimated"
}
```

**Validation:**
| Field | Constraints |
|-------|-------------|
| actualWeight | Required, minimum 0.1 |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "ORDER_WEIGHT_UPDATED",
  "message": "Order weight updated successfully",
  "data": {
    "id": 1001,
    "type": "LAUNDRY",
    "status": "COLLECTED",
    "pinCode": "123456",
    "senderId": 25,
    "senderName": "Alice Smith",
    "senderPhone": "+84999999999",
    "receiverId": null,
    "receiverName": null,
    "lockerId": 5,
    "lockerName": "Main Locker",
    "lockerCode": "LOCKER-001",
    "sendBoxNumber": 3,
    "receiveBoxNumber": null,
    "sendBoxNumbers": [3],
    "receiveBoxNumbers": [],
    "staffId": 15,
    "staffName": "Staff Member",
    "actualWeight": 5.5,
    "weightUnit": "kg",
    "extraFee": 5000.00,
    "discount": 0.00,
    "reservationFee": 10000.00,
    "storagePrice": 0.00,
    "shippingFee": 0.00,
    "totalPrice": 165000.00,
    "description": "Weekly laundry",
    "customerNote": "Please handle with care",
    "staffNote": "Actual weight is 5.5kg, slightly more than estimated",
    "deliveryAddress": null,
    "intendedReceiveAt": null,
    "receiveAt": "2024-01-31T09:00:00",
    "completedAt": null,
    "createdAt": "2024-01-31T08:00:00",
    "updatedAt": "2024-01-31T10:30:00",
    "orderDetails": [
      {
        "id": 1,
        "serviceId": 1,
        "serviceName": "Wash & Fold",
        "serviceImage": "https://example.com/service1.jpg",
        "quantity": 5.5,
        "unit": "kg",
        "price": 33000.00,
        "description": "Updated weight"
      }
    ]
  }
}
```

---

## 4. Staff Access Code Management

### 4.1 Generate Access Code

Generate a staff access code for an order (manual generation).

**Endpoint:**
```http
POST /api/partner/access-codes/generate
```

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": 1001,
  "action": "COLLECT",
  "expirationHours": 12,
  "notes": "Urgent collection needed"
}
```

**Validation:**
| Field | Constraints |
|-------|-------------|
| orderId | Required |
| action | Required, must be "COLLECT" or "RETURN" |
| expirationHours | Optional, default: 24 |

**Response (201 Created):**
```json
{
  "success": true,
  "code": "CODE_GENERATED",
  "message": "Access code generated successfully",
  "data": {
    "id": 103,
    "code": "GHI789RST",
    "orderId": 1001,
    "partnerId": 1,
    "action": "COLLECT",
    "status": "ACTIVE",
    "expiresAt": "2024-01-31T22:00:00",
    "usedAt": null,
    "staffName": null,
    "notes": "Urgent collection needed",
    "createdAt": "2024-01-31T10:00:00",
    "orderLockerCode": "LOCKER-001",
    "orderLockerName": "Main Locker",
    "orderBoxNumbers": "3",
    "customerName": "Alice Smith"
  }
}
```

---

### 4.2 Get Access Codes

Get all access codes generated by the partner.

**Endpoint:**
```http
GET /api/partner/access-codes?page=0&size=20
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | Integer | No | Page number (default: 0) |
| size | Integer | No | Page size (default: 20) |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "CODES_RETRIEVED",
  "message": "Access codes retrieved successfully",
  "data": {
    "content": [
      {
        "id": 101,
        "code": "ABC123XYZ",
        "orderId": 1001,
        "partnerId": 1,
        "action": "COLLECT",
        "status": "USED",
        "expiresAt": "2024-02-01T10:00:00",
        "usedAt": "2024-01-31T11:00:00",
        "staffName": "John Staff",
        "notes": "Collect before 6PM",
        "createdAt": "2024-01-31T10:00:00",
        "orderLockerCode": "LOCKER-001",
        "orderLockerName": "Main Locker",
        "orderBoxNumbers": "3",
        "customerName": "Alice Smith"
      },
      {
        "id": 102,
        "code": "DEF456UVW",
        "orderId": 1001,
        "partnerId": 1,
        "action": "RETURN",
        "status": "ACTIVE",
        "expiresAt": "2024-02-01T12:00:00",
        "usedAt": null,
        "staffName": null,
        "notes": "Return to box 5",
        "createdAt": "2024-01-31T12:00:00",
        "orderLockerCode": "LOCKER-001",
        "orderLockerName": "Main Locker",
        "orderBoxNumbers": "3",
        "customerName": "Alice Smith"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      }
    },
    "totalElements": 2,
    "totalPages": 1,
    "first": true,
    "last": true,
    "size": 20,
    "number": 0,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "numberOfElements": 2,
    "empty": false
  }
}
```

---

### 4.3 Get Access Codes by Order

Get all access codes for a specific order.

**Endpoint:**
```http
GET /api/partner/access-codes/order/{orderId}
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| orderId | Long | Order ID |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "CODES_RETRIEVED",
  "message": "Access codes retrieved successfully",
  "data": [
    {
      "id": 101,
      "code": "ABC123XYZ",
      "orderId": 1001,
      "partnerId": 1,
      "action": "COLLECT",
      "status": "USED",
      "expiresAt": "2024-02-01T10:00:00",
      "usedAt": "2024-01-31T11:00:00",
      "staffName": "John Staff",
      "notes": "Collect before 6PM",
      "createdAt": "2024-01-31T10:00:00",
      "orderLockerCode": "LOCKER-001",
      "orderLockerName": "Main Locker",
      "orderBoxNumbers": "3",
      "customerName": "Alice Smith"
    }
  ]
}
```

---

### 4.4 Cancel Access Code

Cancel an active access code.

**Endpoint:**
```http
POST /api/partner/access-codes/{codeId}/cancel
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| codeId | Long | Access Code ID |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "CODE_CANCELLED",
  "message": "Access code cancelled successfully",
  "data": null
}
```

---

## 5. Store Management

### 5.1 Get Partner Stores

Get all stores managed by the partner.

**Endpoint:**
```http
GET /api/partner/stores
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "code": "STORES_RETRIEVED",
  "message": "Stores retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Laundry Store 1",
      "contactPhone": "+84123456789",
      "status": "ACTIVE",
      "address": "123 Main St, District 1",
      "longitude": 106.660172,
      "latitude": 10.762622,
      "image": "https://example.com/store1.jpg",
      "description": "Main branch with full services",
      "createdAt": "2024-01-15T10:00:00",
      "updatedAt": "2024-01-20T14:00:00"
    },
    {
      "id": 2,
      "name": "Laundry Store 2",
      "contactPhone": "+84987654321",
      "status": "ACTIVE",
      "address": "456 Second St, District 2",
      "longitude": 106.691234,
      "latitude": 10.771234,
      "image": "https://example.com/store2.jpg",
      "description": "Express service branch",
      "createdAt": "2024-01-20T10:00:00",
      "updatedAt": "2024-01-25T14:00:00"
    }
  ]
}
```

---

## 6. Staff Management

### 6.1 Get Partner Staff

Get all staff members for this partner.

**Endpoint:**
```http
GET /api/partner/staff
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "code": "STAFF_RETRIEVED",
  "message": "Staff members retrieved successfully",
  "data": [
    {
      "id": 15,
      "email": "staff1@example.com",
      "name": "John Staff",
      "imageUrl": "https://example.com/staff1.jpg",
      "provider": "LOCAL",
      "emailVerified": true
    },
    {
      "id": 16,
      "email": "staff2@example.com",
      "name": "Jane Staff",
      "imageUrl": "https://example.com/staff2.jpg",
      "provider": "GOOGLE",
      "emailVerified": true
    }
  ]
}
```

---

### 6.2 Add Staff to Partner

Add a user as staff to this partner.

**Endpoint:**
```http
POST /api/partner/staff/{staffId}
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| staffId | Long | User ID to add as staff |

**Response (201 Created):**
```json
{
  "success": true,
  "code": "STAFF_ADDED",
  "message": "Staff member added successfully",
  "data": {
    "id": 17,
    "email": "newstaff@example.com",
    "name": "New Staff",
    "imageUrl": "https://example.com/newstaff.jpg",
    "provider": "LOCAL",
    "emailVerified": true
  }
}
```

---

### 6.3 Remove Staff from Partner

Remove a staff member from this partner.

**Endpoint:**
```http
DELETE /api/partner/staff/{staffId}
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| staffId | Long | Staff User ID |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "STAFF_REMOVED",
  "message": "Staff member removed successfully",
  "data": null
}
```

---

## 7. Locker Management

### 7.1 Get Partner Lockers

Get all lockers from stores managed by the partner.

**Endpoint:**
```http
GET /api/partner/lockers
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "code": "LOCKERS_RETRIEVED",
  "message": "Lockers retrieved successfully",
  "data": [
    {
      "id": 5,
      "code": "LOCKER-001",
      "name": "Main Locker",
      "image": "https://example.com/locker1.jpg",
      "status": "ACTIVE",
      "address": "123 Main St, District 1",
      "longitude": 106.660172,
      "latitude": 10.762622,
      "description": "24/7 accessible locker",
      "storeId": 1,
      "storeName": "Laundry Store 1",
      "totalBoxes": 20,
      "availableBoxes": 15,
      "boxes": [
        {
          "id": 1,
          "boxNumber": 1,
          "isActive": true,
          "status": "AVAILABLE",
          "description": "Small box - 30x30x30cm",
          "lockerId": 5,
          "lockerCode": "LOCKER-001"
        }
      ],
      "createdAt": "2024-01-15T10:00:00",
      "updatedAt": "2024-01-30T14:00:00"
    }
  ]
}
```

---

### 7.2 Get Available Boxes by Locker

Get available boxes in a specific locker.

**Endpoint:**
```http
GET /api/partner/lockers/{lockerId}/boxes/available
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| lockerId | Long | Locker ID |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "BOXES_RETRIEVED",
  "message": "Available boxes retrieved successfully",
  "data": [
    {
      "id": 1,
      "boxNumber": 1,
      "isActive": true,
      "status": "AVAILABLE",
      "description": "Small box - 30x30x30cm",
      "lockerId": 5,
      "lockerCode": "LOCKER-001"
    },
    {
      "id": 2,
      "boxNumber": 2,
      "isActive": true,
      "status": "AVAILABLE",
      "description": "Medium box - 40x40x40cm",
      "lockerId": 5,
      "lockerCode": "LOCKER-001"
    }
  ]
}
```

---

## 8. Revenue & Statistics

### 8.1 Get Partner Revenue

Get revenue report for a specific time period.

**Endpoint:**
```http
GET /api/partner/revenue?fromDate=2024-01-01T00:00:00&toDate=2024-01-31T23:59:59
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fromDate | ISO DateTime | Yes | Start date (ISO 8601 format) |
| toDate | ISO DateTime | Yes | End date (ISO 8601 format) |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "REVENUE_RETRIEVED",
  "message": "Revenue report retrieved successfully",
  "data": {
    "partnerId": 1,
    "businessName": "Laundry Pro Inc.",
    "fromDate": "2024-01-01T00:00:00",
    "toDate": "2024-01-31T23:59:59",
    "grossRevenue": 75000000.00,
    "partnerRevenue": 52500000.00,
    "platformFee": 22500000.00,
    "revenueSharePercent": 70.00,
    "totalOrders": 150,
    "completedOrders": 135,
    "canceledOrders": 5,
    "previousPeriodRevenue": 60000000.00,
    "revenueGrowthPercent": 25.00
  }
}
```

---

### 8.2 Get Order Statistics

Get comprehensive order statistics for the partner.

**Endpoint:**
```http
GET /api/partner/orders/statistics
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "code": "STATISTICS_RETRIEVED",
  "message": "Order statistics retrieved successfully",
  "data": {
    "partnerId": 1,
    "totalOrders": 150,
    "todayOrders": 5,
    "weekOrders": 25,
    "monthOrders": 80,
    "initializedOrders": 2,
    "waitingOrders": 8,
    "collectedOrders": 5,
    "processingOrders": 10,
    "readyOrders": 3,
    "returnedOrders": 2,
    "completedOrders": 118,
    "canceledOrders": 2,
    "totalRevenue": 75000000.00,
    "todayRevenue": 2500000.00,
    "weekRevenue": 12500000.00,
    "monthRevenue": 40000000.00,
    "averageOrderValue": 500000.00,
    "ordersByStore": {
      "1": 80,
      "2": 45,
      "3": 25
    }
  }
}
```

---

## 9. IoT Staff Code Unlock

### 9.1 Unlock Box with Staff Code

Unlock a locker box using a staff access code. This endpoint is typically called by IoT devices or physical staff who don't have system accounts.

**Endpoint:**
```http
POST /api/iot/unlock-with-code
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": 1001,
  "accessCode": "ABC123XYZ",
  "staffName": "John Staff"
}
```

**Validation:**
| Field | Constraints |
|-------|-------------|
| orderId | Required |
| accessCode | Required |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "BOX_UNLOCKED",
  "message": "Box unlocked successfully",
  "data": {
    "success": true,
    "message": "Box unlocked successfully",
    "orderId": 1001,
    "orderStatus": "COLLECTED",
    "action": "COLLECT",
    "boxes": [
      {
        "boxId": 1,
        "boxNumber": "3",
        "size": "MEDIUM"
      }
    ],
    "lockerCode": "LOCKER-001",
    "lockerName": "Main Locker",
    "lockerAddress": "123 Main St, District 1",
    "unlockToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "unlockTimestamp": 1706692800000
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "code": "UNLOCK_FAILED",
  "message": "Invalid or expired access code",
  "data": {
    "success": false,
    "message": "Invalid or expired access code",
    "orderId": 1001,
    "orderStatus": null,
    "action": null,
    "boxes": [],
    "lockerCode": null,
    "lockerName": null,
    "lockerAddress": null,
    "unlockToken": null,
    "unlockTimestamp": null
  }
}
```

---

## Admin Partner Management APIs

These endpoints are for **Admin users only** to manage partner applications and accounts.

**Base URL:** `/api/admin/partners`

**Authentication:** Requires `ADMIN` role

---

### Admin 1. Get All Partners

Get all partners with optional status filter.

**Endpoint:**
```http
GET /api/admin/partners?status=PENDING&page=0&size=20
```

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | PartnerStatus | No | Filter by status: PENDING, APPROVED, REJECTED, SUSPENDED |
| page | Integer | No | Page number (default: 0) |
| size | Integer | No | Page size (default: 20) |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "PARTNERS_RETRIEVED",
  "message": "Partners retrieved successfully",
  "data": {
    "content": [
      {
        "id": 1,
        "userId": 10,
        "userName": "John Doe",
        "businessName": "Laundry Pro Inc.",
        "businessRegistrationNumber": "BR123456789",
        "taxId": "TAX987654321",
        "businessAddress": "123 Business Ave, District 1, HCMC",
        "contactPhone": "+84123456789",
        "contactEmail": "contact@laundrypro.com",
        "status": "PENDING",
        "approvedAt": null,
        "approvedBy": null,
        "rejectionReason": null,
        "revenueSharePercent": 70.00,
        "storeCount": 0,
        "staffCount": 0,
        "notes": "Premium laundry service provider",
        "createdAt": "2024-01-30T10:00:00",
        "updatedAt": "2024-01-30T10:00:00"
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      }
    },
    "totalElements": 1,
    "totalPages": 1,
    "first": true,
    "last": true,
    "size": 20,
    "number": 0,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "numberOfElements": 1,
    "empty": false
  }
}
```

---

### Admin 2. Get Partner by ID

Get detailed information about a specific partner.

**Endpoint:**
```http
GET /api/admin/partners/{partnerId}
```

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| partnerId | Long | Partner ID |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "PARTNER_RETRIEVED",
  "message": "Partner retrieved successfully",
  "data": {
    "id": 1,
    "userId": 10,
    "userName": "John Doe",
    "businessName": "Laundry Pro Inc.",
    "businessRegistrationNumber": "BR123456789",
    "taxId": "TAX987654321",
    "businessAddress": "123 Business Ave, District 1, HCMC",
    "contactPhone": "+84123456789",
    "contactEmail": "contact@laundrypro.com",
    "status": "APPROVED",
    "approvedAt": "2024-01-31T08:30:00",
    "approvedBy": 1,
    "rejectionReason": null,
    "revenueSharePercent": 70.00,
    "storeCount": 3,
    "staffCount": 5,
    "notes": "Premium laundry service provider",
    "createdAt": "2024-01-30T10:00:00",
    "updatedAt": "2024-01-31T08:30:00"
  }
}
```

---

### Admin 3. Approve Partner

Approve a pending partner application.

**Endpoint:**
```http
POST /api/admin/partners/{partnerId}/approve
```

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| partnerId | Long | Partner ID |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "PARTNER_APPROVED",
  "message": "Partner approved successfully",
  "data": {
    "id": 1,
    "userId": 10,
    "userName": "John Doe",
    "businessName": "Laundry Pro Inc.",
    "businessRegistrationNumber": "BR123456789",
    "taxId": "TAX987654321",
    "businessAddress": "123 Business Ave, District 1, HCMC",
    "contactPhone": "+84123456789",
    "contactEmail": "contact@laundrypro.com",
    "status": "APPROVED",
    "approvedAt": "2024-01-31T08:30:00",
    "approvedBy": 1,
    "rejectionReason": null,
    "revenueSharePercent": 70.00,
    "storeCount": 0,
    "staffCount": 0,
    "notes": "Premium laundry service provider",
    "createdAt": "2024-01-30T10:00:00",
    "updatedAt": "2024-01-31T08:30:00"
  }
}
```

---

### Admin 4. Reject Partner

Reject a pending partner application.

**Endpoint:**
```http
POST /api/admin/partners/{partnerId}/reject?reason=Incomplete business registration
```

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| partnerId | Long | Partner ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| reason | String | Yes | Reason for rejection |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "PARTNER_REJECTED",
  "message": "Partner rejected successfully",
  "data": {
    "id": 1,
    "userId": 10,
    "userName": "John Doe",
    "businessName": "Laundry Pro Inc.",
    "businessRegistrationNumber": "BR123456789",
    "taxId": "TAX987654321",
    "businessAddress": "123 Business Ave, District 1, HCMC",
    "contactPhone": "+84123456789",
    "contactEmail": "contact@laundrypro.com",
    "status": "REJECTED",
    "approvedAt": null,
    "approvedBy": null,
    "rejectionReason": "Incomplete business registration",
    "revenueSharePercent": 70.00,
    "storeCount": 0,
    "staffCount": 0,
    "notes": "Premium laundry service provider",
    "createdAt": "2024-01-30T10:00:00",
    "updatedAt": "2024-01-31T09:00:00"
  }
}
```

---

### Admin 5. Suspend Partner

Suspend an active partner account.

**Endpoint:**
```http
POST /api/admin/partners/{partnerId}/suspend
```

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| partnerId | Long | Partner ID |

**Response (200 OK):**
```json
{
  "success": true,
  "code": "PARTNER_SUSPENDED",
  "message": "Partner suspended successfully",
  "data": {
    "id": 1,
    "userId": 10,
    "userName": "John Doe",
    "businessName": "Laundry Pro Inc.",
    "businessRegistrationNumber": "BR123456789",
    "taxId": "TAX987654321",
    "businessAddress": "123 Business Ave, District 1, HCMC",
    "contactPhone": "+84123456789",
    "contactEmail": "contact@laundrypro.com",
    "status": "SUSPENDED",
    "approvedAt": "2024-01-31T08:30:00",
    "approvedBy": 1,
    "rejectionReason": null,
    "revenueSharePercent": 70.00,
    "storeCount": 3,
    "staffCount": 5,
    "notes": "Premium laundry service provider",
    "createdAt": "2024-01-30T10:00:00",
    "updatedAt": "2024-02-01T10:00:00"
  }
}
```

---

## Error Codes

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required or invalid token |
| `FORBIDDEN` | 403 | User does not have required role (PARTNER) |
| `PARTNER_NOT_FOUND` | 404 | Partner profile not found |
| `ORDER_NOT_FOUND` | 404 | Order not found |
| `STORE_NOT_FOUND` | 404 | Store not found |
| `LOCKER_NOT_FOUND` | 404 | Locker not found |
| `ACCESS_CODE_NOT_FOUND` | 404 | Access code not found |
| `INVALID_ACCESS_CODE` | 400 | Invalid or expired access code |
| `ORDER_NOT_WAITING` | 400 | Order is not in WAITING status |
| `ORDER_NOT_COLLECTED` | 400 | Order is not in COLLECTED status |
| `ORDER_NOT_PROCESSING` | 400 | Order is not in PROCESSING status |
| `WEIGHT_UPDATE_FAILED` | 400 | Failed to update order weight |
| `STAFF_ALREADY_EXISTS` | 409 | Staff member already added |
| `PARTNER_REGISTRATION_FAILED` | 400 | Failed to register as partner |
| `CODE_EXPIRED` | 400 | Access code has expired |
| `CODE_ALREADY_USED` | 400 | Access code has already been used |
| `CODE_CANCELLED` | 400 | Access code has been cancelled |
| `INVALID_STATUS_TRANSITION` | 400 | Invalid order status transition |

---

## Order Lifecycle

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ INITIALIZED │───▶│  RESERVED   │───▶│   WAITING   │───▶│  COLLECTED  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                                                    (Staff collects
     │                                                    using access code)
     │                                                           │
     ▼                                                           ▼
┌─────────────┐                                         ┌─────────────┐
│  CANCELED   │◀───────────────────────────────────────▶│  PROCESSING │
└─────────────┘                                         └─────────────┘
                                                              │
                                                              ▼
                                                        ┌─────────────┐
                                                        │    READY    │
                                                        └─────────────┘
                                                              │
                                                              ▼
┌─────────────┐                                         ┌─────────────┐
│  COMPLETED  │◀────────────────────────────────────────│   RETURNED  │
└─────────────┘                                         └─────────────┘
                                                        (Staff returns
                                                        using access code)
```

---

## Integration Examples

### Example 1: Complete Order Flow

```javascript
// 1. Partner accepts a pending order
const acceptResponse = await fetch('/api/partner/orders/1001/accept?expirationHours=24', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  }
});
const { data: accessCode } = await acceptResponse.json();

// 2. Staff uses the access code to unlock and collect items
const unlockResponse = await fetch('/api/iot/unlock-with-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 1001,
    accessCode: accessCode.code,
    staffName: 'John Staff'
  })
});

// 3. Partner updates order weight after collection
await fetch('/api/partner/orders/1001/weight', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    actualWeight: 5.5,
    weightUnit: 'kg',
    staffNote: 'Actual weight measured'
  })
});

// 4. Partner marks order as processing
await fetch('/api/partner/orders/1001/process', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer <token>' }
});

// 5. After processing, partner marks order as ready
const readyResponse = await fetch('/api/partner/orders/1001/ready', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer <token>' }
});
const { data: returnCode } = await readyResponse.json();

// 6. Staff uses the return code to return items to locker
await fetch('/api/iot/unlock-with-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 1001,
    accessCode: returnCode.code,
    staffName: 'John Staff'
  })
});
```

### Example 2: Get Dashboard and Statistics

```javascript
// Get dashboard data
const dashboard = await fetch('/api/partner/dashboard', {
  headers: { 'Authorization': 'Bearer <token>' }
}).then(r => r.json());

// Get detailed statistics
const statistics = await fetch('/api/partner/orders/statistics', {
  headers: { 'Authorization': 'Bearer <token>' }
}).then(r => r.json());

// Get revenue for current month
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
const revenue = await fetch(
  `/api/partner/revenue?fromDate=${firstDay.toISOString()}&toDate=${now.toISOString()}`,
  { headers: { 'Authorization': 'Bearer <token>' } }
).then(r => r.json());
```

---

## Notes for AI Agents

1. **Authentication**: Always include the `Authorization: Bearer <token>` header for all partner endpoints except registration.

2. **Role Requirement**: Most endpoints require the `PARTNER` role. Users must register as a partner and be approved by an admin to access these APIs.

3. **Pagination**: List endpoints support Spring Data pagination with `page`, `size`, and `sort` parameters.

4. **Date Formats**: All date/time fields use ISO 8601 format (e.g., `2024-01-31T10:00:00`).

5. **Order Status Flow**: Orders follow a specific lifecycle. Ensure status transitions are valid:
   - `WAITING` → `COLLECTED` (via accept + unlock)
   - `COLLECTED` → `PROCESSING`
   - `PROCESSING` → `READY`
   - `READY` → `RETURNED` (via ready + unlock)
   - `RETURNED` → `COMPLETED` (customer pickup)

6. **Access Codes**: These are temporary codes generated for physical staff to unlock lockers. They expire after a set duration (default 24 hours).

7. **Weight Updates**: When updating order weight, the system automatically recalculates the total price based on actual weight and service prices.
