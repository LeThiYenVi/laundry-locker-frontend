import { useState } from "react";
import { toast } from "sonner";
import { useGetDashboardOverviewQuery } from "~/stores/apis/admin/dashboard";
import {
  monthlyChartData,
  dashboardRecommendations,
} from "~/constants/dashboard.constants";
import type { DashboardOverviewResponse } from "~/types/admin/dashboard";

// The backend overview endpoint (order-service) only owns a subset of these
// metrics; cross-service fields (users/stores/lockers/boxes/services) may be
// absent. Normalize to a complete object so the dashboard never crashes on a
// missing field (e.g. `overview.ordersToday.toString()`).
function normalizeOverview(
  raw?: Partial<DashboardOverviewResponse>,
): DashboardOverviewResponse {
  return {
    totalUsers: raw?.totalUsers ?? 0,
    totalStores: raw?.totalStores ?? 0,
    totalLockers: raw?.totalLockers ?? 0,
    totalOrders: raw?.totalOrders ?? 0,
    ordersToday: raw?.ordersToday ?? 0,
    pendingOrders: raw?.pendingOrders ?? 0,
    totalRevenue: raw?.totalRevenue ?? 0,
    revenueToday: raw?.revenueToday ?? 0,
    activeServices: raw?.activeServices ?? 0,
    availableBoxes: raw?.availableBoxes ?? 0,
    occupiedBoxes: raw?.occupiedBoxes ?? 0,
  };
}

export function useDashboard() {
  const [selectedYear, setSelectedYear] = useState("2025");

  const { data, isLoading } = useGetDashboardOverviewQuery();

  const overview = normalizeOverview(data?.data);

  const handleRecommendationClick = (id: string) => {
    toast.info(`Mở ${id}`, {
      description: `Đang chuyển đến ${id}...`,
    });
  };

  return {
    overview,
    chartData: monthlyChartData,
    recommendations: dashboardRecommendations,
    selectedYear,
    setSelectedYear,
    isLoading,
    handleRecommendationClick,
  };
}
