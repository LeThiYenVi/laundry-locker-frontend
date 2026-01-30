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
import { useAuth } from "@/context/auth-context";
import type { PartnerProfile } from "@/types";

export default function PartnerProfilePage(): React.JSX.Element {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [profile, setProfile] = React.useState<PartnerProfile | null>(null);

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
      } catch (err) {
        console.error("Lỗi khi tải profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      alert("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setIsSaving(false);
    }
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
          {/* Left Column - Personal Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#7BAAD1]">Personal Details</h2>
            
            {/* Avatar Card */}
            <Card className="border-[#E8E9EB] shadow-sm">
              <CardContent className="p-8 text-center">
                <Avatar className="h-48 w-48 mx-auto mb-4">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-[#B0C8DA] text-[#326B9C] text-4xl font-bold">
                    {profile.businessName.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="inline-block px-4 py-2 bg-[#FAFCFF] border border-[#E8E9EB] rounded-lg text-sm text-[#326B9C] font-medium">
                  Verification Photo
                </div>
              </CardContent>
            </Card>

            {/* Information Fields */}
            <Card className="border-[#E8E9EB] shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div>
                  <Label className="text-xs text-[#7BAAD1] font-medium mb-1 block">Name</Label>
                  <p className="text-base font-semibold text-[#326B9C]">{profile.contactPerson}</p>
                </div>

                <div>
                  <Label className="text-xs text-[#7BAAD1] font-medium mb-1 block">Business</Label>
                  <p className="text-base font-semibold text-[#326B9C]">{profile.businessName}</p>
                </div>

                <div>
                  <Label className="text-xs text-[#7BAAD1] font-medium mb-1 block">Date of Registration</Label>
                  <p className="text-base font-semibold text-[#326B9C]">
                    {new Date(profile.joinDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-[#7BAAD1] font-medium mb-1 block">Role</Label>
                  <p className="text-base font-semibold text-[#326B9C]">Partner</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Address & Contact */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#7BAAD1] mb-6">Address</h2>
              <Card className="border-[#E8E9EB] shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="text-xs text-[#7BAAD1] font-medium mb-1 block">Address Line</Label>
                    <p className="text-sm text-[#326B9C] font-medium">{profile.address}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-[#7BAAD1] font-medium mb-1 block">City</Label>
                    <p className="text-sm text-[#326B9C] font-medium">{profile.city}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-[#7BAAD1] font-medium mb-1 block">State</Label>
                    <p className="text-sm text-[#326B9C] font-medium">{profile.district}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-[#7BAAD1] font-medium mb-1 block">Country</Label>
                    <p className="text-sm text-[#326B9C] font-medium">Vietnam</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#7BAAD1] mb-6">Contact Details</h2>
              <Card className="border-[#E8E9EB] shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="text-xs text-[#7BAAD1] font-medium mb-1 block">Phone Number</Label>
                    <p className="text-sm text-[#326B9C] font-medium">{profile.phoneNumber}</p>
                  </div>

                  <div>
                    <Label className="text-xs text-[#7BAAD1] font-medium mb-1 block">Email</Label>
                    <p className="text-sm text-[#326B9C] font-medium">{profile.email}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#7BAAD1] mb-6">Locker Station</h2>
              <Card className="border-[#E8E9EB] shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {profile.serviceArea && profile.serviceArea.length > 0 ? (
                      profile.serviceArea.map((area, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            idx === 0 ? "border-[#326B9C] bg-[#326B9C]" : "border-[#B0C8DA]"
                          }`}>
                            {idx === 0 && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <span className="text-sm text-[#326B9C] font-medium">Locker {String.fromCharCode(65 + idx)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[#7BAAD1]">No lockers assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Documents & Actions */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#7BAAD1]">Submitted Documents</h2>
            
            {/* Business License */}
            <Card className="border-[#E8E9EB] shadow-sm overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-[#B0C8DA] to-[#E8E9EB] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span className="text-3xl text-[#326B9C]">📄</span>
                  </div>
                  <p className="text-sm text-[#326B9C] font-medium">Business License</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#326B9C] font-medium">Business License</span>
                  <Badge variant="outline" className="text-xs border-[#B0C8DA] text-[#7BAAD1]">
                    1 File
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tax Document */}
            <Card className="border-[#E8E9EB] shadow-sm overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-[#7BAAD1] to-[#B0C8DA] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span className="text-3xl text-[#326B9C]">📋</span>
                  </div>
                  <p className="text-sm text-white font-medium">National ID Card</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#326B9C] font-medium">National ID Card</span>
                  <Badge variant="outline" className="text-xs border-[#B0C8DA] text-[#7BAAD1]">
                    2 Files
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button 
                variant="outline"
                className="border-red-400 text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold"
                onClick={() => alert("Decline action")}
              >
                Decline
              </Button>
              <Button 
                className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white font-semibold"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Processing..." : "Approve"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
