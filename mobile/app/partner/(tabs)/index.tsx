import { ThemedText } from "@/components/themed-text";
import { Icon } from "@rneui/themed";
import { useCallback, useEffect, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

// Mock data for dashboard statistics
const mockStats = {
  totalOrdersToday: 24,
  pendingOrders: 8,
  processingOrders: 5,
  readyOrders: 3,
  completedToday: 8,
  revenue: 2450000,
};

export default function PartnerDashboardScreen() {
  const [stats, setStats] = useState(mockStats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentDate = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fetchStats = useCallback(async () => {
    // TODO: Fetch real statistics from API
    setTimeout(() => {
      setStats(mockStats);
      setIsRefreshing(false);
    }, 500);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText style={styles.greeting}>Xin chào, Partner</ThemedText>
            <ThemedText style={styles.date}>{currentDate}</ThemedText>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications" type="material" size={24} color="#fff" />
            <View style={styles.notificationBadge}>
              <ThemedText style={styles.badgeText}>3</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Revenue Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueIcon}>
            <Icon name="account-balance-wallet" type="material" size={28} color="#4CAF50" />
          </View>
          <View style={styles.revenueInfo}>
            <ThemedText style={styles.revenueLabel}>Doanh thu hôm nay</ThemedText>
            <ThemedText style={styles.revenueValue}>{formatCurrency(stats.revenue)}</ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        {/* Quick Stats */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Tổng quan đơn hàng</ThemedText>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: "#FF9800" }]}>
              <View style={styles.statHeader}>
                <Icon name="pending-actions" type="material" size={24} color="#FF9800" />
                <ThemedText style={styles.statValue}>{stats.pendingOrders}</ThemedText>
              </View>
              <ThemedText style={styles.statLabel}>Chờ lấy đồ</ThemedText>
            </View>

            <View style={[styles.statCard, { borderLeftColor: "#9C27B0" }]}>
              <View style={styles.statHeader}>
                <Icon name="local-laundry-service" type="material" size={24} color="#9C27B0" />
                <ThemedText style={styles.statValue}>{stats.processingOrders}</ThemedText>
              </View>
              <ThemedText style={styles.statLabel}>Đang xử lý</ThemedText>
            </View>

            <View style={[styles.statCard, { borderLeftColor: "#4CAF50" }]}>
              <View style={styles.statHeader}>
                <Icon name="done-all" type="material" size={24} color="#4CAF50" />
                <ThemedText style={styles.statValue}>{stats.readyOrders}</ThemedText>
              </View>
              <ThemedText style={styles.statLabel}>Sẵn sàng trả</ThemedText>
            </View>

            <View style={[styles.statCard, { borderLeftColor: "#2196F3" }]}>
              <View style={styles.statHeader}>
                <Icon name="check-circle" type="material" size={24} color="#2196F3" />
                <ThemedText style={styles.statValue}>{stats.completedToday}</ThemedText>
              </View>
              <ThemedText style={styles.statLabel}>Hoàn thành</ThemedText>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Thao tác nhanh</ThemedText>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: "#E3F2FD" }]}>
                <Icon name="qr-code-scanner" type="material" size={28} color="#2196F3" />
              </View>
              <ThemedText style={styles.actionText}>Quét mã đơn</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: "#FFF3E0" }]}>
                <Icon name="inventory-2" type="material" size={28} color="#FF9800" />
              </View>
              <ThemedText style={styles.actionText}>Lấy đồ</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: "#E8F5E9" }]}>
                <Icon name="assignment-return" type="material" size={28} color="#4CAF50" />
              </View>
              <ThemedText style={styles.actionText}>Trả đồ</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: "#F3E5F5" }]}>
                <Icon name="history" type="material" size={28} color="#9C27B0" />
              </View>
              <ThemedText style={styles.actionText}>Lịch sử</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Orders Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Đơn hàng gần đây</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.viewAllText}>Xem tất cả</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.orderPreviewCard}>
            <View style={styles.orderInfo}>
              <ThemedText style={styles.orderId}>#ORD12345</ThemedText>
              <ThemedText style={styles.orderCustomer}>Nguyễn Văn A</ThemedText>
              <ThemedText style={styles.orderLocker}>Locker A-05</ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: "#FFF3E0" }]}>
              <ThemedText style={[styles.statusText, { color: "#FF9800" }]}>Chờ lấy</ThemedText>
            </View>
          </View>

          <View style={styles.orderPreviewCard}>
            <View style={styles.orderInfo}>
              <ThemedText style={styles.orderId}>#ORD12344</ThemedText>
              <ThemedText style={styles.orderCustomer}>Trần Thị B</ThemedText>
              <ThemedText style={styles.orderLocker}>Locker B-10</ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: "#F3E5F5" }]}>
              <ThemedText style={[styles.statusText, { color: "#9C27B0" }]}>Đang giặt</ThemedText>
            </View>
          </View>

          <View style={styles.orderPreviewCard}>
            <View style={styles.orderInfo}>
              <ThemedText style={styles.orderId}>#ORD12343</ThemedText>
              <ThemedText style={styles.orderCustomer}>Lê Văn C</ThemedText>
              <ThemedText style={styles.orderLocker}>Locker A-02</ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: "#E8F5E9" }]}>
              <ThemedText style={[styles.statusText, { color: "#4CAF50" }]}>Sẵn sàng</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#003D5B",
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
  notificationButton: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF5722",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  revenueCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  revenueIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  revenueInfo: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#4CAF50",
  },
  content: {
    flex: 1,
    marginTop: -8,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: "#003D5B",
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  orderPreviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  orderInfo: {
    gap: 2,
  },
  orderId: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  orderCustomer: {
    fontSize: 13,
    color: "#666",
  },
  orderLocker: {
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 100,
  },
});
