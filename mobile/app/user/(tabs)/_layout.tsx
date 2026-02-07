import { Tabs } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Icon } from "@rneui/themed";
import { View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF", // White for active
        tabBarInactiveTintColor: "#B0C4DE", // Light blue for inactive
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#003D5B", // User specified Dark Blue
          borderTopWidth: 0,
          borderRadius: 20,
          height: 65, // Slightly smaller
          width: "90%",
          paddingBottom: 0,
          paddingHorizontal: 10,
          bottom: 20, // Move up a bit
          alignSelf: "center", // Center horizontally
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25, // Stronger shadow for dark bar
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarItemStyle: {
          flex: 1, // Distribute space evenly
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    width: 30,
                    height: 4,
                    backgroundColor: "#FFFFFF", // White indicator
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                  }}
                />
              )}
              <IconSymbol size={28} name="house.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="lockers"
        options={{
          title: "Lockers",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
                {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    width: 30,
                    height: 4,
                    backgroundColor: "#FFFFFF",
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                  }}
                />
              )}
              <Icon name="inbox" type="material" color={color} size={26} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
                {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    width: 30,
                    height: 4,
                    backgroundColor: "#FFFFFF",
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                  }}
                />
              )}
              <Icon name="receipt" type="material" color={color} size={26} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Thông báo",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
                 {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    width: 30,
                    height: 4,
                    backgroundColor: "#FFFFFF",
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                  }}
                />
              )}
              <Icon name="notifications" type="material" color={color} size={26} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
                 {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    width: 30,
                    height: 4,
                    backgroundColor: "#FFFFFF", // Consistent color
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4,
                  }}
                />
              )}
              <Icon name="person" type="material" color={color} size={26} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
