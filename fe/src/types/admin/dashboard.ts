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
