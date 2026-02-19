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
  View
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#003D5B"]} />
        }
      >
        {/* Gradient Wave Header */}
        <LinearGradient
          colors={["#ffffff", "#f0f8ff", "#d6e9f5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingRow}>
              <View style={{ width: '80%', flexDirection: 'row', alignItems: 'center' }}>
                <Avatar
                  size={56}
                  rounded
                  source={{ uri: "https://randomuser.me/api/portraits/men/36.jpg" }}
                  containerStyle={styles.avatarContainer}
                />
                <View style={[styles.greetingTextContainer, { marginLeft: 12 }]}>
                  <ThemedText type="title" style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">
                    Hi Lertermer!
                  </ThemedText>
                  <ThemedText style={styles.subGreeting}>Good Morning</ThemedText>
                </View>
              </View>
              <View style={{ width: '20%', alignItems: 'flex-end' }}>
              <Image
                source={require("@/assets/images/logo.svg")}
                style={{ width: "100%", height: 60 }}
                contentFit="contain"
              />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Tìm kiếm địa điểm, dịch vụ..."
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
          <View style={[styles.storeCard, styles.storeCardLoading]}>
             <ActivityIndicator size="large" color="#003D5B" />
             <ThemedText style={styles.loadingText}>Loading stores...</ThemedText>
          </View>
        ) : storeError ? (
          <View style={styles.storeCard}>
            <View style={styles.errorContainer}>
              <IconSymbol size={48} name="exclamationmark.triangle" color="#FF6B6B" />
              <ThemedText style={styles.errorText}>{storeError}</ThemedText>
            </View>
          </View>
        ) : firstStore ? (
          <TouchableOpacity
            style={styles.storeCard}
            onPress={() => router.push({
              pathname: "/user/store-detail",
              params: {
                id: firstStore.id,
                name: firstStore.name,
                address: firstStore.address,
                phone: firstStore.phone,
                openTime: firstStore.openTime,
                closeTime: firstStore.closeTime,
                latitude: firstStore.latitude,
                longitude: firstStore.longitude,
              } as any
            })}
            activeOpacity={0.9}
          >
            <View style={styles.storeCardHeader}>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <ThemedText style={styles.statusText}>Hoạt động</ThemedText>
              </View>
              {firstStore.latitude && firstStore.longitude && (
                 <View style={styles.distanceBadge}>
                    <IconSymbol size={12} name="location.fill" color="#003D5B" />
                    <ThemedText style={styles.distanceText}>1.2 km</ThemedText>
                 </View>
              )}
            </View>

            {/* Map Placeholder or Real Map or Store Image */}
            <View style={styles.mapContainer}>
              {firstStore.image || firstStore.imageUrl ? (
                  <Image
                    source={{ uri: firstStore.image || firstStore.imageUrl }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={1000}
                  />
              ) : firstStore.latitude && firstStore.longitude ? (
                  <View style={styles.mapPlaceholderContent}>
                     <IconSymbol size={40} name="map.fill" color="#A0AEC0" />
                     <ThemedText style={styles.mapPlaceholderLabel}>Map Preview</ThemedText>
                  </View>
              ) : (
                  <View style={styles.mapPlaceholderContent}>
                      <IconSymbol size={40} name="map.fill" color="#CBD5E0" />
                      <ThemedText style={styles.mapPlaceholderLabel}>No Location Data</ThemedText>
                  </View>
              )}
            </View>

            <View style={styles.cardContent}>
              <ThemedText style={styles.storeTitle}>{firstStore.name}</ThemedText>
              <ThemedText style={styles.storeAddress}>{firstStore.address}</ThemedText>
              
              <View style={styles.cardFooter}>
                 {firstStore.phone && (
                   <View style={styles.infoRow}>
                     <IconSymbol size={14} name="phone.fill" color="#718096" />
                     <ThemedText style={styles.infoText}>{firstStore.phone}</ThemedText>
                   </View>
                 )}
                 {firstStore.openTime && (
                   <View style={styles.infoRow}>
                     <IconSymbol size={14} name="clock.fill" color="#718096" />
                     <ThemedText style={styles.infoText}>{firstStore.openTime} - {firstStore.closeTime}</ThemedText>
                   </View>
                 )}
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.storeCard}>
            <View style={styles.emptyContainer}>
              <IconSymbol size={48} name="building.2.fill" color="#CBD5E0" />
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
    marginBottom: 0,
    justifyContent: "space-between",
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
    fontFamily: "DancingScript_400Regular",
    marginBottom: 2,
    letterSpacing: -0.5,
    color: "#003D5B",
  },
  subGreeting: {
    fontSize: 14,
    opacity: 0.8,
    fontWeight: "400",
    color: "#003D5B",
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
  searchContainer: {
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 52,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBarInput: {
    color: "#003D5B",
    fontSize: 15,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContent: {
    paddingHorizontal: 24,
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
    marginTop: 8,
  },
  storeHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A202C",
    letterSpacing: 0.5,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 120,
    justifyContent: 'flex-end',
  },
  seeAllText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#003D5B",
  },
  
  /* Store Card Styles */
  storeCard: {
    marginHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F4F8',
  },
  storeCardLoading: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#48BB78",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2F855A",
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#003D5B",
  },
  
  mapContainer: {
    height: 200,
    width: '100%',
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderContent: {
    alignItems: 'center',
    gap: 8,
  },
  mapPlaceholderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A0AEC0',
  },
  
  cardContent: {
    padding: 20,
  },
  storeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A202C",
    marginBottom: 4,
  },
  storeAddress: { 
    fontSize: 14,
    color: "#718096",
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#4A5568",
    fontWeight: "500",
  },
  
  /* Fallback States */
  loadingContainer: {
    gap: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#718096',
    fontSize: 14, 
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: '#E53E3E',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
      color: '#A0AEC0',
  },
  
  bottomSpacer: {
      height: 100,
  },
});
