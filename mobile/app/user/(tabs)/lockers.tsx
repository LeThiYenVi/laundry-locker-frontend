import { ThemedText } from "@/components/themed-text";
import { lockerService, storeService } from "@/services/user";
import { Box, Locker, Store } from "@/types";
import { Icon } from "@rneui/themed";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

const { width, height } = Dimensions.get("window");

type ViewMode = 'stores' | 'lockers';

export default function LockersScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('stores');
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [boxes, setBoxes] = useState<Box[]>([]);
  
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingLockers, setIsLoadingLockers] = useState(false);
  const [isLoadingBoxes, setIsLoadingBoxes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Box modal state
  const [showBoxesModal, setShowBoxesModal] = useState(false);
  const [boxesModalAnim] = useState(new Animated.Value(0));

  // All stores modal state
  const [showAllStoresModal, setShowAllStoresModal] = useState(false);
  const [allStoresModalAnim] = useState(new Animated.Value(0));

  // Fetch stores on mount
  const fetchStores = useCallback(async () => {
    try {
      setIsLoadingStores(true);
      setError(null);
      const response = await storeService.getAllStores();
      if (response.success && response.data) {
        setStores(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách cửa hàng");
    } finally {
      setIsLoadingStores(false);
    }
  }, []);

  // Fetch lockers when store changes
  const fetchLockers = useCallback(async (storeId: number) => {
    try {
      setIsLoadingLockers(true);
      setError(null);
      
      const response = await lockerService.getLockersByStore(storeId);
      if (response.success && response.data) {
        setLockers(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách tủ");
    } finally {
      setIsLoadingLockers(false);
    }
  }, []);

  // Fetch boxes when locker selected
  const fetchBoxes = useCallback(async (lockerId: number) => {
    try {
      setIsLoadingBoxes(true);
      setError(null);
      
      const response = await lockerService.getBoxesByLocker(lockerId);
      if (response.success && response.data) {
        setBoxes(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách ngăn");
    } finally {
      setIsLoadingBoxes(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Handle store selection - switch to lockers view
  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    setSelectedLocker(null);
    setBoxes([]);
    fetchLockers(store.id);
    setViewMode('lockers');
  };

  // Handle locker selection - show boxes modal
  const handleLockerSelect = (locker: Locker) => {
    setSelectedLocker(locker);
    fetchBoxes(locker.id);
    
    // Reset and show modal
    boxesModalAnim.setValue(0);
    setShowBoxesModal(true);
    
    // Animate modal in
    Animated.spring(boxesModalAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  };

  // Close boxes modal
  const closeBoxesModal = () => {
    Animated.timing(boxesModalAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowBoxesModal(false);
      setSelectedLocker(null);
      setBoxes([]);
    });
  };

  // Open all stores modal
  const openAllStoresModal = () => {
    allStoresModalAnim.setValue(0);
    setShowAllStoresModal(true);
    
    Animated.spring(allStoresModalAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  };

  // Close all stores modal
  const closeAllStoresModal = () => {
    Animated.timing(allStoresModalAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowAllStoresModal(false);
    });
  };

  // Back to stores view
  const backToStores = () => {
    setViewMode('stores');
    setSelectedStore(null);
    setLockers([]);
    setSelectedLocker(null);
    setBoxes([]);
  };

  const getBoxStatusColor = (status: string): string => {
    switch (status) {
      case "AVAILABLE":
        return "#10B981";
      case "OCCUPIED":
        return "#EF4444";
      case "RESERVED":
        return "#F59E0B";
      case "MAINTENANCE":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getBoxStatusText = (status: string): string => {
    switch (status) {
      case "AVAILABLE":
        return "Trống";
      case "OCCUPIED":
        return "Có đồ";
      case "RESERVED":
        return "Đã đặt";
      case "MAINTENANCE":
        return "Bảo trì";
      default:
        return status;
    }
  };

  const handleBoxClick = (box: Box) => {
    if (box.status === "AVAILABLE" && selectedStore && selectedLocker) {
      router.push({
        pathname: "/user/create-order",
        params: {
          storeId: selectedStore.id.toString(),
          storeName: selectedStore.name,
          lockerId: selectedLocker.id.toString(),
          lockerName: selectedLocker.name,
          boxId: box.id.toString(),
          boxNumber: box.boxNumber.toString(),
        },
      });
    }
  };

  if (isLoadingStores) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <ThemedText style={styles.loadingText}>Đang tải cửa hàng...</ThemedText>
      </View>
    );
  }

  if (error && stores.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="error-outline" type="material" size={64} color="#EF4444" />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStores}>
          <ThemedText style={styles.retryText}>Thử lại</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  const boxesModalTranslateY = boxesModalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#4A90E2', '#357ABD', '#2868A8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {viewMode === 'lockers' && (
            <TouchableOpacity onPress={backToStores} style={styles.backButton}>
              <Icon name="arrow-back" type="material" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.headerTitle}>
              {viewMode === 'stores' ? 'Tủ Giặt Thông Minh' : selectedStore?.name}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {viewMode === 'stores' ? 'Chọn cửa hàng để xem tủ' : 'Chọn tủ để xem ngăn'}
            </ThemedText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Store Selection View */}
        {viewMode === 'stores' && (
          <View style={styles.storeViewContainer}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Icon name="search" type="material" size={20} color="#9CA3AF" />
                <ThemedText style={styles.searchPlaceholder}>Tìm cửa hàng...</ThemedText>
              </View>
            </View>

            {/* Popular Section - Cửa hàng gần bạn */}
            <View style={styles.popularSection}>
              <View style={styles.sectionHeader}>
                <View>
                  <ThemedText style={styles.sectionTitle}>Cửa hàng gần bạn</ThemedText>
                  <ThemedText style={styles.sectionSubtitle}>Chọn địa điểm phù hợp</ThemedText>
                </View>
                <TouchableOpacity onPress={openAllStoresModal}>
                  <ThemedText style={styles.seeAllText}>Xem tất cả</ThemedText>
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.popularScrollContent}
                snapToInterval={width - 60}
                decelerationRate="fast"
              >
                {stores.slice(0, 3).map((store) => (
                  <TouchableOpacity
                    key={store.id}
                    style={styles.popularCard}
                    onPress={() => handleStoreSelect(store)}
                    activeOpacity={0.9}
                  >
                    {/* Store Image with Gradient */}
                    <View style={styles.popularImageContainer}>
                      <LinearGradient
                        colors={['#4A90E2', '#357ABD']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.popularImage}
                      >
                        <Icon name="store" type="material" size={64} color="rgba(255,255,255,0.9)" />
                      </LinearGradient>
                      
                      {/* Overlay Badge */}
                      <View style={styles.overlayBadge}>
                        <View style={styles.badgeDot} />
                        <ThemedText style={styles.overlayBadgeText}>Mở cửa</ThemedText>
                      </View>
                    </View>

                    {/* Store Info */}
                    <View style={styles.popularCardContent}>
                      <ThemedText style={styles.popularCardName} numberOfLines={1}>
                        {store.name}
                      </ThemedText>
                      
                      <View style={styles.storeLocationRow}>
                        <Icon name="location-on" type="material" size={16} color="#6B7280" />
                        <ThemedText style={styles.popularLocationText} numberOfLines={1}>
                          {store.address.split(',')[0]}
                        </ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Recommended Section - Xem gần đây */}
            <View style={styles.recommendedSection}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Xem gần đây</ThemedText>
                <TouchableOpacity onPress={openAllStoresModal}>
                  <ThemedText style={styles.seeAllText}>Xem tất cả</ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={styles.recommendedGrid}>
                {stores.slice(0, 4).map((store) => (
                  <TouchableOpacity
                    key={`rec-${store.id}`}
                    style={styles.recommendedCard}
                    onPress={() => handleStoreSelect(store)}
                    activeOpacity={0.9}
                  >
                    {/* Store Image */}
                    <View style={styles.recommendedImageContainer}>
                      <LinearGradient
                        colors={['#4A90E2', '#357ABD']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.recommendedImage}
                      >
                        <Icon name="store" type="material" size={40} color="rgba(255,255,255,0.9)" />
                      </LinearGradient>
                      
                      {/* Small Badge */}
                      <View style={styles.smallBadge}>
                        <ThemedText style={styles.smallBadgeText}>NEW</ThemedText>
                      </View>
                    </View>

                    {/* Store Info */}
                    <View style={styles.recommendedCardContent}>
                      <ThemedText style={styles.recommendedCardName} numberOfLines={2}>
                        {store.name}
                      </ThemedText>
                      
                      <View style={styles.storeLocationRow}>
                        <Icon name="location-on" type="material" size={12} color="#9CA3AF" />
                        <ThemedText style={styles.recommendedLocationText} numberOfLines={1}>
                          {store.address.split(',')[0]}
                        </ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Lockers List View */}
        {viewMode === 'lockers' && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Icon name="door-front" type="material" size={22} color="#4A90E2" />
              <ThemedText style={styles.sectionTitle}>Danh sách tủ</ThemedText>
            </View>
            
            {isLoadingLockers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <ThemedText style={styles.loadingText}>Đang tải tủ...</ThemedText>
              </View>
            ) : lockers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="inbox" type="material" size={64} color="#D1D5DB" />
                <ThemedText style={styles.emptyText}>
                  Không có tủ nào tại cửa hàng này
                </ThemedText>
              </View>
            ) : (
              <View style={styles.lockersGrid}>
                {lockers.map((locker) => (
                  <TouchableOpacity
                    key={locker.id}
                    style={styles.lockerCard}
                    onPress={() => handleLockerSelect(locker)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.lockerCardHeader}>
                      <View style={styles.lockerIconContainer}>
                        <Icon name="door-front" type="material" size={28} color="#4A90E2" />
                      </View>
                      <View
                        style={[
                          styles.lockerStatusBadge,
                          locker.status === "ACTIVE" ? styles.statusActive : styles.statusMaintenance,
                        ]}
                      >
                        <View style={[
                          styles.statusDot,
                          locker.status === "ACTIVE" ? styles.statusDotActive : styles.statusDotMaintenance
                        ]} />
                        <ThemedText style={styles.statusText}>
                          {locker.status === "ACTIVE" ? "Hoạt động" : "Bảo trì"}
                        </ThemedText>
                      </View>
                    </View>

                    <ThemedText style={styles.lockerCardName}>{locker.name}</ThemedText>
                    
                    {locker.location && (
                      <View style={styles.lockerLocationRow}>
                        <Icon name="place" type="material" size={14} color="#6B7280" />
                        <ThemedText style={styles.lockerCardLocation} numberOfLines={1}>
                          {locker.location}
                        </ThemedText>
                      </View>
                    )}

                    <View style={styles.lockerStatsRow}>
                      <View style={styles.lockerStat}>
                        <ThemedText style={styles.lockerStatValue}>
                          {locker.availableBoxes}
                        </ThemedText>
                        <ThemedText style={styles.lockerStatLabel}>Ngăn trống</ThemedText>
                      </View>
                      <View style={styles.lockerStatDivider} />
                      <View style={styles.lockerStat}>
                        <ThemedText style={styles.lockerStatValue}>
                          {locker.totalBoxes}
                        </ThemedText>
                        <ThemedText style={styles.lockerStatLabel}>Tổng ngăn</ThemedText>
                      </View>
                    </View>

                    <View style={styles.lockerCardArrow}>
                      <Icon name="chevron-right" type="material" size={24} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Boxes Modal */}
      <Modal
        visible={showBoxesModal}
        transparent
        animationType="none"
        onRequestClose={closeBoxesModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1}
            onPress={closeBoxesModal}
          />
          
          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ translateY: boxesModalTranslateY }] }
            ]}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <View>
                <ThemedText style={styles.modalTitle}>
                  Chọn ngăn tủ
                </ThemedText>
                <ThemedText style={styles.modalSubtitle}>
                  {selectedLocker?.name}
                </ThemedText>
              </View>
              <TouchableOpacity onPress={closeBoxesModal} style={styles.closeButton}>
                <Icon name="close" type="material" size={28} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {isLoadingBoxes ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4A90E2" />
                  <ThemedText style={styles.loadingText}>Đang tải ngăn...</ThemedText>
                </View>
              ) : boxes.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Icon name="inbox" type="material" size={64} color="#D1D5DB" />
                  <ThemedText style={styles.emptyText}>
                    Không có ngăn nào trong tủ này
                  </ThemedText>
                </View>
              ) : (
                <>
                  {/* Legend */}
                  <View style={styles.legend}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
                      <ThemedText style={styles.legendText}>Trống</ThemedText>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
                      <ThemedText style={styles.legendText}>Có đồ</ThemedText>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
                      <ThemedText style={styles.legendText}>Đã đặt</ThemedText>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: "#6B7280" }]} />
                      <ThemedText style={styles.legendText}>Bảo trì</ThemedText>
                    </View>
                  </View>

                  {/* Box Grid */}
                  <View style={styles.boxGrid}>
                    {boxes.map((box) => (
                      <TouchableOpacity
                        key={box.id}
                        style={[
                          styles.boxCell,
                          { 
                            backgroundColor: getBoxStatusColor(box.status),
                            opacity: box.status === "AVAILABLE" ? 1 : 0.5,
                          },
                        ]}
                        onPress={() => handleBoxClick(box)}
                        disabled={box.status !== "AVAILABLE"}
                        activeOpacity={0.8}
                      >
                        <ThemedText style={styles.boxNumber}>{box.boxNumber}</ThemedText>
                        <ThemedText style={styles.boxStatus}>
                          {getBoxStatusText(box.status)}
                        </ThemedText>
                        <ThemedText style={styles.boxSize}>{box.size}</ThemedText>
                        
                        {box.status === "AVAILABLE" && (
                          <View style={styles.boxAvailableBadge}>
                            <Icon name="check-circle" type="material" size={16} color="#fff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* All Stores Modal */}
      <Modal
        visible={showAllStoresModal}
        transparent
        animationType="none"
        onRequestClose={closeAllStoresModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1}
            onPress={closeAllStoresModal}
          />
          
          <Animated.View
            style={[
              styles.modalContainer,
              { transform: [{ translateY: allStoresModalAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [height, 0],
              })}] }
            ]}
          >
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <View>
                <ThemedText style={styles.modalTitle}>
                  Tất cả cửa hàng
                </ThemedText>
                <ThemedText style={styles.modalSubtitle}>
                  {stores.length} cửa hàng
                </ThemedText>
              </View>
              <TouchableOpacity onPress={closeAllStoresModal} style={styles.closeButton}>
                <Icon name="close" type="material" size={28} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.allStoresGrid}>
                {stores.map((store) => (
                  <TouchableOpacity
                    key={`all-${store.id}`}
                    style={styles.allStoreCard}
                    onPress={() => {
                      closeAllStoresModal();
                      handleStoreSelect(store);
                    }}
                    activeOpacity={0.9}
                  >
                    {/* Store Image */}
                    <View style={styles.allStoreImageContainer}>
                      <LinearGradient
                        colors={['#4A90E2', '#357ABD']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.allStoreImage}
                      >
                        <Icon name="store" type="material" size={48} color="rgba(255,255,255,0.9)" />
                      </LinearGradient>
                      
                      {/* Badge */}
                      <View style={styles.allStoreBadge}>
                        <View style={styles.badgeDot} />
                        <ThemedText style={styles.overlayBadgeText}>Mở cửa</ThemedText>
                      </View>
                    </View>

                    {/* Store Info */}
                    <View style={styles.allStoreCardContent}>
                      <ThemedText style={styles.allStoreCardName} numberOfLines={2}>
                        {store.name}
                      </ThemedText>
                      
                      <View style={styles.storeLocationRow}>
                        <Icon name="location-on" type="material" size={14} color="#9CA3AF" />
                        <ThemedText style={styles.allStoreLocationText} numberOfLines={2}>
                          {store.address}
                        </ThemedText>
                      </View>

                      {store.phone && (
                        <View style={styles.storeDetailRow}>
                          <Icon name="phone" type="material" size={14} color="#9CA3AF" />
                          <ThemedText style={styles.allStoreDetailText}>
                            {store.phone}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  errorText: {
    marginTop: 16,
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  
  // Store View Container
  storeViewContainer: {
    flex: 1,
  },
  
  // Search Bar
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  
  // Popular Section - Cửa hàng gần bạn
  popularSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
    fontWeight: "500",
  },
  seeAllText: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "700",
  },
  popularScrollContent: {
    paddingRight: 20,
    paddingBottom: 7,
    gap: 16,
  },
  popularCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    width: width - 60,
    marginLeft: 20,
  },
  popularImageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  popularImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  overlayBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  popularCardContent: {
    padding: 16,
  },
  popularCardName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  popularLocationText: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  
  // Recommended Section - Xem gần đây
  recommendedSection: {
    // marginTop: 28,
    paddingBottom: 32,
  },
  recommendedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 16,
  },
  recommendedCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: (width - 56) / 2,
  },
  recommendedImageContainer: {
    width: "100%",
    height: 120,
    position: "relative",
  },
  recommendedImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  smallBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  smallBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  recommendedCardContent: {
    padding: 12,
  },
  recommendedCardName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 6,
    letterSpacing: -0.2,
    minHeight: 36,
  },
  recommendedLocationText: {
    flex: 1,
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  storeLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  
  loadingContainer: {
    padding: 40,
    alignItems: "center",
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
  },
  
  // Lockers Grid
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
  lockerStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusActive: {
    backgroundColor: "#D1FAE5",
  },
  statusMaintenance: {
    backgroundColor: "#FEF3C7",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotActive: {
    backgroundColor: "#10B981",
  },
  statusDotMaintenance: {
    backgroundColor: "#F59E0B",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
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
  lockerCardArrow: {
    position: "absolute",
    right: 20,
    top: "50%",
    marginTop: -12,
  },
  bottomSpacer: {
    height: 40,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: height * 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#D1D5DB",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    fontWeight: "500",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  
  // Box Grid
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
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
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },
  boxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 24,
  },
  boxCell: {
    width: (width - 76) / 3,
    aspectRatio: 0.85,
    borderRadius: 16,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  boxNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  boxStatus: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  boxSize: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "600",
  },
  boxAvailableBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  
  // All Stores Modal
  allStoresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingBottom: 24,
  },
  allStoreCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: (width - 56) / 2,
  },
  allStoreImageContainer: {
    width: "100%",
    height: 130,
    position: "relative",
  },
  allStoreImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  allStoreBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  allStoreCardContent: {
    padding: 12,
  },
  allStoreCardName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    letterSpacing: -0.2,
    minHeight: 38,
  },
  allStoreLocationText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  storeDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  allStoreDetailText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
});
