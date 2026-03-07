import { ThemedText } from "@/components/themed-text";
import { Store } from "@/types";
import { Icon } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function FavoritesScreen() {
  const router = useRouter();
  const [favoriteStores, setFavoriteStores] = useState<{ [key: string]: Store }>({});
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        setIsLoading(true);
        try {
          const storedStoresStr = await AsyncStorage.getItem("favorite_stores");
          if (storedStoresStr) {
            setFavoriteStores(JSON.parse(storedStoresStr));
          } else {
            setFavoriteStores({});
          }
        } catch (e) {
          console.error("Failed to load favorites", e);
        } finally {
          setIsLoading(false);
        }
      };
      loadFavorites();
    }, [])
  );

  const toggleFavoriteStore = async (store: Store) => {
    try {
      const newFavs = { ...favoriteStores };
      if (newFavs[store.id]) {
        delete newFavs[store.id];
      } else {
        newFavs[store.id] = store;
      }
      setFavoriteStores(newFavs);
      await AsyncStorage.setItem("favorite_stores", JSON.stringify(newFavs));
    } catch (e) {
      console.error("Failed to save favorite store", e);
    }
  };

  const handleStoreSelect = (store: Store) => {
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

  const favoriteStoreList = Object.values(favoriteStores);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1072a2ff" />
              <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
            </View>
          ) : favoriteStoreList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="storefront" type="material" size={64} color="#D1D5DB" />
              <ThemedText style={styles.emptyText}>
                Bạn chưa lưu cửa hàng nào vào danh sách yêu thích
              </ThemedText>
            </View>
          ) : (
            <View style={styles.lockersGrid}>
              {favoriteStoreList.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  style={styles.lockerCard}
                  onPress={() => handleStoreSelect(store)}
                  activeOpacity={0.7}
                >
                  <View style={styles.lockerCardHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View style={styles.lockerIconContainer}>
                        <Icon name="storefront" type="material" size={28} color="#1072a2ff" />
                      </View>
                      <View style={styles.statusBadge}>
                          <View style={styles.statusDot} />
                          <ThemedText style={styles.statusText}>Hoạt động</ThemedText>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavoriteStore(store);
                      }}
                      style={{ padding: 4 }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Icon 
                        name={favoriteStores[store.id] ? "favorite" : "favorite-border"} 
                        type="material" 
                        size={28} 
                        color={favoriteStores[store.id] ? "#E91E63" : "#D1D5DB"} 
                      />
                    </TouchableOpacity>
                  </View>

                  <ThemedText style={styles.lockerCardName}>{store.name}</ThemedText>
                  
                  <View style={styles.lockerLocationRow}>
                    <Icon name="place" type="material" size={14} color="#6B7280" />
                    <ThemedText style={styles.lockerCardLocation} numberOfLines={2}>
                      {store.address}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 60,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: "#9CA3AF",
    fontWeight: "500",
    textAlign: "center",
  },
  lockersGrid: {
    gap: 16,
  },
  lockerCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lockerCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  lockerIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#E8F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
  },
  statusText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  lockerCardName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  lockerLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  lockerCardLocation: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    flex: 1,
  },
  lockerStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  lockerStat: {
    flex: 1,
    alignItems: "center",
  },
  lockerStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E5E7EB",
  },
  lockerStatValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#4A90E2",
    letterSpacing: -0.5,
  },
  lockerStatLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "600",
  },
  bottomSpacer: {
    height: 40,
  },
});
