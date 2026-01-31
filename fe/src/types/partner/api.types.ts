// ============================================
// Partner API Types
// These mirror the Zod schemas in schemas/partner.schemas.ts
// ============================================

import type { OrderStatus, OrderType, PartnerStatus, AccessCodeAction, AccessCodeStatus, BoxStatus, LockerStatus, StoreStatus } from './enums';

// ============================================
// Partner Profile Types
// ============================================

export interface PartnerResponse {
  id: number;
  userId: number;
  userName: string;
  businessName: string;
  businessRegistrationNumber: string | null;
  taxId: string | null;
  businessAddress: string;
  contactPhone: string;
  contactEmail: string | null;
  status: PartnerStatus;
  approvedAt: string | null;
  approvedBy: number | null;
  rejectionReason: string | null;
  revenueSharePercent: number;
  storeCount: number;
  staffCount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerRegistrationRequest {
  businessName: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  businessAddress: string;
  contactPhone: string;
  contactEmail?: string;
  notes?: string;
}

export interface PartnerUpdateRequest {
  businessName?: string;
  businessAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
}

// ============================================
// Dashboard Types
// ============================================

export interface PartnerDashboardResponse {
  partnerId: number;
  businessName: string;
  totalStores: number;
  activeStores: number;
  totalStaff: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  canceledOrders: number;
  totalRevenue: number;
  partnerRevenue: number;
  platformFee: number;
  todayRevenue: number;
  monthRevenue: number;
}

export interface PartnerOrderStatisticsResponse {
  partnerId: number;
  totalOrders: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  initializedOrders: number;
  waitingOrders: number;
  collectedOrders: number;
  processingOrders: number;
  readyOrders: number;
  returnedOrders: number;
  completedOrders: number;
  canceledOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  averageOrderValue: number;
  ordersByStore: Record<string, number>;
}

// ============================================
// Order Types
// ============================================

export interface OrderDetailResponse {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceImage: string | null;
  quantity: number;
  unit: string;
  price: number;
  description: string | null;
}

export interface OrderResponse {
  id: number;
  type: OrderType;
  status: OrderStatus;
  pinCode: string;
  senderId: number;
  senderName: string;
  senderPhone: string;
  receiverId: number | null;
  receiverName: string | null;
  lockerId: number;
  lockerName: string;
  lockerCode: string;
  sendBoxNumber: number;
  receiveBoxNumber: number | null;
  sendBoxNumbers: number[];
  receiveBoxNumbers: number[];
  staffId: number | null;
  staffName: string | null;
  actualWeight: number | null;
  weightUnit: string;
  extraFee: number;
  discount: number;
  reservationFee: number;
  storagePrice: number;
  shippingFee: number;
  totalPrice: number;
  description: string | null;
  customerNote: string | null;
  staffNote: string | null;
  deliveryAddress: string | null;
  intendedReceiveAt: string | null;
  receiveAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderDetailResponse[];
}

export interface UpdateOrderWeightRequest {
  actualWeight: number;
  weightUnit?: string;
  items?: OrderItemRequest[];
  staffNote?: string;
}

export interface OrderItemRequest {
  serviceId: number;
  quantity: number;
  description?: string;
}

// ============================================
// Access Code Types
// ============================================

export interface StaffAccessCodeResponse {
  id: number;
  code: string;
  orderId: number;
  partnerId: number;
  action: AccessCodeAction;
  status: AccessCodeStatus;
  expiresAt: string;
  usedAt: string | null;
  staffName: string | null;
  notes: string | null;
  createdAt: string;
  orderLockerCode: string;
  orderLockerName: string;
  orderBoxNumbers: string;
  customerName: string;
}

export interface GenerateAccessCodeRequest {
  orderId: number;
  action: AccessCodeAction;
  expirationHours?: number;
  notes?: string;
}

// ============================================
// Store Types
// ============================================

export interface StoreResponse {
  id: number;
  name: string;
  contactPhone: string;
  status: StoreStatus;
  address: string;
  longitude: number;
  latitude: number;
  image: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Staff Types
// ============================================

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  imageUrl: string | null;
  provider: string;
  emailVerified: boolean;
}

// ============================================
// Locker & Box Types
// ============================================

export interface BoxResponse {
  id: number;
  boxNumber: number;
  isActive: boolean;
  status: BoxStatus;
  description: string | null;
  lockerId: number;
  lockerCode: string;
}

export interface LockerResponse {
  id: number;
  code: string;
  name: string;
  image: string | null;
  status: LockerStatus;
  address: string;
  longitude: number;
  latitude: number;
  description: string | null;
  storeId: number;
  storeName: string;
  totalBoxes: number;
  availableBoxes: number;
  boxes?: BoxResponse[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Revenue Types
// ============================================

export interface PartnerRevenueResponse {
  partnerId: number;
  businessName: string;
  fromDate: string;
  toDate: string;
  grossRevenue: number;
  partnerRevenue: number;
  platformFee: number;
  revenueSharePercent: number;
  totalOrders: number;
  completedOrders: number;
  canceledOrders: number;
  previousPeriodRevenue: number;
  revenueGrowthPercent: number;
}

// ============================================
// Query Params Types
// ============================================

export interface OrderQueryParams {
  status?: OrderStatus;
  page?: number;
  size?: number;
}

export interface PendingOrdersQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface AccessCodeQueryParams {
  page?: number;
  size?: number;
}

export interface RevenueQueryParams {
  fromDate: string;
  toDate: string;
}
