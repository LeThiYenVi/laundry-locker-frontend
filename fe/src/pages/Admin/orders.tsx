import * as React from "react";
import { Card, CardContent, PageLoading, ErrorState, EmptyData } from "~/components/ui";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui";
import { Badge } from "~/components/ui";
import { t } from "@/lib/i18n";
import { Clock, CheckCircle, Loader2, CheckSquare, MoreHorizontal } from "lucide-react";
import StatusCard from "~/components/ui/status-card";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "~/components/ui/pagination";
import { useGetAllOrdersQuery, useGetOrderStatisticsQuery } from "@/stores/apis/adminApi";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

export default function OrdersPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);

  const { data: ordersData, isLoading, error } = useGetAllOrdersQuery({ pageNumber: page, pageSize: size });
  const { data: statsData } = useGetOrderStatisticsQuery();
  
  const orders = ordersData?.data?.content || [];
  const totalPages = ordersData?.data?.totalPages || 0;
  const totalElements = ordersData?.data?.totalElements || 0;
  const stats = statsData?.data;

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
            description={undefined}
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
            <div className="p-4 text-muted-foreground">{t("admin.orders.empty")}</div>
          ) : (
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
                      <Badge variant={
                        order.status === "COMPLETED" ? "default" :
                        order.status === "WAITING" || order.status === "RESERVED" ? "secondary" :
                        order.status === "CANCELED" ? "destructive" :
                        "outline"
                      }>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">${order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell className="py-2">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="py-2">
                      <button className="p-1 rounded hover:bg-gray-100">
                        <MoreHorizontal size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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

            <Pagination className="">
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
