import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/user";
import { VerifyOtpResponse } from "@/types";
import { Icon } from "@rneui/themed";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type LoginMethod = "phone" | "email";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // ==================== PHONE AUTH ====================
  
  // Phone auth - placeholder (requires Firebase native setup)
  const handleSendPhoneOtp = async () => {
    if (phoneNumber.length < 9) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại hợp lệ");
      return;
    }

    // Show message to use email for now
    Alert.alert(
      "Thông báo",
      "Xác thực số điện thoại yêu cầu cấu hình Firebase native. Vui lòng sử dụng đăng nhập bằng Email.",
      [{ text: "OK", onPress: () => setLoginMethod("email") }]
    );
  };

  // ==================== EMAIL AUTH ====================
  
  // Send OTP to email
  const handleSendEmailOtp = async () => {
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Lỗi", "Vui lòng nhập email hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.sendEmailOtp(email);
      if (response.success) {
        setIsOtpSent(true);
        startCountdown();
        Alert.alert("Thành công", "Mã OTP đã được gửi đến email của bạn");
      } else {
        Alert.alert("Lỗi", response.message || "Không thể gửi OTP");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify Email OTP
  const handleVerifyEmailOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.verifyEmailOtp(email, otp);
      if (response.success) {
        const data: VerifyOtpResponse = response.data;
        
        if (data.newUser && data.tempToken) {
          // New user - go to registration
          router.push({
            pathname: "/(auth)/register",
            params: { tempToken: data.tempToken, method: "email" },
          });
        } else if (data.accessToken && data.refreshToken) {
          // Existing user - login directly
          await login({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          router.replace("/user/(tabs)");
        }
      } else {
        Alert.alert("Lỗi", response.message || "Mã OTP không đúng");
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.response?.data?.message || "Xác thực thất bại. Vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== COMMON ====================

  // Start countdown for resend
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendEmailOtp();
  };

  // OAuth2 Login
  const handleOAuthLogin = async (provider: string) => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8080";
    const oauthUrl = `${baseUrl}/oauth2/authorization/${provider}`;
    
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        oauthUrl, 
        "laundrylocker://auth/callback"
      );
      
      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const accessToken = url.searchParams.get("accessToken");
        const refreshToken = url.searchParams.get("refreshToken");
        
        if (accessToken && refreshToken) {
          await login({ accessToken, refreshToken });
          router.replace("/user/(tabs)");
        }
      }
    } catch (error) {
      console.error("OAuth error:", error);
      Alert.alert("Lỗi", "Đăng nhập thất bại. Vui lòng thử lại");
    }
  };

  // Handle action button
  const handleAction = () => {
    if (loginMethod === "phone") {
      handleSendPhoneOtp();
    } else {
      if (isOtpSent) {
        handleVerifyEmailOtp();
      } else {
        handleSendEmailOtp();
      }
    }
  };

  // Reset state when switching method
  const handleSwitchMethod = (method: LoginMethod) => {
    setLoginMethod(method);
    setIsOtpSent(false);
    setOtp("");
    setCountdown(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Icon name="local-laundry-service" type="material" size={60} color="#fff" />
        </View>
        <ThemedText style={styles.appName}>Laundry Locker</ThemedText>
        <ThemedText style={styles.tagline}>Giặt ủi thông minh, tiện lợi</ThemedText>
      </View>

      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Login Method Toggle */}
          <View style={styles.methodToggle}>
            <TouchableOpacity
              style={[styles.methodButton, loginMethod === "phone" && styles.methodButtonActive]}
              onPress={() => handleSwitchMethod("phone")}
            >
              <Icon
                name="phone"
                type="material"
                size={20}
                color={loginMethod === "phone" ? "#fff" : "#003D5B"}
              />
              <ThemedText
                style={[styles.methodText, loginMethod === "phone" && styles.methodTextActive]}
              >
                Số điện thoại
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodButton, loginMethod === "email" && styles.methodButtonActive]}
              onPress={() => handleSwitchMethod("email")}
            >
              <Icon
                name="email"
                type="material"
                size={20}
                color={loginMethod === "email" ? "#fff" : "#003D5B"}
              />
              <ThemedText
                style={[styles.methodText, loginMethod === "email" && styles.methodTextActive]}
              >
                Email
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Phone Input */}
          {loginMethod === "phone" && (
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Số điện thoại</ThemedText>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCode}>
                  <ThemedText style={styles.countryCodeText}>+84</ThemedText>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="987 654 321"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
              <ThemedText style={styles.hintText}>
                * Đăng nhập bằng SĐT đang được phát triển
              </ThemedText>
            </View>
          )}

          {/* Email Input */}
          {loginMethod === "email" && (
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Email</ThemedText>
              <View style={styles.inputContainer}>
                <Icon name="email" type="material" size={20} color="#666" />
                <TextInput
                  style={styles.textInput}
                  placeholder="example@email.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isOtpSent}
                />
              </View>
            </View>
          )}

          {/* OTP Input */}
          {isOtpSent && loginMethod === "email" && (
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Mã xác thực (OTP)</ThemedText>
              <View style={styles.otpContainer}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <View key={index} style={[styles.otpBox, otp[index] && styles.otpBoxFilled]}>
                    <ThemedText style={styles.otpText}>{otp[index] || ""}</ThemedText>
                  </View>
                ))}
              </View>
              <TextInput
                style={styles.hiddenOtpInput}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                autoFocus
              />
              <TouchableOpacity 
                style={styles.resendButton} 
                onPress={handleResendOtp}
                disabled={countdown > 0}
              >
                <ThemedText style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
                  {countdown > 0 ? `Gửi lại mã (${countdown}s)` : "Gửi lại mã"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
            onPress={handleAction}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.actionButtonText}>
                {isOtpSent ? "Xác nhận" : "Gửi mã OTP"}
              </ThemedText>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>Hoặc đăng nhập với</ThemedText>
            <View style={styles.dividerLine} />
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin("google")}
            >
              <Icon name="google" type="font-awesome" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin("facebook")}
            >
              <Icon name="facebook" type="font-awesome" size={24} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin("zalo")}
            >
              <Icon name="message" type="material" size={24} color="#0068FF" />
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <ThemedText style={styles.termsText}>
            Bằng việc đăng nhập, bạn đồng ý với{" "}
            <ThemedText style={styles.termsLink}>Điều khoản sử dụng</ThemedText> và{" "}
            <ThemedText style={styles.termsLink}>Chính sách bảo mật</ThemedText>
          </ThemedText>
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
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  methodToggle: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  methodButtonActive: {
    backgroundColor: "#003D5B",
  },
  methodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#003D5B",
  },
  methodTextActive: {
    color: "#fff",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  hintText: {
    fontSize: 12,
    color: "#FF9800",
    marginTop: 8,
    fontStyle: "italic",
  },
  phoneInputContainer: {
    flexDirection: "row",
    gap: 12,
  },
  countryCode: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#000",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 50,
    borderWidth: 2,
    borderColor: "transparent",
  },
  otpBoxFilled: {
    borderColor: "#003D5B",
    backgroundColor: "#E8F4F8",
  },
  otpText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#003D5B",
  },
  hiddenOtpInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
  },
  resendButton: {
    alignSelf: "center",
  },
  resendText: {
    fontSize: 14,
    color: "#003D5B",
    fontWeight: "600",
  },
  resendTextDisabled: {
    color: "#999",
  },
  actionButton: {
    backgroundColor: "#003D5B",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 24,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
    color: "#999",
  },
  oauthContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  oauthButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  termsText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  termsLink: {
    color: "#003D5B",
    fontWeight: "600",
  },
});
