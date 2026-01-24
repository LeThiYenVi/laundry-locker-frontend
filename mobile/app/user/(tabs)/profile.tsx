import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user";
import { User } from "@/types";
import { Icon } from "@rneui/themed";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    points: 0,
  });

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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
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
      ]
    );
  };

  // Use auth context user if profile not loaded yet
  const displayUser = profileData || user;

  if (isLoading && !displayUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003D5B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with gradient background */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {displayUser?.avatarUrl ? (
                <Icon name="person" type="material" size={60} color="#fff" />
              ) : (
                <Icon name="person" type="material" size={60} color="#fff" />
              )}
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera-alt" type="material" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.userName}>
            {displayUser?.fullName || "Người dùng"}
          </ThemedText>
          <ThemedText style={styles.userEmail}>
            {displayUser?.email || displayUser?.phoneNumber || ""}
          </ThemedText>
          <View style={styles.membershipBadge}>
            <Icon name="workspace-premium" type="material" size={16} color="#FFD700" />
            <ThemedText style={styles.membershipText}>
              {displayUser?.role === "USER" ? "Thành viên" : displayUser?.role}
            </ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Icon name="shopping-bag" type="material" size={24} color="#003D5B" />
            </View>
            <ThemedText style={styles.statValue}>{stats.totalOrders}</ThemedText>
            <ThemedText style={styles.statLabel}>Tổng đơn</ThemedText>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Icon name="pending-actions" type="material" size={24} color="#FF9800" />
            </View>
            <ThemedText style={styles.statValue}>{stats.activeOrders}</ThemedText>
            <ThemedText style={styles.statLabel}>Đang xử lý</ThemedText>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Icon name="stars" type="material" size={24} color="#FFD700" />
            </View>
            <ThemedText style={styles.statValue}>{stats.points}</ThemedText>
            <ThemedText style={styles.statLabel}>Điểm</ThemedText>
          </View>
        </View>

        {/* Account Information Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Thông tin tài khoản</ThemedText>

          <TouchableOpacity style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="phone" type="material" size={20} color="#003D5B" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Số điện thoại</ThemedText>
              <ThemedText style={styles.infoValue}>
                {displayUser?.phoneNumber || "Chưa cập nhật"}
              </ThemedText>
            </View>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="email" type="material" size={20} color="#003D5B" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Email</ThemedText>
              <ThemedText style={styles.infoValue}>
                {displayUser?.email || "Chưa cập nhật"}
              </ThemedText>
            </View>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="verified-user" type="material" size={20} color="#003D5B" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Trạng thái</ThemedText>
              <ThemedText style={[styles.infoValue, { color: displayUser?.isActive ? "#4CAF50" : "#F44336" }]}>
                {displayUser?.isActive ? "Đã xác thực" : "Chưa xác thực"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="calendar-today" type="material" size={20} color="#003D5B" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Ngày tham gia</ThemedText>
              <ThemedText style={styles.infoValue}>
                {displayUser?.createdAt 
                  ? new Date(displayUser.createdAt).toLocaleDateString("vi-VN")
                  : "N/A"}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Tiện ích</ThemedText>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Icon name="history" type="material" size={28} color="#003D5B" />
              </View>
              <ThemedText style={styles.quickActionText}>Lịch sử</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Icon name="favorite" type="material" size={28} color="#E91E63" />
              </View>
              <ThemedText style={styles.quickActionText}>Yêu thích</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Icon name="card-giftcard" type="material" size={28} color="#FF9800" />
              </View>
              <ThemedText style={styles.quickActionText}>Voucher</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIcon}>
                <Icon name="local-offer" type="material" size={28} color="#4CAF50" />
              </View>
              <ThemedText style={styles.quickActionText}>Ưu đãi</ThemedText>
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
              <Icon name="notifications" type="material" size={22} color="#003D5B" />
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
              <Icon name="chevron-right" type="material" size={24} color="#999" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard}>
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
            <ThemedText style={styles.settingsText}>Trợ giúp & Hỗ trợ</ThemedText>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard}>
            <View style={styles.settingsIconContainer}>
              <Icon name="info" type="material" size={22} color="#003D5B" />
            </View>
            <ThemedText style={styles.settingsText}>Về chúng tôi</ThemedText>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>
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
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#003D5B",
  },
  userName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  membershipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFD700",
  },
  scrollContent: {
    flex: 1,
    marginTop: -20,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
    marginTop: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
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
});
