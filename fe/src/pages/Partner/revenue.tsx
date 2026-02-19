import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  PageLoading,
  ErrorState,
  EmptyData,
  Badge,
} from "~/components/ui";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  RefreshCw,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useGetPartnerRevenueQuery } from "@/stores/apis/partnerApi";

// ============================================
// Error Handling
// ============================================

const ERROR_MESSAGES: Record<string, string> = {
  E_PARTNER001: "Không tìm thấy thông tin partner.",
  E_AUTH001: "Bạn không có quyền truy cập.",
};

const getErrorMessage = (err: unknown): string => {
  const apiError = err as {
    status?: number;
    data?: { code?: string; message?: string };
  };

  if (apiError?.status === 401 || apiError?.status === 403) {
    localStorage.removeItem("accessToken");
    window.location.href =
      "/login?redirect=" + encodeURIComponent(window.location.pathname);
    return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
  }

  const errorCode = apiError?.data?.code;
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }

  return apiError?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
};

// ============================================
// Helpers
// ============================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ============================================
// Main Component
// ============================================

export default function PartnerRevenuePage(): React.JSX.Element {
  const [filterPeriod, setFilterPeriod] = React.useState<string>("30");
  const [errorToast, setErrorToast] = React.useState<string | null>(null);

  // Calculate date range based on filter
  const dateRange = React.useMemo(() => {
    const toDate = new Date().toISOString();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - parseInt(filterPeriod));
    return {
      fromDate: fromDate.toISOString(),
      toDate,
    };
  }, [filterPeriod]);

  // RTK Query - fetch revenue data from API
  const {
    data: revenueData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPartnerRevenueQuery(dateRange, {
    refetchOnFocus: true,
  });

  // Auto-hide error toast
  React.useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  // Loading state
  if (isLoading) {
    return <PageLoading message="Đang tải thông tin doanh thu..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải thông tin doanh thu"
        error={error}
        onRetry={refetch}
      />
    );
  }

  // Empty state
  if (!revenueData) {
    return (
      <div className="min-h-screen bg-[#FAFCFF] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#326B9C]">
              Báo cáo Doanh thu
            </h1>
            <p className="text-[#7BAAD1] mt-1">
              Theo dõi doanh thu và thanh toán của Partner
            </p>
          </div>
          <EmptyData
            title="Chưa có dữ liệu doanh thu"
            message="Dữ liệu doanh thu sẽ hiển thị sau khi có đơn hàng hoàn thành."
            icon={<DollarSign className="h-16 w-16 text-muted-foreground" />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCFF] p-8">
      {/* Error Toast */}
      {errorToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>{errorToast}</span>
            <button
              onClick={() => setErrorToast(null)}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Fetching Indicator */}
      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-sm flex items-center gap-2 shadow">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Đang cập nhật...
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#326B9C]">
              Báo cáo Doanh thu
            </h1>
            <p className="text-[#7BAAD1] mt-1">
              {revenueData.businessName} - Kỳ:{" "}
              {formatDate(revenueData.fromDate)} -{" "}
              {formatDate(revenueData.toDate)}
            </p>
          </div>

          <div className="flex gap-3">
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-40 border-[#B0C8DA] bg-white">
                <SelectValue placeholder="Chọn kỳ" />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E8E9EB]">
                <SelectItem value="7">7 ngày</SelectItem>
                <SelectItem value="30">30 ngày</SelectItem>
                <SelectItem value="90">90 ngày</SelectItem>
                <SelectItem value="365">1 năm</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border-[#B0C8DA]"
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${isFetching ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <div className="text-sm text-[#7BAAD1]">Tổng doanh thu</div>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(revenueData.grossRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
                <div className="text-sm text-[#7BAAD1]">
                  Doanh thu Partner ({revenueData.revenueSharePercent}%)
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(revenueData.partnerRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="text-orange-600" size={24} />
                </div>
                <div className="text-sm text-[#7BAAD1]">
                  Phí nền tảng ({100 - revenueData.revenueSharePercent}%)
                </div>
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {formatCurrency(revenueData.platformFee)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="text-purple-600" size={24} />
                </div>
                <div className="text-sm text-[#7BAAD1]">Tổng đơn hàng</div>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {revenueData.totalOrders}
              </div>
              <div className="text-sm text-[#7BAAD1] mt-1">
                Hoàn thành: {revenueData.completedOrders} | Hủy:{" "}
                {revenueData.canceledOrders}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Table */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-[#326B9C] mb-4">
              Chi tiết doanh thu
            </h3>

            <Table>
              <TableHeader>
                <TableRow className="bg-[#FAFCFF]">
                  <TableHead className="text-[#7BAAD1]">Mục</TableHead>
                  <TableHead className="text-[#7BAAD1] text-right">
                    Giá trị
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Tổng doanh thu</TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(revenueData.grossRevenue)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    Phí nền tảng ({100 - revenueData.revenueSharePercent}%)
                  </TableCell>
                  <TableCell className="text-right text-orange-600">
                    - {formatCurrency(revenueData.platformFee)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2 border-[#326B9C]">
                  <TableCell className="font-bold text-[#326B9C]">
                    Doanh thu Partner ({revenueData.revenueSharePercent}%)
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#326B9C]">
                    {formatCurrency(revenueData.partnerRevenue)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Statistics */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-[#326B9C] mb-4">
              Thống kê đơn hàng
            </h3>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-[#FAFCFF] rounded-lg border border-[#E8E9EB]">
                <div className="text-3xl font-bold text-[#326B9C]">
                  {revenueData.totalOrders}
                </div>
                <div className="text-sm text-[#7BAAD1] mt-1">Tổng đơn</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600">
                  {revenueData.completedOrders}
                </div>
                <div className="text-sm text-green-600 mt-1">Hoàn thành</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600">
                  {revenueData.canceledOrders}
                </div>
                <div className="text-sm text-red-600 mt-1">Đã hủy</div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-[#7BAAD1] mb-2">
                <span>Tỷ lệ hoàn thành</span>
                <span className="font-semibold text-green-600">
                  {revenueData.totalOrders > 0
                    ? (
                        (revenueData.completedOrders /
                          revenueData.totalOrders) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      revenueData.totalOrders > 0
                        ? (revenueData.completedOrders /
                            revenueData.totalOrders) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p>
            ℹ️ <strong>Lưu ý:</strong> Doanh thu được tính toán dựa trên các đơn
            hàng đã hoàn thành trong kỳ. Phí nền tảng được khấu trừ tự động theo
            tỷ lệ đã thỏa thuận ({100 - revenueData.revenueSharePercent}%).
          </p>
        </div>
      </div>
    </div>
  );
}
