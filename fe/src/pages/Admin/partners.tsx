import * as React from "react";
import { MoreHorizontal, Plus, Building2, Phone, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
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
import { useGetAllPartnersQuery, useGetPartnerStatisticsQuery } from "@/stores/apis/adminApi";
import type { PartnerStatus } from "@/types";
import StatusCard from "~/components/ui/status-card";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

const getStatusBadgeVariant = (status: PartnerStatus) => {
  switch (status) {
    case 'APPROVED':
      return 'default';
    case 'PENDING':
      return 'secondary';
    case 'REJECTED':
      return 'destructive';
    case 'SUSPENDED':
      return 'outline';
    default:
      return 'outline';
  }
};

const getStatusIcon = (status: PartnerStatus) => {
  switch (status) {
    case 'APPROVED':
      return <CheckCircle size={14} className="text-green-500" />;
    case 'PENDING':
      return <Clock size={14} className="text-amber-500" />;
    case 'REJECTED':
      return <XCircle size={14} className="text-red-500" />;
    case 'SUSPENDED':
      return <AlertCircle size={14} className="text-gray-500" />;
    default:
      return null;
  }
};

export default function PartnersPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);

  const { data: partnersData, isLoading, error } = useGetAllPartnersQuery({ pageNumber: page, pageSize: size });
  const { data: statsData } = useGetPartnerStatisticsQuery();
  
  const partners = partnersData?.data?.content || [];
  const totalPages = partnersData?.data?.totalPages || 0;
  const totalElements = partnersData?.data?.totalElements || 0;
  const stats = statsData?.data;

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách đối tác..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải dữ liệu đối tác"
        error={error}
        onRetry={() => window.location.reload()}
        onClose={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Quản lý đối tác</h1>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-5 gap-4">
          <StatusCard
            title="Tổng đối tác"
            count={stats.totalPartners}
            variant="blue"
          />
          <StatusCard
            title="Chờ duyệt"
            count={stats.pendingPartners}
            variant="amber"
          />
          <StatusCard
            title="Đã duyệt"
            count={stats.approvedPartners}
            variant="green"
          />
          <StatusCard
            title="Từ chối"
            count={stats.rejectedPartners}
            variant="red"
          />
          <StatusCard
            title="Tạm ngưng"
            count={stats.suspendedPartners}
            variant="gray"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">Tất cả đối tác</div>
            <div className="font-semibold">{totalElements}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="default" size="icon" className="mr-2">
            <Plus size={16} />
          </Button>
          <Button variant="ghost" size="sm">Thêm đối tác</Button>
        </div>
      </div>

      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          {partners.length === 0 ? (
            <EmptyData
              title="Chưa có đối tác"
              message="Danh sách đối tác đang trống."
            />
          ) : (
            <>
              <Table className="w-full p-0">
                <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
                  <TableRow>
                    <TableHead className="rounded-tl-md">Đối tác</TableHead>
                    <TableHead>Liên hệ</TableHead>
                    <TableHead>Thuế/MST</TableHead>
                    <TableHead>Chiết khấu</TableHead>
                    <TableHead>Cửa hàng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="rounded-tr-md">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id} className="h-10">
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 text-sm">
                            <Building2 size={16} />
                          </Avatar>
                          <div>
                            <div className="font-medium">{partner.businessName}</div>
                            <div className="text-sm text-muted-foreground">{partner.userName}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Phone size={12} className="text-gray-400" />
                            {partner.contactPhone}
                          </div>
                          <div className="text-muted-foreground text-xs">{partner.contactEmail}</div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="text-sm font-mono">{partner.taxId || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{partner.businessRegistrationNumber || 'N/A'}</div>
                      </TableCell>

                      <TableCell className="py-2">
                        <span className="text-sm font-medium">{partner.revenueSharePercent}%</span>
                      </TableCell>

                      <TableCell className="py-2">
                        <Badge variant="outline">{partner.storeCount} cửa hàng</Badge>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(partner.status)}
                          <Badge variant={getStatusBadgeVariant(partner.status)}>
                            {partner.status}
                          </Badge>
                        </div>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
