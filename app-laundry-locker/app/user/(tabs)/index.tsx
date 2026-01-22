import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Avatar, Icon, SearchBar } from "@rneui/themed";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? "light"].background;
  const textColor = Colors[colorScheme ?? "light"].text;
  const [search, setSearch] = useState("");

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
            Lock.R
          </ThemedText>
        </ThemedView>

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
            <View style={styles.locationBadge}>
              <IconSymbol size={14} name="mappin.circle.fill" color="#003D5B" />
              <ThemedText style={styles.locationText}>
                9 District, HCMC
              </ThemedText>
            </View>
          </ThemedView>
        </ThemedView>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="Search stores, services..."
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
              Let us be your safe haven.
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
            <ThemedText style={styles.sectionTitle}>Our Store</ThemedText>
          </View>
          <TouchableOpacity style={styles.seeAllButton}>
            <ThemedText style={styles.seeAllText}>SEE ALL</ThemedText>
            <IconSymbol size={14} name="chevron.right" color="#003D5B" />
          </TouchableOpacity>
        </ThemedView>

        {/* Store Card */}
        <View style={styles.storeCard}>
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
            {/* Map will be imported here later */}
            <IconSymbol size={70} name="map.fill" color="#B0B0B0" />
            <ThemedText style={styles.mapPlaceholderText}>Map View</ThemedText>
          </View>

          <View style={styles.storeInfo}>
            <View style={styles.storeNameRow}>
              <ThemedText style={styles.storeName}>STORE A</ThemedText>
              <View style={styles.distanceBadge}>
                <IconSymbol size={12} name="location.fill" color="#003D5B" />
                <ThemedText style={styles.distanceText}>2.5 km</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.storeAddress}>
              Tower D - Masteri Centre Point, Long Binh, Quận 9, TP.HCM
            </ThemedText>
          </View>
        </View>

        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
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
  },
  greetingSection: {
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
  },
  welcomeImage: {
    width: "100%",
    height: "100%",
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
});
