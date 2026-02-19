import { ThemedText } from "@/components/themed-text";
import { serviceService } from "@/services/user";
import { LaundryService } from "@/types";
import { Icon } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// Format price to VND
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default function ExploreScreen() {
  const [services, setServices] = useState<LaundryService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await serviceService.getAllServices();
      if (response.success && response.data) {
        // Filter only active services
        const activeServices = response.data.filter((s) => s.isActive);
        setServices(activeServices);
      } else {
        setError("Không thể tải danh sách dịch vụ");
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Đã xảy ra lỗi khi tải danh sách dịch vụ");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchServices(true);
  };
  const featuredServices = [
    {
      id: 1,
      title: "Express Laundry",
      subtitle: "Giặt nhanh trong 2 giờ",
      icon: "bolt",
      color: "#FF9800",
      gradient: ["#FF9800", "#F57C00"],
    },
    {
      id: 2,
      title: "Premium Care",
      subtitle: "Chăm sóc đặc biệt",
      icon: "workspace-premium",
      color: "#9C27B0",
      gradient: ["#9C27B0", "#7B1FA2"],
    },
    {
      id: 3,
      title: "Eco Friendly",
      subtitle: "Thân thiện môi trường",
      icon: "eco",
      color: "#4CAF50",
      gradient: ["#4CAF50", "#388E3C"],
    },
  ];

  const popularServices = [
    {
      id: 1,
      name: "Giặt ủi cao cấp",
      price: "120.000 VND",
      rating: 4.8,
      reviews: 256,
      icon: "local-laundry-service",
      tag: "Phổ biến",
    },
    {
      id: 2,
      name: "Giặt hấp khử khuẩn",
      price: "150.000 VND",
      rating: 4.9,
      reviews: 189,
      icon: "sanitizer",
      tag: "Mới",
    },
    {
      id: 3,
      name: "Giặt thảm & chăn",
      price: "200.000 VND",
      rating: 4.7,
      reviews: 142,
      icon: "bed",
      tag: "Ưu đãi",
    },
  ];

  const tips = [
    {
      id: 1,
      title: "Cách phân loại quần áo đúng cách",
      category: "Hướng dẫn",
      icon: "lightbulb",
      color: "#FFC107",
    },
    {
      id: 2,
      title: "5 lợi ích của dịch vụ giặt ủi",
      category: "Kiến thức",
      icon: "article",
      color: "#2196F3",
    },
    {
      id: 3,
      title: "Tiết kiệm thời gian với locker",
      category: "Tips",
      icon: "schedule",
      color: "#4CAF50",
    },
  ];

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
          <View>
            <ThemedText style={styles.headerGreeting}>Khám phá</ThemedText>
            <ThemedText style={styles.headerTitle}>Dịch vụ & Ưu đãi</ThemedText>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Icon name="search" type="material" size={24} color="#003D5B" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#003D5B"]}
            tintColor="#003D5B"
          />
        }
      >
        {/* Featured Services Banner */}
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {featuredServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.featuredCard,
                  { backgroundColor: service.color },
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.featuredIcon}>
                  <Icon
                    name={service.icon}
                    type="material"
                    size={32}
                    color="#fff"
                  />
                </View>
                <View style={styles.featuredContent}>
                  <ThemedText style={styles.featuredTitle}>
                    {service.title}
                  </ThemedText>
                  <ThemedText style={styles.featuredSubtitle}>
                    {service.subtitle}
                  </ThemedText>
                </View>
                <Icon
                  name="arrow-forward"
                  type="material"
                  size={24}
                  color="rgba(255, 255, 255, 0.8)"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Dịch vụ phổ biến
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAllText}>Xem tất cả</ThemedText>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#003D5B" />
              <ThemedText style={styles.loadingText}>Đang tải dịch vụ...</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="error-outline" type="material" size={48} color="#FF6B6B" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => fetchServices()}
              >
                <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
              </TouchableOpacity>
            </View>
          ) : services.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="inbox" type="material" size={48} color="#CCC" />
              <ThemedText style={styles.emptyText}>Chưa có dịch vụ nào</ThemedText>
            </View>
          ) : (
            services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                activeOpacity={0.7}
              >
                <View style={styles.serviceIconContainer}>
                  <Icon
                    name="local-laundry-service"
                    type="material"
                    size={32}
                    color="#003D5B"
                  />
                </View>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceHeader}>
                    <ThemedText style={styles.serviceName}>
                      {service.name}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.serviceDescription} numberOfLines={1}>
                    {service.description || ""}
                  </ThemedText>
                  <View style={styles.serviceDetails}>
                    <View style={styles.serviceRating}>
                      <Icon
                        name="schedule"
                        type="material"
                        size={14}
                        color="#666"
                      />
                      <ThemedText style={styles.reviewsText}>
                        {service.estimatedTime ? `${service.estimatedTime}h` : "-"}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.servicePrice}>
                      {formatPrice(service.price)}/{service.unit}
                    </ThemedText>
                  </View>
                </View>
                <Icon
                  name="chevron-right"
                  type="material"
                  size={24}
                  color="#999"
                />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Promotional Banner */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.promoBanner} activeOpacity={0.8}>
            <View style={styles.promoContent}>
              <View style={styles.promoIcon}>
                <Icon
                  name="local-offer"
                  type="material"
                  size={32}
                  color="#fff"
                />
              </View>
              <View style={styles.promoText}>
                <ThemedText style={styles.promoTitle}>
                  Giảm 30% cho đơn hàng đầu tiên
                </ThemedText>
                <ThemedText style={styles.promoSubtitle}>
                  Sử dụng mã: WELCOME30
                </ThemedText>
              </View>
            </View>
            <View style={styles.promoButton}>
              <ThemedText style={styles.promoButtonText}>Nhận ngay</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tips & Guides */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Tips & Hướng dẫn
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAllText}>Xem tất cả</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tipsScroll}
          >
            {tips.map((tip) => (
              <TouchableOpacity
                key={tip.id}
                style={styles.tipCard}
                activeOpacity={0.7}
              >
                <View style={[styles.tipIcon, { backgroundColor: tip.color }]}>
                  <Icon
                    name={tip.icon}
                    type="material"
                    size={28}
                    color="#fff"
                  />
                </View>
                <View style={styles.tipBadge}>
                  <ThemedText style={styles.tipBadgeText}>
                    {tip.category}
                  </ThemedText>
                </View>
                <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
                <View style={styles.tipFooter}>
                  <ThemedText style={styles.tipReadMore}>Đọc thêm</ThemedText>
                  <Icon
                    name="arrow-forward"
                    type="material"
                    size={16}
                    color="#003D5B"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Why Choose Us */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Tại sao chọn chúng tôi?
          </ThemedText>

          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Icon
                  name="verified"
                  type="material"
                  size={32}
                  color="#4CAF50"
                />
              </View>
              <ThemedText style={styles.featureTitle}>
                Chất lượng đảm bảo
              </ThemedText>
              <ThemedText style={styles.featureDescription}>
                Quy trình kiểm định chất lượng nghiêm ngặt
              </ThemedText>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Icon
                  name="access-time"
                  type="material"
                  size={32}
                  color="#2196F3"
                />
              </View>
              <ThemedText style={styles.featureTitle}>Nhanh chóng</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Giao nhận đúng hẹn, tiết kiệm thời gian
              </ThemedText>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Icon
                  name="security"
                  type="material"
                  size={32}
                  color="#FF9800"
                />
              </View>
              <ThemedText style={styles.featureTitle}>An toàn</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Hệ thống locker bảo mật cao
              </ThemedText>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Icon
                  name="support-agent"
                  type="material"
                  size={32}
                  color="#9C27B0"
                />
              </View>
              <ThemedText style={styles.featureTitle}>Hỗ trợ 24/7</ThemedText>
              <ThemedText style={styles.featureDescription}>
                Đội ngũ chăm sóc khách hàng tận tâm
              </ThemedText>
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
    paddingTop: 60,
    paddingBottom: 24,
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  headerGreeting: {
    fontSize: 14,
    color: "#003D5B",
    opacity: 0.8,
    marginBottom: 4,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#003D5B",
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003D5B",
  },
  featuredScroll: {
    gap: 16,
  },
  featuredCard: {
    width: width - 80,
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
  serviceInfo: {
    flex: 1,
    gap: 6,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },
  serviceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularTag: {
    backgroundColor: "#E3F2FD",
  },
  newTag: {
    backgroundColor: "#FFF3E0",
  },
  discountTag: {
    backgroundColor: "#E8F5E9",
  },
  serviceTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#003D5B",
  },
  serviceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
  },
  reviewsText: {
    fontSize: 12,
    color: "#666",
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#4CAF50",
  },
  promoBanner: {
    backgroundColor: "#003D5B",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  promoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  promoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
  },
  promoButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  promoButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#003D5B",
  },
  tipsScroll: {
    gap: 16,
  },
  tipCard: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  tipBadge: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  tipBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#666",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    lineHeight: 20,
    marginBottom: 12,
  },
  tipFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tipReadMore: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003D5B",
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  featureCard: {
    width: "48%",
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
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
    marginBottom: 6,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 40,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
  retryButton: {
    backgroundColor: "#003D5B",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  serviceDescription: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
    marginBottom: 4,
  },
});
