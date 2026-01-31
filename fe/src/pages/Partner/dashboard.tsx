import * as React from "react";
import {
  TrendingUp,
  DollarSign,
  Package,
  Boxes,
  AlertCircle,
  Clock,
  Store,
  Users,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  PageLoading,
  ErrorState,
} from "~/components/ui";
import { 
  useGetPartnerDashboardQuery,
  useGetPartnerOrderStatisticsQuery,
  useGetPendingOrdersQuery,
} from "@/stores/apis/partner";
import { t } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { withLocale } from "@/lib/i18n";

export default function PartnerDashboard(): React.JSX.Element {
  const navigate = useNavigate();
  
  const { 
    data: dashboardData, 
    isLoading: isLoadingDashboard, 
    error: dashboardError,
    refetch: refetchDashboard 
  } = useGetPartnerDashboardQuery();

  const { 
    data: statsData,
    isLoading: isLoadingStats 
  } = useGetPartnerOrderStatisticsQuery();

  const {
    data: pendingOrdersData,
    isLoading: isLoadingPending
  } = useGetPendingOrdersQuery({ page: 0, size: 10 });

  const isLoading = isLoadingDashboard || isLoadingStats || isLoadingPending;
  const error = dashboardError;

  const dashboard = dashboardData?.data;
  const stats = statsData?.data;
  const pendingOrders = pendingOrdersData?.data?.content || [];

  const handleNavigateToOrders = (status?: string) => {
    if (status) {
      navigate(withLocale(`/partner/orders?status=${status}`));
    } else {
      navigate(withLocale("/partner/orders"));
    }
  };

  if (isLoading) {
    return <PageLoading message="Đang tải dashboard..." />;
  }

  if (error || !dashboard) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải dữ liệu dashboard"
        error={error}
        onRetry={refetchDashboard}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{t("partner.dashboard.title")}</h1>
        <p className="text-gray-600 mt-1">
          {dashboard.businessName}
        </p>
      </div>

      {/* Alert Section */}
      {(dashboard.pendingOrders > 0 || stats?.waitingOrders > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(stats?.waitingOrders || 0) > 0 && (
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertCircle className="text-yellow-600" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {stats?.waitingOrders} đơn chờ lấy đồ
                  </p>
                  <p className="text-sm text-gray-600">
                    Cần xử lý ngay hôm nay
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleNavigateToOrders("WAITING")}
                >
                  {t("partner.common.view")}
                </Button>
              </CardContent>
            </Card>
          )}

          {dashboard.pendingOrders > 0 && (
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="flex items-center gap-3 p-4">
                <Clock className="text-blue-600" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {dashboard.pendingOrders} đơn đang xử lý
                  </p>
                  <p className="text-sm text-gray-600">Đang trong quy trình</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleNavigateToOrders("PROCESSING")}
                >
                  {t("partner.common.view")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-3xl font-bold mt-1">{dashboard.totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-3xl font-bold mt-1">{dashboard.pendingOrders}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doanh thu tháng</p>
                <p className="text-2xl font-bold mt-1">
                  {(dashboard.monthRevenue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doanh thu hôm nay</p>
                <p className="text-2xl font-bold mt-1">
                  {(dashboard.todayRevenue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stores */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cửa hàng</p>
                <p className="text-2xl font-bold mt-1">{dashboard.totalStores}</p>
                <p className="text-xs text-green-600">
                  {dashboard.activeStores} đang hoạt động
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Store className="text-indigo-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nhân viên</p>
                <p className="text-2xl font-bold mt-1">{dashboard.totalStaff}</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <Users className="text-pink-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold mt-1">{dashboard.completedOrders}</p>
              </div>
              <div className="p-3 bg-teal-100 rounded-lg">
                <Package className="text-teal-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancelled Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã hủy</p>
                <p className="text-2xl font-bold mt-1">{dashboard.canceledOrders}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Package className="text-red-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tổng doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {(dashboard.totalRevenue / 1000000).toFixed(1)}M đ
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Doanh thu đối tác:</span>
                <span className="font-medium">
                  {(dashboard.partnerRevenue / 1000000).toFixed(1)}M đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí nền tảng:</span>
                <span className="font-medium">
                  {(dashboard.platformFee / 1000000).toFixed(1)}M đ
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đơn hôm nay</span>
                  <Badge variant="outline">{stats.todayOrders}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đơn tuần này</span>
                  <Badge variant="outline">{stats.weekOrders}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đơn tháng này</span>
                  <Badge variant="outline">{stats.monthOrders}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Giá trị TB/đơn</span>
                  <Badge variant="outline">
                    {(stats.averageOrderValue / 1000).toFixed(0)}k
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hành động nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              size="sm" 
              className="w-full justify-between"
              variant="outline"
              onClick={() => handleNavigateToOrders("WAITING")}
            >
              <span>Đơn chờ lấy</span>
              <Badge>{stats?.waitingOrders || 0}</Badge>
            </Button>
            <Button 
              size="sm" 
              className="w-full justify-between"
              variant="outline"
              onClick={() => handleNavigateToOrders("PROCESSING")}
            >
              <span>Đang giặt</span>
              <Badge>{stats?.processingOrders || 0}</Badge>
            </Button>
            <Button 
              size="sm" 
              className="w-full justify-between"
              variant="outline"
              onClick={() => handleNavigateToOrders("READY")}
            >
              <span>Sẵn sàng trả</span>
              <Badge>{stats?.readyOrders || 0}</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders Preview */}
      {pendingOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng chờ xử lý gần đây</CardTitle>
            <CardDescription>
              {pendingOrders.length} đơn hàng đang chờ lấy đồ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingOrders.slice(0, 5).map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">#{order.id} - {order.senderName}</p>
                    <p className="text-sm text-gray-600">
                      {order.lockerName} - Box {order.sendBoxNumber}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleNavigateToOrders()}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

