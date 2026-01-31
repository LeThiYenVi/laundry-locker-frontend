import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2, Wrench, Package, Power } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
  PageLoading,
  ErrorState,
  EmptyData,
  Input,
} from "~/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { t } from "@/lib/i18n";
import {
  useGetAllLockersQuery,
  useGetLockerByIdQuery,
  useCreateLockerMutation,
  useUpdateLockerMutation,
  useSetLockerMaintenanceMutation,
  useDeleteLockerMutation,
} from "@/stores/apis/admin";
import { ActionMenu, DeleteConfirmDialog } from "@/components/admin";
import type { AdminLockerResponse, LockerStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const lockerFormSchema = z.object({
  code: z.string().min(1, "Mã tủ là bắt buộc"),
  name: z.string().min(1, "Tên tủ là bắt buộc"),
  address: z.string().optional(),
  storeId: z.number().min(1, "Cửa hàng là bắt buộc"),
});

type LockerFormValues = z.infer<typeof lockerFormSchema>;

const getStatusBadgeVariant = (status: LockerStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'default';
    case 'MAINTENANCE':
      return 'secondary';
    case 'DISCONNECTED':
      return 'outline';
    default:
      return 'destructive';
  }
};

const getStatusLabel = (status: LockerStatus) => {
  const labels: Record<LockerStatus, string> = {
    'ACTIVE': 'Hoạt động',
    'INACTIVE': 'Ngưng',
    'MAINTENANCE': 'Bảo trì',
    'DISCONNECTED': 'Mất kết nối',
  };
  return labels[status] || status;
};

