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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { StaffMember, CreateStaffRequest } from "@/types";
import { StaffRole } from "@/types/partner.enum";

export default function PartnerStaffPage(): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(true);
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = React.useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterRole, setFilterRole] = React.useState<string>("ALL");
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<CreateStaffRequest>({
    name: "",
    phoneNumber: "",
    email: "",
    role: "STAFF" as StaffRole,
  });

  // TODO: Replace with actual API call
  React.useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock data
        const mockStaff: StaffMember[] = [
          {
            id: 1,
            name: "Nguyễn Văn A",
            phoneNumber: "0912345678",
            email: "nguyenvana@example.com",
            role: "MANAGER" as StaffRole,
            status: "ACTIVE",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
            createdAt: "2024-01-15T08:00:00Z",
            performance: {
              completedOrders: 150,
              avgProcessingTime: "2.5 giờ",
              rating: 4.8,
              onTimeDeliveryRate: 95,
            },
          },
          {
            id: 2,
            name: "Trần Thị B",
            phoneNumber: "0923456789",
            email: "tranthib@example.com",
            role: "STAFF" as StaffRole,
            status: "ACTIVE",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
            createdAt: "2024-02-01T08:00:00Z",
            performance: {
              completedOrders: 120,
              avgProcessingTime: "3.0 giờ",
              rating: 4.5,
              onTimeDeliveryRate: 92,
            },
          },
          {
            id: 3,
            name: "Lê Văn C",
            phoneNumber: "0934567890",
            email: "levanc@example.com",
            role: "DRIVER" as StaffRole,
            status: "ACTIVE",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
            createdAt: "2024-02-15T08:00:00Z",
            performance: {
              completedOrders: 200,
              avgProcessingTime: "1.5 giờ",
              rating: 4.9,
              onTimeDeliveryRate: 98,
            },
          },
          {
            id: 4,
            name: "Phạm Thị D",
            phoneNumber: "0945678901",
            email: "phamthid@example.com",
            role: "STAFF" as StaffRole,
            status: "INACTIVE",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
            createdAt: "2024-03-01T08:00:00Z",
            performance: {
              completedOrders: 80,
              avgProcessingTime: "3.2 giờ",
              rating: 4.3,
              onTimeDeliveryRate: 88,
            },
          },
          {
            id: 5,
            name: "Hoàng Văn E",
            phoneNumber: "0956789012",
            email: "hoangvane@example.com",
            role: "STAFF" as StaffRole,
            status: "ACTIVE",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
            createdAt: "2024-03-15T08:00:00Z",
            performance: {
              completedOrders: 95,
              avgProcessingTime: "2.8 giờ",
              rating: 4.6,
              onTimeDeliveryRate: 90,
            },
          },
        ];

        setStaff(mockStaff);
        setFilteredStaff(mockStaff);
      } catch (err) {
        console.error("Lỗi khi tải danh sách nhân viên:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Filter logic
  React.useEffect(() => {
    let result = [...staff];

    // Search filter
    if (searchQuery) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.phoneNumber.includes(searchQuery) ||
          s.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Role filter
    if (filterRole !== "ALL") {
      result = result.filter((s) => s.role === filterRole);
    }

    // Status filter
    if (filterStatus !== "ALL") {
      result = result.filter((s) => s.status === filterStatus);
    }

    setFilteredStaff(result);
  }, [searchQuery, filterRole, filterStatus, staff]);

  const handleAddStaff = async () => {
    try {
      // TODO: Call API to add staff
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Thêm nhân viên thành công!");
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        phoneNumber: "",
        email: "",
        role: "STAFF" as StaffRole,
      });
    } catch (err) {
      alert("Có lỗi xảy ra khi thêm nhân viên");
    }
  };

  const handleToggleStatus = async (staffId: number) => {
    try {
      // TODO: Call API to toggle staff status
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStaff((prev) =>
        prev.map((s) =>
          s.id === staffId
            ? { ...s, status: s.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
            : s,
        ),
      );
    } catch (err) {
      alert("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const getRoleBadgeColor = (role: StaffRole) => {
    switch (role) {
      case "MANAGER":
        return "bg-[#326B9C] text-white";
      case "DRIVER":
        return "bg-[#7BAAD1] text-white";
      case "STAFF":
      default:
        return "bg-[#B0C8DA] text-[#326B9C]";
    }
  };

  const getRoleLabel = (role: StaffRole) => {
    switch (role) {
      case "MANAGER":
        return "Quản lý";
      case "DRIVER":
        return "Tài xế";
      case "STAFF":
      default:
        return "Nhân viên";
    }
  };

  const stats = React.useMemo(() => {
    const activeStaff = staff.filter((s) => s.status === "ACTIVE");
    const totalOrders = staff.reduce(
      (sum, s) => sum + s.performance.completedOrders,
      0,
    );
    const avgRating =
      staff.reduce((sum, s) => sum + s.performance.rating, 0) /
      (staff.length || 1);

    return {
      totalStaff: staff.length,
      activeStaff: activeStaff.length,
      totalOrders,
      avgRating: avgRating.toFixed(1),
    };
  }, [staff]);

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách nhân viên..." />;
  }

  return (
    <div className="min-h-screen bg-[#FAFCFF] p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#326B9C]">
              Quản lý nhân viên
            </h1>
            <p className="text-[#7BAAD1] mt-1">
              Quản lý đội ngũ nhân viên và theo dõi hiệu suất làm việc
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white font-semibold">
                + Thêm nhân viên
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-[#326B9C]">
                  Thêm nhân viên mới
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-[#7BAAD1] font-medium">
                    Họ và tên
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Nhập họ tên"
                    className="border-[#B0C8DA]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#7BAAD1] font-medium">
                    Số điện thoại
                  </Label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    placeholder="0912345678"
                    className="border-[#B0C8DA]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#7BAAD1] font-medium">
                    Email (không bắt buộc)
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                    className="border-[#B0C8DA]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#7BAAD1] font-medium">Chức vụ</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      setFormData({ ...formData, role: value as StaffRole })
                    }
                  >
                    <SelectTrigger className="border-[#B0C8DA] bg-white">
                      <SelectValue placeholder="Chọn chức vụ" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E8E9EB]">
                      <SelectItem
                        value="STAFF"
                        className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                      >
                        Nhân viên
                      </SelectItem>
                      <SelectItem
                        value="DRIVER"
                        className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                      >
                        Tài xế
                      </SelectItem>
                      <SelectItem
                        value="MANAGER"
                        className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                      >
                        Quản lý
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full bg-[#326B9C] hover:bg-[#7BAAD1] text-white"
                  onClick={handleAddStaff}
                >
                  Thêm nhân viên
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng nhân viên</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {stats.totalStaff}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Đang hoạt động</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {stats.activeStaff}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng đơn hàng</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {stats.totalOrders}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Đánh giá TB</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                ⭐ {stats.avgRating}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">Tìm kiếm</Label>
                <Input
                  placeholder="Tên, SĐT, Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-[#B0C8DA]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">Chức vụ</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="border-[#B0C8DA] bg-white">
                    <SelectValue placeholder="Chọn chức vụ" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E8E9EB]">
                    <SelectItem
                      value="ALL"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Tất cả
                    </SelectItem>
                    <SelectItem
                      value="MANAGER"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Quản lý
                    </SelectItem>
                    <SelectItem
                      value="DRIVER"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Tài xế
                    </SelectItem>
                    <SelectItem
                      value="STAFF"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Nhân viên
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">Trạng thái</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-[#B0C8DA] bg-white">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E8E9EB]">
                    <SelectItem
                      value="ALL"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Tất cả
                    </SelectItem>
                    <SelectItem
                      value="ACTIVE"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Đang hoạt động
                    </SelectItem>
                    <SelectItem
                      value="INACTIVE"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Ngừng hoạt động
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FAFCFF] border-b border-[#E8E9EB]">
                  <TableHead className="text-[#326B9C] font-semibold">
                    Nhân viên
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Liên hệ
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Chức vụ
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Đơn hoàn thành
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Thời gian TB
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Đánh giá
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-[#326B9C] font-semibold">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-[#7BAAD1]"
                    >
                      Không tìm thấy nhân viên nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => (
                    <TableRow
                      key={member.id}
                      className="border-b border-[#E8E9EB] hover:bg-[#FAFCFF]"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-[#B0C8DA] text-[#326B9C]">
                              {member.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-[#326B9C]">
                              {member.name}
                            </div>
                            <div className="text-xs text-[#7BAAD1]">
                              Tham gia:{" "}
                              {new Date(member.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <div className="text-[#326B9C]">
                            {member.phoneNumber}
                          </div>
                          <div className="text-xs text-[#7BAAD1]">
                            {member.email || "-"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {getRoleLabel(member.role)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <span className="font-semibold text-[#326B9C]">
                          {member.performance.completedOrders}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-[#7BAAD1]">
                          {member.performance.avgProcessingTime}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-[#326B9C]">
                            {member.performance.rating}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={
                            member.status === "ACTIVE"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }
                          variant="outline"
                        >
                          {member.status === "ACTIVE" ? "Hoạt động" : "Ngừng"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#B0C8DA] text-[#326B9C] hover:bg-[#FAFCFF]"
                            onClick={() =>
                              alert(`Xem chi tiết: ${member.name}`)
                            }
                          >
                            Chi tiết
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={
                              member.status === "ACTIVE"
                                ? "border-red-300 text-red-600 hover:bg-red-50"
                                : "border-green-300 text-green-600 hover:bg-green-50"
                            }
                            onClick={() => handleToggleStatus(member.id)}
                          >
                            {member.status === "ACTIVE" ? "Tắt" : "Bật"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
