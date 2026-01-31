import { z } from 'zod';

// ============================================
// Partner Enums
// ============================================

export const PartnerStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
]);

export const AccessCodeActionSchema = z.enum([
  'COLLECT',
  'RETURN',
]);

export const AccessCodeStatusSchema = z.enum([
  'ACTIVE',
  'USED',
  'EXPIRED',
  'CANCELLED',
]);

export const OrderTypeSchema = z.enum([
  'LAUNDRY',
  'DRY_CLEAN',
  'STORAGE',
]);

export const OrderStatusSchema = z.enum([
  'INITIALIZED',
  'RESERVED',
  'WAITING',
  'COLLECTED',
  'PROCESSING',
  'READY',
  'RETURNED',
  'COMPLETED',
  'CANCELED',
]);

export const BoxStatusSchema = z.enum([
  'AVAILABLE',
  'OCCUPIED',
  'RESERVED',
  'MAINTENANCE',
]);

export const LockerStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'MAINTENANCE',
  'DISCONNECTED',
]);

export const StoreStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'CLOSED',
]);

// ============================================
// Partner Profile Schemas
// ============================================

export const PartnerResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userName: z.string(),
  businessName: z.string(),
  businessRegistrationNumber: z.string().nullable().optional(),
  taxId: z.string().nullable().optional(),
  businessAddress: z.string(),
  contactPhone: z.string(),
  contactEmail: z.string().email().nullable().optional(),
  status: PartnerStatusSchema,
  approvedAt: z.string().nullable().optional(),
  approvedBy: z.number().nullable().optional(),
  rejectionReason: z.string().nullable().optional(),
  revenueSharePercent: z.number(),
  storeCount: z.number(),
  staffCount: z.number(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const PartnerRegistrationRequestSchema = z.object({
  businessName: z.string().min(3).max(200),
  businessRegistrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  businessAddress: z.string().min(1),
  contactPhone: z.string().min(1),
  contactEmail: z.string().email().optional(),
  notes: z.string().optional(),
});

export const PartnerUpdateRequestSchema = z.object({
  businessName: z.string().min(3).max(200).optional(),
  businessAddress: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email().optional(),
  notes: z.string().optional(),
});

// ============================================
// Dashboard Schemas
// ============================================

export const PartnerDashboardResponseSchema = z.object({
  partnerId: z.number(),
  businessName: z.string(),
  totalStores: z.number(),
  activeStores: z.number(),
  totalStaff: z.number(),
  totalOrders: z.number(),
  pendingOrders: z.number(),
  completedOrders: z.number(),
  canceledOrders: z.number(),
  totalRevenue: z.number(),
  partnerRevenue: z.number(),
  platformFee: z.number(),
  todayRevenue: z.number(),
  monthRevenue: z.number(),
});

export const PartnerOrderStatisticsResponseSchema = z.object({
  partnerId: z.number(),
  totalOrders: z.number(),
  todayOrders: z.number(),
  weekOrders: z.number(),
  monthOrders: z.number(),
  initializedOrders: z.number(),
  waitingOrders: z.number(),
  collectedOrders: z.number(),
  processingOrders: z.number(),
  readyOrders: z.number(),
  returnedOrders: z.number(),
  completedOrders: z.number(),
  canceledOrders: z.number(),
  totalRevenue: z.number(),
  todayRevenue: z.number(),
  weekRevenue: z.number(),
  monthRevenue: z.number(),
  averageOrderValue: z.number(),
  ordersByStore: z.record(z.string(), z.number()),
});

// ============================================
// Order Schemas
// ============================================

export const OrderDetailResponseSchema = z.object({
  id: z.number(),
  serviceId: z.number(),
  serviceName: z.string(),
  serviceImage: z.string().nullable().optional(),
  quantity: z.number(),
  unit: z.string(),
  price: z.number(),
  description: z.string().nullable().optional(),
});

export const OrderResponseSchema = z.object({
  id: z.number(),
  type: OrderTypeSchema,
  status: OrderStatusSchema,
  pinCode: z.string(),
  senderId: z.number(),
  senderName: z.string(),
  senderPhone: z.string(),
  receiverId: z.number().nullable().optional(),
  receiverName: z.string().nullable().optional(),
  lockerId: z.number(),
  lockerName: z.string(),
  lockerCode: z.string(),
  sendBoxNumber: z.number(),
  receiveBoxNumber: z.number().nullable().optional(),
  sendBoxNumbers: z.array(z.number()),
  receiveBoxNumbers: z.array(z.number()),
  staffId: z.number().nullable().optional(),
  staffName: z.string().nullable().optional(),
  actualWeight: z.number().nullable().optional(),
  weightUnit: z.string(),
  extraFee: z.number(),
  discount: z.number(),
  reservationFee: z.number(),
  storagePrice: z.number(),
  shippingFee: z.number(),
  totalPrice: z.number(),
  description: z.string().nullable().optional(),
  customerNote: z.string().nullable().optional(),
  staffNote: z.string().nullable().optional(),
  deliveryAddress: z.string().nullable().optional(),
  intendedReceiveAt: z.string().nullable().optional(),
  receiveAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  orderDetails: z.array(OrderDetailResponseSchema),
});

export const UpdateOrderWeightRequestSchema = z.object({
  actualWeight: z.number().min(0.1),
  weightUnit: z.string().optional().default('kg'),
  items: z.array(z.object({
    serviceId: z.number(),
    quantity: z.number().positive(),
    description: z.string().optional(),
  })).optional(),
  staffNote: z.string().optional(),
});

// ============================================
// Access Code Schemas
// ============================================

export const StaffAccessCodeResponseSchema = z.object({
  id: z.number(),
  code: z.string(),
  orderId: z.number(),
  partnerId: z.number(),
  action: AccessCodeActionSchema,
  status: AccessCodeStatusSchema,
  expiresAt: z.string(),
  usedAt: z.string().nullable().optional(),
  staffName: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  orderLockerCode: z.string(),
  orderLockerName: z.string(),
  orderBoxNumbers: z.string(),
  customerName: z.string(),
});

export const GenerateAccessCodeRequestSchema = z.object({
  orderId: z.number(),
  action: AccessCodeActionSchema,
  expirationHours: z.number().int().min(1).max(72).optional().default(24),
  notes: z.string().max(500).optional(),
});

// ============================================
// Store Schemas
// ============================================

export const StoreResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  contactPhone: z.string(),
  status: StoreStatusSchema,
  address: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  image: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================
// Staff Schemas
// ============================================

export const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  imageUrl: z.string().nullable().optional(),
  provider: z.string(),
  emailVerified: z.boolean(),
});

