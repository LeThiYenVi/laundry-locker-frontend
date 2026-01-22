import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/user";
import { CompleteRegistrationRequest } from "@/types";
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
  const params = useLocalSearchParams<{ tempToken?: string; method?: string }>();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Determine which field to show based on login method
  const showEmailField = params.method === "phone"; // Phone login needs email
  const showPhoneField = params.method === "email"; // Email login needs phone

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ và tên");
      return false;
    }
    if (fullName.trim().length < 2) {
      Alert.alert("Lỗi", "Họ và tên phải có ít nhất 2 ký tự");
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
    if (!params.tempToken) {
      Alert.alert("Lỗi", "Phiên đăng ký không hợp lệ. Vui lòng thử lại.");
      router.back();
      return;
    }

    setIsLoading(true);
    try {
      const requestData: CompleteRegistrationRequest = {
        tempToken: params.tempToken,
        fullName: fullName.trim(),
      };

      // Add optional fields based on login method
      if (showEmailField && email.trim()) {
        requestData.email = email.trim();
      }
      if (showPhoneField && phoneNumber.trim()) {
        requestData.phoneNumber = `+84${phoneNumber.trim().replace(/^0/, "")}`;
      }

      // Call appropriate registration endpoint
      const response = params.method === "email" 
        ? await authService.emailCompleteRegistration(requestData)
        : await authService.completeRegistration(requestData);

      if (response.success && response.data.accessToken && response.data.refreshToken) {
        await login({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
        Alert.alert("Thành công", "Đăng ký thành công!", [
          { text: "OK", onPress: () => router.replace("/user/(tabs)") }
        ]);
      } else {
        Alert.alert("Lỗi", response.message || "Đăng ký thất bại");
      }
    } catch (error: any) {
      Alert.alert(
        "Lỗi", 
        error.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
          {/* Full Name - Required */}
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>
              Họ và tên <ThemedText style={styles.required}>*</ThemedText>
            </ThemedText>
            <View style={styles.inputContainer}>
              <Icon name="person" type="material" size={20} color="#666" />
              <TextInput
                style={styles.textInput}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
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
              <ThemedText style={styles.termsLink}>Điều khoản sử dụng</ThemedText> và{" "}
              <ThemedText style={styles.termsLink}>Chính sách bảo mật</ThemedText>
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
              <ThemedText style={styles.actionButtonText}>Hoàn tất đăng ký</ThemedText>
            )}
          </TouchableOpacity>

          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <ThemedText style={styles.benefitsTitle}>Quyền lợi thành viên</ThemedText>
            <View style={styles.benefitItem}>
              <Icon name="local-offer" type="material" size={20} color="#4CAF50" />
              <ThemedText style={styles.benefitText}>Giảm giá 10% đơn hàng đầu tiên</ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="stars" type="material" size={20} color="#FFD700" />
              <ThemedText style={styles.benefitText}>Tích điểm đổi quà hấp dẫn</ThemedText>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="notifications-active" type="material" size={20} color="#2196F3" />
              <ThemedText style={styles.benefitText}>Thông báo theo dõi đơn hàng</ThemedText>
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
