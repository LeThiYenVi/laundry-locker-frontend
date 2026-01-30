import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  PageLoading,
  ErrorState,
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
import type { PartnerLocker, LockerBox } from "@/types";

export default function PartnerLockersPage(): React.JSX.Element {
  const [isLoading, setIsLoading] = React.useState(true);
  const [lockers, setLockers] = React.useState<PartnerLocker[]>([]);
  const [selectedLocker, setSelectedLocker] =
    React.useState<PartnerLocker | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL");

  React.useEffect(() => {
    const fetchLockers = async () => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockLockers: PartnerLocker[] = [
          {
            id: 1,
            name: "Locker A - Tòa nhà Viettel",
            location: "123 Nguyễn Huệ, Quận 1",
            totalBoxes: 24,
            availableBoxes: 8,
            occupiedBoxes: 14,
            status: "ACTIVE",
            boxes: Array.from({ length: 24 }, (_, i) => ({
              id: i + 1,
              boxNumber: `A${(i + 1).toString().padStart(2, "0")}`,
              size: ["SMALL", "MEDIUM", "LARGE"][i % 3] as
                | "SMALL"
                | "MEDIUM"
                | "LARGE",
              status: ["AVAILABLE", "OCCUPIED", "RESERVED"][
                Math.floor(Math.random() * 3)
              ] as "AVAILABLE" | "OCCUPIED" | "RESERVED",
              currentOrderId: i % 3 === 1 ? 1000 + i : undefined,
              pinCode: i % 3 === 1 ? "1234" : undefined,
            })),
          },
          {
            id: 2,
            name: "Locker B - Chung cư Sunrise",
            location: "456 Lê Lợi, Quận 3",
            totalBoxes: 18,
            availableBoxes: 12,
            occupiedBoxes: 5,
            status: "ACTIVE",
            boxes: Array.from({ length: 18 }, (_, i) => ({
              id: i + 25,
              boxNumber: `B${(i + 1).toString().padStart(2, "0")}`,
              size: ["SMALL", "MEDIUM", "LARGE"][i % 3] as
                | "SMALL"
                | "MEDIUM"
                | "LARGE",
              status: ["AVAILABLE", "OCCUPIED"][i % 4 === 0 ? 1 : 0] as
                | "AVAILABLE"
                | "OCCUPIED",
              currentOrderId: i % 4 === 0 ? 2000 + i : undefined,
            })),
          },
          {
            id: 3,
            name: "Locker C - Trung tâm thương mại",
            location: "789 Trần Hưng Đạo, Quận 5",
            totalBoxes: 30,
            availableBoxes: 5,
            occupiedBoxes: 23,
            status: "ACTIVE",
            boxes: Array.from({ length: 30 }, (_, i) => ({
              id: i + 43,
              boxNumber: `C${(i + 1).toString().padStart(2, "0")}`,
              size: ["SMALL", "MEDIUM", "LARGE"][i % 3] as
                | "SMALL"
                | "MEDIUM"
                | "LARGE",
              status:
                i < 5
                  ? "AVAILABLE"
                  : (["OCCUPIED", "RESERVED"][i % 2] as
                      | "OCCUPIED"
                      | "RESERVED"),
              currentOrderId: i >= 5 ? 3000 + i : undefined,
            })),
          },
        ];

        setLockers(mockLockers);
        setSelectedLocker(mockLockers[0]);
      } catch (err) {
        console.error("Lỗi khi tải danh sách locker:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLockers();
  }, []);

  const getBoxStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-700 border-green-200";
      case "OCCUPIED":
        return "bg-red-100 text-red-700 border-red-200";
      case "RESERVED":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "MAINTENANCE":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getBoxStatusLabel = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Trống";
      case "OCCUPIED":
        return "Đang dùng";
      case "RESERVED":
        return "Đã đặt";
      case "MAINTENANCE":
        return "Bảo trì";
      default:
        return status;
    }
  };

  const getSizeLabel = (size: string) => {
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

  const filteredBoxes = React.useMemo(() => {
    if (!selectedLocker) return [];
    if (filterStatus === "ALL") return selectedLocker.boxes;
    return selectedLocker.boxes.filter((box) => box.status === filterStatus);
  }, [selectedLocker, filterStatus]);

  if (isLoading) {
    return <PageLoading message="Đang tải thông tin locker..." />;
  }

  if (lockers.length === 0) {
    return (
      <ErrorState
        variant="server"
        title="Không có locker nào"
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCFF] p-8">
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

          <Button className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white font-semibold">
            Báo cáo tình trạng
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng Locker</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {lockers.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng ô</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {lockers.reduce((sum, l) => sum + l.totalBoxes, 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Đang sử dụng</div>
              <div className="text-3xl font-bold text-red-600">
                {lockers.reduce((sum, l) => sum + l.occupiedBoxes, 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Còn trống</div>
              <div className="text-3xl font-bold text-green-600">
                {lockers.reduce((sum, l) => sum + l.availableBoxes, 0)}
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
                  value={selectedLocker?.id.toString()}
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
                  className="bg-green-100 text-green-700 border-green-200"
                  variant="outline"
                >
                  Đang hoạt động
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

              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {filteredBoxes.map((box) => (
                  <button
                    key={box.id}
                    className={`
                      relative aspect-square p-3 rounded-lg border-2 transition-all
                      ${
                        box.status === "AVAILABLE"
                          ? "border-green-300 bg-green-50 hover:bg-green-100"
                          : box.status === "OCCUPIED"
                            ? "border-red-300 bg-red-50 hover:bg-red-100"
                            : box.status === "RESERVED"
                              ? "border-yellow-300 bg-yellow-50 hover:bg-yellow-100"
                              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                      }
                    `}
                    onClick={() =>
                      alert(
                        `Ô: ${box.boxNumber}\nKích thước: ${getSizeLabel(box.size)}\nTrạng thái: ${getBoxStatusLabel(box.status)}${box.currentOrderId ? `\nMã đơn: #${box.currentOrderId}` : ""}`,
                      )
                    }
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="font-bold text-[#326B9C] text-sm">
                        {box.boxNumber}
                      </div>
                      <div className="text-xs text-[#7BAAD1] mt-1">
                        {getSizeLabel(box.size)[0]}
                      </div>
                    </div>
                    {box.status === "OCCUPIED" && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[#E8E9EB]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                  <span className="text-sm text-[#7BAAD1]">Trống</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                  <span className="text-sm text-[#7BAAD1]">Đang dùng</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                  <span className="text-sm text-[#7BAAD1]">Đã đặt</span>
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
    </div>
  );
}
