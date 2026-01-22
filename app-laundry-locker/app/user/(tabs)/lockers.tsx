import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Badge, Button, Icon } from "@rneui/themed";
import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const STORES = [
  {
    id: "A",
    name: "STORE A",
    address: "Tower D - Masteri Centre Point, Long Binh, Quận 9, TP.HCM",
    distance: "2.5 km",
    status: "active",
  },
  {
    id: "B",
    name: "STORE B",
    address: "Vinhomes Grand Park, Nguyễn Xiển, Quận 9, TP.HCM",
    distance: "3.8 km",
    status: "active",
  },
  {
    id: "C",
    name: "STORE C",
    address: "The Sun Avenue, Mai Chí Thọ, Quận 2, TP.HCM",
    distance: "5.2 km",
    status: "inactive",
  },
];

// Generate 20 sub-lockers for each store
const generateLockers = (storeId: string) => {
  const statuses = ["empty", "locked", "laundry", "send"];
  const statusColors: Record<string, string> = {
    empty: "#4CAF50",
    locked: "#FF5722",
    laundry: "#2196F3",
    send: "#FF9800",
  };
  const statusLabels: Record<string, string> = {
    empty: "Trống",
    locked: "Đang sử dụng",
    laundry: "Giặt ủi",
    send: "Gửi đồ",
  };

  return Array.from({ length: 20 }, (_, i) => {
    const lockerNum = i + 1;
    let status = statuses[Math.floor(Math.random() * statuses.length)];
    // Make sure we have some empty ones
    if (i < 8) status = "empty";

    return {
      id: `${storeId}-${lockerNum}`,
      number: lockerNum,
      status,
      color: statusColors[status],
      label: statusLabels[status],
    };
  });
};

