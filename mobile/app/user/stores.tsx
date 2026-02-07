import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { storeService } from "@/services/user";
import { Store } from "@/types";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
    router.push({
      pathname: "/user/store-detail",
      params: {
        id: store.id,
        name: store.name,
        address: store.address,
        phone: store.phone,
        openTime: store.openTime,
        closeTime: store.closeTime,
        latitude: store.latitude,
        longitude: store.longitude,
      } as any
    });
  };

  const renderStoreCard = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => handleStorePress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.storeCardHeader}>
        <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <ThemedText style={styles.statusText}>Hoạt động</ThemedText>
        </View>
        <TouchableOpacity style={styles.chevronButton}>
          <IconSymbol size={20} name="chevron.right" color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {item.latitude && item.longitude ? (
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
        <ThemedText style={styles.storeTitle}>{item.name}</ThemedText>
        <ThemedText style={styles.storeAddress}>{item.address}</ThemedText>
        
        <View style={styles.cardFooter}>
            {item.phone && (
              <View style={styles.infoRow}>
                <IconSymbol size={14} name="phone.fill" color="#718096" />
                <ThemedText style={styles.infoText}>{item.phone}</ThemedText>
              </View>
            )}
            {item.openTime && (
              <View style={styles.infoRow}>
                <IconSymbol size={14} name="clock.fill" color="#718096" />
                <ThemedText style={styles.infoText}>{item.openTime} - {item.closeTime}</ThemedText>
              </View>
            )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <IconSymbol size={24} name="chevron.left" color="#003D5B" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Cửa hàng</ThemedText>
            <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <IconSymbol size={64} name="exclamationmark.triangle" color="#FF6B6B" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchStores()}>
            <ThemedText style={styles.retryButtonText}>Thử lại</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol size={24} name="chevron.left" color="#003D5B" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Cửa hàng</ThemedText>
            <View style={styles.headerRight} />
        </View>

        {/* Store Count */}
        <View style={styles.countContainer}>
            <ThemedText style={styles.countText}>Tìm thấy {stores.length} cửa hàng</ThemedText>
        </View>

        {/* Stores List */}
        <FlatList
            data={stores}
            renderItem={renderStoreCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={["#003D5B"]} />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <IconSymbol size={64} name="building.2.fill" color="#CBD5E0" />
                    <ThemedText style={styles.emptyText}>Chưa có cửa hàng nào</ThemedText>
                </View>
            }
        />
      </View>
    </>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
    zIndex: 10,
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
    color: "#1A202C",
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
    color: "#718096",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  
  /* Store Card Styles (Synced with Home) */
  storeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F4F8',
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
  chevronButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  
  mapContainer: {
    height: 180,
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
    fontSize: 13,
    fontWeight: '500',
    color: '#A0AEC0',
  },
  
  cardContent: {
    padding: 20,
  },
  storeTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A202C",
    marginBottom: 4,
  },
  storeAddress: { 
    fontSize: 13,
    color: "#718096",
    lineHeight: 19,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#718096",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#E53E3E",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#003D5B",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#A0AEC0",
  },
});
