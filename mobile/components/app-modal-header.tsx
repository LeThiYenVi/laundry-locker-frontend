import { ThemedText } from "@/components/themed-text";
import { Icon } from "@rneui/themed";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type AppModalHeaderProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  align?: "leading" | "center";
  leftAccessory?: React.ReactNode;
  showDivider?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  titleNumberOfLines?: number;
  subtitleNumberOfLines?: number;
  closeIconColor?: string;
};

export function AppModalHeader({
  title,
  subtitle,
  onClose,
  align = "leading",
  leftAccessory,
  showDivider = false,
  containerStyle,
  titleNumberOfLines = 1,
  subtitleNumberOfLines = 2,
  closeIconColor = "#6B7280",
}: AppModalHeaderProps) {
  if (align === "center") {
    return (
      <View
        style={[
          styles.container,
          showDivider && styles.divider,
          containerStyle,
        ]}
      >
        <View style={styles.sideSlot} />
        <View style={styles.centerContent}>
          <ThemedText
            style={[styles.title, styles.centerTitle]}
            numberOfLines={titleNumberOfLines}
          >
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText
              style={[styles.subtitle, styles.centerSubtitle]}
              numberOfLines={subtitleNumberOfLines}
            >
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="close" type="material" size={22} color={closeIconColor} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, showDivider && styles.divider, containerStyle]}
    >
      <View style={styles.leadingBlock}>
        {leftAccessory ? (
          <View style={styles.leftAccessory}>{leftAccessory}</View>
        ) : null}
        <View style={styles.textBlock}>
          <ThemedText style={styles.title} numberOfLines={titleNumberOfLines}>
            {title}
          </ThemedText>
          {subtitle ? (
            <ThemedText
              style={styles.subtitle}
              numberOfLines={subtitleNumberOfLines}
            >
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
      <TouchableOpacity
        onPress={onClose}
        style={styles.closeButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="close" type="material" size={22} color={closeIconColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 12,
  },
  sideSlot: {
    width: 36,
    height: 36,
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: 12,
  },
  centerTitle: {
    textAlign: "center",
  },
  centerSubtitle: {
    textAlign: "center",
  },
  leadingBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  leftAccessory: {
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    color: "#003D5B",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
