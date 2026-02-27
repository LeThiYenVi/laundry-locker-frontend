import { useState, useMemo } from "react";
import { useGetNotificationsQuery } from "@/stores/apis/notificationApi";

export interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useGetNotificationsQuery({ page: 0, size: 20 });

  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Extract notifications from paginated response
  const notifications: Notification[] = useMemo(() => {
    if (!response) return [];
    // Handle both array and paginated response
    const list = Array.isArray(response) ? response : (response.content || []);
    return list.map((n: any) => ({
      id: n.id,
      title: n.title || "Thông báo",
      message: n.message || n.content || "",
      isRead: n.isRead || false,
      createdAt: n.createdAt || new Date().toISOString(),
    }));
  }, [response]);

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (_id: number) => {
    // Mock implementation
    console.log("Mark as read:", _id);
  };

  const handleMarkAllAsRead = async () => {
    // Mock implementation
    console.log("Mark all as read");
  };

  return {
    notifications: filteredNotifications,
    unreadCount,
    filter,
    setFilter,
    isLoading,
    error,
    refetch,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
}
