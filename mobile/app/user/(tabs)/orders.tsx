import { ThemedText } from "@/components/themed-text";
import { orderService } from "@/services/user";
import { Order } from "@/types";
import { Icon } from "@rneui/themed";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type OrderFilter = "ALL" | "INITIALIZED" | "WAITING" | "PROCESSING" | "COMPLETED";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<OrderFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filters: { value: OrderFilter; label: string }[] = [
    { value: "ALL", label: "Tất cả" },
    { value: "INITIALIZED", label: "Khởi tạo" },
    { value: "WAITING", label: "Chờ xử lý" },
    { value: "PROCESSING", label: "Đang giặt" },
    { value: "COMPLETED", label: "Hoàn thành" },
  ];

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await orderService.getOrders();
      if (response.success && response.data) {
        // API returns PaginatedResponse<Order>
        const ordersList = response.data.content || [];
        setOrders(ordersList);
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    // Filter orders based on selected filter
    if (selectedFilter === "ALL") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((o) => o.status === selectedFilter));
    }
  }, [orders, selectedFilter]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "INITIALIZED":
        return "#2196F3"; // Blue
      case "WAITING":
        return "#FF9800"; // Orange
      case "COLLECTED":
        return "#9C27B0"; // Purple
      case "PROCESSING":
        return "#FF5722"; // Deep Orange
      case "READY":
        return "#00BCD4"; // Cyan
      case "RETURNED":
        return "#4CAF50"; // Green
      case "COMPLETED":
        return "#4CAF50"; // Green
      case "CANCELED":
        return "#9E9E9E"; // Gray
      default:
        return "#666";
    }
  };

  const getStatusGradient = (status: string): string[] => {
    switch (status) {
      case "INITIALIZED":
        return ["#4A90E2", "#357ABD"];
      case "WAITING":
        return ["#FF9800", "#F57C00"];
      case "COLLECTED":
        return ["#9C27B0", "#7B1FA2"];
      case "PROCESSING":
        return ["#FF5722", "#E64A19"];
      case "READY":
        return ["#00BCD4", "#0097A7"];
      case "RETURNED":
        return ["#4CAF50", "#388E3C"];
      case "COMPLETED":
        return ["#4CAF50", "#388E3C"];
      case "CANCELED":
        return ["#9E9E9E", "#757575"];
      default:
        return ["#666", "#444"];
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "INITIALIZED":
        return "Khởi tạo";
      case "WAITING":
        return "Chờ thu gom";
      case "COLLECTED":
        return "Đã thu gom";
      case "PROCESSING":
        return "Đang giặt";
      case "READY":
        return "Sẵn sàng";
      case "RETURNED":
        return "Đã trả";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleConfirmOrder = async (orderId: number) => {
    try {
      const response = await orderService.confirmOrder(orderId);
      if (response.success) {
        // Refresh orders list
        fetchOrders(true);
      }
    } catch (err: any) {
      console.error("Failed to confirm order:", err);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      const response = await orderService.cancelOrder(orderId, "Khách hủy");
      if (response.success) {
        // Refresh orders list
        fetchOrders(true);
      }
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#003D5B" />
        <ThemedText style={styles.loadingText}>Đang tải đơn hàng...</ThemedText>
      </View>
    );
  }

  if (error && orders.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error-outline" type="material" size={64} color="#F44336" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchOrders()}>
          <ThemedText style={styles.retryText}>Thử lại</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Đơn hàng</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {orders.length} đơn hàng
        </ThemedText>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => {
            const count = filter.value === "ALL" 
              ? orders.length 
              : orders.filter((o) => o.status === filter.value).length;
            
            return (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.value && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(filter.value)}
              >
                <ThemedText
                  style={[
                    styles.filterText,
                    selectedFilter === filter.value && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </ThemedText>
                <View
                  style={[
                    styles.filterBadge,
                    selectedFilter === filter.value && styles.filterBadgeActive,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.filterBadgeText,
                      selectedFilter === filter.value && styles.filterBadgeTextActive,
                    ]}
                  >
                    {count}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchOrders(true)}
            colors={["#003D5B"]}
          />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="inbox" type="material" size={64} color="#999" />
            <ThemedText style={styles.emptyText}>
              Không có đơn hàng nào
            </ThemedText>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.ticketContainer}>
              {/* Blue Accent Line */}
              <View style={styles.ticketAccent} />
              
              {/* Left Notch */}
              <View style={[styles.notch, styles.notchLeft]} />
              
              {/* Right Notch */}
              <View style={[styles.notch, styles.notchRight]} />
              
              {/* Ticket Content */}
              <View style={styles.ticketContent}>
                {/* Left Section */}
                <View style={styles.ticketLeft}>
                  <ThemedText style={styles.ticketOrderNumber}>Đơn #{order.id}</ThemedText>
                  
                  <View style={styles.ticketTotal}>
                    <ThemedText style={styles.ticketTotalLabel}>Tổng:</ThemedText>
                    <ThemedText style={styles.ticketTotalValue}>
                      {formatPrice(order.totalAmount)}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.ticketTime}>
                    <Icon name="schedule" type="material" size={11} color="#9CA3AF" />
                    <ThemedText style={styles.ticketTimeText}>
                      {formatDate(order.createdAt)}
                    </ThemedText>
                  </View>
                </View>
                
                {/* Vertical Dashed Line */}
                <View style={styles.ticketDivider} />
                
                {/* Right Section */}
                <View style={styles.ticketRight}>
                  <View style={[styles.ticketStatus, { backgroundColor: getStatusColor(order.status) }]}>
                    <ThemedText style={styles.ticketStatusText}>
                      {getStatusText(order.status)}
                    </ThemedText>
                  </View>
                  
                  {order.pin && (
                    <View style={styles.ticketPin}>
                      <Icon name="lock" type="material" size={12} color="#F59E0B" />
                      <ThemedText style={styles.ticketPinText}>{order.pin}</ThemedText>
                    </View>
                  )}
                  
                  {order.status === "INITIALIZED" && (
                    <TouchableOpacity
                      style={styles.ticketButton}
                      onPress={() => handleConfirmOrder(order.id)}
                    >
                      <ThemedText style={styles.ticketButtonText}>Xác nhận</ThemedText>
                    </TouchableOpacity>
                  )}
                  
                  {(order.status === "WAITING" || order.status === "COLLECTED") && (
                    <TouchableOpacity
                      style={[styles.ticketButton, styles.ticketButtonCancel]}
                      onPress={() => handleCancelOrder(order.id)}
                    >
                      <ThemedText style={styles.ticketButtonCancelText}>Hủy đơn</ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))
        )}

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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    backgroundColor: "#003D5B",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#003D5B",
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  filterContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  filterTabActive: {
    backgroundColor: "#003D5B",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
  },
  filterBadge: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666",
  },
  filterBadgeTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: "#999",
  },
  orderCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  pinContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  pinLabel: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  pinCode: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FF9800",
    marginLeft: "auto",
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: "#000",
  },
  itemQuantity: {
    fontSize: 13,
    color: "#666",
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#003D5B",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#003D5B",
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#F44336",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F44336",
  },

  // Ticket-Style Design
  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  ticketHeader: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  ticketHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ticketOrderId: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.5,
  },
  ticketStatusBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  ticketStatusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  perforatedEdge: {
    height: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  dashedLine: {
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginHorizontal: 20,
  },
  ticketBody: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pinBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FFE0B2",
  },
  pinLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E65100",
  },
  pinValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#E65100",
    letterSpacing: 2,
  },
  servicesSection: {
    marginBottom: 16,
  },
  servicesSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  serviceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  serviceBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4A90E2",
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  serviceQuantity: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    marginLeft: 8,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 12,
  },
  totalDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalAmountBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  timestampRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  timestampText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  ticketActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  ticketButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  ticketButtonPrimary: {
    // Gradient will be applied via LinearGradient
  },
  ticketButtonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FEE2E2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  ticketButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  ticketButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  ticketButtonTextSecondary: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F44336",
    letterSpacing: 0.3,
  },

  // Notch Cuts Design
  // Ticket-style order cards
  ticketContainer: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  ticketAccent: {
    position: "absolute",
    width: 4,
    height: "100%",
    backgroundColor: "#3B82F6",
    left: 0,
    top: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  notch: {
    position: "absolute",
    width: 20,
    height: 20,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    top: "50%",
    marginTop: -10,
    zIndex: 10,
  },
  notchLeft: {
    left: -10,
  },
  notchRight: {
    right: -10,
  },
  ticketContent: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  ticketLeft: {
    flex: 2,
    paddingRight: 12,
    justifyContent: "center",
  },
  ticketOrderNumber: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 6,
  },
  ticketTotal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  ticketTotalLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  ticketTotalValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  ticketTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ticketTimeText: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  ticketDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 12,
    borderStyle: "dashed",
    borderLeftWidth: 1,
    borderLeftColor: "#E5E7EB",
  },
  ticketRight: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ticketStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  ticketStatusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  ticketPin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ticketPinText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#D97706",
    letterSpacing: 1,
  },
  ticketButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ticketButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  ticketButtonCancel: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  ticketButtonCancelText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EF4444",
  },
  bottomSpacer: {
    height: 100,
  },
});
