import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  PageLoading,
  Input,
  Badge,
} from "~/components/ui";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

export default function PartnerSettingsPage(): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // Business Info
  const [businessInfo, setBusinessInfo] = React.useState({
    businessName: "Giặt ủi Viettel",
    taxCode: "0123456789",
    businessType: "COMPANY",
    registrationNumber: "0123456789-001",
    establishedDate: "2020-01-01",
  });

  // Contact Info
  const [contactInfo, setContactInfo] = React.useState({
    phone: "0901234567",
    email: "contact@viettellaundry.vn",
    address: "123 Nguyễn Huệ, Quận 1",
    city: "Hồ Chí Minh",
    state: "Hồ Chí Minh",
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
    bankName: "Vietcombank",
    accountNumber: "1234567890",
    accountHolder: "NGUYEN VAN A",
    branch: "Chi nhánh Quận 1",
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

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));
        // Data is already initialized above
      } catch (err) {
        console.error("Lỗi khi tải cài đặt:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Lưu cài đặt thành công!");
    } catch (err) {
      alert("Có lỗi xảy ra khi lưu cài đặt");
    } finally {
      setIsSaving(false);
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

  return (
    <div className="min-h-screen bg-[#FAFCFF] p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#326B9C]">Cài đặt</h1>
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
