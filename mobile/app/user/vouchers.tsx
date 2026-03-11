import { ThemedText } from "@/components/themed-text";
import { promotionService, loyaltyService } from "@/services/user";
import type { PromotionValidateResponse } from "@/services/user/promotionService";
import type { RewardItem, StampCard, PointTransaction, ExpiringPoints } from "@/services/user/loyaltyService";
import { Icon } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type TabType = "vouchers" | "rewards";

export default function VouchersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<TabType>(
    params.tab === "rewards" ? "rewards" : "vouchers"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Voucher data
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<any[]>([]);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [membershipTier, setMembershipTier] = useState("");

  // Stamp cards data
  const [stampCards, setStampCards] = useState<StampCard[]>([]);

  // Points history & expiring
  const [pointsHistory, setPointsHistory] = useState<PointTransaction[]>([]);
  const [expiringPoints, setExpiringPoints] = useState<ExpiringPoints | null>(null);

  // Promotions data
  const [promotions, setPromotions] = useState<PromotionValidateResponse[]>([]);

  const fetchVouchers = useCallback(async () => {
    try {
      const res = await loyaltyService.getAvailableRewards();
      console.log("=== VOUCHERS (getAvailableRewards) RESPONSE ===", JSON.stringify(res, null, 2));
      if (res.success && res.data) {
        setRewards(res.data.availableRewards || []);
        setRedeemedRewards(res.data.redeemedRewards || []);
        setCurrentPoints(res.data.currentPoints || 0);
        setMembershipTier(res.data.membershipTier || "");
      }
    } catch (error: any) {
      console.error("Failed to fetch vouchers:", error?.message, error?.response?.status, error?.response?.data);
    }
  }, []);

  const fetchStampCards = useCallback(async () => {
    try {
      const res = await loyaltyService.getStampCards();
      console.log("=== STAMP CARDS (getStampCards) RESPONSE ===", JSON.stringify(res, null, 2));
      if (res.success && res.data) {
        setStampCards(res.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch stamp cards:", error?.message, error?.response?.status, error?.response?.data);
    }
  }, []);

  const fetchPromotions = useCallback(async () => {
    try {
      const res = await promotionService.getActivePromotions();
      if (res.success && res.data) {
        setPromotions(res.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch promotions:", error?.message, error?.response?.status, error?.response?.data);
    }
  }, []);

  const fetchPointsHistory = useCallback(async () => {
    try {
      const res = await loyaltyService.getPointsHistory(0, 10);
      if (res.success && res.data) {
        const items = res.data.content || res.data;
        setPointsHistory(Array.isArray(items) ? items : []);
      }
    } catch (error: any) {
      console.error("Failed to fetch points history:", error?.message);
    }
  }, []);

  const fetchExpiringPoints = useCallback(async () => {
    try {
      const res = await loyaltyService.getExpiringPoints();
      if (res.success && res.data && res.data.expiringPoints > 0) {
        setExpiringPoints(res.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch expiring points:", error?.message);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchVouchers(), fetchStampCards(), fetchPromotions(), fetchPointsHistory(), fetchExpiringPoints()]);
    setIsLoading(false);
  }, [fetchVouchers, fetchStampCards, fetchPromotions, fetchPointsHistory, fetchExpiringPoints]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchVouchers(), fetchStampCards(), fetchPromotions(), fetchPointsHistory(), fetchExpiringPoints()]);
    setRefreshing(false);
  }, [fetchVouchers, fetchStampCards, fetchPromotions, fetchPointsHistory, fetchExpiringPoints]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case "DISCOUNT":
        return "local-offer";
      case "FREE_SERVICE":
        return "local-laundry-service";
      case "VOUCHER":
        return "card-giftcard";
      case "MERCHANDISE":
        return "redeem";
      default:
        return "stars";
    }
  };

  const getRewardTypeColor = (type: string) => {
    switch (type) {
      case "DISCOUNT":
        return "#F44336";
      case "FREE_SERVICE":
        return "#2196F3";
      case "VOUCHER":
        return "#FF9800";
      case "MERCHANDISE":
        return "#9C27B0";
      default:
        return "#4CAF50";
    }
  };

  const getRewardStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "#4CAF50";
      case "USED":
        return "#9E9E9E";
      case "EXPIRED":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getRewardStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Sẵn sàng";
      case "USED":
        return "Đã dùng";
      case "EXPIRED":
        return "Hết hạn";
      default:
        return status;
    }
  };

  const renderVouchersTab = () => (
    <View>
      {/* Points Summary */}
      <View style={styles.pointsSummary}>
        <LinearGradient
          colors={["#003D5B", "#0A5C8A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pointsCard}
        >
          <View style={styles.pointsCardContent}>
            <View>
              <ThemedText style={styles.pointsLabel}>Điểm hiện tại</ThemedText>
              <ThemedText style={styles.pointsValue}>
                {currentPoints.toLocaleString()}
              </ThemedText>
            </View>
            <View style={styles.tierBadge}>
              <Icon
                name="workspace-premium"
                type="material"
                size={20}
                color="#FFD700"
              />
              <ThemedText style={styles.tierText}>
                {membershipTier || "Thành viên"}
              </ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Available Rewards */}
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>
          Voucher khả dụng ({rewards.length})
        </ThemedText>

        {rewards.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="card-giftcard"
              type="material"
              size={48}
              color="#CCC"
            />
            <ThemedText style={styles.emptyText}>
              Chưa có voucher khả dụng
            </ThemedText>
            <ThemedText style={styles.emptySubText}>
              Hãy tích thêm điểm để đổi voucher nhé!
            </ThemedText>
          </View>
        ) : (
          rewards.map((reward) => (
            <View key={reward.id} style={styles.rewardCard}>
              <View style={styles.rewardLeft}>
                <View
                  style={[
                    styles.rewardIconContainer,
                    { backgroundColor: `${getRewardTypeColor(reward.type)}15` },
                  ]}
                >
                  <Icon
                    name={getRewardTypeIcon(reward.type)}
                    type="material"
                    size={28}
                    color={getRewardTypeColor(reward.type)}
                  />
                </View>
              </View>
              <View style={styles.rewardContent}>
                <ThemedText style={styles.rewardName}>{reward.name}</ThemedText>
                {reward.description ? (
                  <ThemedText style={styles.rewardDescription} numberOfLines={2}>
                    {reward.description}
                  </ThemedText>
                ) : null}
                <View style={styles.rewardMeta}>
                  <View style={styles.rewardPointsBadge}>
                    <Icon
                      name="stars"
                      type="material"
                      size={14}
                      color="#FFD700"
                    />
                    <ThemedText style={styles.rewardPointsText}>
                      {reward.pointsRequired} điểm
                    </ThemedText>
                  </View>
                  {reward.remainingQuantity !== null && (
                    <ThemedText style={styles.rewardRemaining}>
                      Còn {reward.remainingQuantity}
                    </ThemedText>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.redeemButton,
                  !reward.canRedeem && styles.redeemButtonDisabled,
                ]}
                disabled={!reward.canRedeem}
                onPress={() => {
                  Alert.alert(
                    "Đổi voucher",
                    `Bạn muốn đổi ${reward.pointsRequired} điểm lấy "${reward.name}"?`,
                    [
                      { text: "Hủy", style: "cancel" },
                      {
                        text: "Đổi",
                        onPress: () =>
                          Alert.alert(
                            "Thông báo",
                            "Tính năng đổi điểm sẽ hoạt động khi có đơn hàng"
                          ),
                      },
                    ]
                  );
                }}
              >
                <ThemedText style={styles.redeemButtonText}>
                  {reward.canRedeem ? "Đổi" : "Chưa đủ"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Redeemed Rewards */}
      {redeemedRewards.length > 0 && (
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>
            Voucher đã đổi ({redeemedRewards.length})
          </ThemedText>

          {redeemedRewards.map((reward: any) => (
            <View key={reward.id} style={styles.redeemedCard}>
              <View style={styles.redeemedContent}>
                <ThemedText style={styles.redeemedName}>
                  {reward.rewardName}
                </ThemedText>
                <View style={styles.redeemedMeta}>
                  <ThemedText style={styles.redeemedPoints}>
                    -{reward.pointsSpent} điểm
                  </ThemedText>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: `${getRewardStatusColor(
                          reward.status
                        )}15`,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.statusText,
                        { color: getRewardStatusColor(reward.status) },
                      ]}
                    >
                      {getRewardStatusText(reward.status)}
                    </ThemedText>
                  </View>
                </View>
                {reward.code && (
                  <TouchableOpacity
                    style={styles.codeContainer}
                    onPress={() => {
                      try {
                        Alert.alert("Đã sao chép", `Mã: ${reward.code}`);
                      } catch (e) {
                        Alert.alert("Mã voucher", reward.code);
                      }
                    }}
                  >
                    <ThemedText style={styles.codeText}>
                      {reward.code}
                    </ThemedText>
                    <Icon
                      name="content-copy"
                      type="material"
                      size={14}
                      color="#003D5B"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Expiring Points Warning */}
      {expiringPoints && (
        <View style={[styles.sectionContainer, { marginTop: 0 }]}>
          <View style={{ backgroundColor: '#FFF3E0', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FFE0B2' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Icon name="schedule" type="material" size={20} color="#FF9800" />
              <ThemedText style={{ fontSize: 14, fontWeight: '700', color: '#E65100' }}>
                {expiringPoints.expiringPoints.toLocaleString()} điểm sắp hết hạn
              </ThemedText>
            </View>
            <ThemedText style={{ fontSize: 12, color: '#FF8F00' }}>
              Hết hạn: {new Date(expiringPoints.expiringDate).toLocaleDateString('vi-VN')}
            </ThemedText>
            {expiringPoints.recommendations?.length > 0 && (
              <ThemedText style={{ fontSize: 12, color: '#795548', marginTop: 4 }}>
                💡 {expiringPoints.recommendations[0]}
              </ThemedText>
            )}
          </View>
        </View>
      )}

      {/* Points History */}
      {pointsHistory.length > 0 && (
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>
            Lịch sử điểm ({pointsHistory.length})
          </ThemedText>

          {pointsHistory.map((tx) => (
            <View key={tx.id} style={{
              flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
              borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
            }}>
              <View style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: tx.points > 0 ? '#E8F5E9' : '#FFEBEE',
                justifyContent: 'center', alignItems: 'center', marginRight: 12,
              }}>
                <Icon
                  name={tx.points > 0 ? "add" : "remove"}
                  type="material"
                  size={20}
                  color={tx.points > 0 ? "#4CAF50" : "#F44336"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontSize: 13, color: '#333', fontWeight: '600' }}>
                  {tx.description || (tx.type === 'EARN' ? 'Tích điểm' : 'Đổi điểm')}
                </ThemedText>
                <ThemedText style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                  {new Date(tx.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
              </View>
              <ThemedText style={{
                fontSize: 15, fontWeight: '800',
                color: tx.points > 0 ? '#4CAF50' : '#F44336',
              }}>
                {tx.points > 0 ? '+' : ''}{tx.points}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const formatDiscount = (promo: PromotionValidateResponse): string => {
    if (promo.discountType === 'PERCENTAGE') {
      const max = promo.maxDiscountAmount ? ` (tối đa ${formatPrice(promo.maxDiscountAmount)})` : '';
      return `Giảm ${promo.discountValue}%${max}`;
    } else if (promo.discountType === 'FIXED_AMOUNT') {
      return `Giảm ${formatPrice(promo.discountValue)}`;
    } else {
      return 'Miễn phí dịch vụ';
    }
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return 'percent';
      case 'FIXED_AMOUNT': return 'attach-money';
      case 'FREE_SERVICE': return 'local-laundry-service';
      default: return 'local-offer';
    }
  };

  const getDiscountColor = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return '#E91E63';
      case 'FIXED_AMOUNT': return '#FF5722';
      case 'FREE_SERVICE': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  const renderRewardsTab = () => (
    <View>
      {/* Active Promotions */}
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>
          Mã giảm giá ({promotions.length})
        </ThemedText>

        {promotions.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="local-offer" type="material" size={48} color="#CCC" />
            <ThemedText style={styles.emptyText}>
              Chưa có ưu đãi nào
            </ThemedText>
            <ThemedText style={styles.emptySubText}>
              Các ưu đãi sẽ được cập nhật sớm!
            </ThemedText>
          </View>
        ) : (
          promotions.map((promo) => (
            <View key={promo.id} style={styles.promoCard}>
              <View style={styles.promoLeft}>
                <View
                  style={[
                    styles.promoIconContainer,
                    { backgroundColor: `${getDiscountColor(promo.discountType)}15` },
                  ]}
                >
                  <Icon
                    name={getDiscountIcon(promo.discountType)}
                    type="material"
                    size={28}
                    color={getDiscountColor(promo.discountType)}
                  />
                </View>
              </View>
              <View style={styles.promoContent}>
                <ThemedText style={styles.promoTitle}>{promo.title}</ThemedText>
                {promo.description ? (
                  <ThemedText style={styles.promoDescription} numberOfLines={2}>
                    {promo.description}
                  </ThemedText>
                ) : null}
                <ThemedText style={styles.promoDiscount}>
                  {formatDiscount(promo)}
                </ThemedText>
                <View style={styles.promoMeta}>
                  {promo.minOrderAmount ? (
                    <ThemedText style={styles.promoMinOrder}>
                      Đơn tối thiểu {formatPrice(promo.minOrderAmount)}
                    </ThemedText>
                  ) : null}
                  {promo.endDate ? (
                    <ThemedText style={styles.promoExpiry}>
                      HSD: {formatDate(promo.endDate)}
                    </ThemedText>
                  ) : null}
                </View>
              </View>
              <TouchableOpacity
                style={styles.promoCopyButton}
                onPress={() => {
                  try {
                    Alert.alert("Đã sao chép", `Mã: ${promo.code}`);
                  } catch (e) {
                    Alert.alert("Mã giảm giá", promo.code);
                  }
                }}
              >
                <ThemedText style={styles.promoCode}>{promo.code}</ThemedText>
                <Icon
                  name="content-copy"
                  type="material"
                  size={14}
                  color="#003D5B"
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Stamp Cards */}
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>
          Thẻ tích điểm ({stampCards.length})
        </ThemedText>

        {stampCards.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="loyalty" type="material" size={48} color="#CCC" />
            <ThemedText style={styles.emptyText}>
              Chưa có thẻ tích điểm
            </ThemedText>
            <ThemedText style={styles.emptySubText}>
              Đặt đơn hàng đầu tiên để nhận thẻ tích điểm!
            </ThemedText>
          </View>
        ) : (
          stampCards.map((card) => (
            <View key={card.id} style={styles.stampCardItem}>
              <View style={styles.stampCardHeader}>
                <View style={styles.stampCardIconContainer}>
                  <Icon
                    name="loyalty"
                    type="material"
                    size={24}
                    color="#9C27B0"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.stampCardName}>
                    {card.serviceName || "Stamp Card"}
                  </ThemedText>
                  <ThemedText style={styles.stampCardType}>
                    {card.stampType}
                  </ThemedText>
                </View>
                {card.freeRewardsAvailable > 0 && (
                  <View style={styles.rewardAvailableBadge}>
                    <Icon
                      name="card-giftcard"
                      type="material"
                      size={14}
                      color="#fff"
                    />
                    <ThemedText style={styles.rewardAvailableText}>
                      {card.freeRewardsAvailable}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Stamp Dots */}
              <View style={styles.stampDotsContainer}>
                {Array.from({ length: card.stampsRequired }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.stampDot,
                      i < card.currentStamps && styles.stampDotFilled,
                    ]}
                  >
                    {i < card.currentStamps && (
                      <Icon
                        name="check"
                        type="material"
                        size={12}
                        color="#fff"
                      />
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.stampCardFooter}>
                <ThemedText style={styles.stampProgress}>
                  {card.currentStamps}/{card.stampsRequired} tem
                </ThemedText>
                <View style={styles.stampProgressBarContainer}>
                  <View style={styles.stampProgressBar}>
                    <View
                      style={[
                        styles.stampProgressFill,
                        { width: `${card.progressPercentage}%` },
                      ]}
                    />
                  </View>
                </View>
                <ThemedText style={styles.stampPercentage}>
                  {Math.round(card.progressPercentage)}%
                </ThemedText>
              </View>

              {card.freeRewardsAvailable > 0 && (
                <View style={styles.stampRewardInfo}>
                  <Icon
                    name="card-giftcard"
                    type="material"
                    size={16}
                    color="#FF9800"
                  />
                  <ThemedText style={styles.stampRewardText}>
                    Bạn có {card.freeRewardsAvailable} phần thưởng chưa sử dụng!
                  </ThemedText>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <LinearGradient
        colors={["#003D5B", "#0A5C8A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon
              name="arrow-back"
              type="material"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Voucher & Ưu đãi</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "vouchers" && styles.tabActive]}
            onPress={() => setActiveTab("vouchers")}
          >
            <Icon
              name="card-giftcard"
              type="material"
              size={18}
              color={activeTab === "vouchers" ? "#003D5B" : "rgba(255,255,255,0.7)"}
            />
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "vouchers" && styles.tabTextActive,
              ]}
            >
              Voucher
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "rewards" && styles.tabActive]}
            onPress={() => setActiveTab("rewards")}
          >
            <Icon
              name="loyalty"
              type="material"
              size={18}
              color={activeTab === "rewards" ? "#003D5B" : "rgba(255,255,255,0.7)"}
            />
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "rewards" && styles.tabTextActive,
              ]}
            >
              Ưu đãi
            </ThemedText>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003D5B" />
          <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#003D5B"]}
            />
          }
        >
          {activeTab === "vouchers" ? renderVouchersTab() : renderRewardsTab()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: 48,
    paddingBottom: 0,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 0,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tabActive: {
    backgroundColor: "#F8F9FA",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  tabTextActive: {
    color: "#003D5B",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  scrollContent: {
    flex: 1,
  },
  // Points Summary
  pointsSummary: {
    padding: 16,
  },
  pointsCard: {
    borderRadius: 16,
    padding: 20,
  },
  pointsCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tierText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFD700",
  },
  // Section
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    color: "#BBB",
    marginTop: 4,
  },
  // Reward Card
  rewardCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardLeft: {
    marginRight: 12,
  },
  rewardIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  rewardContent: {
    flex: 1,
  },
  rewardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },
  rewardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rewardPointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  rewardPointsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B8860B",
  },
  rewardRemaining: {
    fontSize: 12,
    color: "#999",
  },
  redeemButton: {
    backgroundColor: "#003D5B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  redeemButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  redeemButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  // Redeemed Card
  redeemedCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#E0E0E0",
  },
  redeemedContent: {},
  redeemedName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 6,
  },
  redeemedMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  redeemedPoints: {
    fontSize: 13,
    color: "#F44336",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#D6E9F5",
    borderStyle: "dashed",
  },
  codeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#003D5B",
    letterSpacing: 1,
  },
  // Stamp Card
  stampCardItem: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stampCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  stampCardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3E5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  stampCardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
  stampCardType: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  rewardAvailableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FF9800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardAvailableText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  stampDotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 14,
  },
  stampDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  stampDotFilled: {
    backgroundColor: "#9C27B0",
    borderColor: "#9C27B0",
  },
  stampCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stampProgress: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    minWidth: 60,
  },
  stampProgressBarContainer: {
    flex: 1,
  },
  stampProgressBar: {
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  stampProgressFill: {
    height: "100%",
    backgroundColor: "#9C27B0",
    borderRadius: 3,
  },
  stampPercentage: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9C27B0",
    minWidth: 35,
    textAlign: "right",
  },
  stampRewardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "#FFF3E0",
    padding: 10,
    borderRadius: 10,
  },
  stampRewardText: {
    fontSize: 13,
    color: "#E65100",
    fontWeight: "600",
    flex: 1,
  },
  // Promotion Card
  promoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  promoLeft: {
    marginRight: 12,
  },
  promoIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginBottom: 2,
  },
  promoDescription: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  promoDiscount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#E91E63",
    marginBottom: 4,
  },
  promoMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  promoMinOrder: {
    fontSize: 11,
    color: "#999",
  },
  promoExpiry: {
    fontSize: 11,
    color: "#FF9800",
    fontWeight: "600",
  },
  promoCopyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#D6E9F5",
    borderStyle: "dashed",
  },
  promoCode: {
    fontSize: 12,
    fontWeight: "700",
    color: "#003D5B",
    letterSpacing: 0.5,
  },
});
