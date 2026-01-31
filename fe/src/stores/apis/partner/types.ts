// ============================================
// Partner API Tags
// ============================================

export const PARTNER_TAGS = {
  PARTNER: 'Partner',
  PARTNER_PROFILE: 'PartnerProfile',
  PARTNER_DASHBOARD: 'PartnerDashboard',
  PARTNER_ORDERS: 'PartnerOrders',
  PARTNER_ACCESS_CODES: 'PartnerAccessCodes',
  PARTNER_STORES: 'PartnerStores',
  PARTNER_STAFF: 'PartnerStaff',
  PARTNER_LOCKERS: 'PartnerLockers',
  PARTNER_REVENUE: 'PartnerRevenue',
  PARTNER_STATISTICS: 'PartnerStatistics',
} as const;

// Re-export all types from schemas for convenience
export type {
  PartnerStatus,
  AccessCodeAction,
  AccessCodeStatus,
  OrderType,
  OrderStatus,
  BoxStatus,
  LockerStatus,
  StoreStatus,
  PartnerResponse,
  PartnerRegistrationRequest,
  PartnerUpdateRequest,
  PartnerDashboardResponse,
  PartnerOrderStatisticsResponse,
  OrderResponse,
  OrderDetailResponse,
  UpdateOrderWeightRequest,
  StaffAccessCodeResponse,
  GenerateAccessCodeRequest,
  StoreResponse,
  UserResponse,
  BoxResponse,
  LockerResponse,
  PartnerRevenueResponse,
  RevenueQueryParams,
  OrderQueryParams,
  PendingOrdersQueryParams,
  AccessCodeQueryParams,
} from '../../../schemas/partner.schemas';
