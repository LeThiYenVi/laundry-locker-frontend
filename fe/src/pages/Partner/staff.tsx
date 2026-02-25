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
  Mail,
} from "lucide-react";
import type { StaffContact, CreateStaffContactRequest } from "@/types/partner.type";
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
  const [staffIdInput, setStaffIdInput] = React.useState("");
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
    const q = searchQuery.toLowerCase();
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phoneNumber?.includes(searchQuery) ||
        s.email?.toLowerCase().includes(q),
    );
  }, [staffList, searchQuery]);

  // Handle add staff by user ID
  const handleAddStaff = async () => {
    const staffId = parseInt(staffIdInput, 10);
    if (isNaN(staffId) || staffId <= 0) {
      setToast({ type: "error", message: "Vui lòng nhập ID nhân viên hợp lệ" });
      return;
    }

    try {
      await addStaff({ staffId }).unwrap();
      setIsAddDialogOpen(false);
      setStaffIdInput("");
      setToast({ type: "success", message: "Đã thêm nhân viên thành công" });
    } catch (err: unknown) {
      console.error("Failed to add staff:", err);
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message ||
            "Không thể thêm nhân viên. Kiểm tra lại ID."
          : "Không thể thêm nhân viên. Vui lòng thử lại.";
      setToast({ type: "error", message });
    }
  };

  // Handle delete staff
  const handleDeleteStaff = async () => {
    if (!deleteConfirm.staff) return;

    try {
      await deleteStaff(deleteConfirm.staff.id).unwrap();
      setDeleteConfirm({ open: false, staff: null });
      setToast({ type: "success", message: "Đã xóa nhân viên thành công" });
    } catch (err) {
      console.error("Failed to delete staff:", err);
      setToast({
        type: "error",
        message: "Không thể xóa nhân viên. Vui lòng thử lại.",
      });
    }
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách nhân viên..." />;
  }

  if (isError) {
    const errorMessage =
      error && "data" in error
        ? (error.data as { message?: string })?.message ||
          "Không thể tải danh sách nhân viên"
        : "Lỗi kết nối đến máy chủ";

    return (
      <div className="min-h-screen bg-[#FAFCFF] p-8">
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="Không thể tải danh sách"
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
              Quản lý nhân viên
            </h1>
            <p className="text-[#7BAAD1] mt-1">
              Thêm nhân viên vào cửa hàng để cùng quản lý đơn hàng
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
                    Thêm nhân viên
                  </DialogTitle>
                  <DialogDescription>
                    Nhập ID người dùng đã đăng ký trong hệ thống để thêm làm
                    nhân viên của cửa hàng
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-[#7BAAD1] font-medium">
                      ID nhân viên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={staffIdInput}
                      onChange={(e) => setStaffIdInput(e.target.value)}
                      placeholder="Nhập ID người dùng (VD: 5)"
                      className="border-[#B0C8DA]"
                    />
                    <p className="text-xs text-gray-500">
                      Người dùng cần đã đăng ký tài khoản trong hệ thống
                    </p>
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
                    disabled={isAdding || !staffIdInput}
                  >
                    {isAdding ? "Đang thêm..." : "Thêm nhân viên"}
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
              <p className="font-semibold mb-1">Cách thêm nhân viên</p>
              <p>
                Nhân viên cần <strong>đăng ký tài khoản</strong> trong hệ thống
                trước. Sau đó bạn thêm họ bằng <strong>ID người dùng</strong>.
                Khi có đơn hàng, nhân viên sẽ nhận{" "}
                <strong>mã truy cập 1 lần</strong> để mở tủ lấy/trả đồ.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Tổng nhân viên</div>
              <div className="text-3xl font-bold text-[#326B9C]">
                {staffList.length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E8E9EB]">
            <CardContent className="p-6">
              <div className="text-sm text-[#7BAAD1] mb-2">Mới nhất</div>
              <div className="text-xl font-bold text-[#326B9C]">
                {staffList.length > 0
                  ? staffList[staffList.length - 1]?.name
                  : "Chưa có nhân viên nào"}
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
                placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
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
                <p className="text-lg font-medium">Chưa có nhân viên nào</p>
                <p className="text-sm mt-1">
                  Thêm nhân viên để cùng quản lý đơn hàng
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
                      Email
                    </TableHead>
                    <TableHead className="text-[#326B9C] font-semibold">
                      Số điện thoại
                    </TableHead>
                    <TableHead className="text-[#326B9C] font-semibold">
                      Vai trò
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
                          {staff.imageUrl ? (
                            <img
                              src={staff.imageUrl}
                              alt={staff.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#B0C8DA] flex items-center justify-center text-[#326B9C] font-semibold">
                              {staff.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-[#326B9C]">
                              {staff.name}
                            </span>
                            <span className="block text-xs text-gray-400">
                              ID: {staff.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {staff.email ? (
                          <a
                            href={`mailto:${staff.email}`}
                            className="flex items-center gap-2 text-[#326B9C] hover:text-[#7BAAD1]"
                          >
                            <Mail size={14} />
                            {staff.email}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {staff.phoneNumber ? (
                          <a
                            href={`tel:${staff.phoneNumber}`}
                            className="flex items-center gap-2 text-[#326B9C] hover:text-[#7BAAD1]"
                          >
                            <Phone size={14} />
                            {staff.phoneNumber}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {staff.roles && staff.roles.length > 0 ? (
                            staff.roles.map((role) => (
                              <Badge
                                key={role}
                                variant="secondary"
                                className="text-xs bg-blue-50 text-blue-700"
                              >
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </div>
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
              <DialogTitle className="text-red-600">Xóa nhân viên</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn xóa nhân viên "{deleteConfirm.staff?.name}" khỏi
                cửa hàng?
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
