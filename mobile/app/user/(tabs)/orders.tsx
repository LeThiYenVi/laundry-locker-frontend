import { ThemedText } from "@/components/themed-text";
import { orderService } from "@/services/user";
import { Order } from "@/types";
import { Icon } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
  
  // Order detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

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
        console.log("Orders Data:", JSON.stringify(ordersList, null, 2));
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

  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null || isNaN(price)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleOrderPress = async (orderId: number) => {
    try {
      setIsLoadingDetail(true);
      setShowDetailModal(true);
      
      const response = await orderService.getOrderById(orderId);
      if (response.success && response.data) {
        setSelectedOrder(response.data);
        console.log('[OrderDetail] Full order:', JSON.stringify(response.data, null, 2));
      }
    } catch (err: any) {
      console.error('Failed to fetch order details:', err);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
      setShowDetailModal(false);
    } finally {
      setIsLoadingDetail(false);
    }
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

  // State for Tracking Modal
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null); // Using any temporarily to avoid import issue if type not refreshed, but will cast to OrderTrackingDetail
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);

  const handleTrackOrder = async (orderId: number) => {
    setIsLoadingTracking(true);
    setTrackingModalVisible(true); // Show modal immediately with loading state
    try {
        const response = await orderService.getOrderStatus(orderId);
        if (response.success) {
            setTrackingData(response.data);
        } else {
             // Fallback to local data if API fails
             throw new Error("API returned failure");
        }
    } catch (error: any) {
        // Log as warning since this is expected if backend is not fully ready
        console.warn("Tracking API not available (404/Error), using fallback data for order:", orderId);
        
        // Fallback Logic
        const localOrder = orders.find(o => o.id === orderId);
        if (localOrder) {
             console.log("Found local order data:", localOrder.id);
             const fallbackData = {
                 orderId: localOrder.id,
                 status: localOrder.status,
                 statusDescription: getStatusText(localOrder.status), 
                 pinCode: localOrder.pin,
                 lockerName: localOrder.locker?.name || "Tủ gửi đồ",
                 boxNumber: localOrder.boxId,
                 createdAt: localOrder.createdAt || new Date().toISOString(),
                 updatedAt: localOrder.updatedAt || new Date().toISOString(),
                 isPaid: false, 
                 nextAction: "Vui lòng làm mới để cập nhật chi tiết" 
             };
             
             if (localOrder.status === 'INITIALIZED') fallbackData.nextAction = "Mang đồ đến tủ và nhập mã PIN";
             else if (localOrder.status === 'RETURNED') fallbackData.nextAction = "Thanh toán để lấy đồ";
             
             setTrackingData(fallbackData);
        } else {
             console.error("No local order found for fallback with ID:", orderId);
             Alert.alert("Lỗi", "Không thể lấy thông tin vận đơn");
             setTrackingModalVisible(false);
        }
    } finally {
        setIsLoadingTracking(false);
    }
  };

  const renderTimeline = (currentStatus: string) => {
      const steps = [
          { status: 'INITIALIZED', label: 'Đã đặt' },
          { status: 'WAITING', label: 'Chờ gửi' },
          { status: 'COLLECTED', label: 'Đã thu' },
          { status: 'PROCESSING', label: 'Đang giặt' },
          { status: 'READY', label: 'Sẵn sàng' },
          { status: 'COMPLETED', label: 'Xong' },
      ];

      const currentIndex = steps.findIndex(s => s.status === currentStatus);
      // If status is RETURNED, mapped to COMPLETED logic or specific? Let's treat RETURNED/COMPLETED similar or add RETURNED step.
      // If CANCELED, plain red text.

      if (currentStatus === 'CANCELED') {
           return <ThemedText style={{color: 'red', textAlign: 'center', marginTop: 10}}>Đơn hàng đã bị hủy</ThemedText>;
      }

      return (
          <View style={styles.timelineContainer}>
              {steps.map((step, index) => {
                  const isActive = index <= (currentIndex === -1 ? 0 : currentIndex);
                  const isCurrent = index === currentIndex;
                  
                  return (
                      <View key={step.status} style={styles.timelineStep}>
                          <View style={[
                              styles.timelineDot, 
                              isActive && styles.timelineDotActive,
                              isCurrent && styles.timelineDotCurrent
                          ]}>
                              {isActive && <Icon name="check" size={10} color="#fff" />}
                          </View>
                          <ThemedText style={[
                              styles.timelineLabel, 
                              isActive && styles.timelineLabelActive
                          ]}>
                              {step.label}
                          </ThemedText>
                          {index < steps.length - 1 && (
                              <View style={[
                                  styles.timelineLine,
                                  isActive && index < currentIndex && styles.timelineLineActive
                              ]} />
                          )}
                      </View>
                  );
              })}
          </View>
      );
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
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <LinearGradient
        colors={["#ffffff", "#f0f8ff", "#d6e9f5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <ThemedText style={styles.headerTitle}>Đơn hàng</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {orders.length} đơn hàng
        </ThemedText>

        {/* DEBUG JSON */}
        {/* {orders.length > 0 && (
          <ThemedText style={{ fontSize: 10, color: 'red', marginTop: 10 }}>
            DEBUG JSON: {JSON.stringify(orders[0])}
          </ThemedText>
        )} */}

      </LinearGradient>

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
            <TouchableOpacity 
              key={order.id} 
              style={styles.ticketContainer}
              onPress={() => handleOrderPress(order.id)}
              activeOpacity={0.8}
            >
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
                  {/* Order Code/ID with Type Badge */}
                  <View style={styles.orderHeaderRow}>
                    <ThemedText style={styles.ticketOrderNumber}>
                      {order.orderCode || `Đơn #${order.id}`}
                    </ThemedText>
                    {order.type && (
                      <View style={[
                        styles.typeBadge, 
                        { backgroundColor: order.type === 'LAUNDRY' ? '#E3F2FD' : '#FFF3E0' }
                      ]}>
                        <ThemedText style={[
                          styles.typeBadgeText,
                          { color: order.type === 'LAUNDRY' ? '#1976D2' : '#E65100' }
                        ]}>
                          {order.type === 'LAUNDRY' ? '🧺' : '📦'}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  
                  {/* Locker Info */}
                  {(order.locker?.name || order.lockerName) && (
                    <View style={styles.ticketLocationRow}>
                      <Icon name="location-on" type="material" size={11} color="#666" />
                      <ThemedText style={styles.ticketLocationText} numberOfLines={1}>
                        {order.locker?.name || order.lockerName}
                      </ThemedText>
                    </View>
                  )}
                  
                  {/* Items/Services Count */}
                  {(order.items?.length || order.services?.length) ? (
                    <View style={styles.ticketItemsRow}>
                      <Icon name="list" type="material" size={11} color="#666" />
                      <ThemedText style={styles.ticketItemsText}>
                        {order.items?.length || order.services?.length} dịch vụ
                      </ThemedText>
                    </View>
                  ) : null}
                  
                  {/* Sender Info */}
                  {order.senderName && (
                    <View style={styles.ticketPersonRow}>
                      <Icon name="person" type="material" size={11} color="#666" />
                      <ThemedText style={styles.ticketPersonText} numberOfLines={1}>
                        Gửi: {order.senderName}
                      </ThemedText>
                    </View>
                  )}
                  
                  {/* Receiver Info */}
                  {order.receiverName && (
                    <View style={styles.ticketPersonRow}>
                      <Icon name="person-outline" type="material" size={11} color="#666" />
                      <ThemedText style={styles.ticketPersonText} numberOfLines={1}>
                        Nhận: {order.receiverName}
                      </ThemedText>
                    </View>
                  )}
                  
                  {/* Price Display */}
                  <View style={styles.ticketTotal}>
                    <ThemedText style={styles.ticketTotalLabel}>Tổng:</ThemedText>
                    <ThemedText style={styles.ticketTotalValue}>
                      {formatPrice(order.totalAmount || order.actualPrice || order.totalPrice || (typeof order.estimatedPrice === 'number' ? order.estimatedPrice : 0))}
                    </ThemedText>
                  </View>
                  
                  {/* Discount Info */}
                  {(order.discountAmount || order.promotionDiscount) ? (
                    <View style={styles.discountRow}>
                      <Icon name="local-offer" type="material" size={10} color="#4CAF50" />
                      <ThemedText style={styles.discountText}>
                        -{formatPrice(order.discountAmount || order.promotionDiscount)}
                      </ThemedText>
                    </View>
                  ) : null}
                  
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

                  {/* Track Button (Always visible logic or specific states? Let's show for active) */}
                  {order.status !== "CANCELED" && (
                      <TouchableOpacity
                        style={[styles.ticketButton, { backgroundColor: '#2196F3' }]}
                        onPress={() => handleTrackOrder(order.id)}
                      >
                         <ThemedText style={styles.ticketButtonText}>Theo dõi</ThemedText>
                      </TouchableOpacity>
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
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Tracking Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={trackingModalVisible}
        onRequestClose={() => setTrackingModalVisible(false)}
      >
        <View style={styles.centeredView}>
            <View style={styles.trackingModalView}>
                <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>Theo dõi đơn hàng</ThemedText>
                    <TouchableOpacity onPress={() => setTrackingModalVisible(false)}>
                        <Icon name="close" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
                
                {isLoadingTracking ? (
                    <ActivityIndicator size="large" color="#003D5B" style={{marginVertical: 40}} />
                ) : trackingData ? (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.trackingInfoContainer}>
                            <View style={styles.trackingRow}>
                                <ThemedText style={styles.trackingLabel}>Mã đơn:</ThemedText>
                                <ThemedText style={styles.trackingValue}>#{trackingData.orderId}</ThemedText>
                            </View>
                            <View style={styles.trackingRow}>
                                <ThemedText style={styles.trackingLabel}>Locker:</ThemedText>
                                <ThemedText style={styles.trackingValue}>{trackingData.lockerName || "N/A"}</ThemedText>
                            </View>
                            <View style={styles.trackingRow}>
                                <ThemedText style={styles.trackingLabel}>Ô số:</ThemedText>
                                <ThemedText style={styles.trackingValue}>{trackingData.boxNumber || "N/A"}</ThemedText>
                            </View> 
                             <View style={styles.trackingRow}>
                                <ThemedText style={styles.trackingLabel}>Mã PIN:</ThemedText>
                                <ThemedText style={[styles.trackingValue, {color: '#F59E0B', fontWeight: 'bold'}]}>{trackingData.pinCode || "******"}</ThemedText>
                            </View>
                        </View>
                        
                        <View style={styles.timelineWrapper}>
                             {renderTimeline(trackingData.status)}
                        </View>
                        
                        <View style={styles.statusDescriptionBox}>
                             <ThemedText style={styles.statusDescTitle}>Trạng thái hiện tại</ThemedText>
                             <ThemedText style={styles.statusDescText}>{trackingData.statusDescription}</ThemedText>
                             <ThemedText style={styles.nextActionText}>👉 {trackingData.nextAction}</ThemedText>
                        </View>
                    </ScrollView>
                ) : (
                    <ThemedText style={{textAlign: 'center', margin: 20}}>Không có dữ liệu</ThemedText>
                )}
            </View>
        </View>
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDetailModal}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.detailModalView}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Chi tiết đơn hàng</ThemedText>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {isLoadingDetail ? (
              <ActivityIndicator size="large" color="#003D5B" style={{marginVertical: 40}} />
            ) : selectedOrder ? (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.detailScrollView}>
                {/* Order Code & Status */}
                <View style={styles.detailSection}>
                  <ThemedText style={styles.detailOrderCode}>
                    {selectedOrder.orderCode || `Đơn #${selectedOrder.id}`}
                  </ThemedText>
                  <View style={[styles.detailStatusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                    <ThemedText style={styles.detailStatusText}>{getStatusText(selectedOrder.status)}</ThemedText>
                  </View>
                </View>

                {/* Type Badge */}
                {selectedOrder.type && (
                  <View style={styles.detailTypeBadge}>
                    <ThemedText style={styles.detailTypeText}>
                      {selectedOrder.type === 'LAUNDRY' ? '🧺 Giặt đồ' : '📦 Lưu trữ'}
                    </ThemedText>
                  </View>
                )}

                {/* Customer Info */}
                {selectedOrder.customer && (
                  <View style={styles.detailInfoBox}>
                    <ThemedText style={styles.detailInfoTitle}>Khách hàng</ThemedText>
                    <ThemedText style={styles.detailInfoText}>{selectedOrder.customer.fullName}</ThemedText>
                    <ThemedText style={styles.detailInfoSubtext}>{selectedOrder.customer.phoneNumber}</ThemedText>
                  </View>
                )}

                {/* Sender Info */}
                {selectedOrder.senderName && (
                  <View style={styles.detailInfoBox}>
                    <ThemedText style={styles.detailInfoTitle}>Người gửi</ThemedText>
                    <ThemedText style={styles.detailInfoText}>{selectedOrder.senderName}</ThemedText>
                    {selectedOrder.senderPhone && (
                      <ThemedText style={styles.detailInfoSubtext}>{selectedOrder.senderPhone}</ThemedText>
                    )}
                  </View>
                )}

                {/* Receiver Info */}
                {selectedOrder.receiverName && (
                  <View style={styles.detailInfoBox}>
                    <ThemedText style={styles.detailInfoTitle}>Người nhận</ThemedText>
                    <ThemedText style={styles.detailInfoText}>{selectedOrder.receiverName}</ThemedText>
                    {selectedOrder.receiverPhone && (
                      <ThemedText style={styles.detailInfoSubtext}>{selectedOrder.receiverPhone}</ThemedText>
                    )}
                  </View>
                )}

                {/* Locker Info */}
                <View style={styles.detailInfoBox}>
                  <ThemedText style={styles.detailInfoTitle}>Vị trí</ThemedText>
                  <ThemedText style={styles.detailInfoText}>
                    {selectedOrder.locker?.name || selectedOrder.lockerName || 'N/A'}
                  </ThemedText>
                  <ThemedText style={styles.detailInfoSubtext}>
                    Ô số: {selectedOrder.boxNumber || selectedOrder.sendBoxNumber || 'N/A'}
                  </ThemedText>
                </View>

                {/* PIN Code */}
                {(selectedOrder.pin || selectedOrder.pinCode) && (
                  <View style={styles.detailPinBox}>
                    <ThemedText style={styles.detailPinLabel}>Mã PIN</ThemedText>
                    <ThemedText style={styles.detailPinValue}>{selectedOrder.pinCode || selectedOrder.pin}</ThemedText>
                  </View>
                )}

                {/* Items/Services */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <View style={styles.detailInfoBox}>
                    <ThemedText style={styles.detailInfoTitle}>Dịch vụ</ThemedText>
                    {selectedOrder.items.map((item, index) => (
                      <View key={index} style={styles.detailItemRow}>
                        <ThemedText style={styles.detailItemName}>{item.serviceName || 'Dịch vụ'}</ThemedText>
                        <ThemedText style={styles.detailItemPrice}>{formatPrice(item.subtotal || item.price)}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Pricing */}
                <View style={styles.detailPriceBox}>
                  {selectedOrder.estimatedPrice && (
                    <View style={styles.detailPriceRow}>
                      <ThemedText style={styles.detailPriceLabel}>Giá ước tính</ThemedText>
                      <ThemedText style={styles.detailPriceValue}>
                        {formatPrice(typeof selectedOrder.estimatedPrice === 'number' ? selectedOrder.estimatedPrice : 0)}
                      </ThemedText>
                    </View>
                  )}
                  {selectedOrder.actualPrice && (
                    <View style={styles.detailPriceRow}>
                      <ThemedText style={styles.detailPriceLabel}>Giá thực tế</ThemedText>
                      <ThemedText style={styles.detailPriceValue}>{formatPrice(selectedOrder.actualPrice)}</ThemedText>
                    </View>
                  )}
                  {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                    <View style={styles.detailPriceRow}>
                      <ThemedText style={styles.detailPriceLabel}>Giảm giá</ThemedText>
                      <ThemedText style={[styles.detailPriceValue, {color: '#4CAF50'}]}>-{formatPrice(selectedOrder.discountAmount)}</ThemedText>
                    </View>
                  )}
                  <View style={[styles.detailPriceRow, styles.detailTotalRow]}>
                    <ThemedText style={styles.detailTotalLabel}>Tổng cộng</ThemedText>
                    <ThemedText style={styles.detailTotalValue}>
                      {formatPrice(selectedOrder.totalAmount || selectedOrder.actualPrice || selectedOrder.totalPrice || 0)}
                    </ThemedText>
                  </View>
                </View>

                {/* Payment Status */}
                {selectedOrder.payment && (
                  <View style={styles.detailInfoBox}>
                    <ThemedText style={styles.detailInfoTitle}>Thanh toán</ThemedText>
                    <ThemedText style={styles.detailInfoText}>
                      {selectedOrder.payment.status === 'COMPLETED' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                    </ThemedText>
                    {selectedOrder.payment.method && (
                      <ThemedText style={styles.detailInfoSubtext}>Phương thức: {selectedOrder.payment.method}</ThemedText>
                    )}
                  </View>
                )}

                {/* Timestamps */}
                <View style={styles.detailInfoBox}>
                  <ThemedText style={styles.detailInfoTitle}>Thời gian</ThemedText>
                  <ThemedText style={styles.detailInfoSubtext}>Tạo: {formatDate(selectedOrder.createdAt)}</ThemedText>
                  {selectedOrder.confirmedAt && (
                    <ThemedText style={styles.detailInfoSubtext}>Xác nhận: {formatDate(selectedOrder.confirmedAt)}</ThemedText>
                  )}
                  {selectedOrder.completedAt && (
                    <ThemedText style={styles.detailInfoSubtext}>Hoàn thành: {formatDate(selectedOrder.completedAt)}</ThemedText>
                  )}
                </View>

                <View style={{height: 20}} />
              </ScrollView>
            ) : (
              <ThemedText style={{textAlign: 'center', margin: 20}}>Không có dữ liệu</ThemedText>
            )}
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#003D5B",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#003D5B",
    opacity: 0.8,
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
  // New styles for enhanced order display
  orderHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 12,
  },
  ticketLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  ticketLocationText: {
    fontSize: 11,
    color: "#666",
    flex: 1,
  },
  ticketItemsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  ticketItemsText: {
    fontSize: 11,
    color: "#666",
  },
  ticketPersonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  ticketPersonText: {
    fontSize: 11,
    color: "#555",
    flex: 1,
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  discountText: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "600",
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
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
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
  
  // Modal Styles
  centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
  },
  trackingModalView: {
      width: '90%',
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 20,
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      paddingBottom: 10,
  },
  modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#003D5B',
  },
  trackingInfoContainer: {
      marginBottom: 20,
      backgroundColor: '#F7FAFC',
      padding: 16,
      borderRadius: 12,
  },
  trackingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
  },
  trackingLabel: {
      color: '#666',
      fontSize: 14,
  },
  trackingValue: {
      fontWeight: '600',
      color: '#333',
      fontSize: 14,
  },
  timelineWrapper: {
      marginBottom: 20,
  },
  timelineContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      position: 'relative',
      paddingHorizontal: 4,
  },
  timelineStep: {
      alignItems: 'center',
      width: 50,
      position: 'relative',
  },
  timelineDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#E2E8F0',
      marginBottom: 4,
      zIndex: 2,
      justifyContent: 'center',
      alignItems: 'center',
  },
  timelineDotActive: {
      backgroundColor: '#4CAF50',
  },
  timelineDotCurrent: {
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#003D5B',
      borderWidth: 2,
      borderColor: '#fff',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      elevation: 3,
  },
  timelineLabel: {
      fontSize: 8,
      textAlign: 'center',
      color: '#CBD5E0',
  },
  timelineLabelActive: {
      color: '#003D5B',
      fontWeight: '700',
  },
  timelineLine: {
      position: 'absolute',
      top: 6,
      left: '50%',
      width: '100%',
      height: 2,
      backgroundColor: '#E2E8F0',
      zIndex: 1,
  },
  timelineLineActive: {
      backgroundColor: '#4CAF50',
  },
  statusDescriptionBox: {
      backgroundColor: '#EBF8FF',
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: '#003D5B',
  },
  statusDescTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#003D5B',
      marginBottom: 4,
  },
  statusDescText: {
      fontSize: 13,
      color: '#4A5568',
      marginBottom: 8,
  },
  nextActionText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#2F855A',
  },
  // Order Detail Modal Styles
  detailModalView: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: "100%",
    maxHeight: "90%",
  },
  detailScrollView: {
    maxHeight: "90%",
  },
  detailSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailOrderCode: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  detailStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  detailTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F4F8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailTypeText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  detailInfoBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  detailInfoTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  detailInfoText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
    marginBottom: 2,
  },
  detailInfoSubtext: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  detailPinBox: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  detailPinLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
  },
  detailPinValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#92400E",
    letterSpacing: 4,
  },
  detailItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailItemName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  detailItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  detailPriceBox: {
    backgroundColor: "#F0F4F8",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  detailPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  detailPriceLabel: {
    fontSize: 13,
    color: "#666",
  },
  detailPriceValue: {
    fontSize: 13,
    color: "#333",
  },
  detailTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
    marginTop: 8,
    paddingTop: 8,
  },
  detailTotalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  detailTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003D5B",
  },
});
