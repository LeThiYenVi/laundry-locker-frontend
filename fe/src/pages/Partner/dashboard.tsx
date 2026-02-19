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

  if (error || !dashboardData) {
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
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Partner Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Quản lý đơn hàng và dịch vụ giặt ủi
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
                <Clock className="text-red-600" size={24} />
                <div>
                  <p className="font-semibold text-gray-900">
                    {displayData.overdueOrders} đơn quá hạn
                  </p>
                  <p className="text-sm text-gray-600">Cần xử lý gấp</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Today Orders */}
        <Card className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-6 border border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white rounded-xl">
              <Package className="text-blue-600" size={24} />
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
        <Card className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-3xl p-6 border border-orange-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white rounded-xl">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
            <Badge className="bg-orange-600 text-white">Đang xử lý</Badge>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Đang giặt</h3>
          <p className="text-3xl font-bold text-orange-600">
            {displayData.processingOrders}
          </p>
        </Card>

        {/* Monthly Revenue */}
        <Card className="bg-gradient-to-br from-green-100 to-green-50 rounded-3xl p-6 border border-green-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white rounded-xl">
              <DollarSign className="text-green-600" size={24} />
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

        {/* Active Lockers */}
        <Card className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl p-6 border border-purple-200">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white rounded-xl">
              <Boxes className="text-purple-600" size={24} />
            </div>
            <Badge className="bg-purple-600 text-white">Hoạt động</Badge>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Cửa hàng</h3>
          <p className="text-3xl font-bold text-purple-600">
            {displayData.activeLockers}
          </p>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Thời gian xử lý trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {displayData.avgProcessingTime}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Từ lúc lấy đồ đến trả khách
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tỷ lệ hoàn thành</CardTitle>
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

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu 7 ngày qua</CardTitle>
            <CardDescription>Biểu đồ doanh thu theo ngày</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">Chart sẽ được thêm sau</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
            <CardDescription>Phân bố theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">Chart sẽ được thêm sau</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
