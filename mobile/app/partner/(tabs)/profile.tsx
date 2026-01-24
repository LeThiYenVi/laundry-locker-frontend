import { ThemedText } from "@/components/themed-text";
import { Icon } from "@rneui/themed";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

export default function PartnerProfileScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with gradient background */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="store" type="material" size={50} color="#fff" />
            </View>
            <View style={styles.verifiedBadge}>
              <Icon name="verified" type="material" size={16} color="#fff" />
            </View>
          </View>
          <ThemedText style={styles.storeName}>Laundry Partner Store</ThemedText>
          <ThemedText style={styles.storeId}>Partner ID: PTN-12345</ThemedText>
          <View style={styles.ratingContainer}>
            <Icon name="star" type="material" size={18} color="#FFD700" />
            <ThemedText style={styles.ratingText}>4.8 (256 đánh giá)</ThemedText>
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
            <ThemedText style={styles.statValue}>1,245</ThemedText>
            <ThemedText style={styles.statLabel}>Tổng đơn hàng</ThemedText>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Icon name="thumb-up" type="material" size={24} color="#4CAF50" />
            </View>
            <ThemedText style={styles.statValue}>98%</ThemedText>
            <ThemedText style={styles.statLabel}>Hài lòng</ThemedText>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Icon name="people" type="material" size={24} color="#FF9800" />
            </View>
            <ThemedText style={styles.statValue}>523</ThemedText>
            <ThemedText style={styles.statLabel}>Khách hàng</ThemedText>
          </View>
        </View>

        {/* Store Information Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Thông tin cửa hàng</ThemedText>

          <TouchableOpacity style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="location-on" type="material" size={20} color="#003D5B" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Địa chỉ</ThemedText>
              <ThemedText style={styles.infoValue}>
                123 Nguyễn Văn Linh, Quận 7, TP.HCM
              </ThemedText>
            </View>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="phone" type="material" size={20} color="#003D5B" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Số điện thoại</ThemedText>
              <ThemedText style={styles.infoValue}>+84 28 1234 5678</ThemedText>
            </View>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Icon name="access-time" type="material" size={20} color="#003D5B" />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoLabel}>Giờ hoạt động</ThemedText>
              <ThemedText style={styles.infoValue}>07:00 - 22:00</ThemedText>
            </View>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Cài đặt</ThemedText>

          <TouchableOpacity style={styles.settingsCard}>
            <View style={styles.settingsIconContainer}>
              <Icon name="notifications" type="material" size={22} color="#003D5B" />
            </View>
            <ThemedText style={styles.settingsText}>Thông báo</ThemedText>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard}>
            <View style={styles.settingsIconContainer}>
              <Icon name="account-balance-wallet" type="material" size={22} color="#003D5B" />
            </View>
            <ThemedText style={styles.settingsText}>Ví & Thanh toán</ThemedText>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard}>
            <View style={styles.settingsIconContainer}>
              <Icon name="bar-chart" type="material" size={22} color="#003D5B" />
            </View>
            <ThemedText style={styles.settingsText}>Báo cáo & Thống kê</ThemedText>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsCard}>
            <View style={styles.settingsIconContainer}>
              <Icon name="help" type="material" size={22} color="#003D5B" />
            </View>
            <ThemedText style={styles.settingsText}>Trợ giúp & Hỗ trợ</ThemedText>
            <Icon name="chevron-right" type="material" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton}>
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
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#003D5B",
  },
  storeName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 4,
  },
  storeId: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 215, 0, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "600",
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
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
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
