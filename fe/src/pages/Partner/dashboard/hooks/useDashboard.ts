import { useGetPartnerDashboardQuery, useGetPendingOrdersQuery, POLLING_INTERVAL } from "@/stores/apis/partnerApi";

export interface DashboardStats {
  todayOrders: number;
  processingOrders: number;
  monthlyRevenue: number;
  activeLockers: number;
  pendingCollections: number;
  overdueOrders: number;
  avgProcessingTime: string;
  completionRate: string | number;
  partnerRevenue: number;
  platformFee: number;
}

export function useDashboard() {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useGetPartnerDashboardQuery(undefined, {
    pollingInterval: POLLING_INTERVAL,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const { data: pendingOrdersData } = useGetPendingOrdersQuery(
    { page: 0, size: 5 },
    {
      pollingInterval: POLLING_INTERVAL,
      refetchOnFocus: true,
    }
  );

  const pendingOrders = pendingOrdersData?.content || [];

  const stats: DashboardStats = {
    todayOrders: dashboardData?.totalOrders || 0,
    processingOrders:
      (dashboardData?.totalOrders || 0) -
      (dashboardData?.completedOrders || 0) -
      (dashboardData?.canceledOrders || 0),
    monthlyRevenue: dashboardData?.monthRevenue || 0,
    activeLockers: dashboardData?.totalStores || 0,
    pendingCollections: dashboardData?.pendingOrders || 0,
    overdueOrders: 0,
    avgProcessingTime: "24h",
    completionRate:
      dashboardData && dashboardData.totalOrders > 0
        ? ((dashboardData.completedOrders / dashboardData.totalOrders) * 100).toFixed(1)
        : 0,
    partnerRevenue: dashboardData?.partnerRevenue || 0,
    platformFee: dashboardData?.platformFee || 0,
  };

  return {
    stats,
    pendingOrders,
    isLoading,
    error,
    refetch,
    hasData: !!dashboardData,
  };
}
