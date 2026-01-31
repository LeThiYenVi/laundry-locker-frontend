// ============================================
// Partner Domain Types (for UI components)
// ============================================

import type { OrderStatus, PaymentStatus, ServiceType, StaffRole, PaymentMethod } from './enums';

// ============================================
// Legacy Partner Types (for backward compatibility)
// These will be deprecated in favor of API types
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
  revenueChart: ChartData[];
  ordersByStatus: StatusCount[];
  topServices: ServiceCount[];
}

export interface ChartData {
  label: string;
  value: number;
}

export interface StatusCount {
  status: OrderStatus;
  count: number;
}

export interface ServiceCount {
  serviceName: string;
  count: number;
}

export interface PartnerOrder {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  lockerName: string;
  lockerAddress: string;
  boxNumber: number;
  serviceType: ServiceType;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  assignedStaffId?: number;
  assignedStaffName?: string;
  customerNote?: string;
  staffNote?: string;
}

export interface PartnerService {
  id: number;
  name: string;
  category: string;
  basePrice: number;
  pricePerKg: number;
  processingTime: number;
  isActive: boolean;
  description: string;
}

export interface StaffMember {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  role: StaffRole;
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
  createdAt: string;
  performance?: StaffPerformance;
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
  email: string;
  role: StaffRole;
}

export interface PartnerLocker {
  id: number;
  name: string;
  location: string;
  totalBoxes: number;
  availableBoxes: number;
  occupiedBoxes: number;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  boxes: LockerBox[];
}

export interface LockerBox {
  id: number;
  boxNumber: string;
  size: 'SMALL' | 'MEDIUM' | 'LARGE';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  currentOrderId?: number;
  pinCode?: string;
}

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
  period: string;
  revenue: number;
  orders: number;
}

// ============================================
// Component Props Types
// ============================================

export interface OrderFilterProps {
  status?: OrderStatus | 'ALL';
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}

export interface StaffFilterProps {
  role?: StaffRole | 'ALL';
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  searchQuery?: string;
}
