import { ThemedText } from "@/components/themed-text";
import { authService } from "@/services/user";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Step = "email" | "reset";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Lỗi", "Vui lòng nhập email hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email.trim());
      if (response.success) {
        setStep("reset");
        Alert.alert("Thành công", "Mã OTP đã được gửi đến email của bạn");
      } else {
        Alert.alert("Lỗi", response.message || "Không thể gửi OTP");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại";
      Alert.alert("Lỗi", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP 6 số");
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPassword,
      });
      if (response.success) {
        Alert.alert(
          "Thành công! ✅",
          "Mật khẩu đã được đặt lại. Vui lòng đăng nhập với mật khẩu mới.",
          [{ text: "Đăng nhập", onPress: () => router.back() }]
        );
      } else {
        Alert.alert("Lỗi", response.message || "Không thể đặt lại mật khẩu");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại";
      Alert.alert("Lỗi", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={["#001F2D", "#003D5B", "#0077B6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={{ fontSize: 28, color: "#fff" }}>←</ThemedText>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <ThemedText style={styles.headerIcon}>🔐</ThemedText>
          <ThemedText style={styles.headerTitle}>Quên mật khẩu</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {step === "email"
              ? "Nhập email để nhận mã xác thực"
              : "Nhập mã OTP và mật khẩu mới"}
          </ThemedText>
        </View>
      </LinearGradient>

      {/* Form */}
      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {step === "email" ? (
            <>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Email đã đăng ký</ThemedText>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="example@email.com"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    autoFocus
                  />
                </View>
              </View>

              {/* Send OTP Button */}
              <TouchableOpacity
                style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
                onPress={handleSendOtp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.actionButtonText}>Gửi mã OTP</ThemedText>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Email Display */}
              <View style={styles.emailBanner}>
                <ThemedText style={styles.emailBannerText}>
                  Mã OTP đã gửi đến: <ThemedText style={{ fontWeight: '800' }}>{email}</ThemedText>
                </ThemedText>
              </View>

              {/* OTP Input */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Mã OTP (6 số)</ThemedText>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.textInput, { letterSpacing: 8, textAlign: 'center', fontSize: 22, fontWeight: '800' }]}
                    placeholder="------"
                    placeholderTextColor="#CCC"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus
                  />
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Mật khẩu mới</ThemedText>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Tối thiểu 6 ký tự"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
                    <ThemedText style={{ fontSize: 14, color: '#0077B6' }}>
                      {showPassword ? "Ẩn" : "Hiện"}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Xác nhận mật khẩu mới</ThemedText>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
              </View>

              {/* Reset Button */}
              <TouchableOpacity
                style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <ThemedText style={styles.actionButtonText}>Đặt lại mật khẩu</ThemedText>
                )}
              </TouchableOpacity>

              {/* Resend OTP */}
              <TouchableOpacity
                onPress={handleSendOtp}
                style={{ alignItems: 'center', marginTop: 16 }}
                disabled={isLoading}
              >
                <ThemedText style={{ fontSize: 14, color: '#0077B6', fontWeight: '600' }}>
                  Gửi lại mã OTP
                </ThemedText>
              </TouchableOpacity>
            </>
          )}

          {/* Back to Login */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ alignItems: 'center', marginTop: 24 }}
          >
            <ThemedText style={{ fontSize: 14, color: '#666' }}>
              ← Quay lại đăng nhập
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003D5B",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    overflow: "hidden",
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  headerContent: {
    alignItems: "center",
    marginTop: 10,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003D5B",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E0E7EF",
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
  },
  actionButton: {
    backgroundColor: "#003D5B",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#003D5B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  emailBanner: {
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  emailBannerText: {
    fontSize: 13,
    color: '#1565C0',
    textAlign: 'center',
  },
});
