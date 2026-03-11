import { ThemedText } from "@/components/themed-text";
import { orderService, serviceService, promotionService, paymentService } from "@/services/user";
import type { PromotionValidateResponse } from "@/services/user/promotionService";
import { LaundryService, Order, OrderType, ServiceCategory } from "@/types";
import { Icon } from "@rneui/themed";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ConfirmOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    storeId: string;
    storeName: string;
    lockerId: string;
    lockerName: string;
    boxId: string;
    boxNumber: string;
    selectedCategory: string; // 'LAUNDRY' or 'STORAGE'
    serviceIds: string; // comma-separated
  }>();

  const [services, setServices] = useState<LaundryService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Parse passed params
  const category = (params.selectedCategory || 'LAUNDRY') as ServiceCategory;
  const selectedServiceIds = params.serviceIds ? params.serviceIds.split(',').map(id => parseInt(id, 10)) : [];

  // Order Detail States
  const [customerNote, setCustomerNote] = useState("");
  const [sendToOther, setSendToOther] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [intendedReceiveAt, setIntendedReceiveAt] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [estimatedWeight, setEstimatedWeight] = useState("");

  // Promo States
  const [promotionCode, setPromotionCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoDetail, setPromoDetail] = useState<PromotionValidateResponse | null>(null);

  // Submission States
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Payment States
  const [paymentTab, setPaymentTab] = useState<'info' | 'momo'>('info');
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await serviceService.getServicesByCategory(category);
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('[fetchServices] Error:', error);
      Alert.alert("Lỗi", "Không thể tải danh sách dịch vụ");
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Derived Values
  const selectedServicesList = services.filter(s => selectedServiceIds.includes(s.id));
  const subtotal = selectedServicesList.reduce((sum, s) => sum + s.price, 0);
  const total = Math.max(0, subtotal - promoDiscount);

  // Auto-set intendedReceiveAt for STORAGE if service has estimated time
  // For LAUNDRY, we might have an estimated time. For STORAGE, it should be manually selected unless it's a very specific fixed-time service.
  const mainService = selectedServicesList.length > 0 ? selectedServicesList[0] : null;
  
  // Calculate fixed hours based on category
  let fixedHours: number | null = null;
  if (category === 'LAUNDRY' && mainService) {
      // Auto set expected receive time for LAUNDRY based on estimated time needed
      fixedHours = mainService.estimatedTime || mainService.estimatedHours || 24; // default 24h if not specified
  } else if (category === 'STORAGE' && mainService) {
      // Only lock storage time if it's a specific "fixed duration" service (e.g., "Gửi đồ 2h").
      // Check for patterns like "2h", "12 h", "2 giờ", "12 giờ" using regex to avoid matching "hàng", "thường"
      const serviceNameLower = mainService.name?.toLowerCase() || "";
      const hasFixedTimeRegex = /\b\d+\s*(h|giờ)\b/;
      if ((mainService.estimatedTime || mainService.estimatedHours) && hasFixedTimeRegex.test(serviceNameLower)) {
         fixedHours = mainService.estimatedTime || mainService.estimatedHours || null;
      }
  }

  const isTimeFixed = !!fixedHours;

  useEffect(() => {
    if (isTimeFixed && fixedHours) {
      const receiveDate = new Date();
      receiveDate.setHours(receiveDate.getHours() + fixedHours);
      setIntendedReceiveAt(receiveDate);
    }
  }, [isTimeFixed, fixedHours]);

  // Handle applied promo code validation
  const handleApplyPromo = async () => {
    const code = promotionCode.trim();
    if (!code) return;

    setPromoLoading(true);
    setPromoError("");
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoDetail(null);

    try {
      const response = await promotionService.validatePromotionCode(code);
      if (response.data) {
        const promo = response.data;
        if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
          setPromoError(`Đơn hàng tối thiểu ${formatPrice(promo.minOrderAmount)} để áp dụng mã này`);
          return;
        }
        const discount = promotionService.calculateDiscount(promo, subtotal);
        setPromoDetail(promo);
        setPromoDiscount(discount);
        setPromoApplied(true);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || "Mã khuyến mãi không hợp lệ";
      setPromoError(errorMsg);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromotionCode("");
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoError("");
    setPromoDetail(null);
  };

  const handleCreateOrder = async () => {
    try {
      setIsCreating(true);
      
      const orderData: any = {
        type: category as OrderType,
        serviceCategory: category,
        lockerId: parseInt(params.lockerId),
        boxId: parseInt(params.boxId),
        customerNote: customerNote.trim() || undefined,
        serviceIds: selectedServiceIds,
      };

      if (promoApplied && promotionCode.trim()) {
        orderData.promotionCode = promotionCode.trim();
      }

      if (category === 'LAUNDRY' && estimatedWeight && parseFloat(estimatedWeight) > 0) {
        orderData.estimatedWeight = parseFloat(estimatedWeight);
      }

      if (category === 'STORAGE') {
        if (intendedReceiveAt) orderData.intendedReceiveAt = intendedReceiveAt.toISOString();
        if (sendToOther && receiverName.trim() && receiverPhone.trim()) {
          orderData.receiverName = receiverName.trim();
          orderData.receiverPhone = receiverPhone.trim();
        }
      }

      console.log('[ConfirmOrder] Sending:', orderData);
      const response = await orderService.createOrder(orderData);
      
      if (response.success && response.data) {
        setCreatedOrder(response.data);

        // Confirm order so it transitions to WAITING (eligible for payment)
        try {
          await orderService.confirmOrder(response.data.id);
          console.log('[ConfirmOrder] Order confirmed:', response.data.id);
        } catch (e) {
          console.warn('[ConfirmOrder] Confirm failed (best-effort):', e);
        }

        setPaymentTab('info');
        setPaymentUrl('');
        setPaymentError('');
        setPaymentSuccess(false);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      Alert.alert("Tạo đơn thất bại", error.message || "Không thể tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  };

  // ── MoMo Payment ──────────────────────────────
  const handlePayMomo = async () => {
    if (!createdOrder) return;
    setIsPaymentLoading(true);
    setPaymentError('');
    setQrCodeData(null);
    try {
      const res = await paymentService.createPayment(createdOrder.id, 'MOMO');
      const paymentData = res.data as any;
      if (res.success && paymentData?.paymentUrl) {
        setPaymentUrl(paymentData.paymentUrl);
        setQrCodeData(paymentData.qrCodeUrl || null);
        setPaymentTab('momo');
        startPaymentPolling(createdOrder.id);
      } else {
        setPaymentError((res as any).message || 'Không thể tạo thanh toán MoMo');
      }
    } catch (err: any) {
      setPaymentError(err?.response?.data?.message || err.message || 'Lỗi kết nối');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const startPaymentPolling = (orderId: number) => {
    if (pollRef.current) clearInterval(pollRef.current);
    setIsPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const res = await orderService.getOrderStatus(orderId);
        if (res.success && res.data?.isPaid) {
          if (pollRef.current) clearInterval(pollRef.current);
          setIsPolling(false);
          setPaymentSuccess(true);
          setShowSuccessModal(false);
          Alert.alert('Thành công!', 'Thanh toán MoMo thành công.', [
            { text: 'OK', onPress: () => router.push('/user/(tabs)/orders' as any) },
          ]);
        }
      } catch { /* ignore polling errors */ }
    }, 3000);
  };

  // Clean up polling on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003D5B" />
        <ThemedText style={styles.loadingText}>Đang tải...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={["#003D5B", "#002B40"]} style={styles.headerGradient}>
          <View style={styles.headerSafeArea}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <View style={styles.backButtonBlur}>
                 <Icon name="arrow-back" type="material" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Chi tiết đơn hàng</ThemedText>
          </View>
        </LinearGradient>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        {/* Info Card */}
        <View style={styles.infoCard}>
            <View style={styles.infoRow}>
                <View style={styles.infoIconBox}>
                    <Icon name="storefront" type="material" size={20} color="#003D5B" />
                </View>
                <View style={{ flex: 1 }}>
                    <ThemedText style={styles.infoLabel}>Cửa hàng</ThemedText>
                    <ThemedText style={styles.infoValue} numberOfLines={1}>{params.storeName}</ThemedText>
                </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
                <View style={[styles.infoIconBox, { backgroundColor: "rgba(227, 242, 253, 0.8)" }]}>
                    <Icon name="door-sliding" type="material" size={20} color="#003D5B" />
                </View>
                <View style={{ flex: 1 }}>
                    <ThemedText style={styles.infoLabel}>Tủ đồ</ThemedText>
                    <ThemedText style={styles.infoValue} numberOfLines={1}>{params.lockerName}</ThemedText>
                </View>
            </View>
            <View style={styles.divider} />
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

        {/* Selected Services */}
        <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Dịch vụ đã chọn</ThemedText>
            {selectedServicesList.map(s => (
                <View key={s.id} style={styles.serviceRow}>
                    <View style={styles.serviceIconWrap}>
                        <Icon name="check-circle" type="material" size={18} color="#4CAF50" />
                    </View>
                    <ThemedText style={styles.serviceName}>{s.name}</ThemedText>
                    <ThemedText style={styles.servicePrice}>{formatPrice(s.price)}</ThemedText>
                </View>
            ))}
        </View>

        {/* Note Input */}
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
        {category === 'STORAGE' && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <ThemedText style={styles.sectionTitle}>Người nhận đồ</ThemedText>
              <TouchableOpacity style={styles.toggleButton} onPress={() => setSendToOther(!sendToOther)}>
                <View style={[styles.toggleTrack, sendToOther && styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, sendToOther && styles.toggleThumbActive]} />
                </View>
                <ThemedText style={styles.toggleLabel}>{sendToOther ? 'Gửi cho người khác' : 'Tự nhận'}</ThemedText>
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

        {/* Time Picker Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Thời gian nhận dự kiến</ThemedText>
          <TouchableOpacity
            style={[styles.datePickerButton, isTimeFixed && { backgroundColor: '#F0F0F0' }]}
            disabled={isTimeFixed}
            onPress={() => {
              const initialDate = intendedReceiveAt || (() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(10, 0, 0, 0);
                return tomorrow;
              })();
              setTempDate(initialDate);
              setShowDatePicker(true);
            }}
          >
            <Icon name="event" type="material" size={22} color="#003D5B" />
            <ThemedText style={styles.datePickerText}>
              {intendedReceiveAt ? formatDateTime(intendedReceiveAt) : 'Chọn thời gian nhận đồ'}
            </ThemedText>
            {!isTimeFixed && <Icon name="chevron-right" type="material" size={22} color="#666" />}
          </TouchableOpacity>
          {isTimeFixed && fixedHours && (
            <ThemedText style={{fontSize: 12, color: '#666', marginTop: 8, fontStyle: 'italic'}}>
              * Thời gian được tính tự động dựa trên dịch vụ ({fixedHours} giờ)
            </ThemedText>
          )}
        </View>

        {/* Promo Code Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Mã giảm giá</ThemedText>
          <View style={styles.promoInputRow}>
            <View style={[styles.promoInputContainer, promoApplied && styles.promoInputApplied, promoError ? styles.promoInputError : null]}>
              <Icon name="local-offer" type="material" size={20} color={promoApplied ? "#4CAF50" : promoError ? "#F44336" : "#666"} />
              <TextInput
                style={styles.promoInput}
                placeholder="Nhập mã khuyến mãi"
                placeholderTextColor="#A0A0A0"
                value={promotionCode}
                onChangeText={(text) => {
                  setPromotionCode(text.toUpperCase());
                  if (promoApplied || promoError) {
                    setPromoApplied(false);
                    setPromoError("");
                    setPromoDiscount(0);
                    setPromoDetail(null);
                  }
                }}
                autoCapitalize="characters"
                editable={!promoApplied && !promoLoading}
              />
              {promoApplied && (
                <TouchableOpacity onPress={handleRemovePromo} style={styles.promoRemoveBtn}>
                  <Icon name="close" type="material" size={18} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            {!promoApplied && (
              <TouchableOpacity
                style={[styles.promoApplyButton, promoLoading && { opacity: 0.6 }]}
                onPress={handleApplyPromo}
                disabled={!promotionCode.trim() || promoLoading}
              >
                {promoLoading ? <ActivityIndicator size="small" color="#fff" /> : <ThemedText style={styles.promoApplyText}>Áp dụng</ThemedText>}
              </TouchableOpacity>
            )}
          </View>

          {promoError ? (
            <View style={styles.promoErrorMsg}>
              <Icon name="error-outline" type="material" size={16} color="#F44336" />
              <ThemedText style={styles.promoErrorText}>{promoError}</ThemedText>
            </View>
          ) : null}

          {promoApplied && promoDetail && (
            <View style={styles.promoSuccessCard}>
              <View style={styles.promoSuccessHeader}>
                <Icon name="check-circle" type="material" size={20} color="#4CAF50" />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.promoSuccessTitle}>{promoDetail.title}</ThemedText>
                  <ThemedText style={styles.promoSuccessCode}>Mã: {promoDetail.code}</ThemedText>
                </View>
              </View>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Footer Pricing Summary */}
      <View style={styles.footerContainer}>
        <View style={styles.priceSummaryBox}>
            <View style={styles.priceRow}>
                <ThemedText style={styles.priceLabel}>Tạm tính ({selectedServicesList.length} d.vụ):</ThemedText>
                <ThemedText style={styles.priceValue}>{formatPrice(subtotal)}</ThemedText>
            </View>
            {promoApplied && promoDiscount > 0 && (
                <View style={styles.priceRow}>
                    <ThemedText style={[styles.priceLabel, { color: '#4CAF50' }]}>Khuyến mãi:</ThemedText>
                    <ThemedText style={[styles.priceValue, { color: '#F44336' }]}>-{formatPrice(promoDiscount)}</ThemedText>
                </View>
            )}
            <View style={styles.totalRow}>
                <ThemedText style={styles.totalLabel}>Tổng cộng:</ThemedText>
                <ThemedText style={styles.totalValue}>{formatPrice(total)}</ThemedText>
            </View>
        </View>

        <TouchableOpacity
            style={[styles.checkoutButton, isCreating && styles.checkoutButtonDisabled]}
            onPress={handleCreateOrder}
            disabled={isCreating}
        >
            {isCreating ? (
            <ActivityIndicator size="small" color="#fff" />
            ) : (
            <>
                <Icon name="check-circle-outline" type="material" size={22} color="#fff" />
                <ThemedText style={styles.checkoutButtonText}>Xác nhận & Đặt đơn</ThemedText>
            </>
            )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {/* ── Tab: Order Info ── */}
            {paymentTab === 'info' && (
              <>
                <View style={styles.successHeader}>
                  <Icon name="check-circle" type="material" size={60} color="#4CAF50" />
                </View>
                <ThemedText style={styles.modalTitle}>Thành công!</ThemedText>
                <ThemedText style={styles.modalSubtitle}>Đơn hàng của bạn đã được tạo.</ThemedText>

                {(createdOrder?.pin || createdOrder?.pinCode) && (
                  <View style={styles.pinContainer}>
                    <ThemedText style={styles.pinLabel}>MÃ PIN MỞ TỦ</ThemedText>
                    <ThemedText style={styles.pinCode}>{createdOrder.pin || createdOrder.pinCode}</ThemedText>
                    <View style={styles.pinInstruction}>
                      <Icon name="touch-app" type="material" size={16} color="#003D5B" />
                      <ThemedText style={styles.pinInstructionText}>
                        {createdOrder?.nextActionMessage || "Nhập mã này trên màn hình tủ"}
                      </ThemedText>
                    </View>
                  </View>
                )}

                {paymentError ? (
                  <View style={{ backgroundColor: '#FFF5F5', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FFCDD2', width: '100%', marginBottom: 12 }}>
                    <ThemedText style={{ color: '#F44336', fontSize: 13, textAlign: 'center' }}>{paymentError}</ThemedText>
                  </View>
                ) : null}

                <View style={styles.buttonStack}>
                  {/* MoMo Pay Button */}
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: '#A50064', flexDirection: 'row', justifyContent: 'center', gap: 8 }]}
                    onPress={handlePayMomo}
                    disabled={isPaymentLoading || paymentSuccess}
                  >
                    {isPaymentLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Icon name="payment" type="material" size={20} color="#fff" />
                        <ThemedText style={styles.primaryButtonText}>
                          {paymentSuccess ? 'Đã thanh toán ✓' : 'Thanh toán MoMo'}
                        </ThemedText>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      if (pollRef.current) clearInterval(pollRef.current);
                      setShowSuccessModal(false);
                      router.push("/user/(tabs)/orders" as any);
                    }}
                  >
                    <ThemedText style={styles.primaryButtonText}>Xem đơn hàng</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      if (pollRef.current) clearInterval(pollRef.current);
                      setShowSuccessModal(false);
                      router.push("/user/(tabs)/home" as any);
                    }}
                  >
                    <ThemedText style={styles.secondaryButtonText}>Về trang chủ</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ── Tab: MoMo QR / Link ── */}
            {paymentTab === 'momo' && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <TouchableOpacity onPress={() => setPaymentTab('info')}>
                    <Icon name="arrow-back" type="material" size={24} color="#333" />
                  </TouchableOpacity>
                  <ThemedText style={[styles.modalTitle, { marginBottom: 0, flex: 1 }]}>Thanh toán MoMo</ThemedText>
                </View>

                <View style={{ width: '100%', backgroundColor: '#FFF0F6', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F8BBD0', alignItems: 'center', marginBottom: 16 }}>
                  {qrCodeData ? (
                    <View style={{ padding: 10, backgroundColor: 'white', borderRadius: 12, marginBottom: 12 }}>
                      <QRCode value={qrCodeData} size={150} />
                    </View>
                  ) : (
                    <Icon name="qr-code-2" type="material" size={80} color="#A50064" />
                  )}
                  <ThemedText style={{ fontSize: 14, color: '#A50064', fontWeight: '700', marginTop: 8, textAlign: 'center' }}>
                    Quét mã QR bằng ứng dụng MoMo
                  </ThemedText>
                  <ThemedText style={{ fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' }}>
                    Hoặc nhấn nút bên dưới để chuyển sang MoMo
                  </ThemedText>
                </View>

                {isPolling && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <ActivityIndicator size="small" color="#A50064" />
                    <ThemedText style={{ fontSize: 13, color: '#666' }}>Đang chờ xác nhận thanh toán...</ThemedText>
                  </View>
                )}

                {paymentSuccess && (
                  <View style={{ backgroundColor: '#F1F8E9', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#C8E6C9', width: '100%', marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Icon name="check-circle" type="material" size={20} color="#4CAF50" />
                    <ThemedText style={{ color: '#2E7D32', fontWeight: '700', fontSize: 14 }}>Thanh toán thành công!</ThemedText>
                  </View>
                )}

                <View style={styles.buttonStack}>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: '#A50064' }]}
                    onPress={() => { if (paymentUrl) Linking.openURL(paymentUrl); }}
                  >
                    <ThemedText style={styles.primaryButtonText}>Mở MoMo thanh toán</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      if (pollRef.current) clearInterval(pollRef.current);
                      setShowSuccessModal(false);
                      router.push("/user/(tabs)/orders" as any);
                    }}
                  >
                    <ThemedText style={styles.secondaryButtonText}>
                      {paymentSuccess ? 'Xem đơn hàng' : 'Thanh toán sau'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </View>
        </View>
      </Modal>

      {/* Date & Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={tempDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (event.type === 'set' && selectedDate) {
              setTempDate(selectedDate);
              if (Platform.OS === 'android') {
                setTimeout(() => setShowTimePicker(true), 100);
              } else {
                setShowTimePicker(true);
              }
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={tempDate || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (event.type === 'set' && selectedTime && tempDate) {
              const finalDate = new Date(tempDate);
              finalDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
              setIntendedReceiveAt(finalDate);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#003D5B" },
  
  header: { backgroundColor: "#003D5B", borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 20 },
  headerGradient: { paddingTop: 40, paddingBottom: 20, paddingHorizontal: 20 },
  headerSafeArea: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  backButton: {},
  backButtonBlur: { backgroundColor: "rgba(255,255,255,0.2)", padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  
  content: { flex: 1, marginTop: -20 },
  contentContainer: { paddingBottom: 180, paddingHorizontal: 20, paddingTop: 10 },
  
  infoCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 20, gap: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  divider: { height: 1, backgroundColor: "#F0F0F0" },
  infoIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F0F8FF", justifyContent: "center", alignItems: "center" },
  infoLabel: { fontSize: 12, color: "#888", marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "700", color: "#333" },

  section: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#003D5B", marginBottom: 12 },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  
  serviceRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  serviceIconWrap: { marginRight: 10 },
  serviceName: { flex: 1, fontSize: 14, color: "#333" },
  servicePrice: { fontSize: 14, fontWeight: "600", color: "#111" },

  noteInputContainer: { flexDirection: 'row', backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: "#E5E7EB", gap: 10 },
  noteInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#1F2937", minHeight: 80 },

  toggleButton: { flexDirection: "row", alignItems: "center", gap: 8 },
  toggleTrack: { width: 40, height: 22, borderRadius: 11, backgroundColor: "#E5E7EB", justifyContent: "center", paddingHorizontal: 2 },
  toggleTrackActive: { backgroundColor: "#003D5B" },
  toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#fff" },
  toggleThumbActive: { alignSelf: "flex-end" },
  toggleLabel: { fontSize: 12, color: "#666" },
  
  receiverInputs: { gap: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  textInputField: { flex: 1, fontSize: 14, color: "#111", paddingVertical: 10 },

  datePickerButton: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  datePickerText: { flex: 1, fontSize: 14, color: "#333" },

  promoInputRow: { flexDirection: "row", gap: 10 },
  promoInputContainer: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#F9FAFB", borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: "#E5E7EB" },
  promoInput: { flex: 1, fontSize: 14, color: "#111", paddingVertical: 10 },
  promoApplyButton: { backgroundColor: "#003D5B", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, justifyContent: "center" },
  promoApplyText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  promoInputApplied: { borderColor: "#4CAF50", backgroundColor: "#F1F8E9" },
  promoInputError: { borderColor: "#FFCDD2", backgroundColor: "#FFF5F5" },
  promoRemoveBtn: { padding: 4 },
  promoErrorMsg: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  promoErrorText: { fontSize: 13, color: "#F44336", flex: 1 },
  promoSuccessCard: { marginTop: 10, backgroundColor: "#F1F8E9", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#C8E6C9" },
  promoSuccessHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  promoSuccessTitle: { fontSize: 14, fontWeight: "600", color: "#2E7D32" },
  promoSuccessCode: { fontSize: 12, color: "#66BB6A", marginTop: 2 },

  footerContainer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", paddingTop: 16, paddingBottom: 30, paddingHorizontal: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 },
  priceSummaryBox: { marginBottom: 16 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  priceLabel: { fontSize: 14, color: "#666" },
  priceValue: { fontSize: 15, fontWeight: "600", color: "#333" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#E0E0E0" },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#003D5B" },
  totalValue: { fontSize: 20, fontWeight: "800", color: "#F44336" },

  checkoutButton: { backgroundColor: "#003D5B", flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 16, borderRadius: 14, gap: 10, shadowColor: "#003D5B", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  checkoutButtonDisabled: { backgroundColor: "#A0A0A0", shadowOpacity: 0, elevation: 0 },
  checkoutButtonText: { fontSize: 16, fontWeight: "700", color: "#fff" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 24, alignItems: "center" },
  successHeader: { marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: "900", color: "#003D5B", marginBottom: 8 },
  modalSubtitle: { fontSize: 15, color: "#6B7280", textAlign: "center", marginBottom: 24 },
  pinContainer: { width: "100%", backgroundColor: "#F0F8FF", borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#B0C4DE", marginBottom: 24 },
  pinLabel: { fontSize: 12, fontWeight: "700", color: "#003D5B", letterSpacing: 1, marginBottom: 12 },
  pinCode: { fontSize: 30, fontWeight: "900", color: "#003D5B", letterSpacing: 4, marginBottom: 16 },
  pinInstruction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pinInstructionText: { fontSize: 13, color: "#003D5B" },
  buttonStack: { width: "100%", gap: 12 },
  primaryButton: { backgroundColor: "#003D5B", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  secondaryButton: { paddingVertical: 16, alignItems: "center" },
  secondaryButtonText: { color: "#003D5B", fontWeight: "600", fontSize: 15 },
});
