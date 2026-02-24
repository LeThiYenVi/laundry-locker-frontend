import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Button,
  PageLoading,
  Badge,
  EmptyData,
  ErrorState,
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
  useGetAllNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  NOTIFICATION_POLLING_INTERVAL,
  type Notification,
} from "~/stores/apis/notificationApi";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Trash2,
  RefreshCw,
} from "lucide-react";

// ============================================
// Helper Functions
// ============================================

const getTypeLabel = (type: string): string => {
  switch (type) {
    case "ORDER":
      return "Đơn hàng";
    case "PAYMENT":
      return "Thanh toán";
    case "SYSTEM":
      return "Hệ thống";
    case "STAFF":
      return "Nhân viên";
    case "INFO":
      return "Thông tin";
    case "WARNING":
      return "Cảnh báo";
    default:
      return type;
  }
};

const getTypeBadge = (type: string): string => {
  switch (type) {
    case "ORDER":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "PAYMENT":
      return "bg-green-100 text-green-700 border-green-200";
    case "SYSTEM":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "STAFF":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "INFO":
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
    case "WARNING":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getTypeIcon = (type: string): string => {
  switch (type) {
    case "ORDER":
      return "📦";
    case "PAYMENT":
      return "💰";
    case "SYSTEM":
      return "⚙️";
    case "STAFF":
      return "👥";
    case "INFO":
      return "ℹ️";
    case "WARNING":
      return "⚠️";
    default:
      return "🔔";
  }
};

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

const groupNotificationsByDate = (
  notifications: Notification[],
): { label: string; notifications: Notification[] }[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; notifications: Notification[] }[] = [
    { label: "Hôm nay", notifications: [] },
    { label: "Hôm qua", notifications: [] },
    { label: "Trước đó", notifications: [] },
  ];

  notifications.forEach((notif) => {
    const notifDate = new Date(notif.createdAt);
    notifDate.setHours(0, 0, 0, 0);

    if (notifDate.getTime() === today.getTime()) {
      groups[0].notifications.push(notif);
    } else if (notifDate.getTime() === yesterday.getTime()) {
      groups[1].notifications.push(notif);
    } else {
      groups[2].notifications.push(notif);
    }
  });

  return groups.filter((group) => group.notifications.length > 0);
};

// ============================================
// Toast Component
// ============================================

interface ToastProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

function Toast({ type, message, onClose }: ToastProps): React.JSX.Element {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          type === "success"
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        {type === "success" ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-red-600" />
        )}
        <span
          className={type === "success" ? "text-green-700" : "text-red-700"}
        >
          {message}
        </span>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function PartnerNotificationsPage(): React.JSX.Element {
  const navigate = useNavigate();

  // Filter states
  const [filterType, setFilterType] = React.useState<string>("ALL");
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL");

  // Toast state
  const [toast, setToast] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // RTK Query hooks
  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAllNotificationsQuery(undefined, {
    pollingInterval: NOTIFICATION_POLLING_INTERVAL,
  });

  const { data: unreadCount = 0 } = useGetUnreadCountQuery(undefined, {
    pollingInterval: NOTIFICATION_POLLING_INTERVAL,
  });

  const [markAsRead, { isLoading: isMarkingRead }] =
    useMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAllRead }] =
    useMarkAllNotificationsAsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  // ============================================
  // Handlers
  // ============================================

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id).unwrap();
      setToast({ type: "success", message: "Đã đánh dấu đã đọc" });
    } catch (err) {
      console.error("Lỗi khi đánh dấu đã đọc:", err);
      setToast({
        type: "error",
        message: "Không thể đánh dấu đã đọc. Vui lòng thử lại.",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      setToast({ type: "success", message: "Đã đánh dấu tất cả đã đọc" });
    } catch (err) {
      console.error("Lỗi khi đánh dấu tất cả đã đọc:", err);
      setToast({
        type: "error",
        message: "Không thể đánh dấu tất cả. Vui lòng thử lại.",
      });
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteNotification(id).unwrap();
      setToast({ type: "success", message: "Đã xóa thông báo" });
    } catch (err) {
      console.error("Lỗi khi xóa thông báo:", err);
      setToast({
        type: "error",
        message: "Không thể xóa thông báo. Vui lòng thử lại.",
      });
    }
  };

  const handleViewOrder = (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/partner/orders?id=${orderId}`);
  };

  // ============================================
  // Filtered & Grouped Data
  // ============================================

  const filteredNotifications = React.useMemo(() => {
    let filtered = [...notifications];

    if (filterType !== "ALL") {
      filtered = filtered.filter((notif) => notif.type === filterType);
    }

    if (filterStatus === "UNREAD") {
      filtered = filtered.filter((notif) => !notif.isRead);
    } else if (filterStatus === "READ") {
      filtered = filtered.filter((notif) => notif.isRead);
    }

    // Sort by date descending
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return filtered;
  }, [notifications, filterType, filterStatus]);

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  // ============================================
  // Stats
  // ============================================

  const stats = React.useMemo(() => {
    return {
      total: notifications.length,
      unread: unreadCount,
      order: notifications.filter((n) => n.type === "ORDER").length,
      payment: notifications.filter((n) => n.type === "PAYMENT").length,
    };
  }, [notifications, unreadCount]);

  // ============================================
  // Render States
  // ============================================

  if (isLoading) {
    return <PageLoading message="Đang tải thông báo..." />;
  }

  if (isError) {
    const errorMessage =
      error && "data" in error
        ? (error.data as { message?: string })?.message ||
          "Không thể tải thông báo"
        : "Lỗi kết nối đến máy chủ";

    return (
      <div className="min-h-screen bg-[#FAFCFF] p-8">
        <div className="max-w-5xl mx-auto">
          <ErrorState
            title="Không thể tải thông báo"
            message={errorMessage}
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  // ============================================
  // Main Render
  // ============================================

  return (
    <div className="min-h-screen bg-[#FAFCFF] p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#326B9C] flex items-center gap-3">
              <Bell className="w-8 h-8" />
              Thông báo
            </h1>
            <p className="text-[#7BAAD1] mt-1">
              Quản lý các thông báo và cập nhật từ hệ thống
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="border-[#B0C8DA] text-[#326B9C]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>

            <Button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isMarkingAllRead}
              className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white font-semibold disabled:opacity-50"
            >
              {isMarkingAllRead ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng thông báo</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Chưa đọc</div>
              <div className="text-3xl font-bold text-red-600">
                {stats.unread}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Đơn hàng</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.order}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Thanh toán</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.payment}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Loại thông báo
                </Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="border-[#B0C8DA] bg-white">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E8E9EB]">
                    <SelectItem
                      value="ALL"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Tất cả
                    </SelectItem>
                    <SelectItem
                      value="ORDER"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Đơn hàng
                    </SelectItem>
                    <SelectItem
                      value="PAYMENT"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Thanh toán
                    </SelectItem>
                    <SelectItem
                      value="SYSTEM"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Hệ thống
                    </SelectItem>
                    <SelectItem
                      value="STAFF"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Nhân viên
                    </SelectItem>
                    <SelectItem
                      value="INFO"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Thông tin
                    </SelectItem>
                    <SelectItem
                      value="WARNING"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Cảnh báo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">Trạng thái</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-[#B0C8DA] bg-white">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E8E9EB]">
                    <SelectItem
                      value="ALL"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Tất cả
                    </SelectItem>
                    <SelectItem
                      value="UNREAD"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Chưa đọc
                    </SelectItem>
                    <SelectItem
                      value="READ"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Đã đọc
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-6">
          {groupedNotifications.length > 0 ? (
            groupedNotifications.map((group) => (
              <div key={group.label} className="space-y-3">
                <h2 className="text-lg font-bold text-[#326B9C] sticky top-0 bg-[#FAFCFF] py-2 z-10">
                  {group.label}
                </h2>

                {group.notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`border-[#E8E9EB] transition-all cursor-pointer ${
                      !notification.isRead
                        ? "bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500"
                        : "hover:bg-[#FAFCFF]"
                    }`}
                    onClick={() =>
                      !notification.isRead && handleMarkAsRead(notification.id)
                    }
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notification.type === "ORDER"
                              ? "bg-blue-100"
                              : notification.type === "PAYMENT"
                                ? "bg-green-100"
                                : notification.type === "SYSTEM"
                                  ? "bg-purple-100"
                                  : notification.type === "WARNING"
                                    ? "bg-red-100"
                                    : "bg-orange-100"
                          }`}
                        >
                          <span className="text-2xl">
                            {getTypeIcon(notification.type)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="font-bold text-[#326B9C]">
                              {notification.title}
                            </h3>
                            <span className="text-xs text-[#7BAAD1] whitespace-nowrap">
                              {getTimeAgo(notification.createdAt)}
                            </span>
                          </div>

                          <p className="text-[#7BAAD1] text-sm mb-3">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={getTypeBadge(notification.type)}
                            >
                              {getTypeLabel(notification.type)}
                            </Badge>

                            {!notification.isRead && (
                              <Badge
                                variant="outline"
                                className="bg-red-100 text-red-700 border-red-200"
                              >
                                Mới
                              </Badge>
                            )}

                            {notification.orderId && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto border-[#B0C8DA] text-[#326B9C]"
                                onClick={(e) =>
                                  handleViewOrder(notification.orderId!, e)
                                }
                              >
                                Xem đơn hàng
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={(e) => handleDelete(notification.id, e)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))
          ) : (
            <EmptyData
              title="Không có thông báo"
              message={
                filterType !== "ALL" || filterStatus !== "ALL"
                  ? "Không tìm thấy thông báo phù hợp với bộ lọc"
                  : "Bạn chưa có thông báo nào"
              }
              icon={<Bell className="w-16 h-16 text-gray-300" />}
            />
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
