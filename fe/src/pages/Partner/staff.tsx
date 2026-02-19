import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  Input,
  PageLoading,
  Badge,
  ErrorState,
} from "~/components/ui";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Phone,
  UserPlus,
  Trash2,
  AlertCircle,
  Search,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type { StaffContact, CreateStaffContactRequest } from "@/types";
import {
  useGetStaffContactsQuery,
  useAddStaffContactMutation,
  useDeleteStaffContactMutation,
} from "@/stores/apis/partnerApi";

// ============================================
// Toast Component
// ============================================

interface ToastProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

function Toast({ type, message, onClose }: ToastProps): React.JSX.Element {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          type === "success"
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        {type === "success" ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-red-600" />
        )}
        <span
          className={type === "success" ? "text-green-700" : "text-red-700"}
        >
          {message}
        </span>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export default function PartnerStaffPage(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{
    open: boolean;
    staff: StaffContact | null;
  }>({ open: false, staff: null });
  const [formData, setFormData] = React.useState<CreateStaffContactRequest>({
    name: "",
    phoneNumber: "",
    notes: "",
  });
  const [toast, setToast] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // RTK Query hooks
  const {
    data: staffList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStaffContactsQuery();
  const [addStaff, { isLoading: isAdding }] = useAddStaffContactMutation();
  const [deleteStaff, { isLoading: isDeleting }] =
    useDeleteStaffContactMutation();

  // Filter staff by search
  const filteredStaff = React.useMemo(() => {
    if (!searchQuery) return staffList;
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phoneNumber.includes(searchQuery),
    );
  }, [staffList, searchQuery]);

  // Handle add staff contact
  const handleAddStaff = async () => {
    if (!formData.name || !formData.phoneNumber) return;

    try {
      await addStaff(formData).unwrap();
      setIsAddDialogOpen(false);
      setFormData({ name: "", phoneNumber: "", notes: "" });
      setToast({ type: "success", message: "Đã thêm liên hệ thành công" });
    } catch (err) {
      console.error("Failed to add staff contact:", err);
      setToast({
        type: "error",
        message: "Không thể thêm liên hệ. Vui lòng thử lại.",
      });
    }
  };

  // Handle delete staff contact
  const handleDeleteStaff = async () => {
    if (!deleteConfirm.staff) return;

    try {
      await deleteStaff(deleteConfirm.staff.id).unwrap();
      setDeleteConfirm({ open: false, staff: null });
      setToast({ type: "success", message: "Đã xóa liên hệ thành công" });
    } catch (err) {
      console.error("Failed to delete staff contact:", err);
      setToast({
        type: "error",
        message: "Không thể xóa liên hệ. Vui lòng thử lại.",
      });
    }
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh bạ nhân viên..." />;
  }

  if (isError) {
    const errorMessage =
      error && "data" in error
        ? (error.data as { message?: string })?.message ||
          "Không thể tải danh bạ nhân viên"
        : "Lỗi kết nối đến máy chủ";

    return (
      <div className="min-h-screen bg-[#FAFCFF] p-8">
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="Không thể tải danh bạ"
            message={errorMessage}
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFCFF] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#326B9C]">
              Danh bạ nhân viên
            </h1>
            <p className="text-[#7BAAD1] mt-1">
              Lưu thông tin liên lạc của nhân viên để gửi mã truy cập
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="border-[#B0C8DA] text-[#326B9C]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm mới
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white font-semibold">
                  <UserPlus size={18} className="mr-2" />
                  Thêm liên hệ
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-[#326B9C]">
                    Thêm liên hệ nhân viên
                  </DialogTitle>
                  <DialogDescription>
                    Lưu thông tin để dễ dàng liên lạc khi cần gửi mã truy cập
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-[#7BAAD1] font-medium">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Nhập họ tên nhân viên"
                      className="border-[#B0C8DA]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#7BAAD1] font-medium">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="0912345678"
                      className="border-[#B0C8DA]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#7BAAD1] font-medium">
                      Ghi chú (không bắt buộc)
                    </Label>
                    <Input
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="VD: Nhân viên ca sáng, chuyên lấy đồ khu vực Q1..."
                      className="border-[#B0C8DA]"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    className="bg-[#326B9C] hover:bg-[#7BAAD1] text-white"
                    onClick={handleAddStaff}
                    disabled={
                      isAdding || !formData.name || !formData.phoneNumber
                    }
                  >
                    {isAdding ? "Đang lưu..." : "Thêm"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="text-blue-600 mt-0.5" size={20} />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Lưu ý về quản lý nhân viên</p>
              <p>
                Nhân viên <strong>không cần tài khoản</strong> trong hệ thống.
                Khi có đơn hàng cần xử lý, bạn chấp nhận đơn và nhận được{" "}
                <strong>mã truy cập 1 lần</strong> (VD: ABC12XYZ). Sau đó gửi mã
                này cho nhân viên qua điện thoại/Zalo để họ mở tủ lấy/trả đồ.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng liên hệ</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {staffList.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Gần đây</div>
              <div className="text-xl font-bold text-[#326B9C]">
                {staffList.length > 0
                  ? staffList[0]?.name
                  : "Chưa có liên hệ nào"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <Input
                placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-[#B0C8DA]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card className="border-[#E8E9EB]">
          <CardContent className="p-0">
            {filteredStaff.length === 0 ? (
              <div className="text-center py-12 text-[#7BAAD1]">
                <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Chưa có liên hệ nào</p>
                <p className="text-sm mt-1">
                  Thêm thông tin nhân viên để dễ dàng liên lạc
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#FAFCFF] border-b border-[#E8E9EB]">
                    <TableHead className="text-[#326B9C] font-semibold">
                      Nhân viên
                    </TableHead>
                    <TableHead className="text-[#326B9C] font-semibold">
                      Số điện thoại
                    </TableHead>
                    <TableHead className="text-[#326B9C] font-semibold">
                      Ghi chú
                    </TableHead>
                    <TableHead className="text-[#326B9C] font-semibold">
                      Ngày thêm
                    </TableHead>
                    <TableHead className="text-[#326B9C] font-semibold text-right">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow
                      key={staff.id}
                      className="border-b border-[#E8E9EB] hover:bg-[#FAFCFF]"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#B0C8DA] flex items-center justify-center text-[#326B9C] font-semibold">
                            {staff.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-[#326B9C]">
                            {staff.name}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <a
                          href={`tel:${staff.phoneNumber}`}
                          className="flex items-center gap-2 text-[#326B9C] hover:text-[#7BAAD1]"
                        >
                          <Phone size={14} />
                          {staff.phoneNumber}
                        </a>
                      </TableCell>

                      <TableCell>
                        <span className="text-[#7BAAD1] text-sm">
                          {staff.notes || "-"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-[#7BAAD1] text-sm">
                          {new Date(staff.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            setDeleteConfirm({ open: true, staff })
                          }
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirm.open}
          onOpenChange={(open) =>
            setDeleteConfirm((prev) => ({ ...prev, open }))
          }
        >
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-red-600">Xóa liên hệ</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn xóa liên hệ "{deleteConfirm.staff?.name}" khỏi
                danh bạ?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm({ open: false, staff: null })}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteStaff}
                disabled={isDeleting}
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
