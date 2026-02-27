import { Skeleton } from "~/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useDashboard } from "./hooks/useDashboard";
import {
  DashboardHeader,
  OverviewCard,
  OverviewSection,
  MainChart,
  RecommendationsSection,
  SchedulerCard,
} from "./components";

export default function Dashboard() {
  const { t } = useTranslation();
  const {
    overview,
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
    handleRecommendationClick,
    isMock,
  } = useDashboard();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-12 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
        <Skeleton className="h-[300px] mb-8" />
        <Skeleton className="h-[200px]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      {isMock && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            🧪 {t("common.mockData")}
          </p>
        </div>
      )}

      <DashboardHeader
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSettings={handleSettings}
        onCreateScenario={handleCreateScenario}
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <OverviewCard label={t("admin.dashboard.monthlyOrders")} value="893" />
        <OverviewCard label={t("admin.dashboard.monthlyRevenue")} value="1.2B" />
        <OverviewCard label={t("admin.dashboard.newUsers")} value="156" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MainChart
            data={chartData}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
        <div className="lg:col-span-1">
          <OverviewSection overview={overview} />
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <RecommendationsSection
          recommendations={recommendations}
          onRecommendationClick={handleRecommendationClick}
        />
      </div>

      {/* Scheduler Management */}
      <SchedulerCard />
    </div>
  );
}
