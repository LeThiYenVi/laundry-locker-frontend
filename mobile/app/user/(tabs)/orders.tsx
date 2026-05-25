import { AppModalHeader } from "@/components/app-modal-header";
import { ThemedText } from "@/components/themed-text";
import { orderService, paymentService } from "@/services/user";
import {
  Order,
  OrderRatingRequest,
  OrderRatingResponse,
  OrderComplaintRequest,
  OrderComplaintResponse,
  RefundResponse,
} from "@/types";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import QRCode from "react-native-qrcode-svg";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  FlatList,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type OrderFilter =
  | "ALL"
  | "INITIALIZED"
  | "WAITING"
  | "PROCESSING"
  | "COMPLETED";

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
      return ["#66", "#444"];
  }
};

const getStatusText = (status: string, type?: string): string => {
  switch (status) {
    case "INITIALIZED":
      return type === "STORAGE" ? "Chờ gửi đồ" : "Khởi tạo";
    case "WAITING":
      return type === "STORAGE" ? "Đang giữ đồ" : "Chờ thu gom";
    case "COLLECTED":
      return "Đã thu gom";
    case "PROCESSING":
      return "Đang giặt";
    case "READY":
      return "Sẵn sàng";
    case "RETURNED":
      return "Đã trả";
    case "COMPLETED":
      return type === "STORAGE" ? "Đã lấy đồ" : "Hoàn thành";
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

const isOrderPaid = (order: Order): boolean => {
  if (order.isPaid === true) return true;
  const paymentStatus = (order.payment?.status || "").toUpperCase();
  return ["SUCCESS", "COMPLETED", "PAID"].includes(paymentStatus);
};

const isOrderUnpaid = (order: Order): boolean => {
  if (order.paymentRequired === false) return false;
  return !isOrderPaid(order);
};

// Extract Memoized component for better FlatList performance
interface MemoizedOrderCardProps {
  order: Order;
  orderRatingsMap: Record<number, any>;
  handleOrderPress: (orderId: number) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string, type?: string) => string;
  formatDate: (dateString?: string) => string;
  formatPrice: (price: number | undefined | null) => string;
  handleTrackOrder: (orderId: number) => void;
  handlePayOrder: (orderId: number) => void;
  handleCancelOrder: (orderId: number) => void;
  payingOrderId: number | null;
}

const MemoizedOrderCard = memo(
  ({
    order,
    orderRatingsMap,
    handleOrderPress,
    getStatusColor,
    getStatusText,
    formatDate,
    formatPrice,
    handleTrackOrder,
    handlePayOrder,
    handleCancelOrder,
    payingOrderId,
  }: MemoizedOrderCardProps) => {
    return (
      <TouchableOpacity
        style={styles.modernCard}
        onPress={() => handleOrderPress(order.id)}
        activeOpacity={0.8}
      >
        {/* Top Accent Line */}
        <View
          style={[
            styles.cardAccentTop,
            { backgroundColor: getStatusColor(order.status) },
          ]}
        />

        {/* Header: ID + Status */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <ThemedText
              style={styles.modernOrderNumber}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {order.orderCode || `Đơn #${order.id}`}
            </ThemedText>
            {order.type && (
              <View
                style={[
                  styles.modernTypeBadge,
                  {
                    backgroundColor:
                      order.type === "LAUNDRY" ? "#E3F2FD" : "#FFF3E0",
                  },
                ]}
              >
                <ThemedText style={{ fontSize: 12 }}>
                  {order.type === "LAUNDRY" ? "🧺" : "📦"}
                </ThemedText>
              </View>
            )}
          </View>
          <View
            style={[
              styles.modernStatusBadge,
              { backgroundColor: getStatusColor(order.status) },
            ]}
          >
            <ThemedText
              style={styles.modernStatusText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {getStatusText(order.status, order.type)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.modernCardDivider} />

        {/* Body: Order Details */}
        <View style={styles.cardBody}>
          {/* Info Row 1 */}
          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <View style={styles.infoLabelRow}>
                <Icon name="location-on" size={12} color="#888" />
                <ThemedText style={styles.infoLabel}>Tủ đồ</ThemedText>
              </View>
              <ThemedText style={styles.infoValue} numberOfLines={1}>
                {order.locker?.name || order.lockerName || "N/A"}
              </ThemedText>
            </View>

            <View style={styles.infoColumn}>
              <View style={styles.infoLabelRow}>
                <Icon name="list" size={12} color="#888" />
                <ThemedText style={styles.infoLabel}>Dịch vụ</ThemedText>
              </View>
              <ThemedText style={styles.infoValue}>
                {order.orderDetails?.length ||
                  order.items?.length ||
                  order.services?.length ||
                  0}{" "}
                món
              </ThemedText>
            </View>
          </View>

          {/* Info Row 2 */}
          <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
              <View style={styles.infoLabelRow}>
                <Icon name="payments" size={12} color="#888" />
                <ThemedText style={styles.infoLabel}>Tổng tiền</ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.infoValue,
                  { color: "#003D5B", fontWeight: "bold" },
                ]}
              >
                {formatPrice(
                  order.totalPrice ||
                    order.totalAmount ||
                    order.actualPrice ||
                    (typeof order.estimatedPrice === "number"
                      ? order.estimatedPrice
                      : 0),
                )}
              </ThemedText>
            </View>

            {/* Optional PIN space if available */}
            {order.pin ? (
              <View style={styles.infoColumn}>
                <View style={[styles.infoLabelRow, styles.pinHighlightBg]}>
                  <Icon name="lock" size={12} color="#E65100" />
                  <ThemedText style={styles.pinHighlightLabel}>
                    Mã PIN
                  </ThemedText>
                </View>
                <ThemedText style={styles.pinHighlightValue}>
                  {order.pin}
                </ThemedText>
              </View>
            ) : (
              <View style={styles.infoColumn}>
                <View style={styles.infoLabelRow}>
                  <Icon name="person" size={12} color="#888" />
                  <ThemedText style={styles.infoLabel}>Người gửi</ThemedText>
                </View>
                <ThemedText style={styles.infoValue} numberOfLines={1}>
                  {order.senderName || "N/A"}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Footer: Time + Actions */}
        <View style={styles.cardFooter}>
          <View style={styles.cardTimeBox}>
            <Icon name="schedule" size={12} color="#888" />
            <ThemedText style={styles.cardTimeText}>
              {formatDate(order.createdAt)}
            </ThemedText>
          </View>

          <View style={styles.cardActions}>
            {order.status !== "CANCELED" && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#E3F2FD" }]}
                onPress={() => handleTrackOrder(order.id)}
              >
                <ThemedText
                  style={[styles.actionBtnText, { color: "#1976D2" }]}
                >
                  Theo dõi
                </ThemedText>
              </TouchableOpacity>
            )}

            {order.status !== "CANCELED" &&
              order.type !== "STORAGE" &&
              isOrderUnpaid(order) && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: "#FFF0F6" }]}
                  onPress={() => handlePayOrder(order.id)}
                  disabled={payingOrderId === order.id}
                >
                  {payingOrderId === order.id ? (
                    <ActivityIndicator size="small" color="#A50064" />
                  ) : (
                    <ThemedText
                      style={[styles.actionBtnText, { color: "#A50064" }]}
                    >
                      Thanh toán
                    </ThemedText>
                  )}
                </TouchableOpacity>
              )}

            {(order.status === "INITIALIZED" ||
              (order.status === "WAITING" && order.type !== "STORAGE") ||
              order.status === "COLLECTED") && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#FFEBEE" }]}
                onPress={() => handleCancelOrder(order.id)}
              >
                <ThemedText
                  style={[styles.actionBtnText, { color: "#C62828" }]}
                >
                  Hủy đơn
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<OrderFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Order detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Rating state
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [existingRating, setExistingRating] =
    useState<OrderRatingResponse | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Complaint state
  const [existingComplaints, setExistingComplaints] = useState<
    OrderComplaintResponse[]
  >([]);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintType, setComplaintType] = useState<
    "DAMAGED" | "MISSING" | "WRONG_ITEM" | "QUALITY" | "OTHER"
  >("DAMAGED");
  const [complaintDesc, setComplaintDesc] = useState("");
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  // Refund state
  const [orderRefunds, setOrderRefunds] = useState<RefundResponse[]>([]);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  // Reorder state
  const [isReordering, setIsReordering] = useState(false);

  // Timeline detail state
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [showTimelineDetail, setShowTimelineDetail] = useState(false);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  // MoMo quick payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);
  const [momoPaymentUrl, setMomoPaymentUrl] = useState("");
  const [momoQrCodeData, setMomoQrCodeData] = useState<string | null>(null);
  const [isPollingPayment, setIsPollingPayment] = useState(false);
  const paymentPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filters: { value: OrderFilter; label: string }[] = [
    { value: "ALL", label: "Tất cả" },
    { value: "INITIALIZED", label: "Khởi tạo/Chờ gửi" },
    { value: "WAITING", label: "Chờ xử lý/Giữ đồ" },
    { value: "PROCESSING", label: "Đang giặt" },
    { value: "COMPLETED", label: "Hoàn thành" },
  ];

  const [orderRatingsMap, setOrderRatingsMap] = useState<Record<number, any>>(
    {},
  );

  const fetchOrders = useCallback(
    async (
      page: number = 0,
      options?: { isRefresh?: boolean; append?: boolean },
    ) => {
      const isRefresh = options?.isRefresh ?? false;
      const append = options?.append ?? false;

      try {
        if (append) {
          setIsLoadingMore(true);
        } else if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        if (!append) {
          setError(null);
        }

        const shouldFetchRatings = page === 0 && !append;
        let response: any;
        let ratingsRes: any = null;

        if (shouldFetchRatings) {
          [response, ratingsRes] = await Promise.all([
            orderService.getOrders(page, 10),
            orderService
              .getMyRatings()
              .catch(() => ({ success: false, data: [] })),
          ]);
        } else {
          response = await orderService.getOrders(page, 10);
        }

        if (response.success && response.data) {
          // API returns PaginatedResponse<Order>
          const ordersList = response.data.content || [];
          setOrders((prev) => {
            if (!append) {
              return ordersList;
            }

            const existingIds = new Set(prev.map((o) => o.id));
            const nextItems = ordersList.filter(
              (o: Order) => !existingIds.has(o.id),
            );
            return [...prev, ...nextItems];
          });
          setCurrentPage(response.data.number ?? 0);
          setTotalPages(response.data.totalPages ?? 1);
        }

        if (ratingsRes.success && ratingsRes.data) {
          const rMap: Record<number, any> = {};
          ratingsRes.data.forEach((r: any) => {
            rMap[r.orderId] = r;
          });
          setOrderRatingsMap(rMap);
        }
      } catch (err: any) {
        if (!append) {
          setError(err.message || "Không thể tải danh sách đơn hàng");
        }
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else if (isRefresh) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    fetchOrders(0);
  }, [fetchOrders]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || isRefreshing || isLoadingMore) return;
    if (currentPage >= totalPages - 1) return;

    fetchOrders(currentPage + 1, { append: true });
  }, [
    currentPage,
    fetchOrders,
    isLoading,
    isLoadingMore,
    isRefreshing,
    totalPages,
  ]);

  const filteredOrders = useMemo(() => {
    if (selectedFilter === "ALL") {
      return orders;
    }
    return orders.filter((o) => o.status === selectedFilter);
  }, [orders, selectedFilter]);

  const handleOrderPress = useCallback(async (orderId: number) => {
    try {
      setIsLoadingDetail(true);
      setShowDetailModal(true);
      // Reset rating state
      setRatingValue(0);
      setRatingComment("");
      setExistingRating(null);
      // Reset complaint state
      setExistingComplaints([]);
      setShowComplaintForm(false);
      setComplaintType("DAMAGED");
      setComplaintDesc("");
      // Reset refund state
      setOrderRefunds([]);
      setShowRefundForm(false);
      setRefundReason("");

      const response = await orderService.getOrderById(orderId);
      if (response.success && response.data) {
        setSelectedOrder(response.data);
        console.log(
          "[OrderDetail] Full order:",
          JSON.stringify(response.data, null, 2),
        );

        // Fetch existing rating and complaints for completed orders
        if (response.data.status === "COMPLETED") {
          try {
            const ratingRes = await orderService.getOrderRating(orderId);
            if (ratingRes.success && ratingRes.data) {
              setExistingRating(ratingRes.data);
            }
          } catch {
            // No rating yet — that's fine
          }
          try {
            const complaintsRes =
              await orderService.getOrderComplaints(orderId);
            if (complaintsRes.success && complaintsRes.data) {
              setExistingComplaints(complaintsRes.data);
            }
          } catch {
            // No complaints — fine
          }
        }
        // Fetch refund data for CANCELED orders that were paid
        if (
          response.data.status === "CANCELED" &&
          response.data.payment?.status === "COMPLETED"
        ) {
          try {
            const refundRes = await paymentService.getOrderRefunds(orderId);
            if (refundRes.success && refundRes.data) {
              setOrderRefunds(refundRes.data);
            }
          } catch {
            // No refunds — fine
          }
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch order details:", err);
      Alert.alert("Lỗi", "Không thể tải chi tiết đơn hàng");
      setShowDetailModal(false);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const handleSubmitComplaint = async () => {
    if (!selectedOrder) return;
    if (!complaintDesc.trim()) {
      Alert.alert("Lỗi", "Vui lòng mô tả vấn đề bạn gặp phải");
      return;
    }
    setIsSubmittingComplaint(true);
    try {
      const data: OrderComplaintRequest = {
        type: complaintType,
        description: complaintDesc.trim(),
      };
      const res = await orderService.createComplaint(selectedOrder.id, data);
      if (res.success && res.data) {
        setExistingComplaints([res.data]);
        setShowComplaintForm(false);
        Alert.alert(
          "Thành công",
          "Khiếu nại của bạn đã được ghi nhận. Chúng tôi sẽ xử lý sớm nhất.",
        );
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Không thể gửi khiếu nại";
      Alert.alert("Lỗi", msg);
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  const executeCancelOrder = useCallback(
    async (orderId: number, reason: string) => {
      try {
        const response = await orderService.cancelOrder(orderId, reason);
        if (response.success) {
          Alert.alert("Đã hủy", "Đơn hàng đã được hủy thành công.");
          fetchOrders(0, { isRefresh: true });
          setShowDetailModal(false);
        }
      } catch (err: any) {
        console.error("Failed to cancel order:", err);
        Alert.alert(
          "Lỗi",
          err?.response?.data?.message || "Không thể hủy đơn hàng",
        );
      }
    },
    [fetchOrders],
  );

  const handleCancelOrder = useCallback(
    async (orderId: number) => {
      Alert.alert("Hủy đơn hàng", "Vui lòng chọn lý do hủy:", [
        { text: "Không hủy", style: "cancel" },
        {
          text: "Đổi ý không muốn giặt",
          onPress: () => executeCancelOrder(orderId, "Đổi ý không muốn giặt"),
        },
        {
          text: "Đặt nhầm đơn",
          onPress: () => executeCancelOrder(orderId, "Đặt nhầm đơn"),
        },
        {
          text: "Lý do khác",
          onPress: () => executeCancelOrder(orderId, "Khách hủy"),
        },
      ]);
    },
    [executeCancelOrder],
  );

  const handlePickupStorage = async (orderId: number) => {
    Alert.alert(
      "Xác nhận lấy đồ",
      "Tủ locker sẽ được mở để bạn lấy đồ. Bạn có chắc chắn?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Lấy đồ",
          onPress: async () => {
            try {
              const response = await orderService.pickupStorageOrder(orderId);
              if (response.success) {
                Alert.alert(
                  "Thành công",
                  "Tủ locker đã được mở! Vui lòng lấy đồ của bạn.",
                  [{ text: "OK" }],
                );
                fetchOrders(0, { isRefresh: true });
                setShowDetailModal(false);
              }
            } catch (err: any) {
              console.error("Failed to pickup storage order:", err);
              const errMsg =
                err?.response?.data?.message ||
                err?.message ||
                "Không thể mở tủ.";
              const errCode = err?.response?.data?.code;

              if (
                errCode === "E_ORDER_OVERTIME" ||
                errMsg.includes("lố giờ") ||
                errMsg.includes("phụ phí")
              ) {
                Alert.alert(
                  "Phát sinh phí trễ giờ",
                  errMsg +
                    "\n\nBạn có muốn thanh toán phần phí phát sinh bằng MoMo để có thể lấy đồ không?",
                  [
                    { text: "Để sau", style: "cancel" },
                    {
                      text: "Thanh toán MoMo",
                      onPress: async () => {
                        try {
                          const payRes = await paymentService.createPayment(
                            orderId,
                            "MOMO",
                          );
                          if (
                            payRes.success &&
                            (payRes.data as any)?.paymentUrl
                          ) {
                            Linking.openURL((payRes.data as any).paymentUrl);
                          } else {
                            Alert.alert(
                              "Lỗi",
                              "Không thể tạo phiên thanh toán.",
                            );
                          }
                        } catch (pErr: any) {
                          Alert.alert(
                            "Lỗi",
                            "Không phát khởi thanh toán được: " +
                              (pErr?.response?.data?.message ||
                                pErr?.message ||
                                ""),
                          );
                        }
                      },
                    },
                  ],
                );
              } else {
                Alert.alert("Lỗi", errMsg);
              }
            }
          },
        },
      ],
    );
  };

  const handleResetPin = async (orderId: number) => {
    Alert.alert(
      "Cấp lại mã PIN",
      "Mã PIN hiện tại sẽ bị hủy và tạo mã mới. Bạn có chắc chắn?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              const response = await orderService.resetOrderPin(orderId);
              if (response.success && response.data) {
                setSelectedOrder(response.data);
                Alert.alert(
                  "Thành công",
                  `Mã PIN mới: ${response.data.pinCode || response.data.pin}`,
                );
                fetchOrders(0, { isRefresh: true });
              }
            } catch (err: any) {
              console.error("Failed to reset PIN:", err);
              const msg =
                err?.response?.data?.message || "Không thể cấp lại mã PIN";
              Alert.alert("Lỗi", msg);
            }
          },
        },
      ],
    );
  };

  const handleReorder = async (orderId: number) => {
    Alert.alert(
      "Đặt lại đơn hàng",
      "Tạo đơn hàng mới với cùng dịch vụ và tủ locker?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đặt lại",
          onPress: async () => {
            setIsReordering(true);
            try {
              const response = await orderService.reorderFromExisting(orderId);
              if (response.success && response.data) {
                Alert.alert(
                  "Thành công",
                  `Đơn hàng mới #${response.data.id} đã được tạo!\nMã PIN: ${response.data.pinCode || response.data.pin || "N/A"}`,
                  [
                    {
                      text: "OK",
                      onPress: () => {
                        setShowDetailModal(false);
                        fetchOrders(0, { isRefresh: true });
                      },
                    },
                  ],
                );
              }
            } catch (err: any) {
              const msg =
                err?.response?.data?.message || "Không thể đặt lại đơn hàng";
              Alert.alert("Lỗi", msg);
            } finally {
              setIsReordering(false);
            }
          },
        },
      ],
    );
  };

  const handleRequestRefund = async () => {
    if (!selectedOrder) return;
    if (!refundReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do yêu cầu hoàn tiền");
      return;
    }
    setIsSubmittingRefund(true);
    try {
      // Find the payment ID from the order
      const paymentsRes = await paymentService.getPaymentsByOrder(
        selectedOrder.id,
      );
      if (!paymentsRes.success || !paymentsRes.data?.length) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin thanh toán");
        return;
      }
      const completedPayment = paymentsRes.data.find(
        (p: any) => p.status === "COMPLETED",
      );
      if (!completedPayment) {
        Alert.alert("Lỗi", "Không tìm thấy khoản thanh toán đã hoàn thành");
        return;
      }
      const res = await paymentService.requestRefund(completedPayment.id, {
        reason: refundReason.trim(),
      });
      if (res.success && res.data) {
        setOrderRefunds([res.data]);
        setShowRefundForm(false);
        setRefundReason("");
        Alert.alert(
          "Thành công",
          "Yêu cầu hoàn tiền đã được ghi nhận. Chúng tôi sẽ xử lý sớm nhất.",
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Không thể gửi yêu cầu hoàn tiền";
      Alert.alert("Lỗi", msg);
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const handleViewTimeline = async (orderId: number) => {
    setIsLoadingTimeline(true);
    setShowTimelineDetail(true);
    try {
      const response = await orderService.getOrderTimeline(orderId);
      if (response.success && response.data) {
        setTimelineEvents((response.data as any).events || [response.data]);
      }
    } catch (err: any) {
      console.warn("Timeline API not available:", err);
      setTimelineEvents([]);
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  const getRefundStatusInfo = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "Chờ xử lý", color: "#FF9800", bg: "#FFF3E0" };
      case "APPROVED":
        return { label: "Đã duyệt", color: "#2196F3", bg: "#E3F2FD" };
      case "COMPLETED":
        return { label: "Đã hoàn tiền", color: "#4CAF50", bg: "#E8F5E9" };
      case "REJECTED":
        return { label: "Từ chối", color: "#F44336", bg: "#FFEBEE" };
      default:
        return { label: status, color: "#666", bg: "#F5F5F5" };
    }
  };

  // State for Tracking Modal
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null); // Using any temporarily to avoid import issue if type not refreshed, but will cast to OrderTrackingDetail
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);

    const handleTrackOrder = useCallback(
    async (orderId: number) => {
      setIsLoadingTracking(true);
      setTrackingModalVisible(true); // Show modal immediately with loading state
      const orderType = orders.find((o) => o.id === orderId)?.type;
      try {
        const response = await orderService.getOrderStatus(orderId);
        if (response.success && response.data) {
          setTrackingData({ ...response.data, type: orderType });
        } else {
          // Fallback to local data if API fails
          throw new Error("API returned failure");
        }
      } catch (error: any) {
        // Log as warning since this is expected if backend is not fully ready
        console.warn(
          "Tracking API not available (404/Error), using fallback data for order:",
          orderId,
        );

        // Fallback Logic
        const localOrder = orders.find((o) => o.id === orderId);
        if (localOrder) {
          console.log("Found local order data:", localOrder.id);
          const fallbackData = {
            orderId: localOrder.id,
            type: localOrder.type,
            status: localOrder.status,
            statusDescription: getStatusText(localOrder.status, localOrder.type),
            pinCode: localOrder.pin || localOrder.pinCode,
            lockerName: localOrder.locker?.name || localOrder.lockerName || "Tủ gửi đồ",
            boxNumber: localOrder.boxId || localOrder.boxNumber || localOrder.sendBoxNumber,
            createdAt: localOrder.createdAt || new Date().toISOString(),
            updatedAt: localOrder.updatedAt || new Date().toISOString(),
            isPaid: false,
            nextAction: "Vui lòng làm mới để cập nhật chi tiết",
          };

          if (localOrder.status === "INITIALIZED")
            fallbackData.nextAction = "Mang đồ đến tủ và nhập mã PIN";
          else if (localOrder.status === "RETURNED" || (localOrder.type === "STORAGE" && localOrder.status === "WAITING"))
            fallbackData.nextAction = "Thanh toán/Nhập PIN để lấy đồ";

          setTrackingData(fallbackData);
        } else {
          console.error("No local order found for fallback with ID:", orderId);
          Alert.alert("Lỗi", "Không thể lấy thông tin vận đơn");
          setTrackingModalVisible(false);
        }
      } finally {
        setIsLoadingTracking(false);
      }
    },
    [orders],
  );

  const stopPaymentPolling = useCallback(() => {
    if (paymentPollRef.current) {
      clearInterval(paymentPollRef.current);
      paymentPollRef.current = null;
    }
    setIsPollingPayment(false);
  }, []);

  const startPaymentPolling = useCallback(
    (orderId: number) => {
      stopPaymentPolling();
      setIsPollingPayment(true);

      paymentPollRef.current = setInterval(async () => {
        try {
          const statusRes = await orderService.getOrderStatus(orderId);
          const statusData = statusRes?.data as any;
          const paymentStatus = (
            statusData?.payment?.status || ""
          ).toUpperCase();
          const paid =
            statusData?.isPaid === true ||
            ["SUCCESS", "COMPLETED", "PAID"].includes(paymentStatus);

          if (paid) {
            stopPaymentPolling();
            setShowPaymentModal(false);
            fetchOrders(0, { isRefresh: true });
            Alert.alert("Thành công", "Thanh toán MoMo thành công.");
          }
        } catch {
          // Ignore polling errors; next interval will retry.
        }
      }, 3000);
    },
    [fetchOrders, stopPaymentPolling],
  );

  const handlePayOrder = useCallback(
    async (orderId: number) => {
      setPayingOrderId(orderId);
      setShowPaymentModal(true);
      setIsCreatingPayment(true);
      setMomoPaymentUrl("");
      setMomoQrCodeData(null);

      try {
        const res = await paymentService.createPayment(orderId, "MOMO");
        const paymentData = res.data as any;

        if (res.success && paymentData?.paymentUrl) {
          setMomoPaymentUrl(paymentData.paymentUrl);
          setMomoQrCodeData(
            paymentData.qrCodeUrl ||
              paymentData.qrCodeData ||
              paymentData.qrCode ||
              paymentData.paymentUrl,
          );
          startPaymentPolling(orderId);
        } else {
          setShowPaymentModal(false);
          Alert.alert("Lỗi", "Không thể tạo thanh toán MoMo");
        }
      } catch (err: any) {
        setShowPaymentModal(false);
        Alert.alert(
          "Lỗi",
          err?.response?.data?.message ||
            err?.message ||
            "Không thể tạo thanh toán MoMo",
        );
      } finally {
        setIsCreatingPayment(false);
        setPayingOrderId(null);
      }
    },
    [startPaymentPolling],
  );

  useEffect(() => {
    return () => {
      stopPaymentPolling();
    };
  }, [stopPaymentPolling]);

  const renderTimeline = (currentStatus: string, orderType?: string) => {
    let steps;
    if (orderType === "STORAGE") {
       steps = [
         { status: "INITIALIZED", label: "Đã đặt" },
         { status: "WAITING", label: "Đang giữ đồ" },
         { status: "COMPLETED", label: "Đã lấy đồ" },
       ];
    } else {
       steps = [
         { status: "INITIALIZED", label: "Đã đặt" },
         { status: "WAITING", label: "Chờ gửi" },
         { status: "COLLECTED", label: "Đã thu" },
         { status: "PROCESSING", label: "Đang giặt" },
         { status: "READY", label: "Sẵn sàng" },
         { status: "COMPLETED", label: "Xong" },
       ];
    }

    const currentIndex = steps.findIndex((s) => s.status === currentStatus);
    // If status is RETURNED, mapped to COMPLETED logic or specific? Let's treat RETURNED/COMPLETED similar or add RETURNED step.
    // If CANCELED, plain red text.

    if (currentStatus === "CANCELED") {
      return (
        <ThemedText
          style={{ color: "red", textAlign: "center", marginTop: 10 }}
        >
          Đơn hàng đã bị hủy
        </ThemedText>
      );
    }

    return (
      <View style={styles.timelineContainer}>
        {steps.map((step, index) => {
          const isActive = index <= (currentIndex === -1 ? 0 : currentIndex);
          const isCurrent = index === currentIndex;

          return (
            <View key={step.status} style={styles.timelineStep}>
              <View
                style={[
                  styles.timelineDot,
                  isActive && styles.timelineDotActive,
                  isCurrent && styles.timelineDotCurrent,
                ]}
              >
                {isActive && <Icon name="check" size={10} color="#fff" />}
              </View>
              <ThemedText
                style={[
                  styles.timelineLabel,
                  isActive && styles.timelineLabelActive,
                ]}
              >
                {step.label}
              </ThemedText>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    isActive &&
                      index < currentIndex &&
                      styles.timelineLineActive,
                  ]}
                />
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
        <Icon name="error-outline" size={64} color="#F44336" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchOrders(0)}
        >
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
            const count =
              filter.value === "ALL"
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
                      selectedFilter === filter.value &&
                        styles.filterBadgeTextActive,
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
      <View style={styles.content}>
        {filteredOrders.length === 0 ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchOrders(0, { isRefresh: true })}
                colors={["#003D5B"]}
              />
            }
          >
            <View style={styles.emptyContainer}>
              <Icon name="inbox" size={64} color="#999" />
              <ThemedText style={styles.emptyText}>
                Không có đơn hàng nào
              </ThemedText>
            </View>
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              data={filteredOrders}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => fetchOrders(0, { isRefresh: true })}
                  colors={["#003D5B"]}
                />
              }
              renderItem={({ item }) => (
                <MemoizedOrderCard
                  order={item}
                  orderRatingsMap={orderRatingsMap}
                  handleOrderPress={handleOrderPress}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                  formatDate={formatDate}
                  formatPrice={formatPrice}
                  handleTrackOrder={handleTrackOrder}
                  handlePayOrder={handlePayOrder}
                  handleCancelOrder={handleCancelOrder}
                  payingOrderId={payingOrderId}
                />
              )}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.35}
              ListFooterComponent={
                isLoadingMore ? (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color="#003D5B" />
                    <ThemedText style={styles.loadingMoreText}>
                      Đang tải thêm đơn hàng...
                    </ThemedText>
                  </View>
                ) : null
              }
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
            />
          </View>
        )}
      </View>

      {/* Tracking Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={trackingModalVisible}
        onRequestClose={() => setTrackingModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.trackingModalView}>
            <AppModalHeader
              title="Theo dõi đơn hàng"
              onClose={() => setTrackingModalVisible(false)}
              showDivider={true}
            />

            {isLoadingTracking ? (
              <ActivityIndicator
                size="large"
                color="#003D5B"
                style={{ marginVertical: 40 }}
              />
            ) : trackingData ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.trackingInfoContainer}>
                  <View style={styles.trackingRow}>
                    <ThemedText style={styles.trackingLabel}>
                      Mã đơn:
                    </ThemedText>
                    <ThemedText style={styles.trackingValue}>
                      #{trackingData.orderId}
                    </ThemedText>
                  </View>
                  <View style={styles.trackingRow}>
                    <ThemedText style={styles.trackingLabel}>
                      Locker:
                    </ThemedText>
                    <ThemedText style={styles.trackingValue}>
                      {trackingData.lockerName || "N/A"}
                    </ThemedText>
                  </View>
                  <View style={styles.trackingRow}>
                    <ThemedText style={styles.trackingLabel}>Ô số:</ThemedText>
                    <ThemedText style={styles.trackingValue}>
                      {trackingData.boxNumber || "N/A"}
                    </ThemedText>
                  </View>
                  <View style={styles.trackingRow}>
                    <ThemedText style={styles.trackingLabel}>
                      Mã PIN:
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.trackingValue,
                        { color: "#F59E0B", fontWeight: "bold" },
                      ]}
                    >
                      {trackingData.pinCode || "******"}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.timelineWrapper}>
                  {renderTimeline(trackingData.status, trackingData.type)}
                </View>

                <View style={styles.statusDescriptionBox}>
                  <ThemedText style={styles.statusDescTitle}>
                    Trạng thái hiện tại
                  </ThemedText>
                  <ThemedText style={styles.statusDescText}>
                    {trackingData.statusDescription}
                  </ThemedText>
                  <ThemedText style={styles.nextActionText}>
                    👉 {trackingData.nextAction}
                  </ThemedText>
                </View>

                {/* Timeline Detail Button */}
                <TouchableOpacity
                  onPress={() => handleViewTimeline(trackingData.orderId)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    paddingVertical: 14,
                    borderRadius: 12,
                    marginTop: 16,
                    backgroundColor: "#E3F2FD",
                    borderWidth: 1,
                    borderColor: "#90CAF9",
                  }}
                >
                  <Icon name="timeline" size={18} color="#1565C0" />
                  <ThemedText
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: "#1565C0",
                    }}
                  >
                    Xem chi tiết lộ trình
                  </ThemedText>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <ThemedText style={{ textAlign: "center", margin: 20 }}>
                Không có dữ liệu
              </ThemedText>
            )}
          </View>
        </View>
      </Modal>

      {/* MoMo Payment Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPaymentModal}
        onRequestClose={() => {
          stopPaymentPolling();
          setShowPaymentModal(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.trackingModalView}>
            <AppModalHeader
              title="Thanh toán MoMo"
              onClose={() => {
                stopPaymentPolling();
                setShowPaymentModal(false);
              }}
              showDivider={true}
            />

            {isCreatingPayment ? (
              <ActivityIndicator
                size="large"
                color="#A50064"
                style={{ marginVertical: 40 }}
              />
            ) : momoPaymentUrl ? (
              <View
                style={{
                  width: "100%",
                  backgroundColor: "#FFF0F6",
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: "#F8BBD0",
                  alignItems: "center",
                }}
              >
                {momoQrCodeData ? (
                  <View
                    style={{
                      padding: 10,
                      backgroundColor: "white",
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                  >
                    <QRCode value={momoQrCodeData} size={160} />
                  </View>
                ) : (
                  <Icon name="qr-code-2" size={80} color="#A50064" />
                )}

                <ThemedText
                  style={{
                    fontSize: 14,
                    color: "#A50064",
                    fontWeight: "700",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Quét mã QR bằng ứng dụng MoMo
                </ThemedText>

                <ThemedText
                  style={{
                    fontSize: 12,
                    color: "#666",
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  Hoặc nhấn nút bên dưới để chuyển sang MoMo
                </ThemedText>

                {isPollingPayment && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <ActivityIndicator size="small" color="#A50064" />
                    <ThemedText style={{ fontSize: 12, color: "#666" }}>
                      Đang chờ xác nhận thanh toán...
                    </ThemedText>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: "#A50064", paddingHorizontal: 20 },
                  ]}
                  onPress={() => Linking.openURL(momoPaymentUrl)}
                >
                  <ThemedText style={[styles.actionBtnText, { color: "#fff" }]}>
                    Mở MoMo thanh toán
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    {
                      marginTop: 10,
                      backgroundColor: "#E8F5E9",
                      paddingHorizontal: 20,
                    },
                  ]}
                  onPress={() => {
                    stopPaymentPolling();
                    setShowPaymentModal(false);
                    fetchOrders(0, { isRefresh: true });
                  }}
                >
                  <ThemedText
                    style={[styles.actionBtnText, { color: "#2E7D32" }]}
                  >
                    Tôi đã thanh toán
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <ThemedText style={{ textAlign: "center", margin: 20 }}>
                Không thể tạo mã thanh toán
              </ThemedText>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showDetailModal}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.bottomSheetView}>
          <View style={styles.detailModalView}>
            {/* Modal Header */}
            <AppModalHeader
              title={
                selectedOrder?.orderCode || `Đơn #${selectedOrder?.id || ""}`
              }
              subtitle={
                selectedOrder?.type === "LAUNDRY"
                  ? "🧺 Dịch vụ Giặt đồ"
                  : "📦 Dịch vụ Lưu trữ"
              }
              onClose={() => setShowDetailModal(false)}
              showDivider={true}
            />

            {isLoadingDetail ? (
              <ActivityIndicator
                size="large"
                color="#003D5B"
                style={{ marginVertical: 40 }}
              />
            ) : selectedOrder ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.detailScrollView}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {/* Prominent PIN Code Section */}
                {(selectedOrder.pin || selectedOrder.pinCode) && (
                  <View
                    style={{
                      backgroundColor: "#FFF9C4",
                      borderRadius: 16,
                      padding: 20,
                      alignItems: "center",
                      marginBottom: 20,
                      borderWidth: 2,
                      borderColor: "#FBC02D",
                      borderStyle: "dashed",
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 14,
                        color: "#F57F17",
                        fontWeight: "600",
                        marginBottom: 8,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Mã PIN Mở Tủ
                    </ThemedText>
                    <ThemedText
                      style={{
                        fontSize: 33,
                        fontWeight: "900",
                        color: "#253d25ff",
                        letterSpacing: 4,
                      }}
                    >
                      {selectedOrder.pinCode || selectedOrder.pin}
                    </ThemedText>
                    <ThemedText
                      style={{
                        fontSize: 13,
                        color: "#666",
                        marginTop: 12,
                        textAlign: "center",
                      }}
                    >
                      Vui lòng đến{" "}
                      {selectedOrder.locker?.name ||
                        selectedOrder.lockerName ||
                        "Kiosk"}{" "}
                      nhập mã PIN này để mở tủ
                    </ThemedText>
                    {/* Failed PIN Attempts Warning */}
                    {(selectedOrder.failedPinAttempts ?? 0) >= 5 && (
                      <View style={{ backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginTop: 12, borderWidth: 1, borderColor: '#f87171' }}>
                        <ThemedText style={{ color: '#b91c1c', fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 20 }}>
                          ⚠️ Tạm khóa giao dịch tại tủ do nhập sai mã PIN 5 lần. Vui lòng bấm Cấp lại mã PIN để lấy mã mới và tiếp tục!
                        </ThemedText>
                      </View>
                    )}

                    {/* Reset PIN Button - only for active orders OR if locked */}
                    {(selectedOrder.status === "INITIALIZED" || selectedOrder.status === "RETURNED" || (selectedOrder.failedPinAttempts ?? 0) >= 5) && (
                        <TouchableOpacity
                          onPress={() => handleResetPin(selectedOrder.id)}
                          style={{
                            marginTop: 14,
                            backgroundColor: "#FFF3E0",
                            paddingHorizontal: 20,
                            paddingVertical: 10,
                            borderRadius: 20,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            borderWidth: 1,
                            borderColor: "#FFB74D",
                          }}
                        >
                          <Icon name="refresh" size={16} color="#E65100" />
                          <ThemedText
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: "#E65100",
                            }}
                          >
                            Cấp lại mã PIN
                          </ThemedText>
                        </TouchableOpacity>
                      )}
                  </View>
                )}

                {/* Status Box */}
                <View
                  style={[
                    styles.detailInfoBox,
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor:
                          getStatusColor(selectedOrder.status) + "30",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Icon
                        name="info"
                        size={20}
                        color={getStatusColor(selectedOrder.status)}
                      />
                    </View>
                    <View>
                      <ThemedText style={{ fontSize: 13, color: "#666" }}>
                        Trạng thái
                      </ThemedText>
                      <ThemedText
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: getStatusColor(selectedOrder.status),
                        }}
                      >
                        {getStatusText(
                          selectedOrder.status,
                          selectedOrder.type,
                        )}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Location Info */}
                <View style={styles.detailInfoBox}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Icon name="place" color="#003D5B" size={24} />
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        {selectedOrder.locker?.name ||
                          selectedOrder.lockerName ||
                          "N/A"}
                      </ThemedText>
                      <ThemedText
                        style={{ fontSize: 13, color: "#666", marginTop: 2 }}
                      >
                        Ô tủ số:{" "}
                        <ThemedText style={{ fontWeight: "bold" }}>
                          {selectedOrder.boxNumber ||
                            selectedOrder.sendBoxNumber ||
                            "N/A"}
                        </ThemedText>
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* People Info */}
                <View style={styles.detailInfoBox}>
                  <View
                    style={{
                      flexDirection: "row",
                      paddingBottom: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: "#F0F0F0",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={{ fontSize: 12, color: "#999", marginBottom: 4 }}
                      >
                        Người gửi
                      </ThemedText>
                      <ThemedText
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        {selectedOrder.senderName ||
                          selectedOrder.customer?.fullName ||
                          "N/A"}
                      </ThemedText>
                      <ThemedText
                        style={{ fontSize: 13, color: "#666", marginTop: 2 }}
                      >
                        {selectedOrder.senderPhone ||
                          selectedOrder.customer?.phoneNumber}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", paddingTop: 16 }}>
                    <View style={{ flex: 1 }}>
                      <ThemedText
                        style={{ fontSize: 12, color: "#999", marginBottom: 4 }}
                      >
                        Người nhận
                      </ThemedText>
                      <ThemedText
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        {selectedOrder.receiverName || "Chưa nhập"}
                      </ThemedText>
                      {selectedOrder.receiverPhone && (
                        <ThemedText
                          style={{ fontSize: 13, color: "#666", marginTop: 2 }}
                        >
                          {selectedOrder.receiverPhone}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                </View>

                {/* Payment Info */}
                <View style={styles.detailInfoBox}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      Thanh toán
                    </ThemedText>
                    <View
                      style={{
                        backgroundColor:
                          selectedOrder.payment?.status === "COMPLETED"
                            ? "#E8F5E9"
                            : "#FFF3E0",
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 12,
                      }}
                    >
                      <ThemedText
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color:
                            selectedOrder.payment?.status === "COMPLETED"
                              ? "#4CAF50"
                              : "#FF9800",
                        }}
                      >
                        {selectedOrder.payment?.status === "COMPLETED"
                          ? "Đã thanh toán"
                          : "Chưa thanh toán"}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Items/Services */}
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <View style={{ marginBottom: 16 }}>
                      {selectedOrder.items.map((item, index) => (
                        <View
                          key={index}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 8,
                          }}
                        >
                          <ThemedText style={{ fontSize: 14, color: "#555" }}>
                            • {item.serviceName || "Dịch vụ"} (x
                            {item.quantity || 1})
                          </ThemedText>
                          <ThemedText
                            style={{
                              fontSize: 14,
                              color: "#333",
                              fontWeight: "500",
                            }}
                          >
                            {formatPrice(item.subtotal || item.price)}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Pricing Breakdown */}
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: "#F0F0F0",
                      paddingTop: 16,
                      gap: 8,
                    }}
                  >
                    {selectedOrder.type === "LAUNDRY" && selectedOrder.actualWeight && (
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                        <ThemedText style={{ fontSize: 14, color: "#1976D2", fontWeight: '600' }}>Khối lượng thực tế</ThemedText>
                        <ThemedText style={{ fontSize: 14, color: "#1976D2", fontWeight: 'bold' }}>
                          {selectedOrder.actualWeight} {selectedOrder.weightUnit || 'kg'}
                        </ThemedText>
                      </View>
                    )}
                    {selectedOrder.estimatedPrice && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <ThemedText style={{ fontSize: 14, color: "#666" }}>
                          Giá ước tính
                        </ThemedText>
                        <ThemedText style={{ fontSize: 14, color: "#333" }}>
                          {formatPrice(
                            typeof selectedOrder.estimatedPrice === "number"
                              ? selectedOrder.estimatedPrice
                              : 0,
                          )}
                        </ThemedText>
                      </View>
                    )}
                    {selectedOrder.actualPrice && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <ThemedText style={{ fontSize: 14, color: "#666" }}>
                          Giá thực tế
                        </ThemedText>
                        <ThemedText style={{ fontSize: 14, color: "#333" }}>
                          {formatPrice(selectedOrder.actualPrice)}
                        </ThemedText>
                      </View>
                    )}
                    {selectedOrder.discountAmount &&
                      selectedOrder.discountAmount > 0 && (
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <ThemedText
                            style={{ fontSize: 14, color: "#4CAF50" }}
                          >
                            Giảm giá
                          </ThemedText>
                          <ThemedText
                            style={{
                              fontSize: 14,
                              color: "#4CAF50",
                              fontWeight: "500",
                            }}
                          >
                            -{formatPrice(selectedOrder.discountAmount)}
                          </ThemedText>
                        </View>
                      )}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 8,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: "#E0E0E0",
                        borderStyle: "dashed",
                      }}
                    >
                      <ThemedText
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#111",
                        }}
                      >
                        Tổng cộng
                      </ThemedText>
                      <ThemedText
                        style={{
                          fontSize: 18,
                          fontWeight: "900",
                          color: "#003D5B",
                        }}
                      >
                        {formatPrice(
                          selectedOrder.totalAmount ||
                            selectedOrder.actualPrice ||
                            selectedOrder.totalPrice ||
                            0,
                        )}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Additional Info / Notes */}
                {(selectedOrder.customerNote || selectedOrder.staffNote || selectedOrder.pickupDeadline) && (
                  <View style={[styles.detailInfoBox, { marginTop: 16 }]}>
                    <ThemedText style={{ fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 12 }}>Thông tin bổ sung</ThemedText>
                    
                    {selectedOrder.customerNote && (
                      <View style={{ marginBottom: 12 }}>
                        <ThemedText style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>Ghi chú của bạn</ThemedText>
                        <ThemedText style={{ fontSize: 14, color: "#333" }}>{selectedOrder.customerNote}</ThemedText>
                      </View>
                    )}
                    
                    {selectedOrder.staffNote && (
                      <View style={{ marginBottom: 12, backgroundColor: '#fff8e1', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ffe082' }}>
                        <ThemedText style={{ fontSize: 12, color: "#f57f17", fontWeight: 'bold', marginBottom: 4 }}>Ghi chú từ nhân viên</ThemedText>
                        <ThemedText style={{ fontSize: 14, color: "#e65100" }}>{selectedOrder.staffNote}</ThemedText>
                      </View>
                    )}

                    {selectedOrder.pickupDeadline && (
                      <View style={{ marginBottom: 4 }}>
                        <ThemedText style={{ fontSize: 12, color: "#d32f2f", fontWeight: 'bold', marginBottom: 4 }}>Hạn chót Cần Lấy Đồ (quá hạn tính phí)</ThemedText>
                        <ThemedText style={{ fontSize: 14, color: "#b71c1c", fontWeight: '600' }}>{formatDate(selectedOrder.pickupDeadline)}</ThemedText>
                      </View>
                    )}
                  </View>
                )}

                {/* Timestamps */}
                <View
                  style={{
                    paddingHorizontal: 4,
                    marginTop: 8,
                    opacity: 0.6,
                    alignItems: "center",
                  }}
                >
                  <ThemedText style={{ fontSize: 11, color: "#666" }}>
                    Tạo lúc: {formatDate(selectedOrder.createdAt)}
                  </ThemedText>
                  {selectedOrder.completedAt && (
                    <ThemedText
                      style={{ fontSize: 11, color: "#666", marginTop: 4 }}
                    >
                      Hoàn thành: {formatDate(selectedOrder.completedAt)}
                    </ThemedText>
                  )}
                </View>

                {/* Rating Section - for COMPLETED orders */}
                {selectedOrder.status === "COMPLETED" && (
                  <View style={styles.detailInfoBox}>
                    <ThemedText
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: 12,
                      }}
                    >
                      {existingRating
                        ? "Đánh giá của bạn"
                        : "Đánh giá đơn hàng"}
                    </ThemedText>

                    {/* Stars */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 8,
                        marginBottom: 12,
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() =>
                            !existingRating && setRatingValue(star)
                          }
                          disabled={!!existingRating}
                          activeOpacity={existingRating ? 1 : 0.6}
                        >
                          <Icon
                            name={
                              star <= (existingRating?.rating || ratingValue)
                                ? "star"
                                : "star-border"
                            }
                            type="material"
                            size={36}
                            color={
                              star <= (existingRating?.rating || ratingValue)
                                ? "#FFB300"
                                : "#DDD"
                            }
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    {existingRating ? (
                      <View>
                        {existingRating.comment ? (
                          <ThemedText
                            style={{
                              fontSize: 14,
                              color: "#555",
                              fontStyle: "italic",
                              textAlign: "center",
                              marginBottom: 8,
                            }}
                          >
                            "{existingRating.comment}"
                          </ThemedText>
                        ) : null}
                        {existingRating.partnerResponse ? (
                          <View
                            style={{
                              backgroundColor: "#F0F8FF",
                              padding: 12,
                              borderRadius: 10,
                              marginTop: 4,
                            }}
                          >
                            <ThemedText
                              style={{
                                fontSize: 12,
                                fontWeight: "600",
                                color: "#003D5B",
                                marginBottom: 4,
                              }}
                            >
                              Phản hồi từ cửa hàng:
                            </ThemedText>
                            <ThemedText style={{ fontSize: 13, color: "#555" }}>
                              {existingRating.partnerResponse}
                            </ThemedText>
                          </View>
                        ) : null}
                      </View>
                    ) : (
                      <View>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: "#E0E0E0",
                            borderRadius: 12,
                            padding: 12,
                            fontSize: 14,
                            minHeight: 70,
                            textAlignVertical: "top",
                            backgroundColor: "#FAFAFA",
                            marginBottom: 12,
                          }}
                          placeholder="Nhận xét về đơn hàng (tùy chọn)..."
                          placeholderTextColor="#BDBDBD"
                          multiline
                          numberOfLines={3}
                          value={ratingComment}
                          onChangeText={setRatingComment}
                          maxLength={500}
                        />
                        <TouchableOpacity
                          onPress={async () => {
                            if (ratingValue === 0) {
                              Alert.alert("Lỗi", "Vui lòng chọn số sao");
                              return;
                            }
                            setIsSubmittingRating(true);
                            try {
                              const data: OrderRatingRequest = {
                                rating: ratingValue,
                                comment: ratingComment.trim() || undefined,
                              };
                              const res = await orderService.rateOrder(
                                selectedOrder.id,
                                data,
                              );
                              if (res.success) {
                                setExistingRating(res.data);
                                Alert.alert(
                                  "Cảm ơn!",
                                  "Đánh giá của bạn đã được ghi nhận.",
                                );
                              }
                            } catch (err: any) {
                              const msg =
                                err?.response?.data?.message ||
                                "Không thể gửi đánh giá";
                              Alert.alert("Lỗi", msg);
                            } finally {
                              setIsSubmittingRating(false);
                            }
                          }}
                          disabled={isSubmittingRating || ratingValue === 0}
                          style={{
                            backgroundColor:
                              ratingValue > 0 ? "#003D5B" : "#CCC",
                            paddingVertical: 14,
                            borderRadius: 12,
                            alignItems: "center",
                            opacity: isSubmittingRating ? 0.7 : 1,
                          }}
                        >
                          {isSubmittingRating ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <ThemedText
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: "#fff",
                              }}
                            >
                              Gửi đánh giá
                            </ThemedText>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* Complaint Section - for COMPLETED orders */}
                {selectedOrder.status === "COMPLETED" && (
                  <View style={styles.detailInfoBox}>
                    <ThemedText
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#333",
                        marginBottom: 12,
                      }}
                    >
                      Khiếu nại đơn hàng
                    </ThemedText>

                    {existingComplaints.length > 0 ? (
                      // Show existing complaint
                      existingComplaints.map((c) => (
                        <View
                          key={c.id}
                          style={{
                            backgroundColor: "#FFF8E1",
                            borderRadius: 12,
                            padding: 14,
                            marginBottom: 8,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <Icon
                                name="report-problem"
                                size={16}
                                color="#F57F17"
                              />
                              <ThemedText
                                style={{
                                  fontSize: 13,
                                  fontWeight: "700",
                                  color: "#F57F17",
                                }}
                              >
                                {c.type === "DAMAGED"
                                  ? "Hư hỏng"
                                  : c.type === "MISSING"
                                    ? "Thiếu đồ"
                                    : c.type === "WRONG_ITEM"
                                      ? "Sai đồ"
                                      : c.type === "QUALITY"
                                        ? "Chất lượng"
                                        : "Khác"}
                              </ThemedText>
                            </View>
                            <View
                              style={{
                                backgroundColor:
                                  c.status === "RESOLVED"
                                    ? "#E8F5E9"
                                    : c.status === "REJECTED"
                                      ? "#FFEBEE"
                                      : c.status === "INVESTIGATING"
                                        ? "#E3F2FD"
                                        : "#FFF3E0",
                                paddingHorizontal: 10,
                                paddingVertical: 3,
                                borderRadius: 10,
                              }}
                            >
                              <ThemedText
                                style={{
                                  fontSize: 11,
                                  fontWeight: "700",
                                  color:
                                    c.status === "RESOLVED"
                                      ? "#4CAF50"
                                      : c.status === "REJECTED"
                                        ? "#F44336"
                                        : c.status === "INVESTIGATING"
                                          ? "#1976D2"
                                          : "#FF9800",
                                }}
                              >
                                {c.status === "PENDING"
                                  ? "Chờ xử lý"
                                  : c.status === "INVESTIGATING"
                                    ? "Đang điều tra"
                                    : c.status === "RESOLVED"
                                      ? "Đã xử lý"
                                      : "Từ chối"}
                              </ThemedText>
                            </View>
                          </View>
                          <ThemedText
                            style={{
                              fontSize: 13,
                              color: "#555",
                              lineHeight: 20,
                            }}
                          >
                            {c.description}
                          </ThemedText>
                          {c.resolution && (
                            <View
                              style={{
                                marginTop: 8,
                                backgroundColor: "#F0F8FF",
                                padding: 10,
                                borderRadius: 8,
                              }}
                            >
                              <ThemedText
                                style={{
                                  fontSize: 12,
                                  fontWeight: "600",
                                  color: "#003D5B",
                                  marginBottom: 2,
                                }}
                              >
                                Phản hồi:
                              </ThemedText>
                              <ThemedText
                                style={{ fontSize: 13, color: "#555" }}
                              >
                                {c.resolution}
                              </ThemedText>
                            </View>
                          )}
                        </View>
                      ))
                    ) : showComplaintForm ? (
                      // Show complaint form
                      <View>
                        {/* Type Picker */}
                        <ThemedText
                          style={{
                            fontSize: 13,
                            color: "#666",
                            marginBottom: 8,
                          }}
                        >
                          Loại khiếu nại:
                        </ThemedText>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                            marginBottom: 14,
                          }}
                        >
                          {[
                            { value: "DAMAGED" as const, label: "💔 Hư hỏng" },
                            { value: "MISSING" as const, label: "❓ Thiếu đồ" },
                            {
                              value: "WRONG_ITEM" as const,
                              label: "🔄 Sai đồ",
                            },
                            {
                              value: "QUALITY" as const,
                              label: "👎 Chất lượng",
                            },
                            { value: "OTHER" as const, label: "📝 Khác" },
                          ].map((opt) => (
                            <TouchableOpacity
                              key={opt.value}
                              onPress={() => setComplaintType(opt.value)}
                              style={{
                                paddingHorizontal: 14,
                                paddingVertical: 8,
                                borderRadius: 20,
                                backgroundColor:
                                  complaintType === opt.value
                                    ? "#FF5722"
                                    : "#F5F5F5",
                                borderWidth: 1,
                                borderColor:
                                  complaintType === opt.value
                                    ? "#FF5722"
                                    : "#E0E0E0",
                              }}
                            >
                              <ThemedText
                                style={{
                                  fontSize: 12,
                                  fontWeight: "600",
                                  color:
                                    complaintType === opt.value
                                      ? "#fff"
                                      : "#555",
                                }}
                              >
                                {opt.label}
                              </ThemedText>
                            </TouchableOpacity>
                          ))}
                        </View>

                        {/* Description Input */}
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: "#E0E0E0",
                            borderRadius: 12,
                            padding: 12,
                            fontSize: 14,
                            minHeight: 80,
                            textAlignVertical: "top",
                            backgroundColor: "#FAFAFA",
                            marginBottom: 14,
                          }}
                          placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                          placeholderTextColor="#BDBDBD"
                          multiline
                          numberOfLines={4}
                          value={complaintDesc}
                          onChangeText={setComplaintDesc}
                          maxLength={1000}
                        />

                        {/* Submit / Cancel */}
                        <View style={{ flexDirection: "row", gap: 10 }}>
                          <TouchableOpacity
                            onPress={() => setShowComplaintForm(false)}
                            style={{
                              flex: 1,
                              paddingVertical: 12,
                              borderRadius: 12,
                              alignItems: "center",
                              backgroundColor: "#F5F5F5",
                            }}
                          >
                            <ThemedText
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: "#666",
                              }}
                            >
                              Hủy
                            </ThemedText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={handleSubmitComplaint}
                            disabled={
                              isSubmittingComplaint || !complaintDesc.trim()
                            }
                            style={{
                              flex: 2,
                              paddingVertical: 12,
                              borderRadius: 12,
                              alignItems: "center",
                              backgroundColor: complaintDesc.trim()
                                ? "#FF5722"
                                : "#CCC",
                              opacity: isSubmittingComplaint ? 0.7 : 1,
                            }}
                          >
                            {isSubmittingComplaint ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <ThemedText
                                style={{
                                  fontSize: 14,
                                  fontWeight: "600",
                                  color: "#fff",
                                }}
                              >
                                Gửi khiếu nại
                              </ThemedText>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      // Show complaint button
                      <TouchableOpacity
                        onPress={() => setShowComplaintForm(true)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          paddingVertical: 14,
                          borderRadius: 12,
                          backgroundColor: "#FFF3E0",
                          borderWidth: 1,
                          borderColor: "#FFB74D",
                        }}
                      >
                        <Icon name="report-problem" size={18} color="#E65100" />
                        <ThemedText
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#E65100",
                          }}
                        >
                          Khiếu nại đơn hàng
                        </ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* Refund Section - for CANCELED orders that were paid */}
                {selectedOrder.status === "CANCELED" &&
                  selectedOrder.payment?.status === "COMPLETED" && (
                    <View style={styles.detailInfoBox}>
                      <ThemedText
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                          marginBottom: 12,
                        }}
                      >
                        💰 Hoàn tiền
                      </ThemedText>

                      {orderRefunds.length > 0 ? (
                        orderRefunds.map((refund, idx) => {
                          const statusInfo = getRefundStatusInfo(refund.status);
                          return (
                            <View
                              key={idx}
                              style={{
                                backgroundColor: "#F5F5F5",
                                borderRadius: 12,
                                padding: 14,
                                marginBottom: 8,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: 8,
                                }}
                              >
                                <ThemedText
                                  style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: "#333",
                                  }}
                                >
                                  {formatPrice(refund.amount)}
                                </ThemedText>
                                <View
                                  style={{
                                    backgroundColor: statusInfo.bg,
                                    paddingHorizontal: 10,
                                    paddingVertical: 3,
                                    borderRadius: 10,
                                  }}
                                >
                                  <ThemedText
                                    style={{
                                      fontSize: 11,
                                      fontWeight: "700",
                                      color: statusInfo.color,
                                    }}
                                  >
                                    {statusInfo.label}
                                  </ThemedText>
                                </View>
                              </View>
                              <ThemedText
                                style={{ fontSize: 13, color: "#555" }}
                              >
                                Lý do: {refund.reason}
                              </ThemedText>
                              <ThemedText
                                style={{
                                  fontSize: 11,
                                  color: "#999",
                                  marginTop: 4,
                                }}
                              >
                                {formatDate(refund.createdAt)}
                              </ThemedText>
                            </View>
                          );
                        })
                      ) : showRefundForm ? (
                        <View>
                          <TextInput
                            style={{
                              borderWidth: 1,
                              borderColor: "#E0E0E0",
                              borderRadius: 12,
                              padding: 12,
                              fontSize: 14,
                              minHeight: 80,
                              textAlignVertical: "top",
                              backgroundColor: "#FAFAFA",
                              marginBottom: 14,
                            }}
                            placeholder="Nhập lý do yêu cầu hoàn tiền..."
                            placeholderTextColor="#BDBDBD"
                            multiline
                            numberOfLines={3}
                            value={refundReason}
                            onChangeText={setRefundReason}
                            maxLength={500}
                          />
                          <View style={{ flexDirection: "row", gap: 10 }}>
                            <TouchableOpacity
                              onPress={() => setShowRefundForm(false)}
                              style={{
                                flex: 1,
                                paddingVertical: 12,
                                borderRadius: 12,
                                alignItems: "center",
                                backgroundColor: "#F5F5F5",
                              }}
                            >
                              <ThemedText
                                style={{
                                  fontSize: 14,
                                  fontWeight: "600",
                                  color: "#666",
                                }}
                              >
                                Hủy
                              </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={handleRequestRefund}
                              disabled={
                                isSubmittingRefund || !refundReason.trim()
                              }
                              style={{
                                flex: 2,
                                paddingVertical: 12,
                                borderRadius: 12,
                                alignItems: "center",
                                backgroundColor: refundReason.trim()
                                  ? "#FF9800"
                                  : "#CCC",
                                opacity: isSubmittingRefund ? 0.7 : 1,
                              }}
                            >
                              {isSubmittingRefund ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <ThemedText
                                  style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: "#fff",
                                  }}
                                >
                                  Gửi yêu cầu
                                </ThemedText>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => setShowRefundForm(true)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            paddingVertical: 14,
                            borderRadius: 12,
                            backgroundColor: "#FFF3E0",
                            borderWidth: 1,
                            borderColor: "#FFB74D",
                          }}
                        >
                          <Icon
                            name="account-balance-wallet"
                            size={18}
                            color="#E65100"
                          />
                          <ThemedText
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: "#E65100",
                            }}
                          >
                            Yêu cầu hoàn tiền
                          </ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                {/* Reorder Button - for COMPLETED or CANCELED orders */}
                {(selectedOrder.status === "COMPLETED" ||
                  selectedOrder.status === "CANCELED") && (
                  <TouchableOpacity
                    onPress={() => handleReorder(selectedOrder.id)}
                    disabled={isReordering}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      paddingVertical: 16,
                      borderRadius: 14,
                      marginTop: 8,
                      backgroundColor: "#003D5B",
                      opacity: isReordering ? 0.7 : 1,
                      shadowColor: "#003D5B",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    {isReordering ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Icon name="refresh" size={20} color="#fff" />
                        <ThemedText
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: "#fff",
                          }}
                        >
                          Đặt lại đơn hàng
                        </ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </ScrollView>
            ) : (
              <ThemedText style={{ textAlign: "center", margin: 20 }}>
                Không có dữ liệu
              </ThemedText>
            )}
          </View>
        </View>
      </Modal>

      {/* Timeline Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showTimelineDetail}
        onRequestClose={() => setShowTimelineDetail(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.trackingModalView}>
            <AppModalHeader
              title="Chi tiết lộ trình"
              onClose={() => setShowTimelineDetail(false)}
              showDivider={true}
            />

            {isLoadingTimeline ? (
              <ActivityIndicator
                size="large"
                color="#003D5B"
                style={{ marginVertical: 40 }}
              />
            ) : timelineEvents.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {timelineEvents.map((event: any, index: number) => (
                  <View
                    key={index}
                    style={{ flexDirection: "row", marginBottom: 20 }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        marginRight: 14,
                        width: 24,
                      }}
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: index === 0 ? "#4CAF50" : "#BDBDBD",
                          borderWidth: 2,
                          borderColor: index === 0 ? "#A5D6A7" : "#E0E0E0",
                        }}
                      />
                      {index < timelineEvents.length - 1 && (
                        <View
                          style={{
                            width: 2,
                            flex: 1,
                            backgroundColor: "#E0E0E0",
                            marginTop: 4,
                          }}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1, paddingBottom: 4 }}>
                      <ThemedText
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        {event.statusDescription || event.status || "Cập nhật"}
                      </ThemedText>
                      {event.description && (
                        <ThemedText
                          style={{ fontSize: 13, color: "#666", marginTop: 2 }}
                        >
                          {event.description}
                        </ThemedText>
                      )}
                      <ThemedText
                        style={{ fontSize: 11, color: "#999", marginTop: 4 }}
                      >
                        {formatDate(event.timestamp || event.createdAt)}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={{ alignItems: "center", marginVertical: 30 }}>
                <Icon name="timeline" size={48} color="#CCC" />
                <ThemedText
                  style={{ fontSize: 14, color: "#999", marginTop: 12 }}
                >
                  Chưa có dữ liệu lộ trình
                </ThemedText>
              </View>
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
    fontSize: 24,
    fontWeight: "900",
    color: "#003D5B",
    marginBottom: 8,
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
  detailPinLabel: {
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
  detailTotalLabel: { fontSize: 15, fontWeight: "700", color: "#111" },
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
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

  // Modern Card Styles
  modernCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },
  cardAccentTop: {
    height: 4,
    width: "100%",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    paddingRight: 8,
    minWidth: 0,
  },
  modernOrderNumber: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: 0.2,
  },
  modernTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modernStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexShrink: 0,
    minWidth: 90,
    maxWidth: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  modernStatusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  modernCardDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoColumn: {
    flex: 1,
    gap: 4,
  },
  infoLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  pinHighlightBg: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  pinHighlightLabel: {
    fontSize: 11,
    color: "#E65100",
    fontWeight: "700",
  },
  pinHighlightValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#E65100",
    letterSpacing: 1.5,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cardTimeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardTimeText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  bottomSpacer: {
    height: 100,
  },

  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bottomSheetView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  trackingModalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  trackingInfoContainer: {
    marginBottom: 20,
    backgroundColor: "#F7FAFC",
    padding: 16,
    borderRadius: 12,
  },
  trackingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  trackingLabel: {
    color: "#666",
    fontSize: 14,
  },
  trackingValue: {
    fontWeight: "600",
    color: "#333",
    fontSize: 14,
  },
  timelineWrapper: {
    marginBottom: 20,
  },
  timelineContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
    paddingHorizontal: 4,
  },
  timelineStep: {
    alignItems: "center",
    width: 50,
    position: "relative",
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#E2E8F0",
    marginBottom: 4,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineDotActive: {
    backgroundColor: "#4CAF50",
  },
  timelineDotCurrent: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#003D5B",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    elevation: 3,
  },
  timelineLabel: {
    fontSize: 8,
    textAlign: "center",
    color: "#CBD5E0",
  },
  timelineLabelActive: {
    color: "#003D5B",
    fontWeight: "700",
  },
  timelineLine: {
    position: "absolute",
    top: 6,
    left: "50%",
    width: "100%",
    height: 2,
    backgroundColor: "#E2E8F0",
    zIndex: 1,
  },
  timelineLineActive: {
    backgroundColor: "#4CAF50",
  },
  statusDescriptionBox: {
    backgroundColor: "#EBF8FF",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#003D5B",
  },
  statusDescTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#003D5B",
    marginBottom: 4,
  },
  statusDescText: {
    fontSize: 13,
    color: "#4A5568",
    marginBottom: 8,
  },
  nextActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2F855A",
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
  detailTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003D5B",
  },
  loadingMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  loadingMoreText: {
    fontSize: 13,
    color: "#6B7280",
  },
});
