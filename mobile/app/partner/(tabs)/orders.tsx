import { ThemedText } from "@/components/themed-text";
import { partnerOrderService } from "@/services/partner";
import { orderService } from "@/services/user";
import { Order, OrderItem, OrderStatus } from "@/types";
import { Icon } from "@rneui/themed";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type FilterStatus = "ALL" | OrderStatus;

const statusFilters: { label: string; value: FilterStatus; color: string }[] = [
  { label: "Tất cả", value: "ALL", color: "#666" },
  { label: "Chờ lấy", value: "WAITING", color: "#FF9800" },
  { label: "Đã lấy", value: "COLLECTED", color: "#2196F3" },
  { label: "Đang xử lý", value: "PROCESSING", color: "#9C27B0" },
  { label: "Sẵn sàng", value: "READY", color: "#4CAF50" },
  { label: "Đã trả", value: "RETURNED", color: "#00BCD4" },
];

const getStatusInfo = (status: OrderStatus): { label: string; color: string; bgColor: string } => {
  switch (status) {
    case "INITIALIZED":
      return { label: "Khởi tạo", color: "#9E9E9E", bgColor: "#F5F5F5" };
    case "WAITING":
      return { label: "Chờ lấy", color: "#FF9800", bgColor: "#FFF3E0" };
    case "COLLECTED":
      return { label: "Đã lấy", color: "#2196F3", bgColor: "#E3F2FD" };
    case "PROCESSING":
      return { label: "Đang xử lý", color: "#9C27B0", bgColor: "#F3E5F5" };
    case "READY":
      return { label: "Sẵn sàng", color: "#4CAF50", bgColor: "#E8F5E9" };
    case "RETURNED":
      return { label: "Đã trả", color: "#00BCD4", bgColor: "#E0F7FA" };
    case "COMPLETED":
      return { label: "Hoàn thành", color: "#8BC34A", bgColor: "#F1F8E9" };
    case "CANCELED":
      return { label: "Đã hủy", color: "#F44336", bgColor: "#FFEBEE" };
    default:
      return { label: status, color: "#666", bgColor: "#F5F5F5" };
  }
};

const getNextAction = (status: OrderStatus): { label: string; action: string; icon: string } | null => {
  switch (status) {
    case "WAITING":
      return { label: "Lấy đồ", action: "collect", icon: "inventory-2" };
    case "COLLECTED":
      return { label: "Bắt đầu xử lý", action: "process", icon: "local-laundry-service" };
    case "PROCESSING":
      return { label: "Đánh dấu sẵn sàng", action: "ready", icon: "done-all" };
    case "READY":
      return { label: "Trả đồ", action: "return", icon: "assignment-return" };
    default:
      return null;
  }
};

