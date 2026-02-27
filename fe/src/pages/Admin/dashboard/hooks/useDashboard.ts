import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  mockDashboardOverview,
  chartData,
  recommendations,
} from "~/mockdata/dashboard.mock";
import { isMockEnabled, mockDelay } from "~/hooks/useMockData";

export function useDashboard() {
  const [activeTab, setActiveTab] = useState("Tổng quan");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [isLoading, setIsLoading] = useState(isMockEnabled);

  if (isMockEnabled && isLoading) {
    setTimeout(() => setIsLoading(false), mockDelay);
  }

  const tabs = useMemo(
    () => [
      "Tổng quan",
      "Đội nhóm",
      "Ngườii dùng",
      "Đăng ký",
      "Thanh toán",
      "Ứng dụng",
      "Biến số",
    ],
    []
  );

  const handleCreateScenario = () => {
    toast.info("Tính năng đang phát triển", {
      description: "Chức năng tạo kịch bản sẽ sớm ra mắt!",
    });
  };

  const handleSettings = () => {
    toast.info("Cài đặt dashboard", {
      description: "Mở modal cài đặt...",
    });
  };

  const handleViewDetails = () => {
    toast.info("Xem chi tiết", {
      description: "Chuyển đến trang chi tiết hệ thống",
    });
  };

  const handleRecommendationClick = (id: string) => {
    toast.info(`Mở ${id}`, {
      description: `Đang chuyển đến ${id}...`,
    });
  };

  return {
    overview: mockDashboardOverview,
    chartData,
    recommendations,
    tabs,
    activeTab,
    setActiveTab,
    selectedYear,
    setSelectedYear,
    isLoading,
    handleCreateScenario,
    handleSettings,
    handleViewDetails,
    handleRecommendationClick,
    isMock: isMockEnabled,
  };
}
