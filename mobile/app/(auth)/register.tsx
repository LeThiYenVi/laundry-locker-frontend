import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/user";
import {
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
} from "@/types";
import { Icon } from "@rneui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const params = useLocalSearchParams<{
    idToken?: string;
    tempToken?: string;
    method?: string;
  }>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Determine which field to show based on login method
  const showEmailField = params.method === "phone"; // Phone login needs email
  const showPhoneField = params.method === "email"; // Email login needs phone

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên");
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ");
      return false;
    }
    if (!birthday.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập ngày sinh");
      return false;
    }
    // Basic birthday validation (should be in past)
    const birthDate = new Date(birthday);
    const today = new Date();
    if (birthDate >= today) {
      Alert.alert("Lỗi", "Ngày sinh phải là ngày trong quá khứ");
      return false;
    }
    if (showEmailField && email && !email.includes("@")) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return false;
    }
    if (showPhoneField && phoneNumber && phoneNumber.length < 9) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ");
      return false;
    }
    if (!agreeTerms) {
      Alert.alert("Lỗi", "Vui lòng đồng ý với điều khoản sử dụng");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    console.log("Registration params:", {
      hasIdToken: !!params.idToken,
      hasTempToken: !!params.tempToken,
      method: params.method,
    });

    if (!params.idToken && !params.tempToken) {
      console.error("No tokens found in params");
      Alert.alert(
        "Lỗi",
        "Phiên đăng ký không hợp lệ. Vui lòng đăng nhập lại.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }],
      );
      return;
    }

    setIsLoading(true);
    try {
      const requestData: CompleteRegistrationRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthday: birthday, // ISO date string
      };

      // Add both idToken (Firebase) and tempToken (backend) if available
      if (params.idToken) {
        requestData.idToken = params.idToken;
        console.log("Added Firebase ID token to registration request");
      }
      if (params.tempToken) {
        requestData.tempToken = params.tempToken;
        console.log("Added backend temp token to registration request");
      }

      // Add optional fields based on login method
      if (showEmailField && email.trim()) {
        // Note: email might not be needed in new request, but keeping for compatibility
      }
      if (showPhoneField && phoneNumber.trim()) {
        // Note: phoneNumber might not be needed in new request, but keeping for compatibility
      }

      // Call appropriate registration endpoint
      console.log("Calling registration API with:", {
        method: params.method,
        endpoint:
          params.method === "email"
            ? "emailCompleteRegistration"
            : "completeRegistration",
        hasIdToken: !!requestData.idToken,
        hasTempToken: !!requestData.tempToken,
        firstName: requestData.firstName,
        lastName: requestData.lastName,
        birthday: requestData.birthday,
      });

      const response =
        params.method === "email"
          ? await authService.emailCompleteRegistration(requestData)
          : await authService.completeRegistration(requestData);

      console.log("Registration response:", response);

      if (response.success) {
        const data: CompleteRegistrationResponse = response.data;
        await login({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        Alert.alert("Thành công", "Đăng ký thành công!", [
          { text: "OK", onPress: () => router.replace("/user/(tabs)/") },
        ]);
      } else {
        Alert.alert("Lỗi", response.message || "Đăng ký thất bại");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
          ? {
              url: error.config.url,
              method: error.config.method,
              data: error.config.data,
            }
          : null,
      });

      let errorMsg = "Đăng ký thất bại. Vui lòng thử lại";

      // Extract backend error message if available
      const backendMessage = error.response?.data?.message;
      const backendCode = error.response?.data?.code;

      console.log("Backend error:", {
        code: backendCode,
        message: backendMessage,
      });

      // Specific error handling based on status code
      if (error.response?.status === 400) {
        errorMsg =
          backendMessage || "Thông tin không hợp lệ. Vui lòng kiểm tra lại.";
      } else if (error.response?.status === 401) {
        errorMsg = "Phiên đăng ký đã hết hạn. Vui lòng đăng nhập lại.";
        setTimeout(() => router.replace("/(auth)/login"), 2000);
      } else if (error.response?.status === 500) {
        // Server error - could be token issue or backend bug
        if (backendCode === "E_COM001") {
          errorMsg =
            "Lỗi máy chủ. Token có thể không hợp lệ hoặc đã hết hạn.\n\nVui lòng thử đăng nhập lại.";
          setTimeout(() => router.replace("/(auth)/login"), 3000);
        } else {
          errorMsg = backendMessage || "Lỗi máy chủ. Vui lòng thử lại sau.";
        }
      } else if (error.message === "Network Error") {
        errorMsg =
          "Không thể kết nối đến máy chủ.\n\nKiểm tra:\n- Backend đang chạy?\n- Kết nối mạng ổn định?";
      } else if (backendMessage) {
        errorMsg = backendMessage;
      }

      Alert.alert("Lỗi đăng ký", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" type="material" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Icon name="person-add" type="material" size={48} color="#fff" />
          <ThemedText style={styles.title}>Hoàn tất đăng ký</ThemedText>
          <ThemedText style={styles.subtitle}>
            Vui lòng cung cấp thông tin để hoàn tất tài khoản
          </ThemedText>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* First Name - Required */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              Tên <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.inputContainer}>
              <Icon name="person" type="material" size={20} color="#666" />
              <TextInput
                style={styles.textInput}
                placeholder="Văn A"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Last Name - Required */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              Họ <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.inputContainer}>
              <Icon name="person" type="material" size={20} color="#666" />
              <TextInput
                style={styles.textInput}
                placeholder="Nguyễn"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Birthday - Required */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              Ngày sinh <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.inputContainer}>
              <Icon
                name="calendar-today"
                type="material"
                size={20}
                color="#666"
              />
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                value={birthday}
                onChangeText={setBirthday}
                keyboardType="numeric"
              />
            </View>
            <ThemedText style={styles.inputHint}>
              Định dạng: YYYY-MM-DD (ví dụ: 1990-01-15)
            </ThemedText>
          </View>

          {/* Email (for phone login) */}
          {showEmailField && (
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
                />
              </View>
              <ThemedText style={styles.inputHint}>
                Email dùng để nhận thông báo đơn hàng
              </ThemedText>
            </View>
          )}

          {/* Phone (for email login) */}
          {showPhoneField && (
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
              <ThemedText style={styles.inputHint}>
                Số điện thoại dùng để liên hệ khi giao đồ
              </ThemedText>
            </View>
          )}

          {/* Terms Agreement */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAgreeTerms(!agreeTerms)}
            activeOpacity={0.7}
          >
            <Icon
              name={agreeTerms ? "check-box" : "check-box-outline-blank"}
              type="material"
              size={24}
              color={agreeTerms ? "#003D5B" : "#999"}
            />
            <ThemedText style={styles.termsText}>
              Tôi đồng ý với{" "}
              <ThemedText style={styles.termsLink}>
                Điều khoản sử dụng
              </ThemedText>{" "}
              và{" "}
              <ThemedText style={styles.termsLink}>
                Chính sách bảo mật
              </ThemedText>
            </ThemedText>
          </TouchableOpacity>

          {/* Register Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              isLoading && styles.actionButtonDisabled,
              !agreeTerms && styles.actionButtonInactive,
            ]}
            onPress={handleRegister}
            disabled={isLoading || !agreeTerms}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.actionButtonText}>
                Hoàn tất đăng ký
              </ThemedText>
            )}
          </TouchableOpacity>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <ThemedText style={styles.benefitsTitle}>
              Quyền lợi thành viên
            </ThemedText>
            <View style={styles.benefitItem}>
              <Icon
                name="local-offer"
                type="material"
                size={20}
                color="#4CAF50"
              />
              <ThemedText style={styles.benefitText}>
                Giảm giá 10% đơn hàng đầu tiên
              </ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="stars" type="material" size={20} color="#FFD700" />
              <ThemedText style={styles.benefitText}>
                Tích điểm đổi quà hấp dẫn
              </ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <Icon
                name="notifications-active"
                type="material"
                size={20}
                color="#2196F3"
              />
              <ThemedText style={styles.benefitText}>
                Thông báo theo dõi đơn hàng
              </ThemedText>
            </View>
          </View>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
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
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#F44336",
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
  inputHint: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    marginLeft: 4,
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 24,
    paddingVertical: 8,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  termsLink: {
    color: "#003D5B",
    fontWeight: "600",
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
  actionButtonInactive: {
    backgroundColor: "#BDBDBD",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  benefitsContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
});
