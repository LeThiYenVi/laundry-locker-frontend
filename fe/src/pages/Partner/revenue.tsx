import * as React from "react";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  PageLoading,
  ErrorState,
  Badge,
} from "~/components/ui";
import { 
  useGetPartnerRevenueQuery,
  useGetPartnerOrderStatisticsQuery 
} from "@/stores/apis/partner";
import { t } from "@/lib/i18n";

export default function PartnerRevenuePage(): React.JSX.Element {
  // Calculate date range for current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [fromDate, setFromDate] = React.useState(firstDayOfMonth.toISOString());
  const [toDate, setToDate] = React.useState(today.toISOString());

  const { 
    data: revenueData, 
    isLoading: isLoadingRevenue, 
    error: revenueError,
    refetch: refetchRevenue 
  } = useGetPartnerRevenueQuery({ fromDate, toDate });

  const { 
    data: statsData,
    isLoading: isLoadingStats 
  } = useGetPartnerOrderStatisticsQuery();

  const isLoading = isLoadingRevenue || isLoadingStats;
  const error = revenueError;

  const revenue = revenueData?.data;
  const stats = statsData?.data;

  if (isLoading) {
    return <PageLoading message="Đang tải dữ liệu doanh thu..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải dữ liệu doanh thu"
        error={error}
        onRetry={refetchRevenue}
        onClose={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{t("partner.revenue.title")}</h1>
        <p className="text-gray-600 mt-1">
          Track revenue and platform fees
        </p>
      </div>

      {/* Revenue Summary Cards */}
      {revenue && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("partner.revenue.totalRevenue")}</p>
                  <p className="text-2xl font-bold mt-1">
                    {(revenue.grossRevenue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("partner.revenue.netRevenue")}</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">
                    {(revenue.partnerRevenue / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {revenue.revenueSharePercent}% {t("partner.revenue.revenueShare")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("partner.revenue.platformFee")}</p>
                  <p className="text-2xl font-bold mt-1 text-red-600">
                    {(revenue.platformFee / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="text-red-600" size={24} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {100 - revenue.revenueSharePercent}% service fee
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("partner.revenue.growth")}</p>
                  <p className={`text-2xl font-bold mt-1 ${
                    revenue.revenueGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {revenue.revenueGrowthPercent >= 0 ? '+' : ''}
                    {revenue.revenueGrowthPercent.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="text-purple-600" size={24} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                vs previous period
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Order Stats */}
      {revenue && (
        <Card>
          <CardHeader>
            <CardTitle>{t("partner.orders.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold">{revenue.totalOrders}</p>
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {revenue.completedOrders}
                </p>
                <p className="text-sm text-gray-600">Hoàn thành</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">
                  {revenue.canceledOrders}
                </p>
                <p className="text-sm text-gray-600">Đã hủy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Period Info */}
      {revenue && (
        <Card>
          <CardHeader>
            <CardTitle>{t("partner.revenue.periodInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("partner.revenue.from")}:</span>
                <span className="font-medium">
                  {new Date(revenue.fromDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("partner.revenue.to")}:</span>
                <span className="font-medium">
                  {new Date(revenue.toDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Partner:</span>
                <span className="font-medium">{revenue.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("partner.revenue.revenueShare")}:</span>
                <Badge variant="outline">{revenue.revenueSharePercent}%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Today:</span>
                <span className="font-medium">
                  {(stats.todayRevenue / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This week:</span>
                <span className="font-medium">
                  {(stats.weekRevenue / 1000000).toFixed(1)}M
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This month:</span>
                <span className="font-medium">
                  {(stats.monthRevenue / 1000000).toFixed(1)}M
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders by time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Hôm nay:</span>
                <Badge variant="outline">{stats.todayOrders}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tuần này:</span>
                <Badge variant="outline">{stats.weekOrders}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tháng này:</span>
                <Badge variant="outline">{stats.monthOrders}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
