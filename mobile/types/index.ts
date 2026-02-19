// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Store
export interface Store {
  id: number;
  name: string;
  address: string;
  phone?: string;
  openTime?: string;
  closeTime?: string;
  image?: string; // Updated from imageUrl to match API guide usually, but keeping imageUrl alias or secondary if needed. Guide says "image".
  imageUrl?: string; // Keeping for compatibility
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Locker
export interface Locker {
  id: number;
  storeId: number;
  name: string;
  code?: string; // Added code
  location?: string;
  image?: string; // Added image
  imageUrl?: string; // Added imageUrl
  status: LockerStatus;
  totalBoxes: number;
  availableBoxes: number;
  createdAt?: string;
  updatedAt?: string;
}

export type LockerStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

// Box
export interface Box {
  id: number;
  lockerId: number;
  boxNumber: string;
  size: BoxSize;
  status: BoxStatus;
  createdAt?: string;
  updatedAt?: string;
}

export type BoxSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type BoxStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

// Service Types (from COMPLETE_API_REFERENCE)
export type ServiceCategory = 'STORAGE' | 'LAUNDRY';
export type ServiceType = 'STANDARD_DROPOFF' | 'OVERNIGHT' | 'EXPRESS_2H' | 'MONTHLY_STUDENT' | 'MONTHLY_SHIPPER' | 'LAUNDRY' | 'ADDITIONAL_FEE';
export type PricingType = 'FIXED' | 'PER_WEIGHT' | 'PER_PIECE';
export type OrderType = 'STANDARD_DROPOFF' | 'LAUNDRY' | 'STORAGE';

// Service
export interface LaundryService {
  id: number;
  storeId?: number;
  name: string;
  description?: string;
  category?: ServiceCategory;       // LAUNDRY or STORAGE
  serviceType?: ServiceType;        // STANDARD_DROPOFF, OVERNIGHT, LAUNDRY, etc.
  price: number;
  pricePerUnit?: number;            // from API
  maxPrice?: number;                // max price for LAUNDRY services
  unit: string;                     // KG, HOUR, NIGHT, MONTH
  estimatedTime?: number;           // estimated time (hours)
  estimatedHours?: number;          // alias
  isAddon?: boolean;                // if it's an addon service
  isMonthlyPackage?: boolean;       // if it's a monthly package
  image?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}


// Promotion Info
export interface PromotionInfo {
  code: string;
  title: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SERVICE';
  discountValue: number;
  maxDiscountAmount?: number;
  calculatedDiscount: number;
  applied: boolean;
  message?: string;
}

// Estimated Price (for LAUNDRY orders)
export interface EstimatedPrice {
  minPrice: number;
  maxPrice: number;
  estimatedWeight?: number;
  note?: string;
}

// Price Breakdown
export interface PriceBreakdown {
  basePrice: number;
  storageFee?: number;
  overtimeFee?: number;
  shippingFee?: number;
  originalPrice?: number;
  promotionCode?: string;
  promotionDiscount?: number;
  discount?: number;
  finalPrice?: number;
  appliedPromotions?: PromotionInfo[];
  note?: string;
}

// Order
export interface Order {
  id: number;
  orderCode?: string;  // ORD-20240115-ABC123
  userId: number;
  type?: OrderType;
  serviceCategory?: ServiceCategory;
  pricingType?: PricingType;
  lockerId: number;
  locker?: Locker;
  lockerName?: string;
  lockerCode?: string;
  boxId: number;
  boxNumber?: number;
  sendBoxNumber?: number;
  receiveBoxNumber?: number;
  boxes?: OrderBox[];  // Array of boxes for order
  status: OrderStatus;
  pin?: string;
  pinCode?: string;

  // Customer Info (from API response)
  customer?: {
    id: number;
    fullName: string;
    phoneNumber: string;
  };

  // Sender Info
  senderId?: number;
  senderName?: string;
  senderPhone?: string;

  // Receiver Info
  receiverId?: number;
  receiverName?: string;
  receiverPhone?: string;

  // Pricing
  totalAmount: number;
  totalPrice?: number;
  originalPrice?: number;
  storagePrice?: number;
  estimatedPrice?: EstimatedPrice | number;  // Can be object or number
  actualPrice?: number;      // Actual price after processing
  discountAmount?: number;   // Total discount amount
  priceBreakdown?: PriceBreakdown;

  // Promotion
  promotionCode?: string;
  appliedPromotionCodes?: string[];
  promotionDiscount?: number;
  discount?: number;
  promotionInfo?: PromotionInfo;
  promotion?: {
    code: string;
    discountPercent?: number;
    discountAmount?: number;
  };