export default function LockersPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedLocker, setSelectedLocker] = React.useState<AdminLockerResponse | null>(null);
  
  const { toast } = useToast();

  const { data: lockersData, isLoading, error } = useGetAllLockersQuery({ pageNumber: page, pageSize: size });
  const { data: lockerDetail } = useGetLockerByIdQuery(selectedLocker?.id || 0, {
    skip: !selectedLocker || !isViewOpen,
  });
  
  const [createLocker, { isLoading: isCreating }] = useCreateLockerMutation();
  const [updateLocker, { isLoading: isUpdating }] = useUpdateLockerMutation();
  const [setMaintenance, { isLoading: isSettingMaintenance }] = useSetLockerMaintenanceMutation();
  const [deleteLocker, { isLoading: isDeleting }] = useDeleteLockerMutation();

  const lockers = lockersData?.data?.content || [];
  const totalPages = lockersData?.data?.totalPages || 0;
  const totalElements = lockersData?.data?.totalElements || 0;

  const form = useForm<LockerFormValues>({
    resolver: zodResolver(lockerFormSchema),
    defaultValues: {
      code: "",
      name: "",
      address: "",
      storeId: 0,
    },
  });

  const resetForm = (locker?: AdminLockerResponse) => {
    if (locker) {
      form.reset({
        code: locker.code,
        name: locker.name,
        address: locker.address || "",
        storeId: locker.storeId,
      });
    } else {
      form.reset({
        code: "",
        name: "",
        address: "",
        storeId: 0,
      });
    }
  };

  const handleCreate = async (values: LockerFormValues) => {
    try {
      await createLocker(values).unwrap();
      toast({ title: "Thành công", description: "Đã tạo tủ khóa mới" });
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể tạo tủ khóa. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (values: LockerFormValues) => {
    if (!selectedLocker) return;
    try {
      await updateLocker({ id: selectedLocker.id, data: values }).unwrap();
      toast({ title: "Thành công", description: "Đã cập nhật tủ khóa" });
      setIsEditOpen(false);
      setSelectedLocker(null);
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể cập nhật tủ khóa. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedLocker) return;
    try {
      await deleteLocker(selectedLocker.id).unwrap();
      toast({ title: "Thành công", description: "Đã xóa tủ khóa" });
      setIsDeleteOpen(false);
      setSelectedLocker(null);
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể xóa tủ khóa. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleToggleMaintenance = async (locker: AdminLockerResponse) => {
    try {
      await setMaintenance({ id: locker.id, data: { maintenance: locker.status !== 'MAINTENANCE' } }).unwrap();
      toast({ 
        title: "Thành công", 
        description: `Đã ${locker.status === 'MAINTENANCE' ? "tắt" : "bật"} chế độ bảo trì` 
      });
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditDialog = (locker: AdminLockerResponse) => {
    setSelectedLocker(locker);
    resetForm(locker);
    setIsEditOpen(true);
  };

  const openViewDialog = (locker: AdminLockerResponse) => {
    setSelectedLocker(locker);
    setIsViewOpen(true);
  };

  const openDeleteDialog = (locker: AdminLockerResponse) => {
    setSelectedLocker(locker);
    setIsDeleteOpen(true);
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách tủ khóa..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải tủ khóa"
        error={error}
        onRetry={() => window.location.reload()}
        onClose={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("admin.lockers.title")}</h1>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus size={16} />
          Thêm tủ khóa
        </Button>
      </div>

      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          {lockers.length === 0 ? (
            <EmptyData
              title="Chưa có tủ khóa"
              message="Danh sách tủ khóa đang trống."
              action={{
                label: "Thêm tủ khóa mới",
                onClick: openCreateDialog,
              }}
            />
          ) : (
            <>
              <Table className="w-full p-0">
                <TableHeader className="bg-blue-950 text-amber-100">
                  <TableRow>
                    <TableHead className="rounded-tl-md">{t("admin.lockers.table.id")}</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>{t("admin.lockers.table.location")}</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>{t("admin.lockers.table.status")}</TableHead>
                    <TableHead>Boxes</TableHead>
                    <TableHead className="rounded-tr-md">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lockers.map((locker) => (
                    <TableRow key={locker.id} className="h-10">
                      <TableCell className="py-2">{locker.id}</TableCell>
                      <TableCell className="py-2 font-mono">{locker.code}</TableCell>
                      <TableCell className="py-2 font-medium">{locker.name}</TableCell>
                      <TableCell className="py-2">{locker.address || 'N/A'}</TableCell>
                      <TableCell className="py-2">{locker.storeName}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant={getStatusBadgeVariant(locker.status)}>
                          {getStatusLabel(locker.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-sm">
                          {locker.availableBoxes}/{locker.totalBoxes} available
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <ActionMenu
                          onView={() => openViewDialog(locker)}
                          onEdit={() => openEditDialog(locker)}
                          onDelete={() => openDeleteDialog(locker)}
                          customActions={[
                            {
                              label: locker.status === 'MAINTENANCE' ? "Tắt bảo trì" : "Bảo trì",
                              icon: <Wrench size={14} />,
                              onClick: () => handleToggleMaintenance(locker),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Footer / Pagination */}
              <div className="flex items-center justify-between border-t border-black-200 pt-4 pl-2 pr-2 pb-2">
                <div className="flex items-center gap-4">
                  <select 
                    className="border rounded px-2 py-1"
                    value={size}
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      setPage(0);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <div className="text-sm text-muted-foreground">
                    {totalElements === 0 ? '0-0 of 0' : `${page * size + 1}-${Math.min((page + 1) * size, totalElements)} of ${totalElements}`}
                  </div>
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationPrevious 
                      onClick={() => setPage(Math.max(0, page - 1))}
                      className={page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = i;
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink 
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(pageNum);
                            }}
                            isActive={page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum + 1}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink 
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(totalPages - 1);
                            }}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    <PaginationNext 
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      className={page >= totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Locker Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setSelectedLocker(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isCreateOpen ? "Thêm tủ khóa mới" : "Chỉnh sửa tủ khóa"}</DialogTitle>
            <DialogDescription>
              {isCreateOpen 
                ? "Nhập thông tin để tạo tủ khóa mới." 
                : "Cập nhật thông tin tủ khóa."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(isCreateOpen ? handleCreate : handleEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã tủ *</FormLabel>
                    <FormControl>
                      <Input placeholder="LOCKER001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên tủ *</FormLabel>
                    <FormControl>
                      <Input placeholder="Tủ khóa Quận 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Đường ABC, Quận 1, TP.HCM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cửa hàng ID *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                  setSelectedLocker(null);
                }}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCreateOpen ? "Tạo tủ khóa" : "Cập nhật"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Locker Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết tủ khóa #{lockerDetail?.data?.code}</DialogTitle>
          </DialogHeader>
          {lockerDetail?.data && (
            <div className="space-y-6">
              {/* Locker Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Mã tủ</Label>
                  <p className="font-medium font-mono">{lockerDetail.data.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tên tủ</Label>
                  <p className="font-medium">{lockerDetail.data.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <Badge variant={getStatusBadgeVariant(lockerDetail.data.status)}>
                    {getStatusLabel(lockerDetail.data.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cửa hàng</Label>
                  <p className="font-medium">{lockerDetail.data.storeName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Địa chỉ</Label>
                  <p className="font-medium">{lockerDetail.data.address || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngăn trống</Label>
                  <p className="font-medium">{lockerDetail.data.availableBoxes}/{lockerDetail.data.totalBoxes}</p>
                </div>
              </div>

              {/* Boxes List */}
              {lockerDetail.data.boxes && lockerDetail.data.boxes.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Danh sách ngăn</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {lockerDetail.data.boxes.map((box) => (
                      <div 
                        key={box.id} 
                        className={`p-2 rounded text-center text-sm ${
                          box.status === 'AVAILABLE' 
                            ? 'bg-green-100 text-green-800' 
                            : box.status === 'OCCUPIED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <Package className="mx-auto h-4 w-4 mb-1" />
                        #{box.boxNumber}
                        <span className="block text-xs">{box.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-4 flex gap-2">
                <Button 
                  onClick={() => handleToggleMaintenance(lockerDetail.data)}
                  disabled={isSettingMaintenance}
                  variant={lockerDetail.data.status === 'MAINTENANCE' ? "default" : "outline"}
                  className="flex-1"
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  {lockerDetail.data.status === 'MAINTENANCE' ? "Tắt bảo trì" : "Bảo trì"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={selectedLocker?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}
