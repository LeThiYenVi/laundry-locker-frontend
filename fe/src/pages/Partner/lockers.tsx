import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  PageLoading,
  ErrorState,
  EmptyData,
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
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Unlock, AlertTriangle, RefreshCw, Box as BoxIcon } from "lucide-react";
import type { PartnerLocker, LockerBox } from "@/types";
import { useGetPartnerLockersQuery } from "@/stores/apis/partnerApi";

// ============================================
// Error Handling
// ============================================

const ERROR_MESSAGES: Record<string, string> = {
  E_LOCKER001: "Không tìm thấy locker.",
  E_BOX003: "Tủ Locker hiện đang bận hoặc gặp sự cố kỹ thuật.",
  E_AUTH001: "Bạn không có quyền truy cập.",
};

const getErrorMessage = (err: unknown): string => {
  const apiError = err as {
    status?: number;
    data?: { code?: string; message?: string };
  };

  if (apiError?.status === 401 || apiError?.status === 403) {
    localStorage.removeItem("accessToken");
    window.location.href =
      "/login?redirect=" + encodeURIComponent(window.location.pathname);
    return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
  }

  const errorCode = apiError?.data?.code;
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }

  return apiError?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
};

// ============================================
// Box Status Helpers
// ============================================

const getBoxStatusBadge = (status: string): string => {
  switch (status) {
    case "AVAILABLE":
      return "bg-green-100 text-green-700 border-green-200";
    case "OCCUPIED":
      return "bg-red-100 text-red-700 border-red-200";
    case "RESERVED":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "MAINTENANCE":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "ERROR":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getBoxStatusLabel = (status: string): string => {
  switch (status) {
    case "AVAILABLE":
      return "Trống";
    case "OCCUPIED":
      return "Đang dùng";
    case "RESERVED":
      return "Đã đặt";
    case "MAINTENANCE":
      return "Bảo trì";
    case "ERROR":
      return "Lỗi";
    default:
      return status;
  }
};

const getSizeLabel = (size: string): string => {
  switch (size) {
    case "SMALL":
      return "Nhỏ";
    case "MEDIUM":
      return "Vừa";
    case "LARGE":
      return "Lớn";
    default:
      return size;
  }
};

// ============================================
// Main Component
// ============================================

export default function PartnerLockersPage(): React.JSX.Element {
  // RTK Query hook - fetch real data from API
  const {
    data: lockers = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPartnerLockersQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [selectedLocker, setSelectedLocker] =
    React.useState<PartnerLocker | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL");
  const [errorToast, setErrorToast] = React.useState<string | null>(null);

  // Emergency Unlock Modal
  const [emergencyModal, setEmergencyModal] = React.useState<{
    open: boolean;
    box: LockerBox | null;
  }>({ open: false, box: null });

  // Set default selected locker when data loads
  React.useEffect(() => {
    if (lockers.length > 0 && !selectedLocker) {
      setSelectedLocker(lockers[0]);
    }
  }, [lockers, selectedLocker]);

  // Auto-hide error toast
  React.useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    return {
      totalLockers: lockers.length,
      totalBoxes: lockers.reduce((sum, l) => sum + (l.totalBoxes || 0), 0),
      occupiedBoxes: lockers.reduce(
        (sum, l) => sum + (l.occupiedBoxes || 0),
        0,
      ),
      availableBoxes: lockers.reduce(
        (sum, l) => sum + (l.availableBoxes || 0),
        0,
      ),
      maintenanceBoxes: lockers.reduce((sum, l) => {
        const boxes = l.boxes || [];
        return sum + boxes.filter((b) => b.status === "MAINTENANCE").length;
      }, 0),
    };
  }, [lockers]);

  // Filter boxes by status
  const filteredBoxes = React.useMemo(() => {
    if (!selectedLocker?.boxes) return [];
    if (filterStatus === "ALL") return selectedLocker.boxes;
    return selectedLocker.boxes.filter((box) => box.status === filterStatus);
  }, [selectedLocker, filterStatus]);

  // Handle Emergency Unlock
  const handleEmergencyUnlock = () => {
    if (!emergencyModal.box) return;
    // TODO: Call API khi backend hỗ trợ endpoint mở tủ khẩn cấp
    alert(
      `⚠️ Yêu cầu mở khẩn cấp ô ${emergencyModal.box.boxNumber} đã được ghi nhận.\nVui lòng liên hệ Admin để được hỗ trợ.`,
    );
    setEmergencyModal({ open: false, box: null });
  };

  // Handle Report Issue
  const handleReportIssue = (box: LockerBox) => {
    // TODO: Call API báo cáo sự cố khi backend hỗ trợ
    alert(
      `📝 Đã ghi nhận báo cáo sự cố ô ${box.boxNumber}.\nĐội kỹ thuật sẽ kiểm tra trong thời gian sớm nhất.`,
    );
    setEmergencyModal({ open: false, box: null });
  };

  // Loading state
  if (isLoading) {
    return <PageLoading message="Đang tải thông tin locker..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải danh sách locker"
        error={error}
        onRetry={refetch}
      />
    );
  }

  // Empty state
  if (lockers.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFCFF] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#326B9C]">
              Quản lý Locker
            </h1>
            <p className="text-[#7BAAD1] mt-1">
              Theo dõi trạng thái và quản lý các tủ locker
            </p>
          </div>
          <EmptyData
            title="Chưa có locker nào"
            message="Cửa hàng của bạn chưa được gán locker. Vui lòng liên hệ Admin để được hỗ trợ."
            icon={<BoxIcon className="h-16 w-16 text-muted-foreground" />}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCFF] p-8">
      {/* Error Toast */}
      {errorToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>{errorToast}</span>
            <button
              onClick={() => setErrorToast(null)}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Polling Indicator */}
      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-sm flex items-center gap-2 shadow">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Đang cập nhật...
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#326B9C]">
              Quản lý Locker
            </h1>
            <p className="text-[#7BAAD1] mt-1">
              Theo dõi trạng thái và quản lý các tủ locker
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="border-[#B0C8DA]"
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${isFetching ? "animate-spin" : ""}`}
              />
              Làm mới
            </Button>
            <Button className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white font-semibold">
              <AlertTriangle size={16} className="mr-2" />
              Báo cáo sự cố
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng Locker</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {stats.totalLockers}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng ô</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {stats.totalBoxes}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Đang sử dụng</div>
              <div className="text-3xl font-bold text-red-600">
                {stats.occupiedBoxes}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Còn trống</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.availableBoxes}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Lỗi/Bảo trì</div>
              <div className="text-3xl font-bold text-orange-600">
                {stats.maintenanceBoxes}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Locker Selection & Filter */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Chọn Locker
                </Label>
                <Select
                  value={selectedLocker?.id?.toString()}
                  onValueChange={(value) => {
                    const locker = lockers.find(
                      (l) => l.id === parseInt(value),
                    );
                    setSelectedLocker(locker || null);
                  }}
                >
                  <SelectTrigger className="border-[#B0C8DA] bg-white">
                    <SelectValue placeholder="Chọn locker" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E8E9EB]">
                    {lockers.map((locker) => (
                      <SelectItem
                        key={locker.id}
                        value={locker.id.toString()}
                        className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                      >
                        {locker.name} - {locker.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[#7BAAD1] font-medium">
                  Lọc trạng thái
                </Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-[#B0C8DA] bg-white">
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
                      value="AVAILABLE"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Trống
                    </SelectItem>
                    <SelectItem
                      value="OCCUPIED"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Đang dùng
                    </SelectItem>
                    <SelectItem
                      value="RESERVED"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Đã đặt
                    </SelectItem>
                    <SelectItem
                      value="ERROR"
                      className="hover:bg-[#FAFCFF] focus:bg-[#FAFCFF]"
                    >
                      Lỗi
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Locker Info */}
        {selectedLocker && (
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#326B9C] mb-2">
                    {selectedLocker.name}
                  </h2>
                  <p className="text-[#7BAAD1]">{selectedLocker.location}</p>
                </div>
                <Badge
                  className={
                    selectedLocker.status === "ACTIVE"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : selectedLocker.status === "MAINTENANCE"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                  variant="outline"
                >
                  {selectedLocker.status === "ACTIVE"
                    ? "Đang hoạt động"
                    : selectedLocker.status === "MAINTENANCE"
                      ? "Đang bảo trì"
                      : selectedLocker.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-[#FAFCFF] rounded-lg border border-[#E8E9EB]">
                  <div className="text-sm text-[#7BAAD1] mb-1">Tổng ô</div>
                  <div className="text-2xl font-bold text-[#326B9C]">
                    {selectedLocker.totalBoxes}
                  </div>
                </div>
                <div className="text-center p-4 bg-[#FAFCFF] rounded-lg border border-[#E8E9EB]">
                  <div className="text-sm text-[#7BAAD1] mb-1">Đang dùng</div>
                  <div className="text-2xl font-bold text-red-600">
                    {selectedLocker.occupiedBoxes}
                  </div>
                </div>
                <div className="text-center p-4 bg-[#FAFCFF] rounded-lg border border-[#E8E9EB]">
                  <div className="text-sm text-[#7BAAD1] mb-1">Còn trống</div>
                  <div className="text-2xl font-bold text-green-600">
                    {selectedLocker.availableBoxes}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Boxes Grid */}
        {selectedLocker && (
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-[#326B9C] mb-6">
                Sơ đồ các ô ({filteredBoxes.length}/{selectedLocker.totalBoxes})
              </h3>

              {filteredBoxes.length === 0 ? (
                <div className="text-center py-8 text-[#7BAAD1]">
                  Không có ô nào ở trạng thái "
                  {filterStatus === "ALL"
                    ? "Tất cả"
                    : getBoxStatusLabel(filterStatus)}
                  "
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {filteredBoxes.map((box) => (
                    <div key={box.id} className="relative group">
                      <button
                        className={`
                          w-full aspect-square p-3 rounded-lg border-2 transition-all
                          ${
                            box.status === "AVAILABLE"
                              ? "border-green-300 bg-green-50 hover:bg-green-100"
                              : box.status === "OCCUPIED"
                                ? "border-red-300 bg-red-50 hover:bg-red-100"
                                : box.status === "RESERVED"
                                  ? "border-yellow-300 bg-yellow-50 hover:bg-yellow-100"
                                  : box.status === "MAINTENANCE"
                                    ? "border-orange-300 bg-orange-50 hover:bg-orange-100"
                                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                          }
                        `}
                        onClick={() => {
                          if (
                            box.status === "OCCUPIED" ||
                            box.status === "MAINTENANCE"
                          ) {
                            setEmergencyModal({ open: true, box });
                          } else {
                            alert(
                              `Ô: ${box.boxNumber}\nKích thước: ${getSizeLabel(box.size || "MEDIUM")}\nTrạng thái: ${getBoxStatusLabel(box.status)}`,
                            );
                          }
                        }}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="font-bold text-[#326B9C] text-sm">
                            {box.boxNumber}
                          </div>
                          <div className="text-xs text-[#7BAAD1] mt-1">
                            {getSizeLabel(box.size || "MEDIUM")[0]}
                          </div>
                        </div>
                        {box.status === "OCCUPIED" && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                        {box.status === "MAINTENANCE" && (
                          <div className="absolute top-1 right-1">
                            <AlertTriangle className="w-3 h-3 text-orange-500" />
                          </div>
                        )}
                      </button>

                      {/* Quick Actions on Hover */}
                      {(box.status === "OCCUPIED" ||
                        box.status === "MAINTENANCE") && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEmergencyModal({ open: true, box });
                            }}
                          >
                            <Unlock size={12} className="mr-1" />
                            Mở
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-[#E8E9EB]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded" />
                  <span className="text-sm text-[#7BAAD1]">Trống</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded" />
                  <span className="text-sm text-[#7BAAD1]">Đang dùng</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded" />
                  <span className="text-sm text-[#7BAAD1]">Đã đặt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded" />
                  <span className="text-sm text-[#7BAAD1]">Lỗi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-[#E8E9EB] text-[#326B9C] rounded">
                    N
                  </span>
                  <span className="text-sm text-[#7BAAD1]">Nhỏ</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-[#E8E9EB] text-[#326B9C] rounded">
                    V
                  </span>
                  <span className="text-sm text-[#7BAAD1]">Vừa</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-[#E8E9EB] text-[#326B9C] rounded">
                    L
                  </span>
                  <span className="text-sm text-[#7BAAD1]">Lớn</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Emergency Unlock Modal */}
      <Dialog
        open={emergencyModal.open}
        onOpenChange={(open) =>
          setEmergencyModal((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Mở tủ khẩn cấp
            </DialogTitle>
            <DialogDescription>
              Bạn đang yêu cầu mở khẩn cấp ô {emergencyModal.box?.boxNumber}.
              Hành động này sẽ được ghi log.
            </DialogDescription>
          </DialogHeader>

          {emergencyModal.box && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                <p>
                  <strong>Ô:</strong> {emergencyModal.box.boxNumber}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  <Badge
                    variant="outline"
                    className={getBoxStatusBadge(emergencyModal.box.status)}
                  >
                    {getBoxStatusLabel(emergencyModal.box.status)}
                  </Badge>
                </p>
                {emergencyModal.box.currentOrderId && (
                  <p>
                    <strong>Mã đơn:</strong> #
                    {emergencyModal.box.currentOrderId}
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                ⚠️ Chỉ sử dụng khi có sự cố khẩn cấp. Mọi hành động sẽ được ghi
                nhận và báo cáo cho Admin.
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEmergencyModal({ open: false, box: null })}
            >
              Hủy
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (emergencyModal.box) {
                  handleReportIssue(emergencyModal.box);
                }
              }}
            >
              <AlertTriangle size={16} className="mr-2" />
              Báo lỗi
            </Button>
            <Button
              onClick={handleEmergencyUnlock}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Unlock size={16} className="mr-2" />
              Mở khẩn cấp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
