import * as React from "react";
import {
  Package,
  Search,
  Filter,
  Check,
  Play,
  CheckCircle,
  Scale,
  Copy,
  Clock,
  Eye,
} from "lucide-react";
import {
  Button,
  Card,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  PageLoading,
  ErrorState,
  EmptyData,
  Badge,
  Input,
} from "~/components/ui";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { ORDER_STATUS_COLORS } from "@/constants";
import type { PartnerOrder, StaffAccessCode } from "@/types/partner.type";
import { OrderStatus } from "@/types/partner.enum";
import {
  useGetPartnerOrdersQuery,
  useAcceptOrderMutation,
  useUpdateOrderWeightMutation,
  useProcessOrderMutation,
  useMarkOrderReadyMutation,
  POLLING_INTERVAL,
} from "@/stores/apis/partnerApi";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
  radius: "rounded-md",
};

// Order status labels in Vietnamese
const STATUS_LABELS: Record<string, string> = {
  ALL: "Tất cả",
  WAITING: "Chờ lấy đồ",
  COLLECTED: "Đã lấy",
  PROCESSING: "Đang giặt",
  PROCESSED: "Giặt xong",
  READY: "Sẵn sàng trả",
  RETURNED: "Đã trả",
  COMPLETED: "Hoàn thành",
  CANCELED: "Đã hủy",
};

// Error codes from Backend
const ERROR_CODES = {
  E_ORDER002: "E_ORDER002", // Sai trạng thái đơn hàng
  E_BOX003: "E_BOX003", // Box đang bận/kẹt
  E_ORDER001: "E_ORDER001", // Không tìm thấy đơn hàng
  E_AUTH001: "E_AUTH001", // Không có quyền
} as const;

// Error messages mapping - Match requirement specification
const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.E_ORDER002]:
    "Lỗi: Trạng thái đơn hàng đã thay đổi, không thể cấp mã.",
  [ERROR_CODES.E_BOX003]:
    "Lỗi: Tủ Locker hiện đang bận hoặc gặp sự cố kỹ thuật.",
  [ERROR_CODES.E_ORDER001]: "Không tìm thấy đơn hàng.",
  [ERROR_CODES.E_AUTH001]: "Bạn không có quyền truy cập cửa hàng này.",
};

// Helper: Get error message from API error
const getErrorMessage = (err: unknown): string => {
  // Type guard for API error response
  const apiError = err as {
    status?: number;
    data?: { code?: string; message?: string };
  };

  // Handle 401/403 - Unauthorized/Forbidden
  if (apiError?.status === 401 || apiError?.status === 403) {
    // Clear token and redirect to login
    localStorage.removeItem("accessToken");
    window.location.href =
      "/login?redirect=" + encodeURIComponent(window.location.pathname);
    return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
  }

  // Handle known error codes
  const errorCode = apiError?.data?.code;
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }

  // Fallback to server message or default
  return apiError?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
};

