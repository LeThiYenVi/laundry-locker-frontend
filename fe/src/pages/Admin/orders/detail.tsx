import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Box,
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Ban,
  Edit3,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";
import { OrderStatus } from "~/types/admin/enums";
import { useOrderDetail } from "./hooks/useOrderDetail";
import { OrderTimeline } from "./components/OrderTimeline";
import { OrderStatusUpdateModal } from "./components/OrderStatusUpdateModal";
import { useState } from "react";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  [OrderStatus.INITIALIZED]: {
    label: "Khởi tạo",
    color: "text-gray-700",
    bg: "bg-gray-100",
    icon: Clock,
  },
  [OrderStatus.RESERVED]: {
    label: "Đã đặt",
    color: "text-blue-700",
    bg: "bg-blue-100",
    icon: Package,
  },
  [OrderStatus.WAITING]: {
    label: "Chờ thu gom",
    color: "text-yellow-700",
    bg: "bg-yellow-100",
    icon: Truck,
  },
  [OrderStatus.COLLECTED]: {
    label: "Đã thu gom",
    color: "text-purple-700",
    bg: "bg-purple-100",
    icon: CheckCircle2,
  },
  [OrderStatus.PROCESSING]: {
    label: "Đang xử lý",
    color: "text-indigo-700",
    bg: "bg-indigo-100",
    icon: RotateCcw,
  },
  [OrderStatus.READY]: {
    label: "Sẵn sàng",
    color: "text-teal-700",
    bg: "bg-teal-100",
    icon: CheckCircle2,
  },
  [OrderStatus.RETURNED]: {
    label: "Đã trả",
    color: "text-orange-700",
    bg: "bg-orange-100",
    icon: Box,
  },
  [OrderStatus.COMPLETED]: {
    label: "Hoàn thành",
    color: "text-green-700",
    bg: "bg-green-100",
    icon: CheckCircle2,
  },
  [OrderStatus.CANCELED]: {
    label: "Đã hủy",
    color: "text-red-700",
    bg: "bg-red-100",
    icon: XCircle,
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { order, isLoading, cancelOrder, updateStatus } =
    useOrderDetail(orderId);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const handleCancel = () => {
    if (confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
      cancelOrder();
      toast.success("Đã hủy đơn hàng");
    }
  };

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    updateStatus(newStatus);
    setIsStatusModalOpen(false);
    toast.success(`Đã cập nhật trạng thái: ${statusConfig[newStatus].label}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium">Không tìm thấy đơn hàng</h3>
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const canCancel = (
    [OrderStatus.INITIALIZED, OrderStatus.WAITING] as OrderStatus[]
  ).includes(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
            <p className="text-sm text-gray-500">{order.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsStatusModalOpen(true)}>
            <Edit3 className="mr-2 h-4 w-4" />
            Cập nhật trạng thái
          </Button>
          {canCancel && (
            <Button variant="destructive" onClick={handleCancel}>
              <Ban className="mr-2 h-4 w-4" />
              Hủy đơn
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`${status.bg} ${status.color} rounded-lg p-4 flex items-center gap-3`}
      >
        <StatusIcon className="h-6 w-6" />
        <div>
          <p className="font-medium">Trạng thái: {status.label}</p>
          <p className="text-sm opacity-80">
            Cập nhật lần cuối: {formatDate(order.updatedAt || order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Chi tiết đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderDetails?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.serviceName}</p>
                      <p className="text-sm text-gray-500">
                        Số lượng: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-blue-600">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Tổng cộng</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(order.totalPrice)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Lịch sử trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline order={order} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Họ tên</p>
                <p className="font-medium">{order.senderName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã khách hàng</p>
                <p className="font-mono text-sm">{order.senderId}</p>
              </div>
              {order.customerNote && (
                <div>
                  <p className="text-sm text-gray-500">Ghi chú</p>
                  <p className="text-sm">{order.customerNote}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Locker Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Thông tin tủ đồ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Tủ</p>
                <p className="font-medium">{order.lockerName || "N/A"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ngăn gửi</p>
                  <Badge variant="outline">
                    <Box className="mr-1 h-3 w-3" />
                    {order.sendBoxNumber || "N/A"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngăn nhận</p>
                  <Badge variant="outline">
                    <Box className="mr-1 h-3 w-3" />
                    {order.receiveBoxNumber || "N/A"}
                  </Badge>
                </div>
              </div>
              {order.pinCode && (
                <div>
                  <p className="text-sm text-gray-500">Mã PIN</p>
                  <p className="font-mono text-lg font-bold tracking-wider">
                    {order.pinCode}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Trạng thái</span>
                <Badge
                  variant={
                    order.status === "COMPLETED" ? "default" : "secondary"
                  }
                  className={
                    order.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : ""
                  }
                >
                  {order.status === "COMPLETED"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phương thức</span>
                <span>N/A</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Tổng tiền</span>
                <span className="text-blue-600">
                  {formatCurrency(order.totalPrice)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Modal */}
      <OrderStatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        currentStatus={order.status}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}
