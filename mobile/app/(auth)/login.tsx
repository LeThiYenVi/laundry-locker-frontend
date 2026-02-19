import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/user";
import { PhoneLoginResponse, VerifyOtpResponse } from "@/types";
import {
  FirebaseAuthTypes,
  getAuth,
  signInWithPhoneNumber,
} from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
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
  const [confirmResult, setConfirmResult] =
    useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Ref for OTP input
  const otpInputRef = useRef<TextInput>(null);

  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    if (user) {
      // User is signed in
      console.log("Firebase User:", user);
    }
  }

  useEffect(() => {
    const subscriber = getAuth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  // Auto-focus OTP input when OTP screen appears
  useEffect(() => {
    if (isOtpSent && otpInputRef.current) {
      // Small delay to ensure UI is rendered
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 300);
    }
  }, [isOtpSent]);

  // ==================== PHONE AUTH (Native) ====================

  const handleSendPhoneOtp = async () => {
    let formattedPhone = phoneNumber.trim();

    // Auto add +84 if missing
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+84" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+84" + formattedPhone;
    }

    if (!/^\+84\d{9}$/.test(formattedPhone)) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      // Native Firebase Phone Auth
      const confirmation = await signInWithPhoneNumber(
        getAuth(),
        formattedPhone,
      );
      console.log("Firebase confirmation result:", confirmation);
      setConfirmResult(confirmation);
      setIsOtpSent(true);
      startCountdown();
      Alert.alert("Thành công", "Mã OTP đã được gửi đến số điện thoại của bạn");
    } catch (error: any) {
      console.error("Phone OTP error:", error);
      let msg = "Không thể gửi OTP. Vui lòng kiểm tra lại số điện thoại";
      if (error.code === "auth/invalid-phone-number")
        msg = "Số điện thoại không hợp lệ";
      if (error.code === "auth/quota-exceeded")
        msg = "Đã quá giới hạn gửi SMS hôm nay";

      Alert.alert("Lỗi", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (otp.length !== 6 || !confirmResult) {
      Alert.alert("Lỗi", "Vui lòng nhập đủ 6 số OTP");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await confirmResult.confirm(otp);

      if (userCredential) {
        // Get ID Token
        const idToken = await userCredential.user.getIdToken();
        console.log("Firebase ID Token:", idToken);
        console.log("Calling backend API at:", process.env.EXPO_PUBLIC_API_URL);

        // Call backend API with Firebase ID Token
        const response = await authService.phoneLogin(idToken);

        if (response.success) {
          const data: PhoneLoginResponse = response.data;
          console.log("Phone login response:", data);

          // New user - needs registration
          if (data.newUser) {
            // Show success message first
            Alert.alert(
              "Xác thực thành công! ✓",
              "Vui lòng hoàn tất thông tin đăng ký để tiếp tục.",
              [
                {
                  text: "Tiếp tục",
                  onPress: () => {
                    // Pass both idToken (Firebase) and tempToken (backend)
                    router.push({
                      pathname: "/(auth)/register",
                      params: {
                        idToken: idToken, // Firebase ID token
                        tempToken: data.tempToken || "", // Backend temp token
                        method: "phone",
                      },
                    });
                  },
                },
              ],
            );
          }
          // Existing user - has tokens
          else if (data.accessToken && data.refreshToken) {
            await login({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            });
            console.log("token", data.accessToken);

            Alert.alert("Đăng nhập thành công!", "Chào mừng bạn trở lại.", [
              { text: "OK", onPress: () => router.replace("/user/(tabs)/") },
            ]);
          }
          // Unexpected response
          else {
            console.error("Unexpected response format:", data);
            Alert.alert("Lỗi", "Phản hồi từ server không đúng định dạng");
          }
        } else {
          Alert.alert("Lỗi", response.message || "Đăng nhập thất bại");
        }
      }
    } catch (error: any) {
      console.error("Verify phone OTP error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
          ? {
              url: error.config.url,
              baseURL: error.config.baseURL,
              method: error.config.method,
            }
          : null,
      });

      let msg = "Mã OTP không đúng hoặc đã hết hạn";

      // Check for Firebase auth errors
      if (error.code === "auth/invalid-verification-code") {
        msg = "Mã OTP không đúng";
      }
      // Check for network errors
      else if (
        error.message === "Network Error" ||
        error.code === "ERR_NETWORK"
      ) {
        msg =
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra:\n\n1. Backend đang chạy tại " +
          (process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8082/api") +
          "\n" +
          "2. Kiểm tra port có đúng không\n" +
          "3. Kiểm tra firewall/antivirus";
      }
      // Check for timeout
      else if (error.code === "ECONNABORTED") {
        msg = "Kết nối quá lâu. Vui lòng kiểm tra backend và thử lại";
      }

      Alert.alert("Lỗi", msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== EMAIL AUTH ====================

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
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại",
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        console.log("Email OTP verify response:", data);

        // New user - needs registration
        if (data.newUser) {
          // Show success message first
          Alert.alert(
            "Xác thực thành công! ✓",
            "Vui lòng hoàn tất thông tin đăng ký để tiếp tục.",
            [
              {
                text: "Tiếp tục",
                onPress: () => {
                  if (data.tempToken) {
                    // Has tempToken from backend
                    router.push({
                      pathname: "/(auth)/register",
                      params: { tempToken: data.tempToken, method: "email" },
                    });
                  } else {
                    // Fallback: create a temporary token identifier
                    console.warn(
                      "No tempToken from backend, using email as identifier",
                    );
                    router.push({
                      pathname: "/(auth)/register",
                      params: { tempToken: `email:${email}`, method: "email" },
                    });
                  }
                },
              },
            ],
          );
        }
        // Existing user - has tokens
        else if (data.accessToken && data.refreshToken) {
          await login({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
          Alert.alert("Đăng nhập thành công!", "Chào mừng bạn trở lại.", [
            { text: "OK", onPress: () => router.replace("/user/(tabs)/") },
          ]);
        }
        // Unexpected response
        else {
          console.error("Unexpected response format:", data);
          Alert.alert("Lỗi", "Phản hồi từ server không đúng định dạng");
        }
      } else {
        Alert.alert("Lỗi", response.message || "Mã OTP không đúng");
      }
    } catch (error: any) {
      Alert.alert(
        "Lỗi",
        error.response?.data?.message || "Xác thực thất bại. Vui lòng thử lại",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== COMMON ====================

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

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    if (loginMethod === "phone") {
      await handleSendPhoneOtp();
    } else {
      await handleSendEmailOtp();
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    // This assumes OAuth is handled via deep linking or web browser
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") ||
      "http://10.0.2.2:8080";
    const oauthUrl = `${baseUrl}/oauth2/authorization/${provider}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        oauthUrl,
        "laundrylocker://auth/callback",
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

  const handleAction = () => {
    if (loginMethod === "phone") {
      if (isOtpSent) {
        handleVerifyPhoneOtp();
      } else {
        handleSendPhoneOtp();
      }
    } else {
      if (isOtpSent) {
        handleVerifyEmailOtp();
      } else {
        handleSendEmailOtp();
      }
    }
  };

  const handleSwitchMethod = (method: LoginMethod) => {
    setLoginMethod(method);
    setIsOtpSent(false);
    setOtp("");
    setConfirmResult(null);
    setCountdown(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}></View>
        <ThemedText style={styles.appName}>Laundry Locker</ThemedText>
        <ThemedText style={styles.tagline}>
          Giặt ủi thông minh, tiện lợi
        </ThemedText>
      </View>

      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Method Toggle */}
          <View style={styles.methodToggle}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                loginMethod === "phone" && styles.methodButtonActive,
              ]}
              onPress={() => handleSwitchMethod("phone")}
            >
              <ThemedText
                style={[
                  styles.methodText,
                  loginMethod === "phone" && styles.methodTextActive,
                ]}
              >
                Số điện thoại
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodButton,
                loginMethod === "email" && styles.methodButtonActive,
              ]}
              onPress={() => handleSwitchMethod("email")}
            >
              <ThemedText
                style={[
                  styles.methodText,
                  loginMethod === "email" && styles.methodTextActive,
                ]}
              >
                Email
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Inputs */}
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
                  editable={!isOtpSent}
                />
              </View>
            </View>
          )}

          {loginMethod === "email" && (
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Email</ThemedText>
              <View style={styles.inputContainer}>
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
          {isOtpSent && (
            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>
                Mã xác thực (OTP)
              </ThemedText>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => otpInputRef.current?.focus()}
              >
                <View style={styles.otpContainer}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <View
                      key={index}
                      style={[styles.otpBox, otp[index] && styles.otpBoxFilled]}
                    >
                      <ThemedText style={styles.otpText}>
                        {otp[index] || ""}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
              <TextInput
                ref={otpInputRef}
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
                <ThemedText
                  style={[
                    styles.resendText,
                    countdown > 0 && styles.resendTextDisabled,
                  ]}
                >
                  {countdown > 0 ? `Gửi lại mã (${countdown}s)` : "Gửi lại mã"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              isLoading && styles.actionButtonDisabled,
            ]}
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

          {/* OAuth Buttons */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>
              Hoặc đăng nhập với
            </ThemedText>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.oauthContainer}>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin("google")}
            ></TouchableOpacity>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin("facebook")}
            ></TouchableOpacity>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthLogin("zalo")}
            ></TouchableOpacity>
          </View>

          <ThemedText style={styles.termsText}>
            Bằng việc đăng nhập, bạn đồng ý với{" "}
            <ThemedText style={styles.termsLink}>Điều khoản sử dụng</ThemedText>{" "}
            và{" "}
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
