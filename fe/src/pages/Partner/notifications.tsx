import * as React from "react";
import { Card, CardContent, Button, PageLoading, Badge } from "~/components/ui";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface Notification {
  id: number;
  type: "ORDER" | "PAYMENT" | "SYSTEM" | "STAFF";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  orderId?: number;
}

export default function PartnerNotificationsPage(): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [filterType, setFilterType] = React.useState<string>("ALL");
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL");

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockNotifications: Notification[] = [
          {
            id: 1,
            type: "ORDER",
            title: "Đơn hàng mới #1234",
            message:
              "Bạn có 1 đơn hàng mới cần xử lý từ khách hàng Nguyễn Văn A",
            isRead: false,
            createdAt: new Date(Date.now() - 5 * 60 * 1000),
            orderId: 1234,
          },
          {
            id: 2,
            type: "PAYMENT",
            title: "Thanh toán thành công",
            message:
              "Thanh toán cho kỳ 01-15/01/2024 đã được xử lý thành công. Số tiền: 5,000,000₫",
            isRead: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000),
          },
          {
            id: 3,
            type: "ORDER",
            title: "Đơn hàng #1230 đã hoàn thành",
            message: "Khách hàng đã nhận đồ. Vui lòng kiểm tra đánh giá.",
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            orderId: 1230,
          },
          {
            id: 4,
            type: "STAFF",
            title: "Nhân viên mới được thêm",
            message:
              "Trần Thị B đã được thêm vào danh sách nhân viên với vai trò Tài xế",
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
          {
            id: 5,
            type: "SYSTEM",
            title: "Cập nhật hệ thống",
            message:
              "Hệ thống sẽ bảo trì vào 2h sáng ngày 20/01/2024. Thời gian dự kiến: 30 phút",
            isRead: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: 6,
            type: "ORDER",
            title: "Đơn hàng #1228 bị hủy",
            message: "Khách hàng đã hủy đơn hàng. Lý do: Thay đổi kế hoạch",
            isRead: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            orderId: 1228,
          },
          {
            id: 7,
            type: "PAYMENT",
            title: "Nhắc nhở thanh toán",
            message: "Kỳ thanh toán 16-31/01/2024 sẽ đến hạn trong 3 ngày",
            isRead: false,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          },
        ];

        setNotifications(mockNotifications);
      } catch (err) {
        console.error("Lỗi khi tải thông báo:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ORDER":
        return "Đơn hàng";
      case "PAYMENT":
        return "Thanh toán";
      case "SYSTEM":
        return "Hệ thống";
      case "STAFF":
        return "Nhân viên";
      default:
        return type;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "ORDER":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PAYMENT":
        return "bg-green-100 text-green-700 border-green-200";
      case "SYSTEM":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "STAFF":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "Vừa xong";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const groupNotificationsByDate = (notifs: Notification[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { label: string; notifications: Notification[] }[] = [
      { label: "Hôm nay", notifications: [] },
      { label: "Hôm qua", notifications: [] },
      { label: "Trước đó", notifications: [] },
    ];

    notifs.forEach((notif) => {
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

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true })),
    );
  };

  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;

    if (filterType !== "ALL") {
      filtered = filtered.filter((notif) => notif.type === filterType);
    }

    if (filterStatus === "UNREAD") {
      filtered = filtered.filter((notif) => !notif.isRead);
    } else if (filterStatus === "READ") {
      filtered = filtered.filter((notif) => notif.isRead);
    }

    return filtered;
  }, [notifications, filterType, filterStatus]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  if (isLoading) {
    return <PageLoading message="Đang tải thông báo..." />;
  }

  return (
    <div className="min-h-screen bg-[#FAFCFF] p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#326B9C]">Thông báo</h1>
            <p className="text-[#7BAAD1] mt-1">
              Quản lý các thông báo và cập nhật từ hệ thống
            </p>
          </div>

          <Button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white font-semibold disabled:opacity-50"
          >
            Đánh dấu tất cả đã đọc
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng thông báo</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {notifications.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Chưa đọc</div>
              <div className="text-3xl font-bold text-red-600">
                {unreadCount}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Đơn hàng</div>
              <div className="text-3xl font-bold text-blue-600">
                {notifications.filter((n) => n.type === "ORDER").length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Thanh toán</div>
              <div className="text-3xl font-bold text-green-600">
                {notifications.filter((n) => n.type === "PAYMENT").length}
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
          {groupedNotifications.map((group) => (
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
                  onClick={() => handleMarkAsRead(notification.id)}
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
                                : "bg-orange-100"
                        }`}
                      >
                        <span className="text-2xl">
                          {notification.type === "ORDER"
                            ? "📦"
                            : notification.type === "PAYMENT"
                              ? "💰"
                              : notification.type === "SYSTEM"
                                ? "⚙️"
                                : "👥"}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3
                            className={`font-bold ${
                              notification.isRead
                                ? "text-[#326B9C]"
                                : "text-[#326B9C]"
                            }`}
                          >
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
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Xem đơn hàng #${notification.orderId}`);
                              }}
                            >
                              Xem đơn hàng
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <Card className="border-[#E8E9EB]">
              <CardContent className="p-12 text-center">
                <p className="text-[#7BAAD1]">Không có thông báo nào</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
