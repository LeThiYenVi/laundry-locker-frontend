import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  PageLoading,
  ErrorState,
  Input,
  Badge,
} from "~/components/ui";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Camera,
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import {
  useGetPartnerProfileQuery,
  useUpdatePartnerProfileMutation,
} from "@/stores/apis/partnerApi";

export default function PartnerSettingsPage(): React.JSX.Element {
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useGetPartnerProfileQuery();
  const [updateProfile, { isLoading: isSaving }] =
    useUpdatePartnerProfileMutation();

  // Toast state
  const [toast, setToast] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-hide toast after 5 seconds
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Business Info (local state for editing)
  const [businessInfo, setBusinessInfo] = React.useState({
    businessName: "",
    taxCode: "",
    businessType: "COMPANY",
    registrationNumber: "",
    establishedDate: "",
  });

  // Contact Info
  const [contactInfo, setContactInfo] = React.useState({
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "Việt Nam",
  });

  // Working Hours
  const [workingHours, setWorkingHours] = React.useState({
    monday: { open: "08:00", close: "22:00", isOpen: true },
    tuesday: { open: "08:00", close: "22:00", isOpen: true },
    wednesday: { open: "08:00", close: "22:00", isOpen: true },
    thursday: { open: "08:00", close: "22:00", isOpen: true },
    friday: { open: "08:00", close: "22:00", isOpen: true },
    saturday: { open: "09:00", close: "20:00", isOpen: true },
    sunday: { open: "09:00", close: "20:00", isOpen: false },
  });

  // Bank Info
  const [bankInfo, setBankInfo] = React.useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    branch: "",
  });

  // Notification Preferences
  const [notificationPrefs, setNotificationPrefs] = React.useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderUpdates: true,
    paymentAlerts: true,
    systemNews: false,
  });

  // Populate form with API data
  React.useEffect(() => {
    if (profile) {
      setBusinessInfo({
        businessName: profile.businessName || "",
        taxCode: profile.taxId || "",
        businessType: "COMPANY",
        registrationNumber: profile.businessRegistrationNumber || "",
        establishedDate: "",
      });
      setContactInfo({
        phone: profile.contactPhone || "",
        email: profile.contactEmail || "",
        address: profile.businessAddress || "",
        city: "",
        state: "",
        country: "Việt Nam",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile({
        businessName: businessInfo.businessName,
        contactPhone: contactInfo.phone,
        contactEmail: contactInfo.email,
        businessAddress: contactInfo.address,
      }).unwrap();
      setToast({ type: "success", message: "Lưu cài đặt thành công!" });
    } catch (err: unknown) {
      console.error("Failed to save:", err);
      // Type guard for API error
      const apiError = err as {
        status?: number;
        data?: { message?: string; code?: string };
      };

      // Handle specific errors
      if (apiError?.status === 401 || apiError?.status === 403) {
        setToast({
          type: "error",
          message: "Phiên đăng nhập hết hạn. Đang chuyển hướng...",
        });
        setTimeout(() => {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }, 1500);
        return;
      }

      // Show detailed error message
      const errorMessage =
        apiError?.data?.message || "Có lỗi xảy ra khi lưu cài đặt";
      setToast({ type: "error", message: errorMessage });
    }
  };

  const getDayLabel = (day: string) => {
    const labels: Record<string, string> = {
      monday: "Thứ 2",
      tuesday: "Thứ 3",
      wednesday: "Thứ 4",
      thursday: "Thứ 5",
      friday: "Thứ 6",
      saturday: "Thứ 7",
      sunday: "Chủ nhật",
    };
    return labels[day] || day;
  };

  if (isLoading) {
    return <PageLoading message="Đang tải cài đặt..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải cài đặt"
        error={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCFF] p-8">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className={`ml-2 ${
                toast.type === "success"
                  ? "text-green-400 hover:text-green-600"
                  : "text-red-400 hover:text-red-600"
              }`}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#326B9C]">
              Hồ sơ & Cài đặt
            </h1>
            <p className="text-[#7BAAD1] mt-1">
              Quản lý thông tin và cài đặt tài khoản của bạn
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white font-semibold disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="border-[#E8E9EB] overflow-hidden">
          <div className="bg-gradient-to-r from-[#326B9C] to-[#7BAAD1] h-32"></div>
          <CardContent className="p-6 -mt-16">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile?.businessName || "P"}`}
                  />
                  <AvatarFallback className="bg-[#B0C8DA] text-[#326B9C] text-3xl font-bold">
                    {profile?.businessName?.substring(0, 2) || "P"}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-[#E8E9EB] hover:bg-[#FAFCFF]">
                  <Camera size={16} className="text-[#326B9C]" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-[#326B9C]">
                    {profile?.businessName ||
                      businessInfo.businessName ||
                      "Chưa cập nhật"}
                  </h2>
                  <Badge
                    className={
                      profile?.status === "APPROVED"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : profile?.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                    }
                  >
                    {profile?.status === "APPROVED"
                      ? "Đã xác thực"
                      : profile?.status === "PENDING"
                        ? "Chờ duyệt"
                        : profile?.status || "N/A"}
                  </Badge>
                </div>
                <p className="text-[#7BAAD1] mb-4">
                  Partner ID: #{profile?.id || "---"}
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#326B9C]">
                      {profile?.storeCount || 0}
                    </p>
                    <p className="text-xs text-[#7BAAD1]">Cửa hàng</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#326B9C]">
                      {profile?.staffCount || 0}
                    </p>
                    <p className="text-xs text-[#7BAAD1]">Nhân viên</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {profile?.revenueSharePercent || 70}%
                    </p>
                    <p className="text-xs text-[#7BAAD1]">Tỷ lệ chia sẻ</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#326B9C] mb-6 pb-4 border-b border-[#E8E9EB]">
              Thông tin doanh nghiệp
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Tên doanh nghiệp
                </Label>
                <Input
                  value={businessInfo.businessName}
                  onChange={(e) =>
                    setBusinessInfo({
                      ...businessInfo,
                      businessName: e.target.value,
                    })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">Mã số thuế</Label>
                <Input
                  value={businessInfo.taxCode}
                  onChange={(e) =>
                    setBusinessInfo({
                      ...businessInfo,
                      taxCode: e.target.value,
                    })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Loại hình kinh doanh
                </Label>
                <Select
                  value={businessInfo.businessType}
                  onValueChange={(value) =>
                    setBusinessInfo({ ...businessInfo, businessType: value })
                  }
                >
                  <SelectTrigger className="border-[#B0C8DA] bg-white">
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E8E9EB]">
                    <SelectItem
                      value="COMPANY"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Công ty
                    </SelectItem>
                    <SelectItem
                      value="INDIVIDUAL"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Hộ kinh doanh
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Số đăng ký kinh doanh
                </Label>
                <Input
                  value={businessInfo.registrationNumber}
                  onChange={(e) =>
                    setBusinessInfo({
                      ...businessInfo,
                      registrationNumber: e.target.value,
                    })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Ngày thành lập
                </Label>
                <Input
                  type="date"
                  value={businessInfo.establishedDate}
                  onChange={(e) =>
                    setBusinessInfo({
                      ...businessInfo,
                      establishedDate: e.target.value,
                    })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#326B9C] mb-6 pb-4 border-b border-[#E8E9EB]">
              Thông tin liên hệ
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Số điện thoại
                </Label>
                <Input
                  value={contactInfo.phone}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, phone: e.target.value })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">Email</Label>
                <Input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, email: e.target.value })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label className="text-[#7BAAD1] font-medium">Địa chỉ</Label>
                <Input
                  value={contactInfo.address}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, address: e.target.value })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">Thành phố</Label>
                <Input
                  value={contactInfo.city}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, city: e.target.value })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">Tỉnh/Thành</Label>
                <Input
                  value={contactInfo.state}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, state: e.target.value })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#326B9C] mb-6 pb-4 border-b border-[#E8E9EB]">
              Giờ làm việc
            </h2>

            <div className="space-y-4">
              {Object.entries(workingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-28 font-medium text-[#326B9C]">
                    {getDayLabel(day)}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hours.isOpen}
                      onChange={(e) =>
                        setWorkingHours({
                          ...workingHours,
                          [day]: { ...hours, isOpen: e.target.checked },
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-[#7BAAD1]">Mở cửa</span>
                  </div>

                  {hours.isOpen && (
                    <>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) =>
                          setWorkingHours({
                            ...workingHours,
                            [day]: { ...hours, open: e.target.value },
                          })
                        }
                        className="w-32 border-[#B0C8DA] bg-white"
                      />
                      <span className="text-[#7BAAD1]">đến</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) =>
                          setWorkingHours({
                            ...workingHours,
                            [day]: { ...hours, close: e.target.value },
                          })
                        }
                        className="w-32 border-[#B0C8DA] bg-white"
                      />
                    </>
                  )}

                  {!hours.isOpen && (
                    <Badge
                      variant="outline"
                      className="bg-red-100 text-red-700 border-red-200"
                    >
                      Đóng cửa
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bank Information */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#326B9C] mb-6 pb-4 border-b border-[#E8E9EB]">
              Thông tin ngân hàng
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Tên ngân hàng
                </Label>
                <Input
                  value={bankInfo.bankName}
                  onChange={(e) =>
                    setBankInfo({ ...bankInfo, bankName: e.target.value })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Số tài khoản
                </Label>
                <Input
                  value={bankInfo.accountNumber}
                  onChange={(e) =>
                    setBankInfo({ ...bankInfo, accountNumber: e.target.value })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Chủ tài khoản
                </Label>
                <Input
                  value={bankInfo.accountHolder}
                  onChange={(e) =>
                    setBankInfo({ ...bankInfo, accountHolder: e.target.value })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">Chi nhánh</Label>
                <Input
                  value={bankInfo.branch}
                  onChange={(e) =>
                    setBankInfo({ ...bankInfo, branch: e.target.value })
                  }
                  className="border-[#B0C8DA] bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-[#326B9C] mb-6 pb-4 border-b border-[#E8E9EB]">
              Tùy chọn thông báo
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#FAFCFF] rounded-lg border border-[#E8E9EB]">
                <div>
                  <div className="font-medium text-[#326B9C]">
                    Thông báo qua Email
                  </div>
                  <div className="text-sm text-[#7BAAD1]">
                    Nhận thông báo qua địa chỉ email
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.emailNotifications}
                  onChange={(e) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      emailNotifications: e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FAFCFF] rounded-lg border border-[#E8E9EB]">
                <div>
                  <div className="font-medium text-[#326B9C]">
                    Thông báo qua SMS
                  </div>
                  <div className="text-sm text-[#7BAAD1]">
                    Nhận thông báo qua tin nhắn điện thoại
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.smsNotifications}
                  onChange={(e) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      smsNotifications: e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#FAFCFF] rounded-lg border border-[#E8E9EB]">
                <div>
                  <div className="font-medium text-[#326B9C]">
                    Thông báo đẩy
                  </div>
                  <div className="text-sm text-[#7BAAD1]">
                    Nhận thông báo đẩy trên ứng dụng
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.pushNotifications}
                  onChange={(e) =>
                    setNotificationPrefs({
                      ...notificationPrefs,
                      pushNotifications: e.target.checked,
                    })
                  }
                  className="w-5 h-5"
                />
              </div>

              <div className="pt-4 border-t border-[#E8E9EB]">
                <h3 className="font-medium text-[#326B9C] mb-3">
                  Loại thông báo
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#7BAAD1]">
                      Cập nhật đơn hàng
                    </span>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.orderUpdates}
                      onChange={(e) =>
                        setNotificationPrefs({
                          ...notificationPrefs,
                          orderUpdates: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#7BAAD1]">
                      Thông báo thanh toán
                    </span>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.paymentAlerts}
                      onChange={(e) =>
                        setNotificationPrefs({
                          ...notificationPrefs,
                          paymentAlerts: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#7BAAD1]">
                      Tin tức hệ thống
                    </span>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.systemNews}
                      onChange={(e) =>
                        setNotificationPrefs({
                          ...notificationPrefs,
                          systemNews: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button (Bottom) */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            className="border-[#B0C8DA]"
            onClick={() => window.location.reload()}
          >
            Hủy thay đổi
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white font-semibold disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </div>
    </div>
  );
}
