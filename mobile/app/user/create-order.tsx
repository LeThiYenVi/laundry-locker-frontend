import { ThemedText } from "@/components/themed-text";
import { orderService, serviceService } from "@/services/user";
import { LaundryService, Order, OrderType, ServiceCategory } from "@/types";
import { Icon } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
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
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('LAUNDRY');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [customerNote, setCustomerNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // New state for STORAGE - receiver info
  const [sendToOther, setSendToOther] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  
  // New state for STORAGE - intended pickup time
  const [intendedReceiveAt, setIntendedReceiveAt] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // New state for promo code (both categories)
  const [promotionCode, setPromotionCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  
  // New state for LAUNDRY - estimated weight
  const [estimatedWeight, setEstimatedWeight] = useState("");

  const fetchServices = useCallback(async (category: ServiceCategory) => {
    try {
      setIsLoading(true);
      const response = await serviceService.getServicesByCategory(category);
      if (response.success && response.data) {
        console.log(`[fetchServices] Category: ${category}, Services count: ${response.data.length}`);
        console.log('[fetchServices] Services:', response.data.map(s => ({ id: s.id, name: s.name, category: s.category, serviceType: s.serviceType })));
        
        // Helper function to detect category from service name/type if field is missing
        const detectCategory = (service: typeof response.data[0]): ServiceCategory => {
          if (service.category) return service.category;
          if (service.serviceType) {
            const type = service.serviceType;
            if (['STANDARD_DROPOFF', 'OVERNIGHT', 'EXPRESS_2H', 'MONTHLY_STUDENT', 'MONTHLY_SHIPPER'].includes(type)) {
              return 'STORAGE';
            }
            return 'LAUNDRY';
          }
          // Fallback: detect from name
          const lowerName = service.name.toLowerCase();
          if (lowerName.includes('gửi') || lowerName.includes('storage') || lowerName.includes('dropoff') || 
              lowerName.includes('tháng') || lowerName.includes('qua đêm') || lowerName.includes('overnight')) {
            return 'STORAGE';
          }
          return 'LAUNDRY';
        };
        
        // Client-side filter as fallback if API doesn't filter correctly
        const filteredByCategory = response.data.filter((s) => detectCategory(s) === category);
        
        console.log(`[fetchServices] After filter: ${filteredByCategory.length} services`);
        setServices(filteredByCategory);
      }
    } catch (error) {
      console.error('[fetchServices] Error:', error);
      Alert.alert("Lỗi", "Không thể tải danh sách dịch vụ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices(selectedCategory);
  }, [fetchServices, selectedCategory]);

  const toggleService = (serviceId: number) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  // Switch category and reset selected services
  const handleCategoryChange = (category: ServiceCategory) => {
    if (category !== selectedCategory) {
      setSelectedCategory(category);
      setSelectedServices([]);
    }
  };

  // Use all services from API (already filtered by category)
  const filteredServices = services;

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
      
      // Build base order data
      const orderData: any = {
        type: selectedCategory as OrderType,
        serviceCategory: selectedCategory,
        lockerId: parseInt(params.lockerId),
        boxId: parseInt(params.boxId),
        customerNote: customerNote.trim() || undefined,
        serviceIds: selectedServices,
      };

      // Add promo code if entered
      if (promotionCode.trim()) {
        orderData.promotionCode = promotionCode.trim();
      }

      // LAUNDRY specific fields
      if (selectedCategory === 'LAUNDRY') {
        if (estimatedWeight && parseFloat(estimatedWeight) > 0) {
          orderData.estimatedWeight = parseFloat(estimatedWeight);
        }
      }

      // STORAGE specific fields
      if (selectedCategory === 'STORAGE') {
        if (intendedReceiveAt) {
          orderData.intendedReceiveAt = intendedReceiveAt.toISOString();
        }
        if (sendToOther && receiverName.trim() && receiverPhone.trim()) {
          orderData.receiverName = receiverName.trim();
          orderData.receiverPhone = receiverPhone.trim();
        }
      }

      console.log('[CreateOrder] Sending:', orderData);
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

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header with Image Background */}
      <ImageBackground
        source={require("@/assets/images/order_locker.png")}
        style={styles.headerBackground}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(61, 158, 206, 0.95)"]}
          style={styles.headerGradient}
        >
          <View style={styles.headerSafeArea}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <View style={styles.backButtonBlur}>
                 <Icon name="arrow-back" type="material" size={24} color="rgb(255, 255, 255)" />
              </View>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <ThemedText style={styles.headerTitle}>Tạo đơn mới</ThemedText>
              <View style={styles.headerStoreBadge}>
                  <Icon name="storefront" type="material" size={14} color="#B0C4DE" />
                  <ThemedText style={styles.headerSubtitle} numberOfLines={1}>
                    {params.storeName}
                  </ThemedText>
              </View>
            </View>
          </View>

          {/* Info Card - Integrated into Header */}
          <View style={styles.infoCardWrapper}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                    <Icon name="door-sliding" type="material" size={20} color="#003D5B" />
                </View>
                <View style={{ flex: 1 }}>
                    <ThemedText style={styles.infoLabel}>Tủ đồ</ThemedText>
                    <ThemedText style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
                      {params.lockerName}
                    </ThemedText>
                </View>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.infoRow}>
                <View style={[styles.infoIconBox, { backgroundColor: "rgba(227, 242, 253, 0.8)" }]}>
                   <Icon name="inventory-2" type="material" size={20} color="#003D5B" />
                </View>
                 <View style={{ flex: 1 }}>
                    <ThemedText style={styles.infoLabel}>Ngăn tủ</ThemedText>
                    <ThemedText style={styles.infoValue}>Số {params.boxNumber}</ThemedText>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Services Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
             <ThemedText style={styles.sectionTitle}>Chọn dịch vụ</ThemedText>
             {selectedServices.length > 0 && (
                 <View style={styles.badgeCount}>
                     <ThemedText style={styles.badgeCountText}>{selectedServices.length}</ThemedText>
                 </View>
             )}
          </View>
          <ThemedText style={styles.sectionSubtitle}>
            Vui lòng chọn loại dịch vụ và các dịch vụ con
          </ThemedText>

          {/* Category Tabs */}
          <View style={styles.categoryTabs}>
            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategory === 'LAUNDRY' && styles.categoryTabActive,
              ]}
              onPress={() => handleCategoryChange('LAUNDRY')}
            >
              <Icon 
                name="local-laundry-service" 
                type="material" 
                size={20} 
                color={selectedCategory === 'LAUNDRY' ? '#003D5B' : '#9CA3AF'} 
              />
              <ThemedText
                style={[
                  styles.categoryTabText,
                  selectedCategory === 'LAUNDRY' && styles.categoryTabTextActive,
                ]}
              >
                Giặt đồ
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryTab,
                selectedCategory === 'STORAGE' && styles.categoryTabActive,
              ]}
              onPress={() => handleCategoryChange('STORAGE')}
            >
              <Icon 
                name="inventory-2" 
                type="material" 
                size={20} 
                color={selectedCategory === 'STORAGE' ? '#003D5B' : '#9CA3AF'} 
              />
              <ThemedText
                style={[
                  styles.categoryTabText,
                  selectedCategory === 'STORAGE' && styles.categoryTabTextActive,
                ]}
              >
                Gửi đồ
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Category Info */}
          <View style={styles.categoryInfo}>
            <Icon 
              name="info-outline" 
              type="material" 
              size={16} 
              color="#003D5B" 
            />
            <ThemedText style={styles.categoryInfoText}>
              {selectedCategory === 'LAUNDRY' 
                ? 'Giá tính theo kg, thanh toán sau khi Partner cân và xử lý xong' 
                : 'Giá cố định, thanh toán trước khi gửi, không cần Partner xử lý'}
            </ThemedText>
          </View>

          {filteredServices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="local-laundry-service" type="material" size={48} color="#CCC" />
              <ThemedText style={styles.emptyText}>
                Không có dịch vụ nào trong danh mục này
              </ThemedText>
            </View>
          ) : (
            <View style={styles.servicesGrid}>
              {filteredServices.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                // Get appropriate icon based on serviceType
                const getServiceIcon = () => {
                  const type = service.serviceType || service.name.toLowerCase();
                  if (type.includes('OVERNIGHT') || type === 'qua đêm') return 'nights-stay';
                  if (type.includes('EXPRESS') || type === 'nhanh') return 'flash-on';
                  if (type.includes('MONTHLY') || type === 'tháng') return 'date-range';
                  if (type.includes('STORAGE') || type.includes('gửi')) return 'inventory-2';
                  if (type.includes('ADDITIONAL') || type.includes('phụ')) return 'add-circle';
                  return 'local-laundry-service';
                };
                
                // Format price display
                const getUnitLabel = () => {
                  switch(service.unit) {
                    case 'KG': return 'kg';
                    case 'HOUR': return 'giờ';
                    case 'NIGHT': return 'đêm';
                    case 'MONTH': return 'tháng';
                    default: return service.unit?.toLowerCase() || '';
                  }
                };
                
                const displayPrice = service.pricePerUnit || service.price;
                
                return (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceCard,
                      isSelected && styles.serviceCardSelected,
                    ]}
                    onPress={() => toggleService(service.id)}
                    activeOpacity={0.8}
                  >
                    {/* Checkbox Indicator */}
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                         {isSelected && <Icon name="check" type="material" size={14} color="#fff" />}
                    </View>

                    <View style={styles.serviceIconContainer}>
                      <Icon
                        name={getServiceIcon()}
                        type="material"
                        size={28}
                        color={isSelected ? "#003D5B" : "#9CA3AF"}
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
                    
                    <View style={styles.priceTag}>
                         <ThemedText style={styles.servicePrice}>
                            {formatPrice(displayPrice)}
                            <ThemedText style={styles.serviceUnit}>/{getUnitLabel()}</ThemedText>
                        </ThemedText>
                        {service.maxPrice && (
                          <ThemedText style={styles.maxPriceText}>
                            Tối đa: {formatPrice(service.maxPrice)}
                          </ThemedText>
                        )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Customer Note */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Ghi chú thêm</ThemedText>
          <View style={styles.noteInputContainer}>
              <View style={{ marginTop: 12 }}>
                <Icon name="edit" type="material" size={20} color="#B0C4DE" />
              </View>
              <TextInput
                style={styles.noteInput}
                placeholder="Ví dụ: Giặt riêng đồ trắng, ủi ly quần tây..."
                placeholderTextColor="#A0A0A0"
                value={customerNote}
                onChangeText={setCustomerNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
          </View>
        </View>

        {/* STORAGE: Receiver Section */}
        {selectedCategory === 'STORAGE' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Người nhận đồ</ThemedText>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setSendToOther(!sendToOther)}
              >
                <View style={[styles.toggleTrack, sendToOther && styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, sendToOther && styles.toggleThumbActive]} />
                </View>
                <ThemedText style={styles.toggleLabel}>
                  {sendToOther ? 'Gửi cho người khác' : 'Tự nhận'}
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            {sendToOther && (
              <View style={styles.receiverInputs}>
                <View style={styles.inputRow}>
                  <Icon name="person" type="material" size={20} color="#666" />
                  <TextInput
                    style={styles.textInputField}
                    placeholder="Tên người nhận"
                    placeholderTextColor="#A0A0A0"
                    value={receiverName}
                    onChangeText={setReceiverName}
                  />
                </View>
                <View style={styles.inputRow}>
                  <Icon name="phone" type="material" size={20} color="#666" />
                  <TextInput
                    style={styles.textInputField}
                    placeholder="Số điện thoại người nhận"
                    placeholderTextColor="#A0A0A0"
                    value={receiverPhone}
                    onChangeText={setReceiverPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* STORAGE: Time Picker Section */}
        {selectedCategory === 'STORAGE' && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Thời gian nhận dự kiến</ThemedText>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => {
                // Set default to tomorrow 10:00 AM if not set
                if (!intendedReceiveAt) {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(10, 0, 0, 0);
                  setIntendedReceiveAt(tomorrow);
                }
                setShowDatePicker(true);
              }}
            >
              <Icon name="event" type="material" size={22} color="#003D5B" />
              <ThemedText style={styles.datePickerText}>
                {intendedReceiveAt ? formatDateTime(intendedReceiveAt) : 'Chọn thời gian nhận đồ'}
              </ThemedText>
              <Icon name="chevron-right" type="material" size={22} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        {/* Promo Code Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Mã giảm giá</ThemedText>
          <View style={styles.promoInputRow}>
            <View style={styles.promoInputContainer}>
              <Icon name="local-offer" type="material" size={20} color="#666" />
              <TextInput
                style={styles.promoInput}
                placeholder="Nhập mã khuyến mãi"
                placeholderTextColor="#A0A0A0"
                value={promotionCode}
                onChangeText={(text) => {
                  setPromotionCode(text.toUpperCase());
                  setPromoApplied(false);
                }}
                autoCapitalize="characters"
              />
            </View>
            <TouchableOpacity
              style={[styles.promoApplyButton, promoApplied && styles.promoAppliedButton]}
              onPress={() => {
                if (promotionCode.trim()) {
                  setPromoApplied(true);
                  // Note: actual discount will be calculated by backend
                }
              }}
              disabled={!promotionCode.trim()}
            >
              <ThemedText style={styles.promoApplyText}>
                {promoApplied ? '✓ Đã áp dụng' : 'Áp dụng'}
              </ThemedText>
            </TouchableOpacity>
          </View>
          {promoApplied && (
            <View style={styles.promoSuccessMsg}>
              <Icon name="check-circle" type="material" size={16} color="#4CAF50" />
              <ThemedText style={styles.promoSuccessText}>
                Mã sẽ được kiểm tra khi tạo đơn
              </ThemedText>
            </View>
          )}
        </View>

        {/* Summary Note */}
        <View style={styles.disclaimerContainer}>
            <Icon name="info-outline" type="material" size={16} color="#003D5B" />
            <ThemedText style={styles.disclaimerText}>
              {selectedCategory === 'LAUNDRY' 
                ? 'Nhân viên sẽ cân lại đồ và cập nhật giá chính xác sau khi thu gom.'
                : 'Giá cố định, thanh toán trước khi gửi đồ vào tủ.'}
            </ThemedText>
        </View>

      </ScrollView>

      {/* Footer Bar */}
      <View style={styles.footerContainer}>
         <View style={styles.footerContent}>
            <View>
               <ThemedText style={styles.footerLabel}>Tổng ước tính</ThemedText>
               <ThemedText style={styles.footerPrice}>
                  {formatPrice(
                      services
                      .filter(s => selectedServices.includes(s.id))
                      .reduce((sum, s) => sum + s.price, 0)
                  )}
                  <ThemedText style={styles.footerUnit}> (Dự kiến)</ThemedText>
               </ThemedText>
            </View>
            <TouchableOpacity
              style={[
                styles.checkoutButton,
                (selectedServices.length === 0 || isCreating) && styles.checkoutButtonDisabled,
              ]}
              onPress={handleCreateOrderPress}
              disabled={selectedServices.length === 0 || isCreating}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <ThemedText style={styles.checkoutButtonText}>Đặt đơn</ThemedText>
                  <Icon name="arrow-forward" type="material" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
         </View>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successHeader}>
               <Icon name="check-circle" type="material" size={60} color="#4CAF50" />
            </View>
            <ThemedText style={styles.modalTitle}>Thành công!</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              Đơn hàng của bạn đã được gửi đi.
            </ThemedText>

            {(createdOrder?.pin || createdOrder?.pinCode) && (
              <View style={styles.pinContainer}>
                <ThemedText style={styles.pinLabel}>MÃ PIN MỞ TỦ</ThemedText>
                <ThemedText style={styles.pinCode}>
                  {createdOrder.pin || createdOrder.pinCode}
                </ThemedText>
                <View style={styles.pinInstruction}>
                    <Icon name="touch-app" type="material" size={16} color="#003D5B" />
                    <ThemedText style={styles.pinInstructionText}>
                        {createdOrder.nextActionMessage || "Nhập mã này trên màn hình tủ"}
                    </ThemedText>
                </View>
              </View>
            )}

            <View style={styles.buttonStack}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.push("/user/(tabs)/orders");
                }}
              >
                <ThemedText style={styles.primaryButtonText}>Xem đơn hàng</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.back();
                }}
              >
                <ThemedText style={styles.secondaryButtonText}>Quay về trang chủ</ThemedText>
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
          <View style={styles.confirmCard}>
            <ThemedText style={styles.confirmTitle}>Xác nhận đặt đơn</ThemedText>
            <ThemedText style={styles.confirmMessage}>
                Bạn chắc chắn muốn tạo đơn hàng với {selectedServices.length} dịch vụ đã chọn?
            </ThemedText>
            
            <View style={styles.confirmActions}>
               <TouchableOpacity 
                  style={styles.confirmButtonCancel}
                  onPress={() => setShowConfirmModal(false)}
               >
                   <ThemedText style={styles.confirmButtonCancelText}>Hủy</ThemedText>
               </TouchableOpacity>
               <TouchableOpacity 
                  style={styles.confirmButtonOk}
                  onPress={handleCreateOrder}
               >
                   <ThemedText style={styles.confirmButtonOkText}>Đồng ý</ThemedText>
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
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#003D5B",
  },
  // Header Styles
  headerBackground: {
    height: 320, // Increased height to accommodate info card
    width: "100%",
  },
  headerGradient: {
    flex: 1,
    justifyContent: "space-between", // Space between nav and info card
    paddingBottom: 24,
  },
  headerSafeArea: {
    marginTop: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    marginRight: 16,
    marginTop: 4,
  },
  backButtonBlur: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerStoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 61, 91, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(176, 196, 222, 0.3)",
    gap: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#B0C4DE",
    fontWeight: "600",
  },
  
  content: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 30, // Keep rounded corners for content
    borderTopRightRadius: 30,
    marginTop: -20, // Slight overlap
    overflow: "hidden",
  },
  
  // Info Card - Now in Header
  infoCardWrapper: {
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.54)", // More transparent
    flexDirection: "row",
    borderRadius: 16,
    padding: 12, // Reduced padding slightly
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  infoRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginHorizontal: 8,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(227, 242, 253, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    color: "#555",
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#003D5B",
    flexShrink: 1, // Allow text to shrink if needed
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#003D5B",
  },
  badgeCount: {
      backgroundColor: "#003D5B",
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
  },
  badgeCountText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "bold",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },

  // Category Tabs
  categoryTabs: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  categoryTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  categoryTabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  categoryTabTextActive: {
    color: "#003D5B",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E0F2FE",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  categoryInfoText: {
    fontSize: 13,
    color: "#003D5B",
    fontWeight: "500",
    flex: 1,
  },
  
  // Empty State
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  emptyText: {
    marginTop: 12,
    color: "#999",
  },

  // Service Grid
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceCardSelected: {
    borderColor: "#003D5B",
    backgroundColor: "#F0F8FF", // Light Alice Blue
  },
  checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: "#D1D5DB",
      position: 'absolute',
      top: 12,
      right: 12,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "transparent",
  },
  checkboxSelected: {
      borderColor: "#4CAF50",
      backgroundColor: "#4CAF50",
      borderWidth: 0,
  },
  radioDot: {
     display: 'none', // Removed
  },
  serviceIconContainer: {
      marginBottom: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    minHeight: 40,
  },
  serviceNameSelected: {
     color: "#003D5B",
  },
  priceTag: {
      alignSelf: 'flex-start',
      backgroundColor: "rgba(176, 196, 222, 0.2)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: "700",
    color: "#003D5B",
  },
  serviceUnit: {
      fontSize: 11,
      fontWeight: "400",
      color: "#666",
  },
  maxPriceText: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
  },

  // Note Input
  noteInputContainer: {
      flexDirection: 'row',
      backgroundColor: "#fff",
      borderRadius: 16,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      gap: 10,
  },
  noteInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 14,
    color: "#1F2937",
  },

  // Disclaimer
  disclaimerContainer: {
      marginHorizontal: 20,
      backgroundColor: "#E8F4F8",
      padding: 12,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
  },
  disclaimerText: {
      flex: 1,
      fontSize: 13,
      color: "#003D5B",
      lineHeight: 18,
  },

  // Footer
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingBottom: 30, // For home indicator
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  footerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  footerLabel: {
      fontSize: 12,
      color: "#9CA3AF",
      marginBottom: 4,
  },
  footerPrice: {
      fontSize: 20,
      fontWeight: "900",
      color: "#003D5B",
  },
  footerUnit: {
      fontSize: 12,
      fontWeight: "normal",
      color: "#9CA3AF",
  },
  checkoutButton: {
    backgroundColor: "#003D5B",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#003D5B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutButtonDisabled: {
      backgroundColor: "#D1D5DB",
      shadowOpacity: 0,
      elevation: 0,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  successHeader: {
      marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#003D5B",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  
  // Pin Box
  pinContainer: {
      width: "100%",
      backgroundColor: "#F0F8FF",
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#B0C4DE",
      marginBottom: 24,
  },
  pinLabel: {
      fontSize: 12,
      fontWeight: "700",
      color: "#003D5B",
      letterSpacing: 1,
      marginBottom: 12,
  },
  pinCode: {
      fontSize: 36,
      fontWeight: "900",
      color: "#003D5B",
      letterSpacing: 4,
      marginBottom: 16,
  },
  pinInstruction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  pinInstructionText: {
      fontSize: 13,
      color: "#003D5B",
  },

  buttonStack: {
      width: "100%",
      gap: 12,
  },
  primaryButton: {
      backgroundColor: "#003D5B",
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
  },
  primaryButtonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
  },
  secondaryButton: {
      paddingVertical: 16,
      alignItems: "center",
  },
  secondaryButtonText: {
      color: "#003D5B",
      fontWeight: "600",
      fontSize: 15,
  },

  // Confirm Modal
  confirmCard: {
      backgroundColor: "#fff",
      borderRadius: 20,
      padding: 24,
  },
  confirmTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#111",
      marginBottom: 12,
  },
  confirmMessage: {
      fontSize: 15,
      color: "#666",
      lineHeight: 22,
      marginBottom: 24,
  },
  confirmActions: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'flex-end',
  },
  confirmButtonCancel: {
      paddingHorizontal: 20,
      paddingVertical: 10,
  },
  confirmButtonCancelText: {
      color: "#666",
      fontWeight: "600",
  },
  confirmButtonOk: {
      backgroundColor: "#003D5B",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
  },
  confirmButtonOkText: {
      color: "#fff",
      fontWeight: "600",
  },

  // New styles for receiver section
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: "#003D5B",
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#fff",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  toggleLabel: {
    fontSize: 12,
    color: "#666",
  },
  receiverInputs: {
    gap: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textInputField: {
    flex: 1,
    fontSize: 15,
    color: "#111",
    paddingVertical: 12,
  },
  
  // Date picker styles
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  datePickerText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  
  // Promo code styles
  promoInputRow: {
    flexDirection: "row",
    gap: 10,
  },
  promoInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  promoInput: {
    flex: 1,
    fontSize: 15,
    color: "#111",
    paddingVertical: 12,
  },
  promoApplyButton: {
    backgroundColor: "#003D5B",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  promoAppliedButton: {
    backgroundColor: "#4CAF50",
  },
  promoApplyText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  promoSuccessMsg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  promoSuccessText: {
    fontSize: 13,
    color: "#4CAF50",
  },
});
