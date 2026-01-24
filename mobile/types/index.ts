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
  imageUrl?: string;
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
  location?: string;
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

// Service
export interface LaundryService {
  id: number;
  storeId?: number;
  name: string;
  description?: string;
  price: number;
  unit: string;
  estimatedTime?: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Order
export interface Order {
  id: number;
  userId: number;
  lockerId: number;
  boxId: number;
  status: OrderStatus;
  pin?: string;
  totalAmount: number;
  items: OrderItem[];
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

export interface OrderItem {
  id: number;
  serviceId: number;
  serviceName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface CreateOrderRequest {
  lockerId: number;
  boxId: number;
  items: { serviceId: number; quantity: number }[];
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
  fullName: string;
  email?: string;
  phoneNumber?: string;
  avatarUrl?: string;
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
  newUser: boolean;
  tempToken?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface CompleteRegistrationRequest {
  tempToken: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  newUser: boolean;
  tempToken?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}
