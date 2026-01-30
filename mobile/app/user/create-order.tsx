import { ThemedText } from "@/components/themed-text";
import { orderService, serviceService } from "@/services/user";
import { LaundryService, Order } from "@/types";
import { Icon } from "@rneui/themed";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    storeId: string;
    storeName: string;
    lockerId: string;
    lockerName: string;
    boxId: string;
    boxNumber: string;
  }>();

  const [services, setServices] = useState<LaundryService[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [customerNote, setCustomerNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await serviceService.getAllServices();
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách dịch vụ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const toggleService = (serviceId: number) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleCreateOrderPress = () => {
    if (selectedServices.length === 0) {
      Alert.alert("Chưa chọn dịch vụ", "Vui lòng chọn ít nhất 1 dịch vụ");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleCreateOrder = async () => {
    setShowConfirmModal(false);
    
    try {
      setIsCreating(true);
      
      const orderData = {
        type: "LAUNDRY" as const,
        lockerId: parseInt(params.lockerId),
        boxId: parseInt(params.boxId),
        customerNote: customerNote.trim() || undefined,
        serviceIds: selectedServices,
      };

      const response = await orderService.createOrder(orderData);
      
      if (response.success && response.data) {
        setCreatedOrder(response.data);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      Alert.alert(
        "Tạo đơn thất bại",
        error.message || "Không thể tạo đơn hàng. Vui lòng thử lại."
      );
    } finally {
      setIsCreating(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003D5B" />
        <ThemedText style={styles.loadingText}>Đang tải dịch vụ...</ThemedText>
      </View>
    );
  }

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
          <ThemedText style={styles.headerTitle}>Tạo đơn hàng</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {params.storeName}
          </ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="door-front" type="material" size={20} color="#003D5B" />
            <ThemedText style={styles.infoLabel}>Tủ:</ThemedText>
            <ThemedText style={styles.infoValue}>{params.lockerName}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Icon name="inbox" type="material" size={20} color="#003D5B" />
            <ThemedText style={styles.infoLabel}>Ngăn:</ThemedText>
            <ThemedText style={styles.infoValue}>#{params.boxNumber}</ThemedText>
          </View>
        </View>

        {/* Services Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Chọn dịch vụ *</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Chọn các dịch vụ bạn muốn sử dụng
          </ThemedText>

          {services.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="local-laundry-service" type="material" size={48} color="#CCC" />
              <ThemedText style={styles.emptyText}>
                Không có dịch vụ nào
              </ThemedText>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {services.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceCard,
                      isSelected && styles.serviceCardSelected,
                    ]}
                    onPress={() => toggleService(service.id)}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Icon name="check-circle" type="material" size={24} color="#4CAF50" />
                      </View>
                    )}
                    <View style={styles.serviceIcon}>
                      <Icon
                        name="local-laundry-service"
                        type="material"
                        size={32}
                        color={isSelected ? "#003D5B" : "#666"}
                      />
                    </View>
                    <ThemedText
                      style={[
                        styles.serviceName,
                        isSelected && styles.serviceNameSelected,
                      ]}
                      numberOfLines={2}
                    >
                      {service.name}
                    </ThemedText>
                    <ThemedText style={styles.servicePrice}>
                      {formatPrice(service.price)}/{service.unit}
                    </ThemedText>
                    {service.estimatedTime && (
                      <ThemedText style={styles.serviceTime}>
                        ⏱️ {service.estimatedTime}h
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Customer Note */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Ghi chú</ThemedText>
          <TextInput
            style={styles.noteInput}
            placeholder="Thêm ghi chú cho đơn hàng (không bắt buộc)"
            placeholderTextColor="#999"
            value={customerNote}
            onChangeText={setCustomerNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Summary */}
        {selectedServices.length > 0 && (
          <View style={styles.summaryCard}>
            <ThemedText style={styles.summaryTitle}>Tóm tắt đơn hàng</ThemedText>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Số dịch vụ:</ThemedText>
              <ThemedText style={styles.summaryValue}>
                {selectedServices.length}
              </ThemedText>
            </View>
            <ThemedText style={styles.summaryNote}>
              💡 Giá cuối cùng sẽ được tính dựa trên cân nặng thực tế
            </ThemedText>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Create Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (selectedServices.length === 0 || isCreating) && styles.createButtonDisabled,
          ]}
          onPress={handleCreateOrderPress}
          disabled={selectedServices.length === 0 || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="add-shopping-cart" type="material" size={24} color="#fff" />
              <ThemedText style={styles.createButtonText}>
                Tạo đơn hàng
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Icon name="check-circle" type="material" size={72} color="#4CAF50" />
            </View>
            <ThemedText style={styles.modalTitle}>Tạo đơn thành công!</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              Đơn hàng #{createdOrder?.id} đã được tạo
            </ThemedText>

            {createdOrder?.pin && (
              <View style={styles.pinDisplay}>
                <ThemedText style={styles.pinLabel}>Mã PIN của bạn:</ThemedText>
                <View style={styles.pinCodeBox}>
                  <ThemedText style={styles.pinCodeText}>
                    {createdOrder.pin}
                  </ThemedText>
                </View>
                <ThemedText style={styles.pinNote}>
                  📌 Sử dụng mã PIN này để mở tủ và bỏ đồ vào
                </ThemedText>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push("/user/(tabs)/orders");
                }}
              >
                <ThemedText style={styles.modalButtonSecondaryText}>
                  Xem đơn hàng
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.back();
                }}
              >
                <ThemedText style={styles.modalButtonPrimaryText}>
                  Hoàn tất
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.confirmIcon}>
              <Icon name="help-outline" type="material" size={64} color="#FF9800" />
            </View>
            <ThemedText style={styles.modalTitle}>Xác nhận tạo đơn?</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              Bạn đã chọn {selectedServices.length} dịch vụ. Vui lòng kiểm tra lại thông tin trước khi xác nhận.
            </ThemedText>

            <View style={styles.confirmDetails}>
              <View style={styles.confirmRow}>
                <Icon name="store" type="material" size={20} color="#666" />
                <ThemedText style={styles.confirmLabel}>Cửa hàng:</ThemedText>
                <ThemedText style={styles.confirmValue}>{params.storeName}</ThemedText>
              </View>
              <View style={styles.confirmRow}>
                <Icon name="door-front" type="material" size={20} color="#666" />
                <ThemedText style={styles.confirmLabel}>Tủ:</ThemedText>
                <ThemedText style={styles.confirmValue}>{params.lockerName}</ThemedText>
              </View>
              <View style={styles.confirmRow}>
                <Icon name="inbox" type="material" size={20} color="#666" />
                <ThemedText style={styles.confirmLabel}>Ngăn:</ThemedText>
                <ThemedText style={styles.confirmValue}>#{params.boxNumber}</ThemedText>
              </View>
              <View style={styles.confirmRow}>
                <Icon name="local-laundry-service" type="material" size={20} color="#666" />
                <ThemedText style={styles.confirmLabel}>Dịch vụ:</ThemedText>
                <ThemedText style={styles.confirmValue}>{selectedServices.length} dịch vụ</ThemedText>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowConfirmModal(false)}
              >
                <ThemedText style={styles.modalButtonSecondaryText}>
                  Xem lại
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleCreateOrder}
              >
                <ThemedText style={styles.modalButtonPrimaryText}>
                  Xác nhận
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  header: {
    backgroundColor: "#003D5B",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    position: "relative",
  },
  serviceCardSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#F1F8F4",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    marginBottom: 6,
    minHeight: 36,
  },
  serviceNameSelected: {
    color: "#003D5B",
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#003D5B",
    marginBottom: 4,
  },
  serviceTime: {
    fontSize: 11,
    color: "#666",
  },
  noteInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 100,
  },
  summaryCard: {
    backgroundColor: "#E8F4F8",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#003D5B",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#003D5B",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  summaryNote: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 8,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  createButton: {
    backgroundColor: "#003D5B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createButtonDisabled: {
    backgroundColor: "#CCC",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  successIcon: {
    alignItems: "center",
    marginBottom: 16,
  },
  confirmIcon: {
    alignItems: "center",
    marginBottom: 16,
  },
  confirmDetails: {
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confirmLabel: {
    fontSize: 14,
    color: "#666",
    minWidth: 70,
  },
  confirmValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  pinDisplay: {
    backgroundColor: "#FFF8E1",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  pinLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  pinCodeBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#FF9800",
    borderStyle: "dashed",
  },
  pinCodeText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FF9800",
    textAlign: "center",
    letterSpacing: 8,
  },
  pinNote: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#003D5B",
  },
  modalButtonSecondaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#003D5B",
    textAlign: "center",
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#003D5B",
  },
  modalButtonPrimaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
});
