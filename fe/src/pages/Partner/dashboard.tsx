import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  Package,
  Boxes,
  AlertCircle,
  Clock,
  ArrowRight,
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
  useGetPendingOrdersQuery,
} from "@/stores/apis/partnerApi";

export default function PartnerDashboard(): React.JSX.Element {
  const navigate = useNavigate();

  // RTK Query hooks
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useGetPartnerDashboardQuery();

  const { data: pendingOrders = [] } = useGetPendingOrdersQuery();

  if (isLoading) {
    return <PageLoading message="Đang tải dashboard..." />;
  }

  if (error || !dashboard) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải dữ liệu dashboard"
        error={error}
        onRetry={refetch}
      />
    );
  }

  // Map API response to display data
  const displayData = {
    todayOrders: dashboardData.totalOrders || 0,
    processingOrders:
      dashboardData.totalOrders -
        dashboardData.completedOrders -
        dashboardData.canceledOrders || 0,
    monthlyRevenue: dashboardData.monthRevenue || 0,
    activeLockers: dashboardData.totalStores || 0,
    pendingCollections: dashboardData.pendingOrders || 0,
    overdueOrders: 0, // Not in API response yet
    avgProcessingTime: "24h", // Static for now
    completionRate:
      dashboardData.totalOrders > 0
        ? (
            (dashboardData.completedOrders / dashboardData.totalOrders) *
            100
          ).toFixed(1)
        : 0,
    partnerRevenue: dashboardData.partnerRevenue || 0,
    platformFee: dashboardData.platformFee || 0,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{t("partner.dashboard.title")}</h1>
        <p className="text-gray-600 mt-1">
          {dashboard.businessName}
        </p>
      </div>

      {/* Alert Section - Pending Orders */}
      {(displayData.pendingCollections > 0 || pendingOrders.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {displayData.pendingCollections > 0 && (
            <Card
              className="border-l-4 border-l-yellow-500 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/partner/orders?status=WAITING")}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-yellow-600" size={24} />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {displayData.pendingCollections} đơn chờ chấp nhận
                    </p>
                    <p className="text-sm text-gray-600">
                      Cần tạo mã cho Staff lấy đồ
                    </p>
                  </div>
                </div>
                <ArrowRight className="text-gray-400" size={20} />
              </CardContent>
            </Card>
          )}

          {displayData.overdueOrders > 0 && (
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="flex items-center gap-3 p-4">
                <Clock className="text-blue-600" size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {displayData.overdueOrders} đơn quá hạn
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
            <Badge className="bg-blue-600 text-white">Tổng đơn</Badge>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Tổng đơn hàng
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            {displayData.todayOrders}
          </p>
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
            <Badge className="bg-orange-600 text-white">Đang xử lý</Badge>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Đang giặt</h3>
          <p className="text-3xl font-bold text-orange-600">
            {displayData.processingOrders}
          </p>
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
            <Badge className="bg-green-600 text-white">Tháng này</Badge>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Doanh thu</h3>
          <p className="text-3xl font-bold text-green-600">
            {(displayData.monthlyRevenue / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Thu về: {(displayData.partnerRevenue / 1000000).toFixed(1)}M
          </p>
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
            <Badge className="bg-purple-600 text-white">Hoạt động</Badge>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Cửa hàng</h3>
          <p className="text-3xl font-bold text-purple-600">
            {displayData.activeLockers}
          </p>
        </Card>
      </div>

      {/* Revenue Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tổng doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {displayData.avgProcessingTime}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {displayData.completionRate}%
            </div>
            <p className="text-sm text-gray-600 mt-2">Đúng hạn cam kết</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hành động nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              size="sm"
              className="w-full"
              variant="outline"
              onClick={() => navigate("/partner/orders?status=WAITING")}
            >
              Xem đơn chờ chấp nhận ({displayData.pendingCollections})
            </Button>
            <Button
              size="sm"
              className="w-full"
              variant="outline"
              onClick={() => navigate("/partner/orders?status=READY")}
            >
              Đơn sẵn sàng trả
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

