import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

// Load the video asset
const splashVideo = require("@/spalsh.mp4");

export default function Index() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Initialize video player
  const player = useVideoPlayer(splashVideo, (player) => {
    player.loop = false;
    player.play();
  });

  // Listen to video events to hide splash when finished
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

  useEffect(() => {
    if (isPlaying) {
      if (!hasStarted) setHasStarted(true);
    } else if (hasStarted && !isLoading) {
      // If the video stops playing, processing has started, and we're not loading auth
      setTimeout(() => setShowSplash(false), 200);
    }
  }, [isPlaying, isLoading, hasStarted]);

  // Fallback timer just in case video fails to load or play
  useEffect(() => {
    const timer = setTimeout(() => {
      // Force hide splash after 4.5 seconds no matter what
      setShowSplash(false);
    }, 4500); 
    return () => clearTimeout(timer);
  }, []);

  // Show splash screen first
  if (showSplash || isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View entering={FadeInDown.duration(800)} style={styles.videoWrapper}>
          <VideoView
            style={styles.video}
            player={player}
            nativeControls={false}
            contentFit="cover"
          />
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(1000).delay(300)} style={styles.textContainer}>
          <Text style={styles.appName}>Lock.R Locker</Text>
          <Text style={styles.tagline}>
            Locker thông minh, tiện lợi
          </Text>
        </Animated.View>
      </View>
    );
  }

  // Redirect logic
  if (isAuthenticated) {
    switch (role) {
      case "PARTNER":
        return <Redirect href="/partner/(tabs)" />;
      case "ADMIN":
      case "USER":
      case "STAFF":
      default:
        return <Redirect href="/user/(tabs)" />;
    }
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#fdfeffff",
    justifyContent: "center",
    alignItems: "center",
  },
  videoWrapper: {
    width: "70%",
    aspectRatio: 1, // Keep it square or let it adjust to video ratio
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // In case video spills
    borderRadius: 20, // Optional: gives it a nice rounded look
  },
  video: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#003D5B",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 16,
    color: "#4A7c94",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});
