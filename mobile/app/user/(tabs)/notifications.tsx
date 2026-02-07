import { ThemedText } from "@/components/themed-text";
import { notificationService } from "@/services/user";
import { Notification, NotificationType } from "@/types";
import { Icon } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

const getNotificationIcon = (type: NotificationType): { name: string; color: string } => {
  switch (type) {
    case "ORDER_CREATED":
      return { name: "add-shopping-cart", color: "#2196F3" };
    case "ORDER_CONFIRMED":
      return { name: "check-circle", color: "#4CAF50" };
    case "ORDER_COLLECTED":
      return { name: "local-shipping", color: "#FF9800" };
    case "ORDER_PROCESSING":
      return { name: "local-laundry-service", color: "#9C27B0" };
    case "ORDER_READY":
      return { name: "done-all", color: "#4CAF50" };
    case "ORDER_RETURNED":
      return { name: "inventory", color: "#00BCD4" };
    case "ORDER_COMPLETED":
      return { name: "celebration", color: "#8BC34A" };
    case "ORDER_CANCELED":
      return { name: "cancel", color: "#F44336" };
    case "PAYMENT_SUCCESS":
      return { name: "payments", color: "#4CAF50" };
    case "PAYMENT_FAILED":
      return { name: "payment", color: "#F44336" };
    case "SYSTEM":
    default:
      return { name: "campaign", color: "#FF5722" };
  }
};

const formatTimeAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getAllNotifications();
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n) => !n.isRead).length);
      }
    } catch (error: any) {
      console.error("Failed to fetch notifications:", error);
      // Use empty array if API fails
      setNotifications([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.isRead) return;
    
    try {
      const response = await notificationService.markAsRead(notification.id);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error: any) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể đánh dấu tất cả đã đọc");
    }
  };

  const handleDelete = async (notification: Notification) => {
    try {
      const response = await notificationService.deleteNotification(notification.id);
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        if (!notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể xóa thông báo");
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const iconInfo = getNotificationIcon(item.type);
    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
        onPress={() => handleMarkAsRead(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconInfo.color}15` }]}>
          <Icon name={iconInfo.name} type="material" size={24} color={iconInfo.color} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {item.title}
            </ThemedText>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <ThemedText style={styles.body} numberOfLines={2}>
            {item.body}
          </ThemedText>
          <View style={styles.metaRow}>
            <ThemedText style={styles.time}>{formatTimeAgo(item.createdAt || "")}</ThemedText>
            <ThemedText style={styles.type}>{item.type.replace(/_/g, " ")}</ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Icon name="close" type="material" size={18} color="#999" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003D5B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <LinearGradient
        colors={["#ffffff", "#f0f8ff", "#d6e9f5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Thông báo</ThemedText>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <ThemedText style={styles.markAllText}>Đánh dấu tất cả đã đọc</ThemedText>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="notifications-off" type="material" size={64} color="#CCC" />
            <ThemedText style={styles.emptyText}>Không có thông báo nào</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Các thông báo về đơn hàng và khuyến mãi sẽ hiển thị tại đây
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#003D5B",
  },
  badge: {
    backgroundColor: "#FF5722",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  markAllText: {
    fontSize: 13,
    color: "#003D5B",
    opacity: 0.8,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#003D5B",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#003D5B",
  },
  body: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  time: {
    fontSize: 11,
    color: "#999",
    fontWeight: "600",
  },
  type: {
    fontSize: 10,
    color: "#999",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: "capitalize",
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#BBB",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
