import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading, role } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#003D5B" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // If authenticated, redirect based on role
  if (isAuthenticated) {
    switch (role) {
      case "PARTNER":
        return <Redirect href="/partner/(tabs)" />;
      case "ADMIN":
        // return <Redirect href="/admin" />;
      case "USER":
      case "STAFF":
      default:
        return <Redirect href="/user/(tabs)" />;
    }
  }

  // If not authenticated, redirect to login
  return <Redirect href="/(auth)/login" />;
}
