import * as React from "react";
import { Card, CardContent, PageLoading, ErrorState, EmptyData, Badge, Button } from "~/components/ui";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui";
import { t } from "@/lib/i18n";
import { Clock, CheckCircle, Loader2, CheckSquare, Package, Truck, RotateCcw } from "lucide-react";
import StatusCard from "~/components/ui/status-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderStatisticsQuery,
  useUpdateOrderStatusMutation,
} from "@/stores/apis/admin";
import { ActionMenu } from "@/components/admin";
import type { OrderResponse, OrderStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

const orderStatuses: OrderStatus[] = [
  'INITIALIZED',
  'RESERVED',
  'WAITING',
  'COLLECTED',
  'PROCESSING',
  'READY',
  'RETURNED',
  'COMPLETED',
  'CANCELED',
];

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case 'COMPLETED':
      return 'default';
    case 'CANCELED':
      return 'destructive';
    case 'WAITING':
    case 'RESERVED':
      return 'secondary';
    case 'PROCESSING':
      return 'outline';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: OrderStatus) => {
  const labels: Record<OrderStatus, string> = {
    'INITIALIZED': 'Khởi tạo',
    'RESERVED': 'Đã đặt chỗ',
    'WAITING': 'Chờ xử lý',
    'COLLECTED': 'Đã lấy hàng',
    'PROCESSING': 'Đang xử lý',
    'READY': 'Sẵn sàng',
    'RETURNED': 'Đã trả hàng',
    'COMPLETED': 'Hoàn thành',
    'CANCELED': 'Đã hủy',
  };
  return labels[status] || status;
};

export default function OrdersPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isStatusOpen, setIsStatusOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<OrderResponse | null>(null);
  const [newStatus, setNewStatus] = React.useState<OrderStatus>('WAITING');
  
  const { toast } = useToast();

  const { data: ordersData, isLoading, error } = useGetAllOrdersQuery({ pageNumber: page, pageSize: size });
  const { data: statsData } = useGetOrderStatisticsQuery();
  const { data: orderDetail } = useGetOrderByIdQuery(selectedOrder?.id || 0, {
    skip: !selectedOrder || !isViewOpen,
  });
  
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const orders = ordersData?.data?.content || [];
  const totalPages = ordersData?.data?.totalPages || 0;
  const totalElements = ordersData?.data?.totalElements || 0;
  const stats = statsData?.data;

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrderStatus({ id: selectedOrder.id, status: newStatus }).unwrap();
      toast({ title: "Thành công", description: "Đã cập nhật trạng thái đơn hàng" });
      setIsStatusOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const openViewDialog = (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };

  const openStatusDialog = (order: OrderResponse) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusOpen(true);
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách đơn hàng..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải đơn hàng"
        error={error}
        onRetry={() => window.location.reload()}
        onClose={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t("admin.orders.title")}</h1>

      {/* Status cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <StatusCard
            title={t("admin.orders.status.waiting")}
            count={stats.pendingOrders}
            variant="blue"
          />

          <StatusCard
            title="Completed"
            count={stats.completedOrders}
            variant="green"
          />

          <StatusCard
            title="Cancelled"
            count={stats.canceledOrders}
            variant="indigo"
          />

          <StatusCard
            title="Total Revenue"
            count={`$${stats.totalRevenue.toLocaleString()}`}
            variant="violet"
          />
        </div>
      )}

      {/* Orders table */}
      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <EmptyData
              title="Chưa có đơn hàng"
              message="Danh sách đơn hàng đang trống."
            />
          ) : (
            <>
              <Table className="w-full p-0">
                <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
                  <TableRow>
                    <TableHead className="rounded-tl-md">{t("admin.orders.table.id")}</TableHead>
                    <TableHead>{t("admin.orders.table.customer")}</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>{t("admin.orders.table.status")}</TableHead>
                    <TableHead>{t("admin.orders.table.total")}</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="rounded-tr-md">{t('admin.orders.table.action')}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="h-10">
                      <TableCell className="py-2">#{order.id}</TableCell>
                      <TableCell className="py-2">{order.senderName}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline">{order.type}</Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">${order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell className="py-2">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="py-2">
                        <ActionMenu
                          onView={() => openViewDialog(order)}
                          customActions={[
                            {
                              label: "Cập nhật trạng thái",
                              icon: <RotateCcw size={14} />,
                              onClick: () => openStatusDialog(order),
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

      {/* View Order Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{orderDetail?.data?.id}</DialogTitle>
          </DialogHeader>
          {orderDetail?.data && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Mã đơn hàng</Label>
                  <p className="font-medium">#{orderDetail.data.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <Badge variant={getStatusBadgeVariant(orderDetail.data.status)}>
                    {getStatusLabel(orderDetail.data.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Loại dịch vụ</Label>
                  <p className="font-medium">{orderDetail.data.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mã PIN</Label>
                  <p className="font-medium font-mono">{orderDetail.data.pinCode}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Thông tin khách hàng</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Ngườii gửi</Label>
                    <p className="font-medium">{orderDetail.data.senderName}</p>
                    <p className="text-sm text-muted-foreground">{orderDetail.data.senderPhone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Ngườii nhận</Label>
                    <p className="font-medium">{orderDetail.data.receiverName}</p>
                  </div>
                </div>
              </div>

              {/* Locker Info */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Thông tin tủ khóa</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Tủ khóa</Label>
                    <p className="font-medium">{orderDetail.data.lockerName}</p>
                    <p className="text-sm text-muted-foreground">Code: {orderDetail.data.lockerCode}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Ngăn</Label>
                    <p className="font-medium">
                      Gửi: {orderDetail.data.sendBoxNumber} / Nhận: {orderDetail.data.receiveBoxNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Chi phí</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí dịch vụ:</span>
                    <span>${orderDetail.data.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí lưu kho:</span>
                    <span>${orderDetail.data.storagePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                    <span>${orderDetail.data.shippingFee.toFixed(2)}</span>
                  </div>
                  {orderDetail.data.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>-${orderDetail.data.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Tổng cộng:</span>
                    <span>${orderDetail.data.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              {orderDetail.data.orderDetails && orderDetail.data.orderDetails.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Chi tiết dịch vụ</h4>
                  <div className="space-y-2">
                    {orderDetail.data.orderDetails.map((detail) => (
                      <div key={detail.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{detail.serviceName}</p>
                          <p className="text-sm text-muted-foreground">
                            {detail.quantity} {detail.unit}
                          </p>
                        </div>
                        <span className="font-medium">${detail.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {(orderDetail.data.customerNote || orderDetail.data.staffNote) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Ghi chú</h4>
                  {orderDetail.data.customerNote && (
                    <div className="mb-2">
                      <Label className="text-muted-foreground">Khách hàng:</Label>
                      <p>{orderDetail.data.customerNote}</p>
                    </div>
                  )}
                  {orderDetail.data.staffNote && (
                    <div>
                      <Label className="text-muted-foreground">Nhân viên:</Label>
                      <p>{orderDetail.data.staffNote}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-4 flex gap-2">
                <Button 
                  onClick={() => openStatusDialog(orderDetail.data)}
                  className="flex-1"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Cập nhật trạng thái
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              Chọn trạng thái mới cho đơn hàng #{selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Trạng thái hiện tại</Label>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(selectedOrder?.status || 'WAITING')}>
                  {getStatusLabel(selectedOrder?.status || 'WAITING')}
                </Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="newStatus">Trạng thái mới</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleUpdateStatus} disabled={isUpdating || newStatus === selectedOrder?.status}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cập nhật
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