export default function LockersScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? "light"].background;
  const [activeStoreIndex, setActiveStoreIndex] = useState(0);
  const [showAllLockers, setShowAllLockers] = useState(false);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (SCREEN_WIDTH - 48));
    setActiveStoreIndex(index);
  };

  const handleViewEmptyLockers = () => {
    setShowAllLockers(true);
  };

  const handleBackToOverview = () => {
    setShowAllLockers(false);
  };

  const currentStore = STORES[activeStoreIndex];
  const lockers = generateLockers(currentStore.id);
  const emptyCount = lockers.filter((l) => l.status === "empty").length;
  const lockedCount = lockers.filter((l) => l.status === "locked").length;

  // Detailed View - Show 20 lockers
  if (showAllLockers) {
    return (
      <View style={styles.wrapper}>
        <StatusBar barStyle="dark-content" />
        <ScrollView
          style={[styles.container, { backgroundColor }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Back Button */}
          <View style={styles.detailHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToOverview}
              activeOpacity={0.7}
            >
              <Icon
                name="chevron-left"
                type="material"
                size={24}
                color="#003D5B"
              />
              <ThemedText style={styles.backButtonText}>Quay lại</ThemedText>
            </TouchableOpacity>
            <View style={styles.detailTitleContainer}>
              <ThemedText style={styles.detailHeaderTitle}>
                {currentStore.name}
              </ThemedText>
              <View style={styles.detailSubtitleRow}>
                <IconSymbol size={14} name="mappin.circle.fill" color="#666" />
                <ThemedText style={styles.detailSubtitle}>
                  {currentStore.distance} - 20 tủ locker
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Store Info Summary */}
          <View style={styles.detailInfoCard}>
            <View style={styles.detailCardHeader}>
              <ThemedText style={styles.detailStoreName}>
                Thống kê tủ locker
              </ThemedText>
              <Badge
                value={`${emptyCount} trống`}
                badgeStyle={styles.emptyBadge}
                textStyle={styles.emptyBadgeText}
              />
            </View>
            <View style={styles.detailStatsRow}>
              <View style={styles.detailStatItem}>
                <View style={styles.statNumberContainer}>
                  <ThemedText style={styles.detailStatValue}>
                    {emptyCount}
                  </ThemedText>
                </View>
                <ThemedText style={styles.detailStatLabel}>Tủ trống</ThemedText>
              </View>
              <View style={styles.detailStatItem}>
                <View style={styles.statNumberContainer}>
                  <ThemedText style={styles.detailStatValue}>
                    {lockedCount}
                  </ThemedText>
                </View>
                <ThemedText style={styles.detailStatLabel}>
                  Đang sử dụng
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <ThemedText style={styles.legendTitle}>Chú thích:</ThemedText>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#4CAF50" }]}
                />
                <ThemedText style={styles.legendText}>Trống</ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#FF5722" }]}
                />
                <ThemedText style={styles.legendText}>Đang sử dụng</ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#2196F3" }]}
                />
                <ThemedText style={styles.legendText}>Giặt ủi</ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: "#FF9800" }]}
                />
                <ThemedText style={styles.legendText}>Gửi đồ</ThemedText>
              </View>
            </View>
          </View>

          {/* Lockers Grid - 20 items */}
          <View style={styles.lockersGrid}>
            {lockers.map((locker) => (
              <TouchableOpacity
                key={locker.id}
                style={[styles.lockerItem, { borderColor: locker.color }]}
                onPress={() => {
                  if (locker.status === "empty") {
                    router.push("/(tabs)/orders");
                  }
                }}
                disabled={locker.status !== "empty"}
              >
                <View
                  style={[
                    styles.lockerIconContainer,
                    { backgroundColor: locker.color + "20" },
                  ]}
                >
                  <IconSymbol
                    size={24}
                    name={
                      locker.status === "empty" ? "lock.open.fill" : "lock.fill"
                    }
                    color={locker.color}
                  />
                </View>
                <ThemedText style={styles.lockerNumber}>
                  Tủ {locker.number}
                </ThemedText>
                <ThemedText
                  style={[styles.lockerStatus, { color: locker.color }]}
                >
                  {locker.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    );
  }

  // Overview - Original view
  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            LOCKER LOCATIONS
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {STORES.length} stores available
          </ThemedText>
        </ThemedView>

        {/* Image Placeholder - Shared for all stores */}
        <View style={styles.imageCarousel}>
          <IconSymbol size={80} name="map.fill" color="#B0C4DE" />
          <ThemedText style={styles.imagePlaceholderText}>
            Map View - All Locations
          </ThemedText>
        </View>

        {/* Stores Carousel - Only Store Info Cards */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH - 48}
          contentContainerStyle={styles.carouselContainer}
        >
          {STORES.map((store, index) => (
            <View key={store.id} style={styles.storeCarouselItem}>
              {/* Store Info Card */}
              <View style={styles.storeInfoCard}>
                <View style={styles.storeHeader}>
                  <View style={styles.storeNameContainer}>
                    <ThemedText style={styles.storeName}>
                      {store.name}
                    </ThemedText>
                    {store.status === "active" && (
                      <Badge
                        value="ACTIVE"
                        badgeStyle={styles.activeBadge}
                        textStyle={styles.activeBadgeText}
                      />
                    )}
                  </View>
                  <TouchableOpacity style={styles.addButton}>
                    <ThemedText style={styles.addButtonText}>+</ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={styles.addressRow}>
                  <IconSymbol
                    size={14}
                    name="mappin.circle.fill"
                    color="#003D5B"
                  />
                  <ThemedText style={styles.storeAddress}>
                    {store.address}
                  </ThemedText>
                </View>

                <View style={styles.distanceRow}>
                  <IconSymbol size={14} name="location.fill" color="#666" />
                  <ThemedText style={styles.distanceText}>
                    {store.distance} from your location
                  </ThemedText>
                </View>

                {/* View Empty Lockers Button */}
                <Button
                  title="Xem tủ trống"
                  buttonStyle={styles.wantToButton}
                  titleStyle={styles.wantToButtonText}
                  containerStyle={styles.wantToButtonContainer}
                  disabled={store.status !== "active"}
                  disabledStyle={styles.wantToButtonDisabled}
                  onPress={handleViewEmptyLockers}
                />

                {/* Locker Types Summary - 4 main categories */}
                {store.status === "active" && (
                  <View style={styles.actionsGrid}>
                    <TouchableOpacity
                      style={styles.actionCard}
                      onPress={handleViewEmptyLockers}
                    >
                      <View style={styles.actionHeader}>
                        <ThemedText style={styles.viewOrdersText}>
                          View Details
                        </ThemedText>
                        <IconSymbol
                          size={12}
                          name="chevron.right"
                          color="#003D5B"
                        />
                      </View>
                      <View style={styles.actionIconContainer}>
                        <IconSymbol size={32} name="lock.fill" color="#000" />
                      </View>
                      <ThemedText style={styles.actionLabel}>Locked</ThemedText>
                      <ThemedText style={styles.actionCount}>
                        12/20 occupied
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionCard}
                      onPress={handleViewEmptyLockers}
                    >
                      <View style={styles.actionHeader}>
                        <ThemedText style={styles.viewOrdersText}>
                          View Details
                        </ThemedText>
                        <IconSymbol
                          size={12}
                          name="chevron.right"
                          color="#003D5B"
                        />
                      </View>
                      <View style={styles.actionIconContainer}>
                        <IconSymbol
                          size={32}
                          name="lock.open.fill"
                          color="#4CAF50"
                        />
                      </View>
                      <ThemedText style={styles.actionLabel}>Empty</ThemedText>
                      <ThemedText style={styles.actionCount}>
                        8/20 available
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionCard}
                      onPress={handleViewEmptyLockers}
                    >
                      <View style={styles.actionHeader}>
                        <ThemedText style={styles.viewOrdersText}>
                          View Details
                        </ThemedText>
                        <IconSymbol
                          size={12}
                          name="chevron.right"
                          color="#003D5B"
                        />
                      </View>
                      <View style={styles.actionIconContainer}>
                        <IconSymbol
                          size={32}
                          name="shippingbox.fill"
                          color="#FF9800"
                        />
                      </View>
                      <ThemedText style={styles.actionLabel}>
                        Send Items
                      </ThemedText>
                      <ThemedText style={styles.actionCount}>
                        Ready to use
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionCard}
                      onPress={handleViewEmptyLockers}
                    >
                      <View style={styles.actionHeader}>
                        <ThemedText style={styles.viewOrdersText}>
                          View Details
                        </ThemedText>
                        <IconSymbol
                          size={12}
                          name="chevron.right"
                          color="#003D5B"
                        />
                      </View>
                      <View style={styles.actionIconContainer}>
                        <IconSymbol
                          size={32}
                          name="washer.fill"
                          color="#2196F3"
                        />
                      </View>
                      <ThemedText style={styles.actionLabel}>
                        Laundry
                      </ThemedText>
                      <ThemedText style={styles.actionCount}>
                        24/7 service
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {STORES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeStoreIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: "500",
  },
  carouselContainer: {
    paddingHorizontal: 24,
    gap: 0,
  },
  storeCarouselItem: {
    width: SCREEN_WIDTH - 48,
    marginRight: 0,
  },
  imageCarousel: {
    height: 220,
    backgroundColor: "#003D5B",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  imagePlaceholderText: {
    color: "#B0C4DE",
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
    fontWeight: "600",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D0D0D0",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#003D5B",
  },
  storeInfoCard: {
    backgroundColor: "#E8E8E8",
    borderRadius: 24,
    padding: 24,
    paddingTop: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  storeNameContainer: {
    flex: 1,
    gap: 8,
  },
  storeName: {
    fontSize: 32,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.5,
  },
  activeBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: "300",
    color: "#000",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 10,
  },
  storeAddress: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  wantToButtonContainer: {
    marginBottom: 20,
  },
  wantToButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 16,
  },
  wantToButtonDisabled: {
    backgroundColor: "#999",
  },
  wantToButtonText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    paddingTop: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  actionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  viewOrdersText: {
    fontSize: 10,
    color: "#003D5B",
    fontWeight: "600",
  },
  actionIconContainer: {
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
    marginBottom: 2,
  },
  actionCount: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 30,
  },
  // Detailed View Styles
  detailHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: "transparent",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#003D5B",
  },
  detailTitleContainer: {
    gap: 6,
  },
  detailHeaderTitle: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#000",
  },
  detailSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailSubtitle: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  detailInfoCard: {
    marginHorizontal: 24,
    backgroundColor: "#E8E8E8",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  detailCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailStoreName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
  emptyBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  emptyBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  detailStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  detailStatItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  statNumberContainer: {
    marginBottom: 8,
    overflow: "visible",
  },
  detailStatLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textAlign: "center",
  },
  detailStatValue: {
    fontSize: 48,
    fontWeight: "300",
    color: "#000",
    lineHeight: 56,
    includeFontPadding: false,
  },
  legendContainer: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  lockersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 12,
  },
  lockerItem: {
    width: "31%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  lockerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  lockerNumber: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000",
    marginBottom: 2,
  },
  lockerStatus: {
    fontSize: 10,
    fontWeight: "700",
  },
});
