import type {
  AuthProvider,
  RoleName,
  LockerStatus,
  BoxStatus,
  OrderType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from './admin.enum';

// ============================================
// Admin User Management Types
// ============================================

export interface AdminUserResponse {
  id: number;
  email: string;
  name: string;
  imageUrl: string;
  provider: AuthProvider;
  emailVerified: boolean;
  enabled: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  enabled?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  imageUrl?: string;
}

export interface UpdateUserStatusRequest {
  enabled: boolean;
}

export interface UpdateUserRolesRequest {
  roles: RoleName[];
}

// ============================================
// Admin Store Management Types
// ============================================

export interface AdminStoreResponse {
  id: number;
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  description: string;
  openTime: string;
  closeTime: string;
  active: boolean;
  lockerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreRequest {
  name: string;
  address?: string;
  phone?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  openTime?: string;
  closeTime?: string;
}

// ============================================
// Admin Service Management Types
// ============================================

export interface AdminServiceResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  imageUrl: string;
  estimatedMinutes: number;
  storeId: number;
  storeName: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  price: number;
  unit?: string;
  imageUrl?: string;
  estimatedMinutes?: number;
  storeId?: number;
}

export interface UpdateServicePriceRequest {
  price: number;
}

// ============================================
// Admin Locker & Box Management Types
// ============================================

export interface BoxInfo {
  id: number;
  boxNumber: number;
  status: BoxStatus;
  description: string;
}

export interface AdminLockerResponse {
  id: number;
  code: string;
  name: string;
  address: string;
  storeId: number;
  storeName: string;
  status: LockerStatus;
  totalBoxes: number;
  availableBoxes: number;
  boxes: BoxInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateLockerRequest {
  code: string;
  name: string;
  address?: string;
  storeId: number;
}

export interface CreateBoxRequest {
  boxNumber: number;
  description?: string;
}

export interface UpdateLockerMaintenanceRequest {
  maintenance: boolean;
}

export interface UpdateBoxStatusRequest {
  status: string;
}

// ============================================
// Admin Order Management Types
// ============================================

export interface OrderDetailResponse {
  id: number;
  serviceId: number;
  serviceName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: number;
  type: OrderType;
  status: OrderStatus;
  pinCode: string;
  senderId: number;
  senderName: string;
  senderPhone: string;
  receiverId: number;
  receiverName: string;
  lockerId: number;
  lockerName: string;
  lockerCode: string;
  sendBoxNumber: number;
  receiveBoxNumber: number;
  sendBoxNumbers: number[];
  receiveBoxNumbers: number[];
  staffId: number;
  staffName: string;
  actualWeight: number;
  weightUnit: string;
  extraFee: number;
  discount: number;
  reservationFee: number;
  storagePrice: number;
  shippingFee: number;
  totalPrice: number;
  description: string;
  customerNote: string;
  staffNote: string;
  deliveryAddress: string;
  intendedReceiveAt: string;
  receiveAt: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderDetailResponse[];
}

export interface OrderStatisticsResponse {
  totalOrders: number;
  completedOrders: number;
  canceledOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
}

export interface DailyRevenueEntry {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueReportResponse {
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  revenueByPaymentMethod: { [key: string]: number };
  dailyRevenue: DailyRevenueEntry[];
}

// ============================================
// Admin Payment Management Types
// ============================================

export interface PaymentResponse {
  id: number;
  orderId: number;
  customerId: number;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  content: string;
  referenceId: string;
  referenceTransactionId: string;
  qr: string;
  url: string;
  deeplink: string;
  description: string;
  createdAt: string;
}

// ============================================
// Admin Scheduler Management Types
// ============================================

export interface SchedulerJobResponse {
  jobName?: string;
  status?: string;
  message?: string;
  [key: string]: any;
}

export interface SchedulerStatusResponse {
  schedulerEnabled?: boolean;
  jobs?: string[];
  message?: string;
  [key: string]: any;
}

// ============================================
// Admin Dashboard Types
// ============================================

export interface DashboardOverviewResponse {
  totalUsers: number;
  totalStores: number;
  totalLockers: number;
  totalOrders: number;
  ordersToday: number;
  pendingOrders: number;
  totalRevenue: number;
  revenueToday: number;
  activeServices: number;
  availableBoxes: number;
  occupiedBoxes: number;
}
