import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { storeService } from "@/services/user";
import { Store } from "@/types";
import { Avatar, Icon, SearchBar } from "@rneui/themed";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? "light"].background;
  const textColor = Colors[colorScheme ?? "light"].text;
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [storeError, setStoreError] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  const fetchStores = async () => {
    try {
      setIsLoadingStores(true);
      setStoreError(null);
      const response = await storeService.getAllStores();
      if (response.success && response.data) {
        setStores(response.data);
      } else {
        setStoreError("Không thể tải danh sách cửa hàng");
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      setStoreError("Đã xảy ra lỗi khi tải danh sách cửa hàng");
    } finally {
      setIsLoadingStores(false);
      setRefreshing(false);
    }
  };

  // Fetch stores on mount
  useEffect(() => {
    fetchStores();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStores();
  };

  // Get the first store or use default data
  const firstStore = stores.length > 0 ? stores[0] : null;

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#003D5B"]} />
        }
      >
        {/* Greeting Section */}
        <ThemedView style={styles.greetingSection}>
          <View style={styles.greetingRow}>
            <Avatar
              size={56}
              rounded
              source={{ uri: "https://randomuser.me/api/portraits/men/36.jpg" }}
              containerStyle={styles.avatarContainer}
            />
            <View style={styles.greetingTextContainer}>
              <ThemedText type="title" style={styles.greeting}>
                Hi Lertermer!
              </ThemedText>
              <ThemedText style={styles.subGreeting}>Good Morning</ThemedText>
            </View>
          </View>
          <ThemedView style={styles.locationRow}>
            <View style={styles.brandContainer}>
              <IconSymbol size={20} name="lock.fill" color="#003D5B" />
              <ThemedText type="title" style={styles.brandText}>
                Lock.R
              </ThemedText>
            </View>
            <View style={styles.locationBadge}>
              <IconSymbol size={14} name="mappin.circle.fill" color="#003D5B" />
              <ThemedText style={styles.locationText}>
                Quận Bình Tân, TP.HCM
              </ThemedText>
            </View>
          </ThemedView>
        </ThemedView>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Tìm kiếm cửa hàng, dịch vụ..."
            onChangeText={setSearch}
            value={search}
            platform="default"
            containerStyle={styles.searchBarContainer}
            inputContainerStyle={styles.searchBarInputContainer}
            inputStyle={styles.searchBarInput}
            searchIcon={
              <Icon name="search" type="material" color="#B0C4DE" size={20} />
            }
            placeholderTextColor="#B0C4DE"
          />
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <LinearGradient
            colors={["#ffffff", "#f0f8ff", "#d6e9f5"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.welcomeLeft}
          >
            <ThemedText style={styles.welcomeTitle}>Welcome!</ThemedText>
            <ThemedText style={styles.welcomeSubtitle}>
              Hãy để chúng tôi là nơi an toàn của bạn.
            </ThemedText>
          </LinearGradient>
          <View style={styles.welcomeRight}>
            <Image
              source={require("@/assets/images/ezgif-frame-004.jpg")}
              style={styles.welcomeImage}
              contentFit="cover"
            />
          </View>
        </View>

        {/* Our Store Section */}
        <ThemedView style={styles.storeSectionHeader}>
          <View style={styles.storeHeaderLeft}>
            <View style={styles.iconWrapper}>
              <IconSymbol size={18} name="building.2.fill" color="#003D5B" />
            </View>
            <ThemedText style={styles.sectionTitle}>Các nơi đặt locker</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => router.push("/user/stores")}
          >
            <ThemedText style={styles.seeAllText}>XEM TẤT CẢ</ThemedText>
            <IconSymbol size={14} name="chevron.right" color="#003D5B" />
          </TouchableOpacity>
        </ThemedView>

        {/* Store Card */}
        {isLoadingStores ? (
          <View style={styles.storeCard}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#003D5B" />
              <ThemedText style={styles.loadingText}>Đang tải cửa hàng...</ThemedText>
            </View>
          </View>
        ) : storeError ? (
          <View style={styles.storeCard}>
            <View style={styles.errorContainer}>
              <IconSymbol size={48} name="exclamationmark.triangle" color="#FF6B6B" />
              <ThemedText style={styles.errorText}>{storeError}</ThemedText>
            </View>
          </View>
        ) : firstStore ? (
          <View style={styles.storeCard}>
            <View style={styles.storeCardHeader}>
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <ThemedText style={styles.activeBadgeText}>Hoạt động</ThemedText>
              </View>
              <TouchableOpacity 
                style={styles.chevronButton}
                onPress={() => router.push("/user/stores")}
              >
                <IconSymbol size={18} name="chevron.right" color="#666" />
              </TouchableOpacity>
            </View>

            {firstStore.latitude && firstStore.longitude ? (
              <MapView
                style={styles.storeImagePlaceholder}
                initialRegion={{
                  latitude: firstStore.latitude,
                  longitude: firstStore.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: firstStore.latitude,
                    longitude: firstStore.longitude,
                  }}
                  title={firstStore.name}
                  description={firstStore.address}
                />
              </MapView>
            ) : (
              <View style={styles.storeImagePlaceholder}>
                <IconSymbol size={70} name="map.fill" color="#B0B0B0" />
                <ThemedText style={styles.mapPlaceholderText}>Map View</ThemedText>
              </View>
            )}

            <View style={styles.storeInfo}>
              <View style={styles.storeNameRow}>
                <ThemedText style={styles.storeName}>{firstStore.name}</ThemedText>
                {firstStore.latitude && firstStore.longitude && (
                  <View style={styles.distanceBadge}>
                    <IconSymbol size={12} name="location.fill" color="#003D5B" />
                    <ThemedText style={styles.distanceText}>-</ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={styles.storeAddress}>
                {firstStore.address}
              </ThemedText>
              {firstStore.phone && (
                <View style={styles.phoneRow}>
                  <IconSymbol size={14} name="phone.fill" color="#666" />
                  <ThemedText style={styles.phoneText}>{firstStore.phone}</ThemedText>
                </View>
              )}
              {firstStore.openTime && firstStore.closeTime && (
                <View style={styles.timeRow}>
                  <IconSymbol size={14} name="clock.fill" color="#666" />
                  <ThemedText style={styles.timeText}>
                    {firstStore.openTime} - {firstStore.closeTime}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.storeCard}>
            <View style={styles.emptyContainer}>
              <IconSymbol size={48} name="building.2" color="#CCC" />
              <ThemedText style={styles.emptyText}>Chưa có nơi đặt locker nào</ThemedText>
            </View>
          </View>
        )}

        {/* Pagination Dots
        <View style={styles.paginationContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View> */}

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
  },
  greetingSection: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  greetingTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: "400",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 2,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 61, 91, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003D5B",
  },
  searchWrapper: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchBarContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
    borderBottomWidth: 0,
    padding: 0,
  },
  searchBarInputContainer: {
    backgroundColor: "#003D5B",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 52,
  },
  searchBarInput: {
    color: "#fff",
    fontSize: 15,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  welcomeCard: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 24,
    overflow: "hidden",
    height: 150,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  welcomeLeft: {
    flex: 1.2,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    fontWeight: "400",
  },
  welcomeRight: {
    flex: 1,
    backgroundColor: "#1A3A4A",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  welcomeImage: {
    width: "100%",
    height: "100%",
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  storeSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  storeHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0, 61, 91, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#003D5B",
    letterSpacing: 0.5,
  },
  storeCard: {
    marginHorizontal: 24,
    backgroundColor: "#E8E8E8",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  storeCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#000",
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
  },
  activeBadgeText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  chevronButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  storeImagePlaceholder: {
    backgroundColor: "#D5D5D5",
    height: 190,
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderText: {
    color: "#888",
    fontSize: 13,
    marginTop: 8,
    fontWeight: "500",
  },
  storeInfo: {
    gap: 6,
  },
  storeNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  storeName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.5,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 61, 91, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#003D5B",
  },
  storeAddress: {
    fontSize: 13,
    color: "#666",
    lineHeight: 19,
    fontWeight: "400",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 8,
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
  bottomSpacer: {
    height: 30,
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
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  phoneText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  timeText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
});
