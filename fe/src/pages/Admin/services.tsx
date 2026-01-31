import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, DollarSign, Clock, Store, Loader2 } from "lucide-react";
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
  Textarea,
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
  useGetAllServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useUpdateServiceStatusMutation,
  useDeleteServiceMutation,
} from "@/stores/apis/admin";
import { ActionMenu, DeleteConfirmDialog } from "@/components/admin";
import type { AdminServiceResponse } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

const serviceFormSchema = z.object({
  name: z.string().min(1, "Tên dịch vụ là bắt buộc"),
  description: z.string().optional(),
  price: z.number().min(0, "Giá phải lớn hơn 0"),
  unit: z.string().optional(),
  estimatedMinutes: z.number().optional(),
  storeId: z.number().optional(),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function ServicesPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<AdminServiceResponse | null>(null);
  
  const { toast } = useToast();

  const { data: servicesData, isLoading, error } = useGetAllServicesQuery({ pageNumber: page, pageSize: size });
  const { data: serviceDetail } = useGetServiceByIdQuery(selectedService?.id || 0, {
    skip: !selectedService || !isViewOpen,
  });
  
  const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [updateServiceStatus] = useUpdateServiceStatusMutation();
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const services = servicesData?.data?.content || [];
  const totalPages = servicesData?.data?.totalPages || 0;
  const totalElements = servicesData?.data?.totalElements || 0;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      unit: "",
      estimatedMinutes: 0,
    },
  });

  const resetForm = (service?: AdminServiceResponse) => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description || "",
        price: service.price,
        unit: service.unit || "",
        estimatedMinutes: service.estimatedMinutes || 0,
        storeId: service.storeId,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        unit: "",
        estimatedMinutes: 0,
      });
    }
  };

  const handleCreate = async (values: ServiceFormValues) => {
    try {
      await createService(values).unwrap();
      toast({ title: "Thành công", description: "Đã tạo dịch vụ mới" });
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể tạo dịch vụ. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (values: ServiceFormValues) => {
    if (!selectedService) return;
    try {
      await updateService({ id: selectedService.id, data: values }).unwrap();
      toast({ title: "Thành công", description: "Đã cập nhật dịch vụ" });
      setIsEditOpen(false);
      setSelectedService(null);
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể cập nhật dịch vụ. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    try {
      await deleteService(selectedService.id).unwrap();
      toast({ title: "Thành công", description: "Đã xóa dịch vụ" });
      setIsDeleteOpen(false);
      setSelectedService(null);
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể xóa dịch vụ. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (service: AdminServiceResponse) => {
    try {
      await updateServiceStatus({ id: service.id, data: { enabled: !service.active } }).unwrap();
      toast({ 
        title: "Thành công", 
        description: `Đã ${service.active ? "vô hiệu hóa" : "kích hoạt"} dịch vụ` 
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

  const openEditDialog = (service: AdminServiceResponse) => {
    setSelectedService(service);
    resetForm(service);
    setIsEditOpen(true);
  };

  const openViewDialog = (service: AdminServiceResponse) => {
    setSelectedService(service);
    setIsViewOpen(true);
  };

  const openDeleteDialog = (service: AdminServiceResponse) => {
    setSelectedService(service);
    setIsDeleteOpen(true);
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách dịch vụ..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải dữ liệu dịch vụ"
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
            <div className="text-sm text-muted-foreground">Tất cả dịch vụ</div>
            <div className="font-semibold">{totalElements}</div>
          </div>
        </div>

        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus size={16} />
          Thêm dịch vụ
        </Button>
      </div>

      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          {services.length === 0 ? (
            <EmptyData
              title="Chưa có dịch vụ"
              message="Danh sách dịch vụ đang trống."
              action={{
                label: "Thêm dịch vụ mới",
                onClick: openCreateDialog,
              }}
            />
          ) : (
            <>
              <Table className="w-full p-0">
                <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
                  <TableRow>
                    <TableHead className="rounded-tl-md">Dịch vụ</TableHead>
                    <TableHead>Giá</TableHead>
                    <TableHead>Đơn vị</TableHead>
                    <TableHead>Thờii gian</TableHead>
                    <TableHead>Cửa hàng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="rounded-tr-md">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id} className="h-10">
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 text-sm">
                            {service.name[0]}
                          </Avatar>
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {service.description || 'Không có mô tả'}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <DollarSign size={14} className="text-green-500" />
                          {service.price.toLocaleString()} VNĐ
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <Badge variant="outline">{service.unit}</Badge>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock size={14} className="text-gray-400" />
                          {service.estimatedMinutes ? `${Math.round(service.estimatedMinutes / 60)}h` : 'N/A'}
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Store size={14} className="text-gray-400" />
                          {service.storeName || 'Tất cả cửa hàng'}
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${service.active ? "bg-green-500" : "bg-red-500"}`} />
                          <span className="text-sm">{service.active ? "Hoạt động" : "Ngưng"}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <ActionMenu
                          onView={() => openViewDialog(service)}
                          onEdit={() => openEditDialog(service)}
                          onDelete={() => openDeleteDialog(service)}
                          onToggleStatus={() => handleToggleStatus(service)}
                          isActive={service.active}
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

      {/* Create/Edit Service Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setSelectedService(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isCreateOpen ? "Thêm dịch vụ mới" : "Chỉnh sửa dịch vụ"}</DialogTitle>
            <DialogDescription>
              {isCreateOpen 
                ? "Nhập thông tin để tạo dịch vụ mới." 
                : "Cập nhật thông tin dịch vụ."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(isCreateOpen ? handleCreate : handleEdit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên dịch vụ *</FormLabel>
                    <FormControl>
                      <Input placeholder="Giặt ủi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Mô tả dịch vụ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="50000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị</FormLabel>
                      <FormControl>
                        <Input placeholder="kg, item, ..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="estimatedMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thờii gian ước tính (phút)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="60"
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
                  setSelectedService(null);
                }}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCreateOpen ? "Tạo dịch vụ" : "Cập nhật"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Service Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết dịch vụ</DialogTitle>
          </DialogHeader>
          {serviceDetail?.data && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 text-xl">
                  {serviceDetail.data.name[0]}
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{serviceDetail.data.name}</h3>
                  <Badge variant={serviceDetail.data.active ? "default" : "destructive"}>
                    {serviceDetail.data.active ? "Hoạt động" : "Ngưng"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Giá</Label>
                  <p className="font-medium text-green-600">{serviceDetail.data.price.toLocaleString()} VNĐ</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Đơn vị</Label>
                  <p className="font-medium">{serviceDetail.data.unit || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Thờii gian</Label>
                  <p className="font-medium">
                    {serviceDetail.data.estimatedMinutes 
                      ? `${Math.round(serviceDetail.data.estimatedMinutes / 60)} giờ` 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cửa hàng</Label>
                  <p className="font-medium">{serviceDetail.data.storeName || 'Tất cả cửa hàng'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Mô tả</Label>
                <p className="font-medium">{serviceDetail.data.description || 'Không có mô tả'}</p>
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
        itemName={selectedService?.name}
        isLoading={isDeleting}
      />
    </div>
  );
}