export default function PartnerOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnBoxId, setReturnBoxId] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      // Fetch orders from API
      const response = await orderService.getOrders(0, 50);
      if (response.success) {
        // Filter orders that staff can manage (WAITING, COLLECTED, PROCESSING, READY)
        const manageableStatuses: OrderStatus[] = ["WAITING", "COLLECTED", "PROCESSING", "READY", "RETURNED"];
        const manageableOrders = response.data.content.filter(
          (order) => manageableStatuses.includes(order.status)
        );
        setOrders(manageableOrders);
      }
    } catch (error: any) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    let result = orders;
    if (selectedFilter !== "ALL") {
      result = result.filter((o) => o.status === selectedFilter);
    }
    if (searchQuery.trim()) {
      result = result.filter(
        (o) =>
          o.id.toString().includes(searchQuery) ||
          o.pin?.includes(searchQuery)
      );
    }
    setFilteredOrders(result);
  }, [orders, selectedFilter, searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrders();
  };

  const handleAction = async (order: Order, action: string) => {
    if (action === "return") {
      setSelectedOrder(order);
      setShowReturnModal(true);
      return;
    }

    const actionLabel = getNextAction(order.status)?.label.toLowerCase();
    
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc muốn ${actionLabel} đơn hàng #${order.id}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            setIsActionLoading(true);
            try {
              let response;
              switch (action) {
                case "collect":
                  response = await partnerOrderService.collectOrder(order.id);
                  break;
                case "process":
                  response = await partnerOrderService.processOrder(order.id);
                  break;
                case "ready":
                  response = await partnerOrderService.markReady(order.id);
                  break;
                default:
                  return;
              }

              if (response.success) {
                // Update local state with new order data
                setOrders((prev) =>
                  prev.map((o) => (o.id === order.id ? response.data : o))
                );
                Alert.alert("Thành công", `Đã ${actionLabel} đơn hàng #${order.id}`);
              } else {
                Alert.alert("Lỗi", response.message || "Thao tác thất bại");
              }
            } catch (error: any) {
              Alert.alert("Lỗi", error.response?.data?.message || "Thao tác thất bại");
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReturnOrder = async () => {
    if (!selectedOrder || !returnBoxId.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã box trả đồ");
      return;
    }

    const boxId = parseInt(returnBoxId, 10);
    if (isNaN(boxId)) {
      Alert.alert("Lỗi", "Mã box không hợp lệ");
      return;
    }

    setIsActionLoading(true);
    try {
      const response = await partnerOrderService.returnOrder(selectedOrder.id, boxId);
      if (response.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? response.data : o))
        );
        Alert.alert("Thành công", `Đã trả đồ vào Box ${boxId}`);
        setShowReturnModal(false);
        setSelectedOrder(null);
        setReturnBoxId("");
      } else {
        Alert.alert("Lỗi", response.message || "Không thể trả đồ");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể trả đồ");
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusInfo = getStatusInfo(item.status);
    const nextAction = getNextAction(item.status);

    return (
      <View style={styles.orderCard}>
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <ThemedText style={styles.orderId}>Đơn #{item.id}</ThemedText>
            {item.pin && (
              <View style={styles.pinContainer}>
                <Icon name="key" type="material" size={12} color="#666" />
                <ThemedText style={styles.orderPin}>{item.pin}</ThemedText>
              </View>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </ThemedText>
          </View>
        </View>

        {/* Location & Time */}
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Icon name="inbox" type="material" size={16} color="#666" />
            <ThemedText style={styles.detailText}>
              Locker {item.lockerId} - Box {item.boxId}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <Icon name="schedule" type="material" size={16} color="#666" />
            <ThemedText style={styles.detailText}>
              {formatDateTime(item.createdAt)}
            </ThemedText>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          <ThemedText style={styles.itemsTitle}>Chi tiết dịch vụ:</ThemedText>
          {item.items.map((orderItem: OrderItem) => (
            <View key={orderItem.id} style={styles.itemRow}>
              <ThemedText style={styles.itemName}>
                {orderItem.serviceName}
              </ThemedText>
              <ThemedText style={styles.itemQty}>x{orderItem.quantity}</ThemedText>
              <ThemedText style={styles.itemPrice}>
                {formatCurrency(orderItem.subtotal)}
              </ThemedText>
            </View>
          ))}
          <View style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>Tổng cộng</ThemedText>
            <ThemedText style={styles.totalValue}>
              {formatCurrency(item.totalAmount)}
            </ThemedText>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {item.confirmedAt && (
            <ThemedText style={styles.timelineText}>
              ✓ Xác nhận: {formatDateTime(item.confirmedAt)}
            </ThemedText>
          )}
          {item.collectedAt && (
            <ThemedText style={styles.timelineText}>
              ✓ Lấy đồ: {formatDateTime(item.collectedAt)}
            </ThemedText>
          )}
          {item.processedAt && (
            <ThemedText style={styles.timelineText}>
              ✓ Xử lý: {formatDateTime(item.processedAt)}
            </ThemedText>
          )}
          {item.readyAt && (
            <ThemedText style={styles.timelineText}>
              ✓ Sẵn sàng: {formatDateTime(item.readyAt)}
            </ThemedText>
          )}
          {item.returnedAt && (
            <ThemedText style={styles.timelineText}>
              ✓ Đã trả: {formatDateTime(item.returnedAt)}
            </ThemedText>
          )}
        </View>

        {/* Action Button */}
        {nextAction && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: statusInfo.color }]}
            onPress={() => handleAction(item, nextAction.action)}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name={nextAction.icon} type="material" size={20} color="#fff" />
                <ThemedText style={styles.actionButtonText}>{nextAction.label}</ThemedText>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
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
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Quản lý đơn hàng</ThemedText>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Icon name="search" type="material" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo mã đơn hoặc PIN..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="close" type="material" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={statusFilters}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(item.value)}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  selectedFilter === item.value && styles.filterTextActive,
                ]}
              >
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.value}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inbox" type="material" size={64} color="#CCC" />
            <ThemedText style={styles.emptyText}>Không có đơn hàng nào</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Đơn hàng cần xử lý sẽ hiển thị tại đây
            </ThemedText>
          </View>
        }
      />

      {/* Return Modal */}
      <Modal
        visible={showReturnModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReturnModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Trả đồ cho khách</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              Đơn hàng #{selectedOrder?.id} - PIN: {selectedOrder?.pin}
            </ThemedText>

            <View style={styles.modalInfoCard}>
              <ThemedText style={styles.modalInfoLabel}>Locker hiện tại:</ThemedText>
              <ThemedText style={styles.modalInfoValue}>
                Locker {selectedOrder?.lockerId} - Box {selectedOrder?.boxId}
              </ThemedText>
            </View>

            <View style={styles.modalInputGroup}>
              <ThemedText style={styles.modalLabel}>Mã Box trả đồ *</ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập mã box mới..."
                placeholderTextColor="#999"
                value={returnBoxId}
                onChangeText={setReturnBoxId}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowReturnModal(false);
                  setReturnBoxId("");
                }}
              >
                <ThemedText style={styles.modalCancelText}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, isActionLoading && { opacity: 0.7 }]}
                onPress={handleReturnOrder}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <ThemedText style={styles.modalConfirmText}>Xác nhận trả đồ</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "#003D5B",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: "#000",
  },
  filterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  filterChipActive: {
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
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderIdContainer: {
    gap: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },
  pinContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  orderPin: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  orderDetails: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#666",
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  itemQty: {
    fontSize: 14,
    color: "#666",
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    width: 80,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#003D5B",
  },
  timelineContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  timelineText: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInfoCard: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  modalInfoLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  modalInputGroup: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#000",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    alignItems: "center",
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
