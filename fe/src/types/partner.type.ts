import type {
  OrderStatus,
  ServiceType,
  ReturnMethod,
  StaffRole,
  PaymentStatus,
  PaymentMethod,
  AccessCodeAction,
  AccessCodeStatus,
  PartnerStatus,
} from "./partner.enum";

// ============================================
// Partner Order Types
// ============================================

export interface PartnerOrder {
  id: number;
  orderCode: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  serviceType: ServiceType;
  returnMethod: ReturnMethod;
  lockerId: number;
  lockerName: string;
  boxNumber: string;
  pinCode: string;
  createdAt: string;
  updatedAt: string;
  collectedAt?: string;
  processedAt?: string;
  returnedAt?: string;
  completedAt?: string;
  weight?: number;
  totalPrice?: number;
  platformFee?: number;
  partnerRevenue?: number;
  assignedStaffId?: number;
  assignedStaffName?: string;
  deliveryAddress?: string;
  notes?: string;
  items?: OrderItem[];
  timeline?: OrderTimeline[];
}

export interface OrderItem {
  id: number;
  itemType: string;
  quantity: number;
  pricePerItem: number;
  totalPrice: number;
  notes?: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  staffName?: string;
  notes?: string;
}

export interface UpdateOrderRequest {
  weight?: number;
  items?: OrderItem[];
  notes?: string;
}

export interface CollectOrderRequest {
  staffId: number;
  pinCode: string;
  notes?: string;
}

export interface ReturnOrderRequest {
  boxNumber?: string;
  staffId?: number;
  returnMethod: ReturnMethod;
  deliveryAddress?: string;
  deliveryProof?: string;
  notes?: string;
}

// ============================================
// Partner Staff Types
// ============================================

export interface StaffMember {
  id: number;
  name: string;
  phoneNumber: string;
  email?: string;
  role: StaffRole;
  status: "ACTIVE" | "INACTIVE";
  avatar?: string;
  createdAt: string;
  performance: StaffPerformance;
}

export interface StaffPerformance {
  completedOrders: number;
  avgProcessingTime: string;
  rating: number;
  onTimeDeliveryRate: number;
}

export interface CreateStaffRequest {
  name: string;
  phoneNumber: string;
  email?: string;
  role: StaffRole;
}

export interface UpdateStaffRequest {
  name?: string;
  phoneNumber?: string;
  email?: string;
  role?: StaffRole;
  status?: "ACTIVE" | "INACTIVE";
}

// ============================================
// Partner Service Types
// ============================================

export interface PartnerService {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  pricePerKg?: number;
  processingTime: string;
  isActive: boolean;
  category: string;
}

export interface UpdateServiceRequest {
  basePrice?: number;
  pricePerKg?: number;
  processingTime?: string;
  isActive?: boolean;
  description?: string;
}

// ============================================
// Partner Revenue Types
// ============================================

export interface RevenueStats {
  totalRevenue: number;
  platformFee: number;
  netRevenue: number;
  paidAmount: number;
  pendingAmount: number;
  totalOrders: number;
  completedOrders: number;
}

export interface PaymentHistory {
  id: number;
  amount: number;
  platformFee: number;
  netAmount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  periodStart: string;
  periodEnd: string;
}

export interface RevenueByPeriod {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

// ============================================
// Partner Locker Types
// ============================================

export interface PartnerLocker {
  id: number;
  name: string;
  location: string;
  totalBoxes: number;
  availableBoxes: number;
  occupiedBoxes: number;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  boxes: LockerBox[];
}

export interface LockerBox {
  id: number;
  boxNumber: string;
  size: "SMALL" | "MEDIUM" | "LARGE";
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
  currentOrderId?: number;
  pinCode?: string;
}

// ============================================
// Partner Dashboard Types
// ============================================

export interface PartnerDashboardOverview {
  todayOrders: number;
  processingOrders: number;
  monthlyRevenue: number;
  activeLockers: number;
  pendingCollections: number;
  overdueOrders: number;
  avgProcessingTime: string;
  completionRate: number;
  revenueChart: RevenueByPeriod[];
  ordersByStatus: OrderStatusCount[];
  topServices: ServiceStats[];
}

export interface OrderStatusCount {
  status: OrderStatus;
  count: number;
  percentage: number;
}

export interface ServiceStats {
  serviceName: string;
  orderCount: number;
  revenue: number;
}

// ============================================
// Partner Notification Types
// ============================================

export interface PartnerNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  orderId?: number;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType =
  | "NEW_ORDER"
  | "ORDER_TIMEOUT"
  | "CUSTOMER_COMPLAINT"
  | "PAYMENT_RECEIVED"
  | "LOCKER_ISSUE";

// ============================================
// Partner Profile Types
// ============================================

export interface PartnerProfile {
  id: number;
  businessName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  taxCode?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  platformFeePercentage: number;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  joinDate: string;
  totalRevenue: number;
  totalOrders: number;
  rating: number;
  description?: string;
  workingHours: {
    open: string;
    close: string;
  };
  serviceArea?: string[];
  avatar?: string;
}

export interface UpdatePartnerProfileRequest {
  // Fields matching backend PartnerUpdateRequest
  businessName?: string;
  businessAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
}
  serviceArea?: string[];
}

// ============================================
// Staff Access Code Types (Business Flow)
// ============================================

export interface StaffAccessCode {
  id: number;
  code: string;
  orderId: number;
  partnerId: number;
  action: AccessCodeAction;
  status: AccessCodeStatus;
  expiresAt: string;
  usedAt?: string;
  staffName?: string;
  notes?: string;
  createdAt: string;
  orderLockerCode?: string;
  orderLockerName?: string;
  orderBoxNumbers?: string;
  customerName?: string;
}

export interface GenerateAccessCodeRequest {
  orderId: number;
  action: AccessCodeAction;
  expirationHours?: number;
  notes?: string;
}

export interface AcceptOrderResponse {
  orderId: number;
  status: OrderStatus;
  staffAccessCode: StaffAccessCode;
  message: string;
}

export interface MarkReadyResponse {
  orderId: number;
  status: OrderStatus;
  staffAccessCode: StaffAccessCode;
  message: string;
}

export interface UpdateWeightRequest {
  orderId: number;
  actualWeight: number;
  weightUnit?: "kg" | "g";
  notes?: string;
}

export interface UpdateWeightResponse {
  orderId: number;
  actualWeight: number;
  totalPrice: number;
  message: string;
}

// ============================================
// Partner API Response Types (from Backend)
// ============================================

export interface PartnerResponse {
  id: number;
  userId: number;
  userName: string;
  businessName: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  businessAddress: string;
  contactPhone: string;
  contactEmail?: string;
  status: PartnerStatus;
  approvedAt?: string;
  approvedBy?: number;
  rejectionReason?: string;
  revenueSharePercent: number;
  storeCount: number;
  staffCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

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
  previousPeriodRevenue?: number;
  revenueGrowthPercent?: number;
}

// ============================================
// Staff Directory Types (Simple - No Accounts)
// ============================================

export interface StaffContact {
  id: number;
  name: string;
  phoneNumber: string;
  notes?: string;
  createdAt: string;
}

export interface CreateStaffContactRequest {
  name: string;
  phoneNumber: string;
  notes?: string;
}
