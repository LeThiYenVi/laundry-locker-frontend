import * as React from "react";
import { MoreHorizontal, DollarSign, CreditCard, User } from "lucide-react";
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
} from "~/components/ui";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "~/components/ui/pagination";
import { t } from "@/lib/i18n";
import { useGetAllPaymentsQuery } from "@/stores/apis/adminApi";
import type { PaymentStatus } from "@/types";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

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

export default function PaymentsPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);

  const { data: paymentsData, isLoading, error } = useGetAllPaymentsQuery({ pageNumber: page, pageSize: size });
  const payments = paymentsData?.data?.content || [];
  const totalPages = paymentsData?.data?.totalPages || 0;
  const totalElements = paymentsData?.data?.totalElements || 0;

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

  if (payments.length === 0) {
    return (
      <EmptyData
        title="Chưa có giao dịch"
        message="Danh sách thanh toán đang trống."
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
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
                      {payment.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-2">
                    <span className="text-sm">{new Date(payment.createdAt).toLocaleString()}</span>
                  </TableCell>

                  <TableCell className="py-2">
                    <button className="p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal size={16} />
                    </button>
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
        </CardContent>
      </Card>
    </div>
  );
}
