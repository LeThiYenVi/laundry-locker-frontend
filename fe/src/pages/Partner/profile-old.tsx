import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  Input,
  PageLoading,
  ErrorState,
  Badge,
} from "~/components/ui";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useAuth } from "@/context/auth-context";
import type { PartnerProfile } from "@/types";

export default function PartnerProfilePage(): React.JSX.Element {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [profile, setProfile] = React.useState<PartnerProfile | null>(null);
  const [formData, setFormData] = React.useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    taxCode: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    description: "",
    workingHours: {
      open: "08:00",
      close: "20:00",
    },
    serviceArea: [] as string[],
  });

  // TODO: Replace with actual API call
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock data
        const mockProfile: PartnerProfile = {
          id: 1,
          businessName: "Giặt Ủi Sạch ABC",
          contactPerson: "Nguyễn Văn A",
          email: "contact@giatsach.com",
          phoneNumber: "0912345678",
          address: "123 Nguyễn Huệ",
          city: "Hồ Chí Minh",
          district: "Quận 1",
          ward: "Phường Bến Nghé",
          taxCode: "0123456789",
          bankName: "Vietcombank",
          bankAccountNumber: "1234567890",
          bankAccountName: "NGUYEN VAN A",
          platformFeePercentage: 20,
          status: "ACTIVE",
          joinDate: "2024-01-15",
          totalRevenue: 50000000,
          totalOrders: 234,
          rating: 4.8,
          description:
            "Dịch vụ giặt ủi chuyên nghiệp với đội ngũ nhân viên giàu kinh nghiệm",
          workingHours: {
            open: "08:00",
            close: "20:00",
          },
          serviceArea: ["Quận 1", "Quận 3", "Quận 5"],
          avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ABC",
        };

        setProfile(mockProfile);
        setFormData({
          businessName: mockProfile.businessName,
          contactPerson: mockProfile.contactPerson,
          email: mockProfile.email,
          phoneNumber: mockProfile.phoneNumber,
          address: mockProfile.address,
          city: mockProfile.city,
          district: mockProfile.district,
          ward: mockProfile.ward,
          taxCode: mockProfile.taxCode || "",
          bankName: mockProfile.bankName || "",
          bankAccountNumber: mockProfile.bankAccountNumber || "",
          bankAccountName: mockProfile.bankAccountName || "",
          description: mockProfile.description || "",
          workingHours: mockProfile.workingHours,
          serviceArea: mockProfile.serviceArea || [],
        });
      } catch (err) {
        console.error("Lỗi khi tải profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO: Call API to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      alert("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = () => {
    // TODO: Implement avatar upload
    alert("Chức năng upload avatar sẽ được thêm sau");
  };

  if (isLoading) {
    return <PageLoading message="Đang tải thông tin..." />;
  }

  if (!profile) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải thông tin"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCFF]">
      {/* Navigation Header */}
      <div className="bg-white border-b border-[#E8E9EB] px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button className="flex items-center gap-2 text-[#326B9C] hover:text-[#7BAAD1] transition-colors">
            <span>←</span>
            <span className="font-medium">Back</span>
          </button>
          <button className="flex items-center gap-2 text-[#326B9C] hover:text-[#7BAAD1] transition-colors">
            <span className="font-medium">Next Profile</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Avatar Card */}
            <Card className="bg-gradient-to-br from-[#326B9C] to-[#7BAAD1] border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <Avatar className="h-32 w-32 mx-auto mb-6 border-4 border-white shadow-xl">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-white text-[#326B9C] text-3xl font-bold">
                    {profile.businessName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <h2 className="text-2xl font-bold text-white mb-2">
                  {profile.contactPerson}
                </h2>
                <p className="text-[#B0C8DA] mb-6">{profile.email}</p>

                <Badge className="bg-white text-[#326B9C] hover:bg-white mb-6">
                  {profile.status === "ACTIVE" ? "Active" : "Inactive"}
                </Badge>

                <Button
                  className="w-full bg-white text-[#326B9C] hover:bg-[#E8E9EB] font-semibold"
                  onClick={handleAvatarUpload}
                >
                  Upload New Photo
                </Button>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="shadow-lg border-[#E8E9EB]">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#326B9C] mb-6">
                  Platform Settings
                </h3>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#326B9C]">
                      Email notifications
                    </span>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#326B9C]">Post replies</span>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#326B9C]">Mentions</span>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="border-t border-[#E8E9EB] my-6"></div>

                <h3 className="text-lg font-bold text-[#326B9C] mb-6">
                  Application
                </h3>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#326B9C]">New launches</span>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#326B9C]">
                      Product updates
                    </span>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#326B9C]">Newsletter</span>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            {/* Profile Information */}
            <Card className="shadow-lg border-[#E8E9EB]">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#326B9C] mb-4">
                  Profile Information
                </h3>
                <p className="text-sm text-[#7BAAD1] mb-6 leading-relaxed">
                  {profile.description}
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">
                        Full Name
                      </Label>
                      <Input
                        value={formData.contactPerson}
                        onChange={(e) =>
                          handleInputChange("contactPerson", e.target.value)
                        }
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">
                        Business
                      </Label>
                      <Input
                        value={formData.businessName}
                        onChange={(e) =>
                          handleInputChange("businessName", e.target.value)
                        }
                        className="border-[#B0C8DA]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-[#7BAAD1] uppercase">
                        Email
                      </Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-500 uppercase">
                        Phone
                      </Label>
                      <Input
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        className="border-[#B0C8DA]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#7BAAD1] uppercase">
                      Location
                    </Label>
                    <Input
                      value={`${formData.address}, ${formData.district}, ${formData.city}`}
                      className="border-[#B0C8DA]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-[#7BAAD1] uppercase">
                        City
                      </Label>
                      <Select
                        value={formData.city}
                        onValueChange={(v) => handleInputChange("city", v)}
                      >
                        <SelectTrigger className="border-[#B0C8DA]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hồ Chí Minh">
                            Hồ Chí Minh
                          </SelectItem>
                          <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                          <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-[#7BAAD1] uppercase">
                        District
                      </Label>
                      <Input
                        value={formData.district}
                        onChange={(e) =>
                          handleInputChange("district", e.target.value)
                        }
                        className="border-[#B0C8DA]"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#E8E9EB]">
                  <Button
                    className="w-full bg-[#326B9C] hover:bg-[#7BAAD1] text-white font-semibold"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="shadow-lg border-[#E8E9EB]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#326B9C]">Projects</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#7BAAD1] hover:text-[#326B9C]"
                  >
                    View All
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="border border-[#E8E9EB] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-[#B0C8DA] to-[#E8E9EB]"></div>
                    <div className="p-4">
                      <h4 className="font-semibold text-[#326B9C] mb-2">
                        Modern Design
                      </h4>
                      <p className="text-xs text-[#7BAAD1] mb-3">
                        Contemporary approach to laundry management systems.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="border border-[#E8E9EB] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-[#7BAAD1] to-[#B0C8DA]"></div>
                    <div className="p-4">
                      <h4 className="font-semibold text-[#326B9C] mb-2">
                        Service Hub
                      </h4>
                      <p className="text-xs text-[#7BAAD1] mb-3">
                        Integrated platform for partner services.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card className="shadow-lg border-[#E8E9EB]">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#326B9C] mb-6">
                  Statistics
                </h3>

                <div className="space-y-5">
                  <div className="flex items-center justify-between py-3 border-b border-[#E8E9EB]">
                    <span className="text-sm text-[#7BAAD1]">Member Since</span>
                    <span className="font-semibold text-[#326B9C]">
                      {new Date(profile.joinDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-[#E8E9EB]">
                    <span className="text-sm text-[#7BAAD1]">Total Revenue</span>
                    <span className="font-semibold text-[#326B9C]">
                      {(profile.totalRevenue / 1000000).toFixed(1)}M VND
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-[#E8E9EB]">
                    <span className="text-sm text-[#7BAAD1]">Total Orders</span>
                    <span className="font-semibold text-[#326B9C]">
                      {profile.totalOrders}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-[#E8E9EB]">
                    <span className="text-sm text-[#7BAAD1]">Rating</span>
                    <span className="font-semibold text-[#326B9C]">
                      {profile.rating} / 5.0
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-[#7BAAD1]">Platform Fee</span>
                    <span className="font-semibold text-[#326B9C]">
                      {profile.platformFeePercentage}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg border-[#E8E9EB]">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#326B9C] mb-6">
                  Recent Activity
                </h3>

                <div className="space-y-4">
                  {[
                    { name: "New Order", time: "2 hours ago" },
                    { name: "Payment Received", time: "5 hours ago" },
                    { name: "Order Completed", time: "1 day ago" },
                    { name: "Customer Review", time: "2 days ago" },
                  ].map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-[#FAFCFF] transition-colors"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#326B9C]">
                          {activity.name}
                        </p>
                        <p className="text-xs text-[#7BAAD1] mt-1">
                          {activity.time}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        View
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bank Information */}
            <Card className="shadow-lg border-[#E8E9EB]">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-[#326B9C] mb-6">
                  Payment Information
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#7BAAD1] uppercase">
                      Bank Name
                    </Label>
                    <Select
                      value={formData.bankName}
                      onValueChange={(v) => handleInputChange("bankName", v)}
                    >
                      <SelectTrigger className="border-[#B0C8DA]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vietcombank">Vietcombank</SelectItem>
                        <SelectItem value="Techcombank">Techcombank</SelectItem>
                        <SelectItem value="BIDV">BIDV</SelectItem>
                        <SelectItem value="VietinBank">VietinBank</SelectItem>
                        <SelectItem value="ACB">ACB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#7BAAD1] uppercase">
                      Account Number
                    </Label>
                    <Input
                      value={formData.bankAccountNumber}
                      onChange={(e) =>
                        handleInputChange("bankAccountNumber", e.target.value)
                      }
                      className="border-[#B0C8DA]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[#7BAAD1] uppercase">
                      Account Name
                    </Label>
                    <Input
                      value={formData.bankAccountName}
                      onChange={(e) =>
                        handleInputChange("bankAccountName", e.target.value)
                      }
                      className="border-[#B0C8DA]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
