import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Icon } from "@rneui/themed";
import { Tabs } from "expo-router";

export default function PartnerTabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Icon name="dashboard" type="material" color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Đơn hàng",
          tabBarIcon: ({ color }) => (
            <Icon name="receipt-long" type="material" color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color }) => (
            <Icon name="person" type="material" color={color} size={26} />
          ),
        }}
      />
    </Tabs>
  );
}
