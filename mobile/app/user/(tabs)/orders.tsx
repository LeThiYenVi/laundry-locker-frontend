import { ThemedText } from "@/components/themed-text";
import { Icon } from "@rneui/themed";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#4CAF50"; // Green
      case "in-progress":
        return "#FF9800"; // Orange
      case "pending":
      case "cancelled":
        return "#FF5722"; // Red
      default:
        return "#003D5B"; // Default blue
    }
  };
  const [orderDetails, setOrderDetails] = useState({
    id: "12345",
    customerNote: "",
    orderPhone: "0969 218 002002",
    receiverPhone: "0969 218 002002",
    amount: "120.000 VND",
    receivedTime: "18/09/2002",
    paymentMethod: "Cash",
    status: "RETURNED",
  });

  const [serviceQuantity, setServiceQuantity] = useState(2);

  // Mock order history data
  const orderHistory = [
    {
      id: "ORD-2024-001",
      date: "18/01/2026",
      locker: "Tủ #5, Store A",
      service: "Service A - Giặt ủi",
      status: "completed",
      statusLabel: "Hoàn thành",
      amount: "120.000 VND",
      items: ["Clothes", "Towels"],
      reward: { current: 3, total: 6 },
      timeline: [
        {
          time: "11:24",
          date: "24/11/2024",
          label: "Initialized",
          status: "done",
        },
        { time: "24:11", date: "24/11/2024", label: "Waiting", status: "done" },
        {
          time: "11:11",
          date: "24/11/2024",
          label: "Complete",
          status: "done",
        },
      ],
    },
    {
      id: "ORD-2024-002",
      date: "15/01/2026",
      locker: "Tủ #12, Store B",
      service: "Service B - Gửi đồ",
      status: "in-progress",
      statusLabel: "Đang xử lý",
      amount: "85.000 VND",
      items: ["Clothes"],
      reward: { current: 2, total: 6 },
      timeline: [
        {
          time: "14:30",
          date: "15/01/2026",
          label: "Initialized",
          status: "done",
        },
        {
          time: "15:45",
          date: "15/01/2026",
          label: "Waiting",
          status: "current",
        },
        {
          time: "--:--",
          date: "--/--/----",
          label: "Complete",
          status: "pending",
        },
      ],
    },
    {
      id: "ORD-2024-003",
      date: "10/01/2026",
      locker: "Tủ #8, Store A",
      service: "Service A - Giặt ủi",
      status: "pending",
      statusLabel: "Chưa hoàn thành",
      amount: "150.000 VND",
      items: ["Clothes", "Bedding"],
      reward: { current: 1, total: 6 },
      timeline: [
        {
          time: "09:15",
          date: "10/01/2026",
          label: "Initialized",
          status: "current",
        },
        {
          time: "--:--",
          date: "--/--/----",
          label: "Waiting",
          status: "pending",
        },
        {
          time: "--:--",
          date: "--/--/----",
          label: "Complete",
          status: "pending",
        },
      ],
    },
  ];

  const steps = [
    { id: 1, label: "Đơn hàng" },
    { id: 2, label: "Xác nhận" },
    { id: 3, label: "Hoàn tất" },
  ];

  const incrementQuantity = () => setServiceQuantity(serviceQuantity + 1);
  const decrementQuantity = () => {
    if (serviceQuantity > 1) setServiceQuantity(serviceQuantity - 1);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>
          {activeTab === "create" ? "Tạo đơn hàng mới" : "Lịch sử đơn hàng"}
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          {activeTab === "create"
            ? "Vui lòng điền đầy đủ thông tin"
            : "Xem tất cả đơn hàng của bạn"}
        </ThemedText>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "create" && styles.tabActive]}
          onPress={() => setActiveTab("create")}
        >
          <Icon
            name="add-circle-outline"
            type="material"
            size={20}
            color={activeTab === "create" ? "#003D5B" : "#999"}
          />
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "create" && styles.tabTextActive,
            ]}
          >
            Đặt đơn hàng
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.tabActive]}
          onPress={() => setActiveTab("history")}
        >
          <Icon
            name="history"
            type="material"
            size={20}
            color={activeTab === "history" ? "#003D5B" : "#999"}
          />
          <ThemedText
            style={[
              styles.tabText,
              activeTab === "history" && styles.tabTextActive,
            ]}
          >
            Lịch sử
          </ThemedText>
        </TouchableOpacity>
      </View>

      {activeTab === "create" ? (
        <>
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {steps.map((step, index) => (
              <View key={step.id} style={styles.stepWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    currentStep >= step.id && styles.stepCircleActive,
                  ]}
                >
                  {currentStep > step.id ? (
                    <Icon name="check" type="material" size={16} color="#fff" />
                  ) : (
                    <ThemedText
                      style={[
                        styles.stepNumber,
                        currentStep >= step.id && styles.stepNumberActive,
                      ]}
                    >
                      {step.id}
                    </ThemedText>
                  )}
                </View>
                <ThemedText
                  style={[
                    styles.stepLabel,
                    currentStep >= step.id && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </ThemedText>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      currentStep > step.id && styles.stepLineActive,
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Basic Information Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Thông tin</ThemedText>
              </View>

              <View style={styles.card}>
                {/* Order ID */}
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}># Id</ThemedText>
                  <View style={styles.infoBadge}>
                    <ThemedText style={styles.infoBadgeText}>
                      {orderDetails.status}
                    </ThemedText>
                  </View>
                </View>

                {/* Customer Note */}
                <View style={styles.infoRowColumn}>
                  <ThemedText style={styles.infoLabel}>
                    Customer note
                  </ThemedText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập ghi chú..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={2}
                    value={orderDetails.customerNote}
                    onChangeText={(text) =>
                      setOrderDetails({ ...orderDetails, customerNote: text })
                    }
                  />
                </View>

                {/* Phone Numbers */}
                <View style={styles.infoRowDouble}>
                  <View style={styles.infoColumn}>
                    <ThemedText style={styles.infoLabel}>
                      Order Phone
                    </ThemedText>
                    <View style={styles.phoneContainer}>
                      <Icon
                        name="phone"
                        type="material"
                        size={16}
                        color="#003D5B"
                      />
                      <ThemedText style={styles.phoneText}>
                        {orderDetails.orderPhone}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.infoColumn}>
                    <ThemedText style={styles.infoLabel}>
                      Receiver Phone
                    </ThemedText>
                    <View style={styles.phoneContainer}>
                      <Icon
                        name="phone"
                        type="material"
                        size={16}
                        color="#003D5B"
                      />
                      <ThemedText style={styles.phoneText}>
                        {orderDetails.receiverPhone}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Amount and Received Time */}
                <View style={styles.infoRowDouble}>
                  <View style={styles.infoColumn}>
                    <ThemedText style={styles.infoLabel}>Amount</ThemedText>
                    <View style={styles.amountContainer}>
                      <Icon
                        name="attach-money"
                        type="material"
                        size={16}
                        color="#4CAF50"
                      />
                      <ThemedText style={styles.amountText}>
                        {orderDetails.amount}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.infoColumn}>
                    <ThemedText style={styles.infoLabel}>
                      Received Time
                    </ThemedText>
                    <View style={styles.timeContainer}>
                      <Icon
                        name="calendar-today"
                        type="material"
                        size={16}
                        color="#666"
                      />
                      <ThemedText style={styles.timeText}>
                        {orderDetails.receivedTime}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Payment Method and Status */}
                <View style={styles.infoRowDouble}>
                  <View style={styles.infoColumn}>
                    <ThemedText style={styles.infoLabel}>
                      Payment Method
                    </ThemedText>
                    <View style={styles.paymentContainer}>
                      <Icon
                        name="money"
                        type="material"
                        size={16}
                        color="#FF9800"
                      />
                      <ThemedText style={styles.paymentText}>
                        {orderDetails.paymentMethod}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.infoColumn}>
                    <ThemedText style={styles.infoLabel}>Status</ThemedText>
                    <View style={styles.statusBadge}>
                      <ThemedText style={styles.statusText}>
                        {orderDetails.status}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Details Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Details</ThemedText>
                <TouchableOpacity style={styles.addButton}>
                  <Icon name="add" type="material" size={18} color="#003D5B" />
                </TouchableOpacity>
              </View>

              {/* Service A Card */}
              <View style={styles.detailCard}>
                <View style={styles.detailHeader}>
                  <View style={styles.detailIcon}>
                    <Icon
                      name="store"
                      type="material"
                      size={32}
                      color="#003D5B"
                    />
                  </View>
                  <View style={styles.detailInfo}>
                    <ThemedText style={styles.detailTitle}>
                      Service A
                    </ThemedText>
                    <ThemedText style={styles.detailDescription}>
                      Người dùng lorem ipsum hãy ra nội dụng vô đặt bắt nào vô
                      loà con
                    </ThemedText>
                    <ThemedText style={styles.detailPrice}>
                      120.000 VND / Unit
                    </ThemedText>
                  </View>
                  <View style={styles.detailActions}>
                    <TouchableOpacity style={styles.iconButton}>
                      <Icon
                        name="check-circle"
                        type="material"
                        size={24}
                        color="#4CAF50"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                      <Icon
                        name="delete"
                        type="material"
                        size={24}
                        color="#FF5722"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Quantity Selector */}
                <View style={styles.quantitySection}>
                  <View style={styles.quantityTimeline}>
                    <View style={styles.timelineStart} />
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineIcon}>
                      <Icon
                        name="lock"
                        type="material"
                        size={20}
                        color="#fff"
                      />
                    </View>
                    <View style={styles.timelineLine} />
                    <View style={styles.timelineEnd} />
                  </View>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={decrementQuantity}
                    >
                      <ThemedText style={styles.quantityButtonText}>
                        -
                      </ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={styles.quantityValue}>
                      {serviceQuantity}.0
                    </ThemedText>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={incrementQuantity}
                    >
                      <ThemedText style={styles.quantityButtonText}>
                        +
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Items Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Items</ThemedText>
                <TouchableOpacity style={styles.addButton}>
                  <Icon name="add" type="material" size={18} color="#003D5B" />
                </TouchableOpacity>
              </View>

              {/* Clothes Item Card */}
              <View style={styles.itemCard}>
                <View style={styles.itemIcon}>
                  <Icon
                    name="checkroom"
                    type="material"
                    size={32}
                    color="#003D5B"
                  />
                </View>
                <View style={styles.itemInfo}>
                  <ThemedText style={styles.itemTitle}>Clothes</ThemedText>
                  <ThemedText style={styles.itemDescription}>
                    Phasellus non lorem Thức nỗi dị củ và xinh tên ấy thường nàm
                    công
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.secondaryButton}>
                <ThemedText style={styles.secondaryButtonText}>
                  Quay lại
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setCurrentStep(2)}
              >
                <ThemedText style={styles.primaryButtonText}>
                  Tiếp tục
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </>
      ) : (
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Order History List */}
          <View style={styles.historyContainer}>
            {orderHistory.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.historyCardWrapper}
                onPress={() => {
                  setSelectedOrder(order);
                  setShowOrderDetail(true);
                }}
                activeOpacity={0.7}
              >
                {/* Left Sidebar */}
                <View
                  style={[
                    styles.historySidebar,
                    { backgroundColor: getStatusColor(order.status) },
                  ]}
                >
                  <View style={styles.sidebarContent}>
                    <Icon
                      name={
                        order.status === "completed"
                          ? "check-circle"
                          : order.status === "in-progress"
                            ? "pending"
                            : "cancel"
                      }
                      type="material"
                      size={28}
                      color="#fff"
                    />
                    <ThemedText style={styles.sidebarStatus}>
                      {order.status === "completed"
                        ? "Laundry"
                        : order.status === "in-progress"
                          ? "Locked"
                          : "Cancelled"}
                    </ThemedText>
                    <View style={styles.sidebarDivider} />
                    <Icon
                      name="inventory-2"
                      type="material"
                      size={24}
                      color="#fff"
                    />
                    <ThemedText style={styles.sidebarText}>
                      Send Items
                    </ThemedText>
                  </View>

                  {/* Perforated Edge - Răng cưa */}
                  <View style={styles.perforatedEdge}>
                    {Array.from({ length: 10 }, (_, i) => (
                      <View key={i} style={styles.perforation} />
                    ))}
                  </View>
                </View>

                {/* Main Card Content */}
                <View style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyHeaderLeft}>
                      <View style={styles.historyIconWrapper}>
                        <Icon
                          name="access-time"
                          type="material"
                          size={16}
                          color="#003D5B"
                        />
                        <ThemedText style={styles.historyTimeLabel}>
                          Time
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.historyDate}>
                        {order.date}
                      </ThemedText>
                    </View>
                    <View style={styles.historyIconContainer}>
                      <Icon
                        name="local-laundry-service"
                        type="material"
                        size={40}
                        color="#003D5B"
                      />
                    </View>
                  </View>

                  <View style={styles.historyInfoSection}>
                    <View style={styles.historyInfoRow}>
                      <View style={styles.historyInfoItem}>
                        <Icon
                          name="inbox"
                          type="material"
                          size={14}
                          color="#666"
                        />
                        <ThemedText style={styles.historyInfoLabel}>
                          Send Box
                        </ThemedText>
                        <ThemedText style={styles.historyInfoValue}>
                          #{order.locker.split("#")[1]?.split(",")[0] || "2"}
                        </ThemedText>
                      </View>
                      <View style={styles.historyInfoItem}>
                        <Icon
                          name="move-to-inbox"
                          type="material"
                          size={14}
                          color="#666"
                        />
                        <ThemedText style={styles.historyInfoLabel}>
                          Receive Box
                        </ThemedText>
                        <ThemedText style={styles.historyInfoValue}>
                          #{order.locker.split("#")[1]?.split(",")[0] || "2"}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.historyInfoRow}>
                      <View style={styles.historyInfoItem}>
                        <Icon
                          name="payments"
                          type="material"
                          size={14}
                          color="#666"
                        />
                        <ThemedText style={styles.historyInfoLabel}>
                          Total
                        </ThemedText>
                        <ThemedText style={styles.historyTotalValue}>
                          {order.amount}
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.historyDivider} />

                  <View style={styles.historyFooter}>
                    <View style={styles.historyPeopleSection}>
                      <View style={styles.historyPerson}>
                        <Icon
                          name="person"
                          type="material"
                          size={14}
                          color="#003D5B"
                        />
                        <View style={styles.historyPersonInfo}>
                          <ThemedText style={styles.historyPersonLabel}>
                            Sender
                          </ThemedText>
                          <ThemedText style={styles.historyPersonName}>
                            Letermer
                          </ThemedText>
                          <ThemedText style={styles.historyPersonPhone}>
                            07724112004
                          </ThemedText>
                        </View>
                      </View>
                      <View style={styles.historyPerson}>
                        <Icon
                          name="person-outline"
                          type="material"
                          size={14}
                          color="#003D5B"
                        />
                        <View style={styles.historyPersonInfo}>
                          <ThemedText style={styles.historyPersonLabel}>
                            Receiver
                          </ThemedText>
                          <ThemedText style={styles.historyPersonName}>
                            Lock.R
                          </ThemedText>
                          <ThemedText style={styles.historyPersonPhone}>
                            07724112004
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* See More Button */}
            <TouchableOpacity style={styles.seeMoreButton}>
              <ThemedText style={styles.seeMoreText}>See More</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <StatusBar barStyle="dark-content" />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setShowOrderDetail(false)}
              >
                <Icon
                  name="arrow-back"
                  type="material"
                  size={24}
                  color="#000"
                />
              </TouchableOpacity>
              <ThemedText style={styles.modalHeaderTitle}>
                Service Detail
              </ThemedText>
              <TouchableOpacity style={styles.modalCartButton}>
                <Icon
                  name="shopping-cart"
                  type="material"
                  size={24}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Reward Section */}
              <View style={styles.rewardSection}>
                <ThemedText style={styles.rewardTitle}>
                  My Reward{" "}
                  <ThemedText style={styles.rewardCount}>
                    ({selectedOrder.reward.current}/{selectedOrder.reward.total}
                    )
                  </ThemedText>
                </ThemedText>
                <ThemedText style={styles.rewardId}>
                  ID: {selectedOrder.id.replace("ORD-", "")}
                </ThemedText>

                {/* Locker Status Grid */}
                <View style={styles.lockerGrid}>
                  {Array.from({ length: 6 }, (_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.lockerBox,
                        i < selectedOrder.reward.current
                          ? styles.lockerBoxLocked
                          : styles.lockerBoxFree,
                      ]}
                    >
                      <Icon
                        name="lock"
                        type="material"
                        size={20}
                        color={
                          i < selectedOrder.reward.current ? "#fff" : "#ccc"
                        }
                      />
                      <ThemedText
                        style={[
                          styles.lockerBoxLabel,
                          i < selectedOrder.reward.current
                            ? styles.lockerBoxLabelLocked
                            : styles.lockerBoxLabelFree,
                        ]}
                      >
                        {i < selectedOrder.reward.current
                          ? `Locked ${i + 1}`
                          : i === selectedOrder.reward.current
                            ? "Free"
                            : "Free"}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>

              {/* Service Card */}
              <View style={styles.serviceDetailCard}>
                <View style={styles.serviceCardHeader}>
                  <View style={styles.serviceCardIcon}>
                    <Icon
                      name="store"
                      type="material"
                      size={32}
                      color="#003D5B"
                    />
                  </View>
                  <View style={styles.serviceCardInfo}>
                    <ThemedText style={styles.serviceCardTitle}>
                      {selectedOrder.service.split("-")[0].trim()}
                    </ThemedText>
                    <ThemedText style={styles.serviceCardDescription}>
                      Người dùng Nhật Minh Thực ra một củ giá xinh tên đặt
                      thường, cảm-ơn bụ
                    </ThemedText>
                    <View style={styles.serviceCardBadge}>
                      <ThemedText style={styles.serviceCardBadgeText}>
                        ACTIVE
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Timeline */}
                <View style={styles.timelineSection}>
                  {selectedOrder.timeline.map((item: any, index: number) => (
                    <View key={index} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <ThemedText style={styles.timelineTime}>
                          {item.time}
                        </ThemedText>
                        <ThemedText style={styles.timelineDate}>
                          {item.date}
                        </ThemedText>
                      </View>
                      <View style={styles.timelineCenter}>
                        <View
                          style={[
                            styles.timelineDot,
                            item.status === "done" && styles.timelineDotDone,
                            item.status === "current" &&
                              styles.timelineDotCurrent,
                            item.status === "pending" &&
                              styles.timelineDotPending,
                          ]}
                        >
                          {item.status === "done" && (
                            <Icon
                              name="check"
                              type="material"
                              size={12}
                              color="#fff"
                            />
                          )}
                        </View>
                        {index < selectedOrder.timeline.length - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              item.status === "done" && styles.timelineLineDone,
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.timelineRight}>
                        <ThemedText
                          style={[
                            styles.timelineLabel,
                            item.status === "done" && styles.timelineLabelDone,
                            item.status === "current" &&
                              styles.timelineLabelCurrent,
                          ]}
                        >
                          {item.label}
                        </ThemedText>
                        {item.status === "current" && (
                          <Icon
                            name="pending"
                            type="material"
                            size={20}
                            color="#FF9800"
                          />
                        )}
                        {item.status === "done" && (
                          <Icon
                            name="check-circle"
                            type="material"
                            size={20}
                            color="#4CAF50"
                          />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.bottomSpacer} />
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  tabActive: {
    backgroundColor: "#E8F4F8",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  tabTextActive: {
    color: "#003D5B",
    fontWeight: "700",
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  stepWrapper: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: "#003D5B",
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#999",
  },
  stepNumberActive: {
    color: "#fff",
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
    textAlign: "center",
  },
  stepLabelActive: {
    color: "#003D5B",
  },
  stepLine: {
    position: "absolute",
    top: 18,
    left: "50%",
    right: "-50%",
    height: 2,
    backgroundColor: "#E8E8E8",
    zIndex: 1,
  },
  stepLineActive: {
    backgroundColor: "#003D5B",
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
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
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    gap: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoRowColumn: {
    gap: 8,
  },
  infoRowDouble: {
    flexDirection: "row",
    gap: 12,
  },
  infoColumn: {
    flex: 1,
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  infoBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF9800",
  },
  textInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: "#000",
    minHeight: 60,
    textAlignVertical: "top",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
  },
  phoneText: {
    fontSize: 13,
    color: "#000",
    fontWeight: "600",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
  },
  amountText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "700",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 13,
    color: "#000",
    fontWeight: "600",
  },
  paymentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 13,
    color: "#000",
    fontWeight: "600",
  },
  statusBadge: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF9800",
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  detailIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E8F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
  detailInfo: {
    flex: 1,
    gap: 4,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
  },
  detailDescription: {
    fontSize: 11,
    color: "#666",
    lineHeight: 16,
  },
  detailPrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#003D5B",
    marginTop: 4,
  },
  detailActions: {
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  quantitySection: {
    position: "relative",
    paddingVertical: 20,
  },
  quantityTimeline: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineStart: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8E8E8",
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E8E8E8",
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  timelineEnd: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8E8E8",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
    zIndex: 2,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E8F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
  },
  itemDescription: {
    fontSize: 11,
    color: "#666",
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#E8E8E8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#003D5B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  bottomSpacer: {
    height: 40,
  },
  historyContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 20,
  },
  historyCardWrapper: {
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderRadius: 20,
    overflow: "hidden",
  },
  historySidebar: {
    width: 65,
    backgroundColor: "#003D5B",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  sidebarContent: {
    alignItems: "center",
    gap: 8,
    zIndex: 2,
  },
  perforatedEdge: {
    position: "absolute",
    right: -6,
    top: 0,
    bottom: 0,
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  perforation: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  sidebarStatus: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  sidebarDivider: {
    width: 30,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginVertical: 12,
  },
  sidebarText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    lineHeight: 12,
  },
  historyCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  historyHeaderLeft: {
    flex: 1,
    gap: 6,
  },
  historyIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  historyTimeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003D5B",
  },
  historyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E8F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
  historyOrderId: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
  },
  historyDate: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },
  historyInfoSection: {
    gap: 8,
    marginBottom: 16,
  },
  historyInfoRow: {
    flexDirection: "row",
    gap: 12,
  },
  historyInfoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 8,
  },
  historyInfoLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  historyInfoValue: {
    fontSize: 12,
    color: "#000",
    fontWeight: "700",
    marginLeft: "auto",
  },
  historyTotalValue: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "800",
    marginLeft: "auto",
  },
  historyDivider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginBottom: 16,
  },
  historyFooter: {
    gap: 12,
  },
  historyPeopleSection: {
    flexDirection: "row",
    gap: 16,
  },
  historyPerson: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  historyPersonInfo: {
    flex: 1,
    gap: 2,
  },
  historyPersonLabel: {
    fontSize: 10,
    color: "#003D5B",
    fontWeight: "700",
  },
  historyPersonName: {
    fontSize: 13,
    color: "#000",
    fontWeight: "700",
  },
  historyPersonPhone: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  seeMoreButton: {
    backgroundColor: "#E8E8E8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
  },
  // Modal Styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F5F5F5",
    zIndex: 999,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  modalBackButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },
  modalCartButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  modalScrollView: {
    flex: 1,
  },
  rewardSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  rewardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    marginBottom: 4,
  },
  rewardCount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#003D5B",
  },
  rewardId: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    marginBottom: 20,
  },
  lockerGrid: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  lockerBox: {
    width: "15%",
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  lockerBoxLocked: {
    backgroundColor: "#003D5B",
  },
  lockerBoxFree: {
    backgroundColor: "#E8E8E8",
  },
  lockerBoxLabel: {
    fontSize: 8,
    fontWeight: "700",
    textAlign: "center",
  },
  lockerBoxLabelLocked: {
    color: "#fff",
  },
  lockerBoxLabelFree: {
    color: "#999",
  },
  serviceDetailCard: {
    marginHorizontal: 24,
    backgroundColor: "#003D5B",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  serviceCardHeader: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  serviceCardIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#E8F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
  serviceCardInfo: {
    flex: 1,
    gap: 6,
  },
  serviceCardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
  },
  serviceCardDescription: {
    fontSize: 11,
    color: "#666",
    lineHeight: 16,
  },
  serviceCardBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  serviceCardBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  timelineSection: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 16,
    minHeight: 60,
  },
  timelineLeft: {
    width: 80,
    alignItems: "flex-end",
    paddingTop: 4,
  },
  timelineTime: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  timelineDate: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
  },
  timelineCenter: {
    alignItems: "center",
    width: 24,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  timelineDotDone: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  timelineDotCurrent: {
    backgroundColor: "#FF9800",
    borderColor: "#FF9800",
  },
  timelineDotPending: {
    backgroundColor: "transparent",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  timelineLineDone: {
    backgroundColor: "#4CAF50",
  },
  timelineRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.6)",
  },
  timelineLabelDone: {
    color: "#fff",
  },
  timelineLabelCurrent: {
    color: "#fff",
  },
});
