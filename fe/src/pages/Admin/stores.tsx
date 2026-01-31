import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, MapPin, Phone, Clock, Loader2, Eye } from "lucide-react";
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
  Avatar,
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
  useGetAllStoresQuery,
  useGetStoreByIdQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useUpdateStoreStatusMutation,
  useDeleteStoreMutation,
} from "@/stores/apis/admin";
import { ActionMenu, DeleteConfirmDialog } from "@/components/admin";
import type { AdminStoreResponse } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

const storeFormSchema = z.object({
  name: z.string().min(1, "Tên cửa hàng là bắt buộc"),
  address: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

export default function StoresPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedStore, setSelectedStore] = React.useState<AdminStoreResponse | null>(null);
  
  const { toast } = useToast();

  const { data: storesData, isLoading, error } = useGetAllStoresQuery({ pageNumber: page, pageSize: size });
  const { data: storeDetail } = useGetStoreByIdQuery(selectedStore?.id || 0, {
    skip: !selectedStore || !isViewOpen,
  });
  
  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
  const [updateStoreStatus] = useUpdateStoreStatusMutation();
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();

  const stores = storesData?.data?.content || [];
  const totalPages = storesData?.data?.totalPages || 0;
  const totalElements = storesData?.data?.totalElements || 0;

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      description: "",
      openTime: "",
      closeTime: "",
    },
  });

  const resetForm = (store?: AdminStoreResponse) => {
    if (store) {
      form.reset({
        name: store.name,
        address: store.address || "",
        phone: store.phone || "",
        description: store.description || "",
        openTime: store.openTime || "",
        closeTime: store.closeTime || "",
        latitude: store.latitude,
        longitude: store.longitude,
      });
    } else {
      form.reset({
        name: "",
        address: "",
        phone: "",
        description: "",
        openTime: "",
        closeTime: "",
      });
    }
  };

  const handleCreate = async (values: StoreFormValues) => {
    try {
      await createStore(values).unwrap();
      toast({ title: "Thành công", description: "Đã tạo cửa hàng mới" });
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể tạo cửa hàng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (values: StoreFormValues) => {
    if (!selectedStore) return;
    try {
      await updateStore({ id: selectedStore.id, data: values }).unwrap();
      toast({ title: "Thành công", description: "Đã cập nhật cửa hàng" });
      setIsEditOpen(false);
      setSelectedStore(null);
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể cập nhật cửa hàng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedStore) return;
    try {
      await deleteStore(selectedStore.id).unwrap();
      toast({ title: "Thành công", description: "Đã xóa cửa hàng" });
      setIsDeleteOpen(false);
      setSelectedStore(null);
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể xóa cửa hàng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (store: AdminStoreResponse) => {
    try {
      await updateStoreStatus({ id: store.id, data: { enabled: !store.active } }).unwrap();
      toast({ 
        title: "Thành công", 
        description: `Đã ${store.active ? "vô hiệu hóa" : "kích hoạt"} cửa hàng` 
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

  const openEditDialog = (store: AdminStoreResponse) => {
    setSelectedStore(store);
    resetForm(store);
    setIsEditOpen(true);
  };

  const openViewDialog = (store: AdminStoreResponse) => {
    setSelectedStore(store);
    setIsViewOpen(true);
  };

  const openDeleteDialog = (store: AdminStoreResponse) => {
    setSelectedStore(store);
    setIsDeleteOpen(true);
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách cửa hàng..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải dữ liệu cửa hàng"
        error={error}
        onRetry={() => window.location.reload()}
        onClose={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">Tất cả cửa hàng</div>
            <div className="font-semibold">{totalElements}</div>
          </div>
        </div>

        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus size={16} />
          Thêm cửa hàng
        </Button>
      </div>

      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          {stores.length === 0 ? (
            <EmptyData
              title="Chưa có cửa hàng"
              message="Danh sách cửa hàng đang trống."
              action={{
                label: "Thêm cửa hàng mới",
                onClick: openCreateDialog,
              }}
            />
          ) : (
            <>
              <Table className="w-full p-0">
                <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
                  <TableRow>
                    <TableHead className="rounded-tl-md">Cửa hàng</TableHead>
                    <TableHead>Liên hệ</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead>Giờ mở cửa</TableHead>
                    <TableHead>Tủ khóa</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="rounded-tr-md">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store.id} className="h-10">
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 text-sm">
                            {store.name[0]}
                          </Avatar>
                          <div>
                            <div className="font-medium">{store.name}</div>
                            <div className="text-sm text-muted-foreground">ID: {store.id}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone size={14} className="text-gray-400" />
                          {store.phone || 'N/A'}
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="truncate max-w-[200px]" title={store.address}>
                            {store.address || 'N/A'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock size={14} className="text-gray-400" />
                          {store.openTime && store.closeTime 
                            ? `${store.openTime} - ${store.closeTime}`
                            : 'N/A'
                          }
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <Badge variant="outline">{store.lockerCount || 0}</Badge>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${store.active ? "bg-green-500" : "bg-red-500"}`} />
                          <span className="text-sm">{store.active ? "Hoạt động" : "Ngưng"}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <ActionMenu
                          onView={() => openViewDialog(store)}
                          onEdit={() => openEditDialog(store)}
                          onDelete={() => openDeleteDialog(store)}
                          onToggleStatus={() => handleToggleStatus(store)}
                          isActive={store.active}
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

      {/* Create/Edit Store Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setSelectedStore(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isCreateOpen ? "Thêm cửa hàng mới" : "Chỉnh sửa cửa hàng"}</DialogTitle>
            <DialogDescription>
              {isCreateOpen 
                ? "Nhập thông tin để tạo cửa hàng mới." 
                : "Cập nhật thông tin cửa hàng."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(isCreateOpen ? handleCreate : handleEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên cửa hàng *</FormLabel>
                    <FormControl>
                      <Input placeholder="Cửa hàng ABC" {...field} />
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="0901234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="openTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ mở cửa</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="closeTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giờ đóng cửa</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreateOpen(false);
                  setIsEditOpen(false);
                  setSelectedStore(null);
                }}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCreateOpen ? "Tạo cửa hàng" : "Cập nhật"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Store Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết cửa hàng</DialogTitle>
          </DialogHeader>
          {storeDetail?.data && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 text-xl">
                  {storeDetail.data.name[0]}
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{storeDetail.data.name}</h3>
                  <Badge variant={storeDetail.data.active ? "default" : "destructive"}>
                    {storeDetail.data.active ? "Hoạt động" : "Ngưng"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Địa chỉ</Label>
                  <p className="font-medium">{storeDetail.data.address || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Số điện thoại</Label>
                  <p className="font-medium">{storeDetail.data.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Giờ hoạt động</Label>
                  <p className="font-medium">
                    {storeDetail.data.openTime && storeDetail.data.closeTime
                      ? `${storeDetail.data.openTime} - ${storeDetail.data.closeTime}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Số tủ khóa</Label>
                  <p className="font-medium">{storeDetail.data.lockerCount || 0}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Mô tả</Label>
                <p className="font-medium">{storeDetail.data.description || 'Không có mô tả'}</p>
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
        itemName={selectedStore?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}
