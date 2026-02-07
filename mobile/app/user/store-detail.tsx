import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";

export default function StoreDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? "light"].background;

  // Reconstruct store object from params
  const store = {
    name: params.name as string,
    address: params.address as string,
    phone: params.phone as string,
    openTime: params.openTime as string,
    closeTime: params.closeTime as string,
    latitude: params.latitude,
    longitude: params.longitude,
  };

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol size={24} name="chevron.left" color="#003D5B" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Chi tiết cửa hàng</ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Map Header Placeholder */}
        <View style={styles.mapContainer}>
             <IconSymbol size={60} name="map.fill" color="#CBD5E0" />
             <ThemedText style={styles.mapLabel}>Location Preview</ThemedText>
        </View>

        {/* Store Info Card */}
        <View style={styles.infoCard}>
            <View style={styles.titleRow}>
                <ThemedText style={styles.storeName}>{store.name}</ThemedText>
                <View style={styles.statusBadge}>
                    <View style={styles.activeDot} />
                    <ThemedText style={styles.statusText}>Hoạt động</ThemedText>
                </View>
            </View>
            
            <ThemedText style={styles.storeAddress}>{store.address}</ThemedText>

            <View style={styles.divider} />

            <View style={styles.detailsList}>
                {store.phone && (
                    <View style={styles.detailRow}>
                        <View style={styles.iconBox}>
                            <IconSymbol size={20} name="phone.fill" color="#003D5B" />
                        </View>
                        <View>
                            <ThemedText style={styles.detailLabel}>Số điện thoại</ThemedText>
                            <ThemedText style={styles.detailValue}>{store.phone}</ThemedText>
                        </View>
                    </View>
                )}
                
                {store.openTime && (
                    <View style={styles.detailRow}>
                        <View style={styles.iconBox}>
                            <IconSymbol size={20} name="clock.fill" color="#003D5B" />
                        </View>
                        <View>
                            <ThemedText style={styles.detailLabel}>Giờ mở cửa</ThemedText>
                            <ThemedText style={styles.detailValue}>{store.openTime} - {store.closeTime}</ThemedText>
                        </View>
                    </View>
                )}
            </View>

            {/* Actions */}
            <TouchableOpacity style={styles.directionButton}>
                <IconSymbol size={20} name="mappin.circle.fill" color="#FFF" />
                <ThemedText style={styles.directionButtonText}>Chỉ đường</ThemedText>
            </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollContent: {
      paddingBottom: 40,
  },
  mapContainer: {
      height: 250,
      backgroundColor: '#F7FAFC',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
  },
  mapLabel: {
      color: '#A0AEC0',
      fontWeight: '600',
  },
  infoCard: {
      backgroundColor: '#fff',
      marginTop: -24,
      marginHorizontal: 16,
      borderRadius: 24,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
  },
  titleRow: {
      marginBottom: 8,
  },
  storeName: {
      fontSize: 24,
      fontWeight: '800',
      color: '#1A202C',
      marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#48BB78",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2F855A",
  },
  storeAddress: {
      fontSize: 15,
      color: '#718096',
      lineHeight: 22,
      marginTop: 12,
  },
  divider: {
      height: 1,
      backgroundColor: '#E2E8F0',
      marginVertical: 24,
  },
  detailsList: {
      gap: 20,
  },
  detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
  },
  iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: '#EBF8FF', // Light blue background
      justifyContent: 'center',
      alignItems: 'center',
  },
  detailLabel: {
      fontSize: 13,
      color: '#718096',
      marginBottom: 2,
  },
  detailValue: {
      fontSize: 15,
      color: '#2D3748',
      fontWeight: '600',
  },
  directionButton: {
      marginTop: 32,
      backgroundColor: '#003D5B',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 16,
      borderRadius: 16,
      gap: 8,
      shadowColor: "#003D5B",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
  },
  directionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '700',
  },
});
