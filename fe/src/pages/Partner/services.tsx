import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  PageLoading,
  ErrorState,
  EmptyData,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  AlertTriangle,
  RefreshCw,
  Wrench,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { PartnerService } from "@/types/partner.type";
import {
  useGetPartnerServicesQuery,
  useGetPartnerProfileQuery,
} from "@/stores/apis/partnerApi";

// ============================================
// Helpers
// ============================================

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case "LAUNDRY":
      return "Giặt ủi";
    case "STORAGE":
      return "Gửi đồ";
    default:
      return category;
  }
};

const getCategoryBadge = (category: string): string => {
  switch (category) {
    case "LAUNDRY":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "STORAGE":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// ============================================
// Main Component
// ============================================

export default function PartnerServicesPage(): React.JSX.Element {
  // RTK Query hooks
  const {
    data: services = [],
    isLoading,
    error,
    refetch,
  } = useGetPartnerServicesQuery();

  const { isLoading: isLoadingProfile, error: profileError } =
    useGetPartnerProfileQuery();

  const [filterCategory, setFilterCategory] = React.useState<string>("ALL");
  const [errorToast, setErrorToast] = React.useState<string | null>(null);

  // Edit Price Modal
  const [editModal, setEditModal] = React.useState<{
    open: boolean;
    service: PartnerService | null;
    newPrice: string;
  }>({ open: false, service: null, newPrice: "" });

  // Auto-hide error toast
  React.useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  // Filter services
  const filteredServices = React.useMemo(() => {
    if (filterCategory === "ALL") return services;
    return services.filter((service) => service.category === filterCategory);
  }, [services, filterCategory]);

  // Stats
  const stats = React.useMemo(() => {
    const activeServices = services.filter((s) => s.isActive).length;
    const inactiveServices = services.length - activeServices;
    const avgPrice =
      services.length > 0
        ? services.reduce((sum, s) => sum + s.price, 0) / services.length
        : 0;

    return {
      total: services.length,
      active: activeServices,
      inactive: inactiveServices,
      avgPrice,
    };
  }, [services]);

  // Toggle service active status (local only - needs backend)
  const handleToggleActive = (_serviceId: number) => {
    // Backend has no partner-specific toggle endpoint
    setErrorToast(
      "⚠️ Chức năng bật/tắt dịch vụ chỉ Admin mới có quyền thay đổi.",
    );
  };

  // Update price (local only - needs backend)
  const handleUpdatePrice = () => {
    if (!editModal.service || !editModal.newPrice) return;

    const newPrice = parseFloat(editModal.newPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      setErrorToast("Giá không hợp lệ");
      return;
    }

    // Backend has no partner-specific price update endpoint
    setEditModal({ open: false, service: null, newPrice: "" });
    setErrorToast("⚠️ Chức năng cập nhật giá chỉ Admin mới có quyền thay đổi.");
  };

  // Refetch all data
  const handleRefresh = () => {
    refetch();
  };

  // Loading state
  if (isLoading || isLoadingProfile) {
    return <PageLoading message="Đang tải danh sách dịch vụ..." />;
  }

  // Error state
  if (error || profileError) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải danh sách dịch vụ"
        error={error || profileError}
        onRetry={handleRefresh}
      />
    );
  }

  // Empty state
  if (services.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFCFF] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#326B9C]">
              Quản lý Dịch vụ
            </h1>
            <p className="text-[#7BAAD1] mt-1">
              Cài đặt và quản lý các dịch vụ giặt ủi
            </p>
          </div>
          <EmptyData
            title="Chưa có dịch vụ nào"
            message="Hệ thống chưa có dịch vụ giặt ủi. Vui lòng liên hệ Admin để được hỗ trợ."
            icon={<Wrench className="h-16 w-16 text-muted-foreground" />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCFF] p-8">
      {/* Error/Warning Toast */}
      {errorToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <span className="text-sm">{errorToast}</span>
            <button
              onClick={() => setErrorToast(null)}
              className="ml-2 text-yellow-500 hover:text-yellow-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#326B9C]">
              Quản lý Dịch vụ
            </h1>
            <p className="text-[#7BAAD1] mt-1">
              Cài đặt và quản lý các dịch vụ giặt ủi
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-[#B0C8DA]"
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p>
            ℹ️ <strong>Lưu ý:</strong> Danh sách dịch vụ được quản lý bởi Admin.
            Nếu cần thay đổi, vui lòng liên hệ quản trị viên hệ thống.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng dịch vụ</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Đang hoạt động</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.active}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tạm ngưng</div>
              <div className="text-3xl font-bold text-red-600">
                {stats.inactive}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Giá TB</div>
              <div className="text-2xl font-bold text-[#326B9C]">
                {formatCurrency(stats.avgPrice)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Label className="text-[#7BAAD1] font-medium whitespace-nowrap">
                Lọc theo loại:
              </Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="max-w-xs border-[#B0C8DA] bg-white">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E8E9EB]">
                  <SelectItem
                    value="ALL"
                    className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                  >
                    Tất cả
                  </SelectItem>
                  <SelectItem
                    value="LAUNDRY"
                    className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                  >
                    Giặt ủi
                  </SelectItem>
                  <SelectItem
                    value="STORAGE"
                    className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                  >
                    Gửi đồ
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="border-[#E8E9EB] hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#326B9C] mb-2">
                      {service.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={getCategoryBadge(service.category)}
                    >
                      {getCategoryLabel(service.category)}
                    </Badge>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      service.isActive
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }
                  >
                    {service.isActive ? "Hoạt động" : "Tạm ngưng"}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-[#7BAAD1] line-clamp-2">
                  {service.description || "Không có mô tả"}
                </p>

                {/* Pricing */}
                <div className="space-y-2 pt-2 border-t border-[#E8E9EB]">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#7BAAD1]">Giá:</span>
                    <span className="font-bold text-[#326B9C]">
                      {formatCurrency(service.price)}
                      {service.unit ? `/${service.unit}` : ""}
                    </span>
                  </div>
                  {service.maxPrice != null && service.maxPrice > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#7BAAD1]">
                        Giá tối đa:
                      </span>
                      <span className="font-bold text-[#326B9C]">
                        {formatCurrency(service.maxPrice)}
                      </span>
                    </div>
                  )}
                  {service.estimatedHours != null &&
                    service.estimatedHours > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#7BAAD1]">
                          Thời gian xử lý:
                        </span>
                        <span className="font-semibold text-[#326B9C]">
                          {service.estimatedHours}h
                        </span>
                      </div>
                    )}
                  {service.serviceType && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#7BAAD1]">Loại:</span>
                      <span className="text-sm text-[#326B9C]">
                        {service.serviceType}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-[#B0C8DA]"
                    onClick={() =>
                      setEditModal({
                        open: true,
                        service,
                        newPrice: service.price.toString(),
                      })
                    }
                  >
                    Sửa giá
                  </Button>
                  <Button
                    className={`flex-1 ${
                      service.isActive
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white`}
                    onClick={() => handleToggleActive(service.id)}
                  >
                    {service.isActive ? (
                      <>
                        <ToggleRight size={16} className="mr-1" />
                        Tắt
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={16} className="mr-1" />
                        Bật
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-12 text-center">
              <p className="text-[#7BAAD1]">
                Không tìm thấy dịch vụ nào ở loại "
                {filterCategory === "ALL"
                  ? "Tất cả"
                  : getCategoryLabel(filterCategory)}
                "
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Price Modal */}
      <Dialog
        open={editModal.open}
        onOpenChange={(open) => setEditModal((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật giá dịch vụ</DialogTitle>
          </DialogHeader>

          {editModal.service && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 text-sm">
                <p className="font-bold text-[#326B9C]">
                  {editModal.service.name}
                </p>
                <p className="text-[#7BAAD1] mt-1">
                  Giá hiện tại: {formatCurrency(editModal.service.price)}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Giá mới (VNĐ)
                </Label>
                <Input
                  type="number"
                  placeholder="Nhập giá mới"
                  value={editModal.newPrice}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      newPrice: e.target.value,
                    }))
                  }
                  className="border-[#B0C8DA]"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                ⚠️ Chức năng cập nhật giá chỉ Admin mới có quyền thay đổi. Vui
                lòng liên hệ quản trị viên.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() =>
                setEditModal({ open: false, service: null, newPrice: "" })
              }
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpdatePrice}
              className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
