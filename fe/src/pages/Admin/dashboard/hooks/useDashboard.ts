import { useState } from "react";
import { toast } from "sonner";
import { useGetDashboardOverviewQuery } from "~/stores/apis/admin/dashboard";
import {
  monthlyChartData,
  dashboardRecommendations,
} from "~/constants/dashboard.constants";

export function useDashboard() {
  const [selectedYear, setSelectedYear] = useState("2025");

  const { data, isLoading } = useGetDashboardOverviewQuery();

  const overview = data?.data;

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
