import * as React from "react";
import { DollarSign, CreditCard, User, Loader2, RotateCcw } from "lucide-react";
import {
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
  Button,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ActionMenu } from "@/components/admin";
import {
  useGetAllPaymentsQuery,
  useGetPaymentByIdQuery,
  useUpdatePaymentStatusMutation,
} from "@/stores/apis/admin";
import type { PaymentResponse, PaymentStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

const paymentStatuses: PaymentStatus[] = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
  'CANCELED',
];

const getStatusBadgeVariant = (status: PaymentStatus) => {
  switch (status) {
    case 'COMPLETED':
      return 'default';
    case 'PENDING':
      return 'secondary';
    case 'PROCESSING':
      return 'outline';
    case 'FAILED':
    case 'CANCELED':
      return 'destructive';
    case 'REFUNDED':
      return 'outline';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: PaymentStatus) => {
  const labels: Record<PaymentStatus, string> = {
    'PENDING': 'Chờ xử lý',
    'PROCESSING': 'Đang xử lý',
    'COMPLETED': 'Hoàn thành',
    'FAILED': 'Thất bại',
    'REFUNDED': 'Đã hoàn tiền',
    'CANCELED': 'Đã hủy',
  };
  return labels[status] || status;
};

export default function PaymentsPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isStatusOpen, setIsStatusOpen] = React.useState(false);
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentResponse | null>(null);
  const [newStatus, setNewStatus] = React.useState<PaymentStatus>('PENDING');
  
  const { toast } = useToast();

  const { data: paymentsData, isLoading, error } = useGetAllPaymentsQuery({ pageNumber: page, pageSize: size });
  const { data: paymentDetail } = useGetPaymentByIdQuery(selectedPayment?.id || 0, {
    skip: !selectedPayment || !isViewOpen,
  });
  
  const [updatePaymentStatus, { isLoading: isUpdating }] = useUpdatePaymentStatusMutation();

  const payments = paymentsData?.data?.content || [];
  const totalPages = paymentsData?.data?.totalPages || 0;
  const totalElements = paymentsData?.data?.totalElements || 0;

  const handleUpdateStatus = async () => {
    if (!selectedPayment) return;
    try {
      await updatePaymentStatus({ paymentId: selectedPayment.id, status: newStatus }).unwrap();
      toast({ title: "Thành công", description: "Đã cập nhật trạng thái thanh toán" });
      setIsStatusOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const openViewDialog = (payment: PaymentResponse) => {
    setSelectedPayment(payment);
    setIsViewOpen(true);
  };

  const openStatusDialog = (payment: PaymentResponse) => {
    setSelectedPayment(payment);
    setNewStatus(payment.status);
    setIsStatusOpen(true);
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách thanh toán..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải dữ liệu thanh toán"
        error={error}
        onRetry={() => window.location.reload()}
        onClose={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý thanh toán</h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">Tất cả giao dịch</div>
            <div className="font-semibold">{totalElements.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <EmptyData
              title="Chưa có giao dịch"
              message="Danh sách thanh toán đang trống."
            />
          ) : (
            <>
              <Table className="w-full p-0">
                <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
                  <TableRow>
                    <TableHead className="rounded-tl-md">Mã giao dịch</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Phương thức</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="rounded-tr-md">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="h-10">
                      <TableCell className="py-2">
                        <div className="font-mono text-sm">#{payment.id}</div>
                        <div className="text-xs text-muted-foreground">Order #{payment.orderId}</div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <div>
                            <div className="font-medium text-sm">{payment.customerName}</div>
                            <div className="text-xs text-muted-foreground">ID: {payment.customerId}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-1">
                          <CreditCard size={14} className="text-gray-400" />
                          <Badge variant="outline">{payment.method}</Badge>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <DollarSign size={14} className="text-green-500" />
                          {payment.amount.toLocaleString()} VNĐ
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          {getStatusLabel(payment.status)}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-2">
                        <span className="text-sm">{new Date(payment.createdAt).toLocaleString()}</span>
                      </TableCell>

                      <TableCell className="py-2">
                        <ActionMenu
                          onView={() => openViewDialog(payment)}
                          customActions={[
                            {
                              label: "Cập nhật trạng thái",
                              icon: <RotateCcw size={14} />,
                              onClick: () => openStatusDialog(payment),
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

      {/* View Payment Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết giao dịch #{paymentDetail?.data?.id}</DialogTitle>
          </DialogHeader>
          {paymentDetail?.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Mã giao dịch</Label>
                  <p className="font-medium font-mono">#{paymentDetail.data.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mã đơn hàng</Label>
                  <p className="font-medium">#{paymentDetail.data.orderId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <Badge variant={getStatusBadgeVariant(paymentDetail.data.status)}>
                    {getStatusLabel(paymentDetail.data.status)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phương thức</Label>
                  <p className="font-medium">{paymentDetail.data.method}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Số tiền</Label>
                  <p className="font-medium text-green-600 text-lg">
                    {paymentDetail.data.amount.toLocaleString()} VNĐ
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày tạo</Label>
                  <p className="font-medium">{new Date(paymentDetail.data.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Thông tin khách hàng</h4>
                <div>
                  <Label className="text-muted-foreground">Tên khách hàng</Label>
                  <p className="font-medium">{paymentDetail.data.customerName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ID khách hàng</Label>
                  <p className="font-medium">{paymentDetail.data.customerId}</p>
                </div>
              </div>

              {paymentDetail.data.referenceId && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Thông tin tham chiếu</h4>
                  <div>
                    <Label className="text-muted-foreground">Reference ID</Label>
                    <p className="font-medium font-mono">{paymentDetail.data.referenceId}</p>
                  </div>
                  {paymentDetail.data.referenceTransactionId && (
                    <div>
                      <Label className="text-muted-foreground">Transaction ID</Label>
                      <p className="font-medium font-mono">{paymentDetail.data.referenceTransactionId}</p>
                    </div>
                  )}
                </div>
              )}

              {paymentDetail.data.description && (
                <div className="border-t pt-4">
                  <Label className="text-muted-foreground">Nội dung</Label>
                  <p className="font-medium">{paymentDetail.data.description}</p>
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-4 flex gap-2">
                <Button 
                  onClick={() => openStatusDialog(paymentDetail.data)}
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
            <DialogTitle>Cập nhật trạng thái thanh toán</DialogTitle>
            <DialogDescription>
              Chọn trạng thái mới cho giao dịch #{selectedPayment?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Trạng thái hiện tại</Label>
              <div className="mt-1">
                <Badge variant={getStatusBadgeVariant(selectedPayment?.status || 'PENDING')}>
                  {getStatusLabel(selectedPayment?.status || 'PENDING')}
                </Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="newStatus">Trạng thái mới</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as PaymentStatus)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
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
              <Button onClick={handleUpdateStatus} disabled={isUpdating || newStatus === selectedPayment?.status}>
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