  // Weight (for LAUNDRY)
  estimatedWeight?: number;
  actualWeight?: number;
  weightUnit?: string;

  // Overtime
  isOvertime?: boolean;
  overtimeHours?: number;
  extraFee?: number;

  // Status flags
  isPaid?: boolean;
  paymentRequired?: boolean;

  // Payment Info (from API response)
  payment?: {
    status: string;
    method: string;
    paidAt?: string;
  };

  // Action guidance
  nextAction?: string;
  nextActionMessage?: string;

  // Items & Services
  items?: OrderItem[];
  services?: LaundryService[];
  customerNote?: string;

  // Timestamps
  expiresAt?: string;        // Order expiration
  intendedReceiveAt?: string;
  pickupDeadline?: string;
  createdAt?: string;
  updatedAt?: string;
  confirmedAt?: string;
  collectedAt?: string;
  processedAt?: string;
  readyAt?: string;
  returnedAt?: string;
  completedAt?: string;
  canceledAt?: string;
  cancelReason?: string;
}

export interface OrderBox {
  id: number;
  boxNumber: string;
  size: string;
}

export interface OrderItem {
  id: number;
  serviceId: number;
  serviceName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderItemRequest {
  serviceId: number;
  quantity?: number;
  description?: string;
}

export interface CreateOrderRequest {
  type: OrderType;
  serviceCategory?: ServiceCategory;
  lockerId: number;
  boxId?: number;
  boxIds?: number[];
  serviceIds?: number[];
  items?: OrderItemRequest[];
  customerNote?: string;
  receiverId?: number;
  receiverName?: string;
  receiverPhone?: string;
  intendedReceiveAt?: string;
  estimatedWeight?: number;
  promotionCode?: string;
  promotionCodes?: string[];
}

export interface OrderTrackingDetail {
  orderId: number;
  status: OrderStatus;
  statusDescription: string;
  pinCode?: string;
  lockerName?: string;
  lockerCode?: string;
  boxNumber?: number;
  createdAt: string;
  updatedAt: string;
  estimatedReadyAt?: string;
  completedAt?: string;
  isPaid: boolean;
  nextAction: string;
}

export type OrderStatus =
  | 'INITIALIZED'
  | 'WAITING'
  | 'COLLECTED'
  | 'PROCESSING'
  | 'READY'
  | 'RETURNED'
  | 'COMPLETED'
  | 'CANCELED';

// Payment
export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paymentUrl?: string;
  expiredAt?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentMethod = 'VNPAY' | 'MOMO' | 'CASH';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';

export interface CreatePaymentRequest {
  orderId: number;
  paymentMethod: PaymentMethod;
}

// Notification
export interface Notification {
  id: number;
  userId: number;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt?: string;
}

export type NotificationType =
  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_COLLECTED'
  | 'ORDER_PROCESSING'
  | 'ORDER_READY'
  | 'ORDER_RETURNED'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'SYSTEM';

// User
export interface User {
  id: number;
  fullName: string; // Deprecated but kept for compatibility
  firstName?: string; // New
  lastName?: string; // New
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string; // Keeping alias
  imageUrl?: string; // New API field
  joinDate?: string; // New
  emailVerified?: boolean; // New
  phoneVerified?: boolean; // New
  provider?: string; // New
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'USER' | 'STAFF' | 'PARTNER' | 'ADMIN';

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PhoneLoginRequest {
  idToken: string;
}

export interface PhoneLoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  newUser: boolean;
  phoneNumber?: string;
  tempToken?: string;
}

export interface CompleteRegistrationRequest {
  idToken?: string;
  tempToken?: string;
  firstName: string;
  lastName: string;
  birthday: string; // ISO date string
}

export interface CompleteRegistrationResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn: number;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  newUser: boolean;
  phoneNumber?: string;
  tempToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// ============================================
// IoT Types
// ============================================

export interface VerifyPinRequest {
  boxId: number;
  pinCode: string;
}

export interface VerifyPinResponse {
  valid: boolean;
  orderId?: number;
  boxId?: number;
  boxNumber?: number;
  lockerCode?: string;
  orderStatus?: string;
  message?: string;
}

export interface UnlockBoxRequest {
  boxId: number;
  pinCode: string;
  actionType?: 'DROP_OFF' | 'PICKUP';
}

export interface UnlockBoxResponse {
  success: boolean;
  boxId?: number;
  boxNumber?: number;
  lockerCode?: string;
  orderId?: number;
  message?: string;
  unlockToken?: string;
  unlockTimestamp?: number;
}
