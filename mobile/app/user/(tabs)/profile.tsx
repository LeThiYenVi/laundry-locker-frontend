import { AppModalHeader } from "@/components/app-modal-header";
import { ThemedText } from "@/components/themed-text";
import { Image } from "expo-image";
import { useAuth } from "@/context/AuthContext";
import {
  orderService,
  userService,
  loyaltyService,
  lockerService,
} from "@/services/user";
import type { LoyaltySummary } from "@/services/user/loyaltyService";
import {
  Order,
  OrderComplaintResponse,
  User,
  UserStatisticsResponse,
} from "@/types";
import { Icon } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import partnerService from "@/services/partner/partnerService";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Avatar Update State
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  // Edit Profile State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    birthday: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  // Change Password State
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Partner Registration State
  const [partnerModalVisible, setPartnerModalVisible] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    businessName: "",
    businessAddress: "",
    contactPhone: "",
    businessRegistrationNumber: "",
    taxId: "",
  });
  const [registeringPartner, setRegisteringPartner] = useState(false);

  // Refreshing state
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
  });

  // User Statistics from API
  const [userStats, setUserStats] = useState<UserStatisticsResponse | null>(
    null,
  );

  // Loyalty state
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);

  // Partner Profile state
  const [partnerProfile, setPartnerProfile] = useState<any | null>(null);

  // Complaints state
  const [complaintsModalVisible, setComplaintsModalVisible] = useState(false);
  const [myComplaints, setMyComplaints] = useState<OrderComplaintResponse[]>(
    [],
  );
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  // Locker Reports state
  const [reportsModalVisible, setReportsModalVisible] = useState(false);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        setProfileData(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOrderStats = useCallback(async () => {
    try {
      // Fetch all orders to calculate stats
      const response = await orderService.getOrders();
      if (response.success && response.data && response.data.content) {
        const orders = response.data.content;
        const total = orders.length;
        const completed = orders.filter(
          (o: Order) => o.status === "COMPLETED",
        ).length;
        // Active orders are anything not completed or canceled (simplified logic)
        const active = orders.filter((o: Order) =>
          [
            "INITIALIZED",
            "WAITING",
            "COLLECTED",
            "PROCESSING",
            "READY",
            "RETURNED",
          ].includes(o.status),
        ).length;

        setStats({
          totalOrders: total,
          completedOrders: completed,
          activeOrders: active,
        });
      }
    } catch (error) {
      console.error("Failed to fetch order stats:", error);
    }
  }, []);

  const fetchUserStatistics = useCallback(async () => {
    try {
      const response = await userService.getUserStatistics();
      if (response.success) {
        setUserStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch user statistics:", error);
    }
  }, []);

  const fetchLoyalty = useCallback(async () => {
    try {
      const response = await loyaltyService.getLoyaltySummary();
      if (response.success) {
        setLoyalty(response.data);
      }
    } catch (error: any) {
      if (
        error?.response?.status === 400 &&
        error?.response?.data?.code === "E_LOYALTY001"
      ) {
        return;
      }
      console.error("Failed to fetch loyalty:", error);
    }
  }, []);

  const fetchPartnerProfile = useCallback(async () => {
    try {
      const response = await partnerService.getProfile();
      if (response.success) {
        setPartnerProfile(response.data);
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error("Failed to fetch partner profile:", error);
      }
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchOrderStats();
    fetchLoyalty();
    fetchPartnerProfile();
    fetchUserStatistics();
  }, [
    fetchProfile,
    fetchOrderStats,
    fetchLoyalty,
    fetchPartnerProfile,
    fetchUserStatistics,
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchProfile(),
      fetchOrderStats(),
      fetchLoyalty(),
      fetchPartnerProfile(),
      fetchUserStatistics(),
    ]);
    setRefreshing(false);
  }, [
    fetchProfile,
    fetchOrderStats,
    fetchLoyalty,
    fetchPartnerProfile,
    fetchUserStatistics,
  ]);

  const openEditModal = () => {
    setEditForm({
      firstName: displayUser?.firstName || "",
      lastName: displayUser?.lastName || "",
      phoneNumber: displayUser?.phoneNumber || "",
      email: displayUser?.email || "",
      birthday: "",
    });
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async () => {
    setUpdatingProfile(true);
    try {
      const result = await userService.updateProfile({
        firstName: editForm.firstName || undefined,
        lastName: editForm.lastName || undefined,
        phoneNumber: editForm.phoneNumber || undefined,
        email: editForm.email || undefined,
        birthday: editForm.birthday || undefined,
      });
      if (result.success) {
        setProfileData(result.data);
        if (refreshUser) refreshUser();
        setEditModalVisible(false);
        Alert.alert("Thành công", "Cập nhật hồ sơ thành công");
      } else {
        Alert.alert("Lỗi", result.message || "Không thể cập nhật hồ sơ");
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      const msg =
        error?.response?.data?.message || "Đã xảy ra lỗi khi cập nhật";
      Alert.alert("Lỗi", msg);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }
    setChangingPassword(true);
    try {
      const result = await userService.changePassword(passwordForm);
      if (result.success) {
        setPasswordModalVisible(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        Alert.alert("Thành công", "Đổi mật khẩu thành công");
      } else {
        Alert.alert("Lỗi", result.message || "Không thể đổi mật khẩu");
      }
    } catch (error: any) {
      console.error("Change password error:", error);
      const msg =
        error?.response?.data?.message ||
        "Mật khẩu hiện tại không đúng hoặc đã xảy ra lỗi";
      Alert.alert("Lỗi", msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRegisterPartner = async () => {
    if (
      !partnerForm.businessName ||
      !partnerForm.businessAddress ||
      !partnerForm.contactPhone
    ) {
      Alert.alert("Lỗi", "Vui lòng điền các thông tin bắt buộc (*)");
      return;
    }
    setRegisteringPartner(true);
    try {
      const result = await partnerService.registerPartner({
        businessName: partnerForm.businessName,
        businessAddress: partnerForm.businessAddress,
        contactPhone: partnerForm.contactPhone,
        businessRegistrationNumber: partnerForm.businessRegistrationNumber,
        taxId: partnerForm.taxId,
      });
      if (result.success) {
        setPartnerModalVisible(false);
        setPartnerForm({
          businessName: "",
          businessAddress: "",
          contactPhone: "",
          businessRegistrationNumber: "",
          taxId: "",
        });
        setPartnerProfile(result.data); // Update UI immediately
        if (refreshUser) refreshUser(); // refresh to hopefully fetch new PARTNER role
        Alert.alert(
          "Thành công",
          "Đăng ký thông tin Đối tác thành công! Vui lòng chờ phê duyệt.",
        );
      } else {
        Alert.alert("Lỗi", "Không thể đăng ký làm đối tác");
      }
    } catch (error: any) {
      console.error("Register partner error:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi trong quá trình đăng ký Đối tác.");
    } finally {
      setRegisteringPartner(false);
    }
  };

  const handleUpdateAvatar = async () => {
    if (!newAvatarUrl.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đường dẫn hình ảnh");
      return;
    }

    setUpdatingAvatar(true);
    try {
      const result = await userService.updateAvatar(newAvatarUrl.trim());
      if (result.success) {
        setProfileData(result.data);
        if (refreshUser) refreshUser();
        setAvatarModalVisible(false);
        setNewAvatarUrl("");
        Alert.alert("Thành công", "Cập nhật ảnh đại diện thành công");
      } else {
        Alert.alert("Lỗi", result.message || "Không thể cập nhật ảnh đại diện");
      }
    } catch (error) {
      console.error("Update avatar error:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi cập nhật");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleOpenComplaints = async () => {
    setComplaintsModalVisible(true);
    setLoadingComplaints(true);
    setMyComplaints([]);
    try {
      const response = await orderService.getMyComplaints();
      if (response.success && response.data) {
        setMyComplaints(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch complaints:", error);
      setMyComplaints([]);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleOpenReports = async () => {
    setReportsModalVisible(true);
    setLoadingReports(true);
    setMyReports([]);
    try {
      const response = await lockerService.getMyReports();
      if (response.success && response.data) {
        setMyReports(response.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch reports:", error);
      setMyReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const getReportStatusInfo = (
    status: string,
  ): { label: string; bg: string; color: string } => {
    switch (status) {
      case "PENDING":
        return { label: "Chờ xử lý", bg: "#FFF3E0", color: "#FF9800" };
      case "INVESTIGATING":
        return { label: "Đang điều tra", bg: "#E3F2FD", color: "#1976D2" };
      case "RESOLVED":
        return { label: "Đã xử lý", bg: "#E8F5E9", color: "#4CAF50" };
      case "DISMISSED":
        return { label: "Đã bác bỏ", bg: "#FFEBEE", color: "#F44336" };
      default:
        return { label: status, bg: "#F5F5F5", color: "#666" };
    }
  };

  const getComplaintTypeLabel = (type: string): string => {
    switch (type) {
      case "DAMAGED":
        return "💔 Hư hỏng";
      case "MISSING":
        return "❓ Thiếu đồ";
      case "WRONG_ITEM":
        return "🔄 Sai đồ";
      case "QUALITY":
        return "👎 Chất lượng";
      default:
        return "📝 Khác";
    }
  };

  const getComplaintStatusInfo = (
    status: string,
  ): { label: string; bg: string; color: string } => {
    switch (status) {
      case "PENDING":
        return { label: "Chờ xử lý", bg: "#FFF3E0", color: "#FF9800" };
      case "INVESTIGATING":
        return { label: "Đang điều tra", bg: "#E3F2FD", color: "#1976D2" };
      case "RESOLVED":
        return { label: "Đã xử lý", bg: "#E8F5E9", color: "#4CAF50" };
      case "REJECTED":
        return { label: "Từ chối", bg: "#FFEBEE", color: "#F44336" };
      default:
        return { label: status, bg: "#F5F5F5", color: "#666" };
    }
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Logout failed:", error);
          }
        },
      },
    ]);
  };

  // Use auth context user if profile not loaded yet
  const displayUser = profileData || user;

  // Determine display name
  const displayName =
    displayUser?.lastName && displayUser?.firstName
      ? `${displayUser.lastName} ${displayUser.firstName}`
      : displayUser?.fullName || "Người dùng";

  // Determine avatar source (API might return image, imageUrl, or avatarUrl)
  const avatarSource =
    displayUser?.imageUrl || displayUser?.image || displayUser?.avatarUrl;

  if (isLoading && !displayUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003D5B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with gradient background */}
      <LinearGradient
        colors={["#ffffff", "#f0f8ff", "#d6e9f5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Image
                source={{
                  uri:
                    avatarSource ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser?.firstName || "User")}&background=003D5B&color=fff&size=128`,
                }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
                contentFit="cover"
                transition={200}
              />
            </View>
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={() => setAvatarModalVisible(true)}
            >
              <Icon name="edit" type="material" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.userName}>{displayName}</ThemedText>
          <ThemedText style={styles.userEmail}>
            {displayUser?.email || displayUser?.phoneNumber || ""}
          </ThemedText>
          <View style={styles.membershipBadge}>
            <Icon
              name="workspace-premium"
              type="material"
              size={16}
              color="#FFD700"
            />
            <ThemedText style={styles.membershipText}>
              {displayUser?.role === "USER" ? "Thành viên" : displayUser?.role}
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#003D5B"]}
          />
        }
      >
        {/* Statistics Cards */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Hoạt động của tôi</ThemedText>
          <View style={styles.statsGrid}>
            <View style={[styles.statCardGrid, { backgroundColor: "#E3F2FD" }]}>
              <View
                style={[
                  styles.statIconContainerGrid,
                  { backgroundColor: "#BBDEFB" },
                ]}
              >
                <Icon
                  name="local-laundry-service"
                  type="material"
                  size={24}
                  color="#1976D2"
                />
              </View>
              <View>
                <ThemedText
                  style={[styles.statValueGrid, { color: "#0D47A1" }]}
                >
                  {userStats?.totalLaundryOrders ?? stats.completedOrders}
                </ThemedText>
                <ThemedText style={styles.statLabelGrid}>Giặt đồ</ThemedText>
              </View>
            </View>

            <View style={[styles.statCardGrid, { backgroundColor: "#FFF3E0" }]}>
              <View
                style={[
                  styles.statIconContainerGrid,
                  { backgroundColor: "#FFE0B2" },
                ]}
              >
                <Icon
                  name="inventory-2"
                  type="material"
                  size={24}
                  color="#E65100"
                />
              </View>
              <View>
                <ThemedText
                  style={[styles.statValueGrid, { color: "#BF360C" }]}
                >
                  {userStats?.totalStorageOrders ?? stats.activeOrders}
                </ThemedText>
                <ThemedText style={styles.statLabelGrid}>Lưu trữ</ThemedText>
              </View>
            </View>

            <View style={[styles.statCardGrid, { backgroundColor: "#E8F5E9" }]}>
              <View
                style={[
                  styles.statIconContainerGrid,
                  { backgroundColor: "#C8E6C9" },
                ]}
              >
                <Icon
                  name="payments"
                  type="material"
                  size={24}
                  color="#388E3C"
                />
              </View>
              <View>
                <ThemedText
                  style={[styles.statValueGrid, { color: "#1B5E20" }]}
                >
                  {userStats
                    ? `${(userStats.totalAmountSpent / 1000).toFixed(0)}k`
                    : `${stats.totalOrders}`}
                </ThemedText>
                <ThemedText style={styles.statLabelGrid}>Đã chi</ThemedText>
              </View>
            </View>

            <View style={[styles.statCardGrid, { backgroundColor: "#F3E5F5" }]}>
              <View
                style={[
                  styles.statIconContainerGrid,
                  { backgroundColor: "#E1BEE7" },
                ]}
              >
                <Icon
                  name="confirmation-number"
                  type="material"
                  size={24}
                  color="#8E24AA"
                />
              </View>
              <View>
                <ThemedText
                  style={[styles.statValueGrid, { color: "#4A148C" }]}
                >
                  {userStats?.totalVouchersUsed ?? 0}
                </ThemedText>
                <ThemedText style={styles.statLabelGrid}>Voucher</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Account Information Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Thông tin tài khoản
          </ThemedText>

          <TouchableOpacity style={styles.infoCard} onPress={openEditModal}>
            <View style={styles.infoIconContainer}>
              <Icon name="badge" type="material" size={20} color="#003D5B" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Họ và tên</ThemedText>
              <ThemedText style={styles.infoValue}>{displayName}</ThemedText>
            </View>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCard} onPress={openEditModal}>
            <View style={styles.infoIconContainer}>
              <Icon name="phone" type="material" size={20} color="#003D5B" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Số điện thoại</ThemedText>
              <ThemedText style={styles.infoValue}>
                {displayUser?.phoneNumber || "Chưa cập nhật"}
              </ThemedText>
            </View>
            {displayUser?.phoneVerified && (
              <Icon
                name="check-circle"
                type="material"
                size={16}
                color="#4CAF50"
              />
            )}
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCard} onPress={openEditModal}>
            <View style={styles.infoIconContainer}>
              <Icon name="email" type="material" size={20} color="#003D5B" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
              <ThemedText style={styles.infoValue}>
                {displayUser?.email || "Chưa cập nhật"}
              </ThemedText>
            </View>
            {displayUser?.emailVerified && (
              <Icon
                name="check-circle"
                type="material"
                size={16}
                color="#4CAF50"
              />
            )}
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon
                name="verified-user"
                type="material"
                size={20}
                color="#003D5B"
              />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Trạng thái</ThemedText>
              <ThemedText
                style={[
                  styles.infoValue,
                  {
                    color:
                      displayUser?.emailVerified || displayUser?.phoneVerified
                        ? "#4CAF50"
                        : "#F44336",
                  },
                ]}
              >
                {displayUser?.emailVerified || displayUser?.phoneVerified
                  ? "Đã xác thực"
                  : "Chưa xác thực"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon
                name="calendar-today"
                type="material"
                size={20}
                color="#003D5B"
              />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Ngày tham gia</ThemedText>
              <ThemedText style={styles.infoValue}>
                {/* Prefer joinDate from new API, fallback to createdAt */}
                {displayUser?.joinDate
                  ? new Date(displayUser.joinDate).toLocaleDateString("vi-VN")
                  : displayUser?.createdAt
                    ? new Date(displayUser.createdAt).toLocaleDateString(
                        "vi-VN",
                      )
                    : "N/A"}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Loyalty Summary */}
        {loyalty && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Tích điểm & Ưu đãi
            </ThemedText>

            <View style={styles.loyaltyCard}>
              <View style={styles.loyaltyRow}>
                <View style={styles.loyaltyItem}>
                  <Icon
                    name="stars"
                    type="material"
                    size={28}
                    color="#FFD700"
                  />
                  <ThemedText style={styles.loyaltyValue}>
                    {loyalty.pointsAccount?.pointsBalance?.toLocaleString() ||
                      0}
                  </ThemedText>
                  <ThemedText style={styles.loyaltyLabel}>
                    Điểm tích lũy
                  </ThemedText>
                </View>
                <View style={styles.loyaltyDivider} />
                <View style={styles.loyaltyItem}>
                  <Icon
                    name="card-giftcard"
                    type="material"
                    size={28}
                    color="#FF9800"
                  />
                  <ThemedText style={styles.loyaltyValue}>
                    {loyalty.totalFreeRewards || 0}
                  </ThemedText>
                  <ThemedText style={styles.loyaltyLabel}>
                    Phần thưởng
                  </ThemedText>
                </View>
                <View style={styles.loyaltyDivider} />
                <View style={styles.loyaltyItem}>
                  <Icon
                    name="monetization-on"
                    type="material"
                    size={28}
                    color="#4CAF50"
                  />
                  <ThemedText style={styles.loyaltyValue}>
                    {(loyalty.totalRedeemableValue || 0).toLocaleString()}đ
                  </ThemedText>
                  <ThemedText style={styles.loyaltyLabel}>
                    Có thể đổi
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Stamp Cards */}
            {loyalty.stampCards && loyalty.stampCards.length > 0 && (
              <View style={{ marginTop: 12 }}>
                {loyalty.stampCards.map((card) => (
                  <View key={card.id} style={styles.stampCard}>
                    <View style={styles.stampCardHeader}>
                      <Icon
                        name="loyalty"
                        type="material"
                        size={20}
                        color="#9C27B0"
                      />
                      <ThemedText style={styles.stampCardTitle}>
                        {card.serviceName || "Stamp Card"}
                      </ThemedText>
                    </View>
                    <View style={styles.stampProgressBar}>
                      <View
                        style={[
                          styles.stampProgressFill,
                          { width: `${card.progressPercentage}%` },
                        ]}
                      />
                    </View>
                    <ThemedText style={styles.stampProgressText}>
                      {card.currentStamps}/{card.stampsRequired} tem
                      {card.freeRewardsAvailable > 0 &&
                        ` — 🎁 ${card.freeRewardsAvailable} phần thưởng`}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Tiện ích</ThemedText>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/user/(tabs)/orders")}
            >
              <View style={styles.quickActionIcon}>
                <Icon
                  name="history"
                  type="material"
                  size={28}
                  color="#003D5B"
                />
              </View>
              <ThemedText style={styles.quickActionText}>Lịch sử</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/user/favorites")}
            >
              <View style={styles.quickActionIcon}>
                <Icon
                  name="favorite"
                  type="material"
                  size={28}
                  color="#E91E63"
                />
              </View>
              <ThemedText style={styles.quickActionText}>Yêu thích</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/user/vouchers?tab=vouchers")}
            >
              <View style={styles.quickActionIcon}>
                <Icon
                  name="card-giftcard"
                  type="material"
                  size={28}
                  color="#FF9800"
                />
              </View>
              <ThemedText style={styles.quickActionText}>Voucher</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push("/user/vouchers?tab=rewards")}
            >
              <View style={styles.quickActionIcon}>
                <Icon
                  name="local-offer"
                  type="material"
                  size={28}
                  color="#4CAF50"
                />
              </View>
              <ThemedText style={styles.quickActionText}>Ưu đãi</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleOpenComplaints}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#FFF3E0" }]}
              >
                <Icon
                  name="report-problem"
                  type="material"
                  size={28}
                  color="#FF5722"
                />
              </View>
              <ThemedText style={styles.quickActionText}>Khiếu nại</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleOpenReports}
            >
              <View
                style={[styles.quickActionIcon, { backgroundColor: "#FCE4EC" }]}
              >
                <Icon name="build" type="material" size={28} color="#C62828" />
              </View>
              <ThemedText style={styles.quickActionText}>Báo cáo tủ</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Cài đặt</ThemedText>

          <TouchableOpacity
            style={styles.settingsCard}
            onPress={() => router.push("/user/(tabs)/notifications")}
          >
            <View style={styles.settingsIconContainer}>
              <Icon
                name="notifications"
                type="material"
                size={22}
                color="#003D5B"
              />
            </View>
            <ThemedText style={styles.settingsText}>Thông báo</ThemedText>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard}>
            <View style={styles.settingsIconContainer}>
              <Icon name="language" type="material" size={22} color="#003D5B" />
            </View>
            <ThemedText style={styles.settingsText}>Ngôn ngữ</ThemedText>
            <View style={styles.settingsValueContainer}>
              <ThemedText style={styles.settingsValue}>Tiếng Việt</ThemedText>
              <Icon
                name="chevron-right"
                type="material"
                size={24}
                color="#999"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsCard}
            onPress={() => setPasswordModalVisible(true)}
          >
            <View style={styles.settingsIconContainer}>
              <Icon name="security" type="material" size={22} color="#003D5B" />
            </View>
            <ThemedText style={styles.settingsText}>Bảo mật</ThemedText>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard}>
            <View style={styles.settingsIconContainer}>
              <Icon name="help" type="material" size={22} color="#003D5B" />
            </View>
            <ThemedText style={styles.settingsText}>
              Trợ giúp & Hỗ trợ
            </ThemedText>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard}>
            <View style={styles.settingsIconContainer}>
              <Icon name="info" type="material" size={22} color="#003D5B" />
            </View>
            <ThemedText style={styles.settingsText}>Về chúng tôi</ThemedText>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          {displayUser?.role !== "PARTNER" &&
            displayUser?.role !== "ADMIN" &&
            (partnerProfile?.status === "PENDING" ? (
              <View
                style={[styles.settingsCard, { backgroundColor: "#FFF8E1" }]}
              >
                <View
                  style={[
                    styles.settingsIconContainer,
                    { backgroundColor: "#FFE0B2" },
                  ]}
                >
                  <Icon
                    name="hourglass-empty"
                    type="material"
                    size={22}
                    color="#FF9800"
                  />
                </View>
                <ThemedText
                  style={[
                    styles.settingsText,
                    { color: "#FF9800", fontWeight: "bold" },
                  ]}
                >
                  Hồ sơ Đang chờ duyệt
                </ThemedText>
              </View>
            ) : partnerProfile?.status === "REJECTED" ? (
              <TouchableOpacity
                style={styles.settingsCard}
                onPress={() => setPartnerModalVisible(true)}
              >
                <View
                  style={[
                    styles.settingsIconContainer,
                    { backgroundColor: "#FFEBEE" },
                  ]}
                >
                  <Icon
                    name="error"
                    type="material"
                    size={22}
                    color="#F44336"
                  />
                </View>
                <ThemedText
                  style={[
                    styles.settingsText,
                    { color: "#F44336", fontWeight: "bold" },
                  ]}
                >
                  Đăng ký bị từ chối (Thử lại)
                </ThemedText>
                <Icon
                  name="chevron-right"
                  type="material"
                  size={24}
                  color="#F44336"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.settingsCard}
                onPress={() => setPartnerModalVisible(true)}
              >
                <View
                  style={[
                    styles.settingsIconContainer,
                    { backgroundColor: "#E8F5E9" },
                  ]}
                >
                  <Icon
                    name="storefront"
                    type="material"
                    size={22}
                    color="#4CAF50"
                  />
                </View>
                <ThemedText
                  style={[
                    styles.settingsText,
                    { color: "#4CAF50", fontWeight: "bold" },
                  ]}
                >
                  Đăng ký Trở thành Đối tác
                </ThemedText>
                <Icon
                  name="chevron-right"
                  type="material"
                  size={24}
                  color="#4CAF50"
                />
              </TouchableOpacity>
            ))}
        </View>

        {/* User ID for debugging */}
        <View style={styles.section}>
          <ThemedText style={styles.userIdText}>
            User ID: {displayUser?.id || "N/A"}
          </ThemedText>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" type="material" size={20} color="#FF5722" />
            <ThemedText style={styles.logoutText}>Đăng xuất</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Avatar Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={avatarModalVisible}
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <AppModalHeader
              title="Cập nhật ảnh đại diện"
              onClose={() => setAvatarModalVisible(false)}
              align="center"
            />
            <ThemedText style={styles.modalSubText}>
              Nhập đường dẫn URL hình ảnh mới
            </ThemedText>
            <TextInput
              style={styles.modalInput}
              placeholder="https://example.com/avatar.jpg"
              value={newAvatarUrl}
              onChangeText={setNewAvatarUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setAvatarModalVisible(false)}
              >
                <ThemedText style={styles.textStyle}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonUpdate]}
                onPress={handleUpdateAvatar}
                disabled={updatingAvatar}
              >
                {updatingAvatar ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.textStyle}>Cập nhật</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <AppModalHeader
              title="Chỉnh sửa hồ sơ"
              onClose={() => setEditModalVisible(false)}
              align="center"
            />

            <View style={styles.formField}>
              <ThemedText style={styles.formLabel}>Họ</ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập họ"
                value={editForm.lastName}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, lastName: text }))
                }
              />
            </View>

            <View style={styles.formField}>
              <ThemedText style={styles.formLabel}>Tên</ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập tên"
                value={editForm.firstName}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, firstName: text }))
                }
              />
            </View>

            <View style={styles.formField}>
              <ThemedText style={styles.formLabel}>Số điện thoại</ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập số điện thoại"
                value={editForm.phoneNumber}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, phoneNumber: text }))
                }
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formField}>
              <ThemedText style={styles.formLabel}>Email</ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập email"
                value={editForm.email}
                onChangeText={(text) =>
                  setEditForm((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setEditModalVisible(false)}
              >
                <ThemedText style={styles.textStyle}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonUpdate]}
                onPress={handleUpdateProfile}
                disabled={updatingProfile}
              >
                {updatingProfile ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.textStyle}>Lưu</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <AppModalHeader
              title="Đổi mật khẩu"
              onClose={() => {
                setPasswordModalVisible(false);
                setPasswordForm({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              }}
              align="center"
            />

            <View style={styles.formField}>
              <ThemedText style={styles.formLabel}>
                Mật khẩu hiện tại
              </ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập mật khẩu hiện tại"
                value={passwordForm.currentPassword}
                onChangeText={(text) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: text,
                  }))
                }
                secureTextEntry
              />
            </View>

            <View style={styles.formField}>
              <ThemedText style={styles.formLabel}>Mật khẩu mới</ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Tối thiểu 6 ký tự"
                value={passwordForm.newPassword}
                onChangeText={(text) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: text }))
                }
                secureTextEntry
              />
            </View>

            <View style={styles.formField}>
              <ThemedText style={styles.formLabel}>
                Xác nhận mật khẩu
              </ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập lại mật khẩu mới"
                value={passwordForm.confirmPassword}
                onChangeText={(text) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: text,
                  }))
                }
                secureTextEntry
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                <ThemedText style={styles.textStyle}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonUpdate]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.textStyle}>Đổi</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Partner Registration Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={partnerModalVisible}
        onRequestClose={() => setPartnerModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <AppModalHeader
              title="Đăng ký Đối tác"
              onClose={() => setPartnerModalVisible(false)}
              align="center"
            />

            <View style={styles.formField}>
              <ThemedText style={styles.formLabel}>
                Tên cửa hàng/Doanh nghiệp{" "}
                <ThemedText style={{ color: "red" }}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập tên doanh nghiệp"
                value={partnerForm.businessName}
                onChangeText={(text) =>
                  setPartnerForm((prev) => ({ ...prev, businessName: text }))
                }
              />
            </View>

            <View style={styles.formField}>
              <ThemedText style={styles.formLabel}>
                Địa chỉ kinh doanh{" "}
                <ThemedText style={{ color: "red" }}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập địa chỉ"
                value={partnerForm.businessAddress}
                onChangeText={(text) =>
                  setPartnerForm((prev) => ({ ...prev, businessAddress: text }))
                }
              />
            </View>

            <View style={styles.formField}>
              <ThemedText style={styles.formLabel}>
                Số điện thoại liên hệ{" "}
                <ThemedText style={{ color: "red" }}>*</ThemedText>
              </ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập số điện thoại"
                value={partnerForm.contactPhone}
                onChangeText={(text) =>
                  setPartnerForm((prev) => ({ ...prev, contactPhone: text }))
                }
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formField}>
              <ThemedText style={styles.formLabel}>
                Mã số kinh doanh (Tuỳ chọn)
              </ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập mã số kinh doanh"
                value={partnerForm.businessRegistrationNumber}
                onChangeText={(text) =>
                  setPartnerForm((prev) => ({
                    ...prev,
                    businessRegistrationNumber: text,
                  }))
                }
              />
            </View>

            <View style={styles.formField}>
              <ThemedText style={styles.formLabel}>
                Mã số thuế (Tuỳ chọn)
              </ThemedText>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập mã số thuế"
                value={partnerForm.taxId}
                onChangeText={(text) =>
                  setPartnerForm((prev) => ({ ...prev, taxId: text }))
                }
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setPartnerModalVisible(false)}
              >
                <ThemedText style={styles.textStyle}>Hủy</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#4CAF50" }]}
                onPress={handleRegisterPartner}
                disabled={registeringPartner}
              >
                {registeringPartner ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.textStyle}>Gửi đăng ký</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* My Complaints Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={complaintsModalVisible}
        onRequestClose={() => setComplaintsModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View
            style={[styles.modalView, { maxHeight: "80%", paddingBottom: 0 }]}
          >
            <AppModalHeader
              title="Khiếu nại của tôi"
              onClose={() => setComplaintsModalVisible(false)}
              align="center"
            />

            {loadingComplaints ? (
              <ActivityIndicator
                size="large"
                color="#003D5B"
                style={{ marginVertical: 40 }}
              />
            ) : myComplaints.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Icon
                  name="check-circle"
                  type="material"
                  size={56}
                  color="#4CAF50"
                />
                <ThemedText
                  style={{
                    fontSize: 15,
                    color: "#666",
                    marginTop: 12,
                    textAlign: "center",
                  }}
                >
                  Bạn chưa có khiếu nại nào
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={myComplaints}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => {
                  const statusInfo = getComplaintStatusInfo(item.status);
                  return (
                    <View
                      style={{
                        backgroundColor: "#FAFAFA",
                        borderRadius: 14,
                        padding: 14,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: "#F0F0F0",
                      }}
                    >
                      {/* Header: Type + Status */}
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
                            type="material"
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
                            {getComplaintTypeLabel(item.type)}
                          </ThemedText>
                        </View>
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

                      {/* Order ID */}
                      <ThemedText
                        style={{ fontSize: 12, color: "#999", marginBottom: 4 }}
                      >
                        Đơn hàng #{item.orderId}
                      </ThemedText>

                      {/* Description */}
                      <ThemedText
                        style={{ fontSize: 13, color: "#555", lineHeight: 20 }}
                      >
                        {item.description}
                      </ThemedText>

                      {/* Resolution */}
                      {item.resolution && (
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
                          <ThemedText style={{ fontSize: 13, color: "#555" }}>
                            {item.resolution}
                          </ThemedText>
                        </View>
                      )}

                      {/* Date */}
                      <ThemedText
                        style={{ fontSize: 11, color: "#BBB", marginTop: 8 }}
                      >
                        {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </ThemedText>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Locker Reports Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reportsModalVisible}
        onRequestClose={() => setReportsModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View
            style={[styles.modalView, { maxHeight: "80%", paddingBottom: 0 }]}
          >
            <AppModalHeader
              title="Báo cáo tủ của tôi"
              onClose={() => setReportsModalVisible(false)}
              align="center"
            />

            {loadingReports ? (
              <ActivityIndicator
                size="large"
                color="#003D5B"
                style={{ marginVertical: 40 }}
              />
            ) : myReports.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Icon
                  name="check-circle"
                  type="material"
                  size={56}
                  color="#4CAF50"
                />
                <ThemedText
                  style={{
                    fontSize: 15,
                    color: "#666",
                    marginTop: 12,
                    textAlign: "center",
                  }}
                >
                  Bạn chưa có báo cáo tủ nào
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={myReports}
                keyExtractor={(item, index) => (item.id || index).toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => {
                  const statusInfo = getReportStatusInfo(item.status);
                  return (
                    <View
                      style={{
                        backgroundColor: "#FAFAFA",
                        borderRadius: 14,
                        padding: 14,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: "#F0F0F0",
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
                            name="build"
                            type="material"
                            size={16}
                            color="#C62828"
                          />
                          <ThemedText
                            style={{
                              fontSize: 13,
                              fontWeight: "700",
                              color: "#C62828",
                            }}
                          >
                            {item.lockerName || `Tủ #${item.lockerId}`}
                          </ThemedText>
                        </View>
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
                        style={{ fontSize: 13, color: "#555", lineHeight: 20 }}
                      >
                        {item.description || item.issue || "Không có mô tả"}
                      </ThemedText>

                      {item.resolution && (
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
                          <ThemedText style={{ fontSize: 13, color: "#555" }}>
                            {item.resolution}
                          </ThemedText>
                        </View>
                      )}

                      <ThemedText
                        style={{ fontSize: 11, color: "#BBB", marginTop: 8 }}
                      >
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : ""}
                      </ThemedText>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Existing styles...
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
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    zIndex: 10,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#003D5B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#003D5B",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#003D5B",
    opacity: 0.8,
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DAA520",
  },
  scrollContent: {
    flex: 1,
    marginTop: 0,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  },
  statCardGrid: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statIconContainerGrid: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  statValueGrid: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 2,
  },
  statLabelGrid: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    marginBottom: 16,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
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
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "700",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
  },
  settingsCard: {
    flexDirection: "row",
    alignItems: "center",
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
  settingsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingsText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  settingsValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingsValue: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  userIdText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#FF5722",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FF5722",
  },
  bottomSpacer: {
    height: 40,
  },
  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalSubText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
    color: "#666",
  },
  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontSize: 14,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    flex: 1,
    alignItems: "center",
  },
  buttonClose: {
    backgroundColor: "#ccc",
  },
  buttonUpdate: {
    backgroundColor: "#003D5B",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  // Form field styles
  formField: {
    width: "100%",
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  // Loyalty styles
  loyaltyCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  loyaltyRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  loyaltyItem: {
    alignItems: "center",
    flex: 1,
  },
  loyaltyValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003D5B",
    marginTop: 4,
  },
  loyaltyLabel: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  loyaltyDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E0E0E0",
  },
  stampCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#9C27B0",
  },
  stampCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  stampCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  stampProgressBar: {
    height: 8,
    backgroundColor: "#F0E6F6",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  stampProgressFill: {
    height: "100%",
    backgroundColor: "#9C27B0",
    borderRadius: 4,
  },
  stampProgressText: {
    fontSize: 12,
    color: "#666",
  },
});
