import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { storeService } from "@/services/user";
import { Store } from "@/types";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function StoresScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? "light"].background;

  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await storeService.getAllStores();
      if (response.success) {
        setStores(response.data);
      } else {
        setError(response.message || "Không thể tải danh sách cửa hàng");
      }
    } catch (err: any) {
      console.error("Error fetching stores:", err);
      setError("Đã xảy ra lỗi khi tải danh sách cửa hàng");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleRefresh = () => {
    fetchStores(true);
  };

  const handleStorePress = (store: Store) => {
    // TODO: Navigate to store detail screen
    console.log("Store pressed:", store);
  };

  const renderStoreCard = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => handleStorePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.storeCardHeader}>
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <ThemedText style={styles.activeBadgeText}>ACTIVE</ThemedText>
        </View>
        <TouchableOpacity style={styles.chevronButton}>
          <IconSymbol size={18} name="chevron.right" color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.storeImagePlaceholder}>
        <IconSymbol size={70} name="map.fill" color="#B0B0B0" />
        <ThemedText style={styles.mapPlaceholderText}>Map View</ThemedText>
      </View>

      <View style={styles.storeInfo}>
        <View style={styles.storeNameRow}>
          <ThemedText style={styles.storeName}>{item.name}</ThemedText>
          {item.latitude && item.longitude && (
            <View style={styles.distanceBadge}>
              <IconSymbol size={12} name="location.fill" color="#003D5B" />
              <ThemedText style={styles.distanceText}>-</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={styles.storeAddress}>{item.address}</ThemedText>
        {item.phone && (
          <View style={styles.phoneRow}>
            <IconSymbol size={14} name="phone.fill" color="#666" />
            <ThemedText style={styles.phoneText}>{item.phone}</ThemedText>
          </View>
        )}
        {item.openTime && item.closeTime && (
          <View style={styles.timeRow}>
            <IconSymbol size={14} name="clock.fill" color="#666" />
            <ThemedText style={styles.timeText}>
              {item.openTime} - {item.closeTime}
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol size={24} name="chevron.left" color="#003D5B" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Cửa hàng</ThemedText>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003D5B" />
          <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol size={24} name="chevron.left" color="#003D5B" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Cửa hàng</ThemedText>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.errorContainer}>
          <IconSymbol
            size={64}
            name="exclamationmark.triangle"
            color="#FF6B6B"
          />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchStores()}
          >
            <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol size={24} name="chevron.left" color="#003D5B" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Cửa hàng</ThemedText>
        <View style={styles.headerRight} />
      </View>

      {/* Store Count */}
      <View style={styles.countContainer}>
        <ThemedText style={styles.countText}>
          Tìm thấy {stores.length} cửa hàng
        </ThemedText>
      </View>

      {/* Stores List */}
      {stores.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#003D5B"]}
            />
          }
        >
          <IconSymbol size={64} name="building.2" color="#CCC" />
          <ThemedText style={styles.emptyText}>Chưa có cửa hàng nào</ThemedText>
        </ScrollView>
      ) : (
        <FlatList
          data={stores}
          renderItem={renderStoreCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#003D5B"]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 61, 91, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  headerRight: {
    width: 40,
  },
  countContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  countText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  storeCard: {
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
    gap: 8,
  },
  storeNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storeName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 0.5,
    flex: 1,
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
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  },
  timeText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#003D5B",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
});