// ============================================
// Locker & Box Schemas
// ============================================

export const BoxResponseSchema = z.object({
  id: z.number(),
  boxNumber: z.number(),
  isActive: z.boolean(),
  status: BoxStatusSchema,
  description: z.string().nullable().optional(),
  lockerId: z.number(),
  lockerCode: z.string(),
});

export const LockerResponseSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  image: z.string().nullable().optional(),
  status: LockerStatusSchema,
  address: z.string(),
  longitude: z.number(),
  latitude: z.number(),
  description: z.string().nullable().optional(),
  storeId: z.number(),
  storeName: z.string(),
  totalBoxes: z.number(),
  availableBoxes: z.number(),
  boxes: z.array(BoxResponseSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ============================================
// Revenue Schemas
// ============================================

export const PartnerRevenueResponseSchema = z.object({
  partnerId: z.number(),
  businessName: z.string(),
  fromDate: z.string(),
  toDate: z.string(),
  grossRevenue: z.number(),
  partnerRevenue: z.number(),
  platformFee: z.number(),
  revenueSharePercent: z.number(),
  totalOrders: z.number(),
  completedOrders: z.number(),
  canceledOrders: z.number(),
  previousPeriodRevenue: z.number(),
  revenueGrowthPercent: z.number(),
});

export const RevenueQueryParamsSchema = z.object({
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
});

// ============================================
// Query Params Schemas
// ============================================

export const OrderQueryParamsSchema = z.object({
  status: OrderStatusSchema.optional(),
  page: z.number().int().min(0).optional().default(0),
  size: z.number().int().min(1).max(100).optional().default(20),
});

export const PendingOrdersQueryParamsSchema = z.object({
  page: z.number().int().min(0).optional().default(0),
  size: z.number().int().min(1).max(100).optional().default(20),
  sort: z.string().optional().default('createdAt,desc'),
});

export const AccessCodeQueryParamsSchema = z.object({
  page: z.number().int().min(0).optional().default(0),
  size: z.number().int().min(1).max(100).optional().default(20),
});

// ============================================
// Type Exports
// ============================================

export type PartnerStatus = z.infer<typeof PartnerStatusSchema>;
export type AccessCodeAction = z.infer<typeof AccessCodeActionSchema>;
export type AccessCodeStatus = z.infer<typeof AccessCodeStatusSchema>;
export type OrderType = z.infer<typeof OrderTypeSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type BoxStatus = z.infer<typeof BoxStatusSchema>;
export type LockerStatus = z.infer<typeof LockerStatusSchema>;
export type StoreStatus = z.infer<typeof StoreStatusSchema>;

export type PartnerResponse = z.infer<typeof PartnerResponseSchema>;
export type PartnerRegistrationRequest = z.infer<typeof PartnerRegistrationRequestSchema>;
export type PartnerUpdateRequest = z.infer<typeof PartnerUpdateRequestSchema>;
export type PartnerDashboardResponse = z.infer<typeof PartnerDashboardResponseSchema>;
export type PartnerOrderStatisticsResponse = z.infer<typeof PartnerOrderStatisticsResponseSchema>;
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
export type OrderDetailResponse = z.infer<typeof OrderDetailResponseSchema>;
export type UpdateOrderWeightRequest = z.infer<typeof UpdateOrderWeightRequestSchema>;
export type StaffAccessCodeResponse = z.infer<typeof StaffAccessCodeResponseSchema>;
export type GenerateAccessCodeRequest = z.infer<typeof GenerateAccessCodeRequestSchema>;
export type StoreResponse = z.infer<typeof StoreResponseSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type BoxResponse = z.infer<typeof BoxResponseSchema>;
export type LockerResponse = z.infer<typeof LockerResponseSchema>;
export type PartnerRevenueResponse = z.infer<typeof PartnerRevenueResponseSchema>;
export type RevenueQueryParams = z.infer<typeof RevenueQueryParamsSchema>;
export type OrderQueryParams = z.infer<typeof OrderQueryParamsSchema>;
export type PendingOrdersQueryParams = z.infer<typeof PendingOrdersQueryParamsSchema>;
export type AccessCodeQueryParams = z.infer<typeof AccessCodeQueryParamsSchema>;
