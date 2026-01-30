import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  PageLoading,
  ErrorState,
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
import type { RevenueStats, PaymentHistory, RevenueByPeriod } from "@/types";
import { PaymentMethod, PaymentStatus } from "@/types/partner.enum";

export default function PartnerRevenuePage(): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState<RevenueStats | null>(null);
  const [paymentHistory, setPaymentHistory] = React.useState<PaymentHistory[]>(
    [],
  );
  const [revenueData, setRevenueData] = React.useState<RevenueByPeriod[]>([]);
  const [filterPeriod, setFilterPeriod] = React.useState<string>("30");
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL");

  // TODO: Replace with actual API call
  React.useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock stats
        const mockStats: RevenueStats = {
          totalRevenue: 125000000,
          platformFee: 25000000,
          netRevenue: 100000000,
          paidAmount: 80000000,
          pendingAmount: 20000000,
          totalOrders: 450,
          completedOrders: 380,
        };

        // Mock payment history
        const mockPayments: PaymentHistory[] = [
          {
            id: 1,
            amount: 15000000,
            platformFee: 3000000,
            netAmount: 12000000,
            paymentDate: "2024-03-25T10:00:00Z",
            paymentMethod: "BANK_TRANSFER" as PaymentMethod,
            status: "PAID" as PaymentStatus,
            transactionId: "TXN20240325001",
            periodStart: "2024-03-01",
            periodEnd: "2024-03-15",
          },
          {
            id: 2,
            amount: 18500000,
            platformFee: 3700000,
            netAmount: 14800000,
            paymentDate: "2024-03-10T10:00:00Z",
            paymentMethod: "BANK_TRANSFER" as PaymentMethod,
            status: "PAID" as PaymentStatus,
            transactionId: "TXN20240310001",
            periodStart: "2024-02-16",
            periodEnd: "2024-02-29",
          },
          {
            id: 3,
            amount: 22000000,
            platformFee: 4400000,
            netAmount: 17600000,
            paymentDate: "",
            paymentMethod: "BANK_TRANSFER" as PaymentMethod,
            status: "PENDING" as PaymentStatus,
            transactionId: "TXN20240401001",
            periodStart: "2024-03-16",
            periodEnd: "2024-03-31",
          },
          {
            id: 4,
            amount: 12500000,
            platformFee: 2500000,
            netAmount: 10000000,
            paymentDate: "2024-02-25T10:00:00Z",
            paymentMethod: "BANK_TRANSFER" as PaymentMethod,
            status: "PAID" as PaymentStatus,
            transactionId: "TXN20240225001",
            periodStart: "2024-02-01",
            periodEnd: "2024-02-15",
          },
          {
            id: 5,
            amount: 8000000,
            platformFee: 1600000,
            netAmount: 6400000,
            paymentDate: "",
            paymentMethod: "BANK_TRANSFER" as PaymentMethod,
            status: "PROCESSING" as PaymentStatus,
            transactionId: "TXN20240405001",
            periodStart: "2024-04-01",
            periodEnd: "2024-04-15",
          },
        ];

        // Mock revenue by period
        const mockRevenueData: RevenueByPeriod[] = [
          {
            date: "2024-03-25",
            revenue: 15000000,
            orders: 60,
            avgOrderValue: 250000,
          },
          {
            date: "2024-03-20",
            revenue: 12000000,
            orders: 50,
            avgOrderValue: 240000,
          },
          {
            date: "2024-03-15",
            revenue: 18500000,
            orders: 70,
            avgOrderValue: 264285,
          },
          {
            date: "2024-03-10",
            revenue: 14000000,
            orders: 55,
            avgOrderValue: 254545,
          },
          {
            date: "2024-03-05",
            revenue: 16000000,
            orders: 65,
            avgOrderValue: 246153,
          },
          {
            date: "2024-02-28",
            revenue: 13500000,
            orders: 52,
            avgOrderValue: 259615,
          },
          {
            date: "2024-02-25",
            revenue: 11000000,
            orders: 45,
            avgOrderValue: 244444,
          },
        ];

        setStats(mockStats);
        setPaymentHistory(mockPayments);
        setRevenueData(mockRevenueData);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu doanh thu:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  const filteredPayments = React.useMemo(() => {
    let result = [...paymentHistory];

    if (filterStatus !== "ALL") {
      result = result.filter((p) => p.status === filterStatus);
    }

    // Filter by period (days)
    if (filterPeriod !== "ALL") {
      const days = parseInt(filterPeriod);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      result = result.filter((p) => {
        const paymentDate = p.paymentDate
          ? new Date(p.paymentDate)
          : new Date();
        return paymentDate >= cutoffDate;
      });
    }

    return result;
  }, [paymentHistory, filterStatus, filterPeriod]);

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "FAILED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return "Đã thanh toán";
      case "PENDING":
        return "Chờ thanh toán";
      case "PROCESSING":
        return "Đang xử lý";
      case "FAILED":
        return "Thất bại";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isLoading) {
    return <PageLoading message="Đang tải dữ liệu doanh thu..." />;
  }

  if (!stats) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải dữ liệu"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCFF] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#326B9C]">Doanh thu</h1>
            <p className="text-[#7BAAD1] mt-1">
              Theo dõi doanh thu và lịch sử thanh toán
            </p>
          </div>

          <Button className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white font-semibold">
            Xuất báo cáo
          </Button>
        </div>

        {/* Revenue Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng doanh thu</div>
              <div className="text-2xl font-bold text-[#326B9C]">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-xs text-[#7BAAD1] mt-2">
                {stats.totalOrders} đơn hàng
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">
                Phí nền tảng (20%)
              </div>
              <div className="text-2xl font-bold text-red-600">
                -{formatCurrency(stats.platformFee)}
              </div>
              <div className="text-xs text-[#7BAAD1] mt-2">
                Trên {stats.completedOrders} đơn
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Doanh thu ròng</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.netRevenue)}
              </div>
              <div className="text-xs text-[#7BAAD1] mt-2">Sau khi trừ phí</div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Chờ thanh toán</div>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.pendingAmount)}
              </div>
              <div className="text-xs text-[#7BAAD1] mt-2">
                Đã nhận: {formatCurrency(stats.paidAmount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart Placeholder */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-[#326B9C] mb-6">
              Biểu đồ doanh thu theo ngày
            </h3>
            <div className="h-64 bg-gradient-to-br from-[#B0C8DA]/20 to-[#E8E9EB]/40 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-[#7BAAD1] mb-2">📊</div>
                <p className="text-sm text-[#7BAAD1]">
                  Biểu đồ sẽ được tích hợp sau
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Khoảng thời gian
                </Label>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="border-[#B0C8DA] bg-white">
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E8E9EB]">
                    <SelectItem
                      value="7"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      7 ngày qua
                    </SelectItem>
                    <SelectItem
                      value="30"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      30 ngày qua
                    </SelectItem>
                    <SelectItem
                      value="90"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      90 ngày qua
                    </SelectItem>
                    <SelectItem
                      value="ALL"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Tất cả
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">Trạng thái</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-[#B0C8DA] bg-white">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E8E9EB]">
                    <SelectItem
                      value="ALL"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Tất cả
                    </SelectItem>
                    <SelectItem
                      value="PAID"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Đã thanh toán
                    </SelectItem>
                    <SelectItem
                      value="PENDING"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Chờ thanh toán
                    </SelectItem>
                    <SelectItem
                      value="PROCESSING"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Đang xử lý
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full border-[#B0C8DA] text-[#326B9C] hover:bg-[#FAFCFF]"
                  onClick={() => {
                    setFilterPeriod("30");
                    setFilterStatus("ALL");
                  }}
                >
                  Đặt lại bộ lọc
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History Table */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-0">
            <div className="p-6 border-b border-[#E8E9EB]">
              <h3 className="text-lg font-bold text-[#326B9C]">
                Lịch sử thanh toán
              </h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="bg-[#FAFCFF] border-b border-[#E8E9EB]">
                  <TableHead className="text-[#326B9C] font-semibold">
                    Mã giao dịch
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Kỳ thanh toán
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Tổng doanh thu
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Phí nền tảng
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Thực nhận
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Ngày thanh toán
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-[#7BAAD1]"
                    >
                      Không tìm thấy giao dịch nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="border-b border-[#E8E9EB] hover:bg-[#FAFCFF]"
                    >
                      <TableCell>
                        <div className="font-mono text-sm text-[#326B9C] font-semibold">
                          {payment.transactionId}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm text-[#326B9C]">
                          {new Date(payment.periodStart).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>
                        <div className="text-xs text-[#7BAAD1]">
                          đến{" "}
                          {new Date(payment.periodEnd).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="font-semibold text-[#326B9C]">
                          {formatCurrency(payment.amount)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-red-600 font-semibold">
                          -{formatCurrency(payment.platformFee)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-green-600 font-semibold">
                          {formatCurrency(payment.netAmount)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-[#7BAAD1]">
                          {payment.paymentDate
                            ? new Date(payment.paymentDate).toLocaleDateString(
                                "vi-VN",
                              )
                            : "-"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadge(payment.status)}
                        >
                          {getStatusLabel(payment.status)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#B0C8DA] text-[#326B9C] hover:bg-[#FAFCFF]"
                          onClick={() =>
                            alert(`Xem chi tiết: ${payment.transactionId}`)
                          }
                        >
                          Chi tiết
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Revenue Data */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-[#326B9C] mb-6">
              Doanh thu theo ngày (7 ngày gần nhất)
            </h3>

            <div className="space-y-4">
              {revenueData.slice(0, 7).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-[#FAFCFF] rounded-lg border border-[#E8E9EB]"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-[#326B9C]">
                      {new Date(item.date).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-sm text-[#7BAAD1] mt-1">
                      {item.orders} đơn hàng • Trung bình:{" "}
                      {formatCurrency(item.avgOrderValue)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