export default function PartnerOrders(): React.JSX.Element {
  const [activeTab, setActiveTab] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Error toast state
  const [errorToast, setErrorToast] = React.useState<string | null>(null);

  // Auto-hide error toast after 5 seconds
  React.useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  // Modal states
  const [accessCodeModal, setAccessCodeModal] = React.useState<{
    open: boolean;
    code: StaffAccessCode | null;
    action: "COLLECT" | "RETURN";
  }>({ open: false, code: null, action: "COLLECT" });

  const [weightModal, setWeightModal] = React.useState<{
    open: boolean;
    order: PartnerOrder | null;
    weight: string;
  }>({ open: false, order: null, weight: "" });

  // RTK Query hooks
  const {
    data: ordersData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPartnerOrdersQuery(
    {
      status: activeTab === "ALL" ? undefined : (activeTab as OrderStatus),
      page,
      size,
      search: searchQuery || undefined,
    },
    {
      // Polling: Tự động gọi lại API mỗi 10 giây
      pollingInterval: POLLING_INTERVAL,
      // Refetch khi tab browser được focus lại
      refetchOnFocus: true,
      // Refetch khi reconnect mạng
      refetchOnReconnect: true,
    },
  );

  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const [updateWeight, { isLoading: isUpdatingWeight }] =
    useUpdateOrderWeightMutation();
  const [processOrder, { isLoading: isProcessing }] = useProcessOrderMutation();
  const [markReady, { isLoading: isMarkingReady }] =
    useMarkOrderReadyMutation();

  const orders = ordersData?.content || [];

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    return (
      ORDER_STATUS_COLORS[status as OrderStatus] || "bg-gray-100 text-gray-700"
    );
  };

  // Copy access code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  // Handle Accept Order
  const handleAcceptOrder = async (order: PartnerOrder) => {
    try {
      const result = await acceptOrder(order.id).unwrap();
      setAccessCodeModal({
        open: true,
        code: result.staffAccessCode,
        action: "COLLECT",
      });
    } catch (err: unknown) {
      console.error("Failed to accept order:", err);
      setErrorToast(getErrorMessage(err));
    }
  };

  // Handle Update Weight
  const handleOpenWeightModal = (order: PartnerOrder) => {
    setWeightModal({
      open: true,
      order,
      weight: order.weight?.toString() || "",
    });
  };

  const handleSubmitWeight = async () => {
    if (!weightModal.order || !weightModal.weight) return;

    try {
      await updateWeight({
        orderId: weightModal.order.id,
        actualWeight: parseFloat(weightModal.weight),
        weightUnit: "kg",
      }).unwrap();
      setWeightModal({ open: false, order: null, weight: "" });
    } catch (err: unknown) {
      console.error("Failed to update weight:", err);
      setErrorToast(getErrorMessage(err));
    }
  };

  // Handle Process Order
  const handleProcessOrder = async (order: PartnerOrder) => {
    try {
      await processOrder(order.id).unwrap();
    } catch (err: unknown) {
      console.error("Failed to process order:", err);
      setErrorToast(getErrorMessage(err));
    }
  };

  // Handle Mark Ready
  const handleMarkReady = async (order: PartnerOrder) => {
    try {
      const result = await markReady(order.id).unwrap();
      setAccessCodeModal({
        open: true,
        code: result.staffAccessCode,
        action: "RETURN",
      });
    } catch (err: unknown) {
      console.error("Failed to mark order ready:", err);
      setErrorToast(getErrorMessage(err));
    }
  };

  // Get action buttons based on order status
  // Business Flow Mapping:
  // - WAITING (= DROPPED_OFF in business terms) → Cấp mã COLLECT
  // - PROCESSING (= IN_PROGRESS in business terms) → Cấp mã RETURN
  const getOrderActions = (order: PartnerOrder) => {
    switch (order.status) {
      // WAITING = DROPPED_OFF: Khách đã bỏ đồ vào tủ, Partner cấp mã cho Staff đi lấy
      case OrderStatus.WAITING:
        return (
          <Button
            size="sm"
            onClick={() => handleAcceptOrder(order)}
            disabled={isAccepting}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check size={14} className="mr-1" />
            Cấp mã lấy đồ
          </Button>
        );

      case OrderStatus.COLLECTED:
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenWeightModal(order)}
            >
              <Scale size={14} className="mr-1" />
              Cập nhật KG
            </Button>
            <Button
              size="sm"
              onClick={() => handleProcessOrder(order)}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play size={14} className="mr-1" />
              Bắt đầu giặt
            </Button>
          </div>
        );

      // PROCESSING/PROCESSED = IN_PROGRESS: Đang giặt xong, Partner cấp mã cho Staff đi trả đồ
      case OrderStatus.PROCESSING:
      case OrderStatus.PROCESSED:
        return (
          <Button
            size="sm"
            onClick={() => handleMarkReady(order)}
            disabled={isMarkingReady}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <CheckCircle size={14} className="mr-1" />
            Cấp mã trả đồ
          </Button>
        );

      case OrderStatus.READY:
        return (
          <Badge
            variant="outline"
            className="text-purple-600 border-purple-600"
          >
            Chờ Staff trả đồ
          </Badge>
        );

      case OrderStatus.RETURNED:
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            Chờ khách lấy đồ
          </Badge>
        );

      case OrderStatus.COMPLETED:
        return (
          <Button size="sm" variant="ghost">
            <Eye size={14} className="mr-1" />
            Chi tiết
          </Button>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách đơn hàng..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải danh sách đơn hàng"
        error={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Error Toast */}
      {errorToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-red-500">⚠️</span>
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

      {/* Polling Indicator */}
      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-sm flex items-center gap-2 shadow">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Đang cập nhật...
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-2">
            Theo dõi và xử lý đơn hàng giặt ủi
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Tìm kiếm theo mã đơn, khách hàng, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={18} />
          Bộ lọc
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="ALL">Tất cả</TabsTrigger>
          <TabsTrigger value="WAITING">Chờ lấy đồ</TabsTrigger>
          <TabsTrigger value="COLLECTED">Đã lấy</TabsTrigger>
          <TabsTrigger value="PROCESSING">Đang giặt</TabsTrigger>
          <TabsTrigger value="READY">Sẵn sàng trả</TabsTrigger>
          <TabsTrigger value="RETURNED">Đã trả</TabsTrigger>
          <TabsTrigger value="COMPLETED">Hoàn thành</TabsTrigger>
        </TabsList>

        {orders.length === 0 ? (
          <EmptyData
            title="Chưa có đơn hàng"
            message={`Không có đơn hàng nào ${activeTab !== "ALL" ? `ở trạng thái "${STATUS_LABELS[activeTab]}"` : ""}.`}
            icon={<Package className="h-16 w-16 text-muted-foreground" />}
          />
        ) : (
          <Card>
            <Table>
              <TableHeader className={tableHeader.bg}>
                <TableRow>
                  <TableHead
                    className={`${tableHeader.text} ${tableHeader.radius}`}
                  >
                    Mã đơn
                  </TableHead>
                  <TableHead className={tableHeader.text}>Khách hàng</TableHead>
                  <TableHead className={tableHeader.text}>Locker</TableHead>
                  <TableHead className={tableHeader.text}>Dịch vụ</TableHead>
                  <TableHead className={tableHeader.text}>Trạng thái</TableHead>
                  <TableHead className={tableHeader.text}>Cân nặng</TableHead>
                  <TableHead className={tableHeader.text}>Giá trị</TableHead>
                  <TableHead className={tableHeader.text}>Ngày tạo</TableHead>
                  <TableHead
                    className={`${tableHeader.text} ${tableHeader.radius} text-right`}
                  >
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono font-semibold">
                      {order.orderCode}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-500">
                          {order.customerPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.lockerName}</p>
                        <p className="text-sm text-gray-500">
                          Box {order.boxNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.serviceType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(order.status)}>
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.weight ? `${order.weight} kg` : "-"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {order.totalPrice
                        ? `${order.totalPrice.toLocaleString()}đ`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      {getOrderActions(order)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Tabs>

      {/* Access Code Modal */}
      <Dialog
        open={accessCodeModal.open}
        onOpenChange={(open) =>
          setAccessCodeModal((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {accessCodeModal.action === "COLLECT"
                ? "🔑 Mã lấy đồ cho Staff"
                : "📦 Mã trả đồ cho Staff"}
            </DialogTitle>
            <DialogDescription className="text-center">
              Gửi mã này cho nhân viên để{" "}
              {accessCodeModal.action === "COLLECT" ? "lấy đồ" : "trả đồ"} tại
              tủ locker
            </DialogDescription>
          </DialogHeader>

          {accessCodeModal.code && (
            <div className="space-y-4">
              {/* Large Code Display */}
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <p className="text-4xl font-mono font-bold tracking-widest text-blue-600">
                  {accessCodeModal.code.code}
                </p>
              </div>

              {/* Copy Button */}
              <Button
                className="w-full"
                onClick={() => copyToClipboard(accessCodeModal.code!.code)}
              >
                <Copy size={16} className="mr-2" />
                Sao chép mã
              </Button>

              {/* Code Details */}
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>
                    Hết hạn:{" "}
                    {new Date(accessCodeModal.code.expiresAt).toLocaleString(
                      "vi-VN",
                    )}
                  </span>
                </div>
                {accessCodeModal.code.orderLockerName && (
                  <p>📍 Tủ: {accessCodeModal.code.orderLockerName}</p>
                )}
                {accessCodeModal.code.orderBoxNumbers && (
                  <p>📦 Box: {accessCodeModal.code.orderBoxNumbers}</p>
                )}
                {accessCodeModal.code.customerName && (
                  <p>👤 Khách: {accessCodeModal.code.customerName}</p>
                )}
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                ⚠️ Mã chỉ sử dụng được 1 lần và sẽ tự động hết hạn sau 24 giờ
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setAccessCodeModal({
                  open: false,
                  code: null,
                  action: "COLLECT",
                })
              }
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Weight Update Modal */}
      <Dialog
        open={weightModal.open}
        onOpenChange={(open) => setWeightModal((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật cân nặng</DialogTitle>
            <DialogDescription>
              Nhập cân nặng thực tế sau khi cân đồ của khách
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Cân nặng (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="VD: 3.5"
                value={weightModal.weight}
                onChange={(e) =>
                  setWeightModal((prev) => ({
                    ...prev,
                    weight: e.target.value,
                  }))
                }
              />
            </div>

            {weightModal.order && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p>
                  <strong>Mã đơn:</strong> {weightModal.order.orderCode}
                </p>
                <p>
                  <strong>Khách hàng:</strong> {weightModal.order.customerName}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setWeightModal({ open: false, order: null, weight: "" })
              }
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitWeight} disabled={isUpdatingWeight}>
              {isUpdatingWeight ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
