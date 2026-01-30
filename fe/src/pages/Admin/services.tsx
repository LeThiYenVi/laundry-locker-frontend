import * as React from "react";
import { MoreHorizontal, Plus, DollarSign, Clock, Store } from "lucide-react";
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
import { useGetAllServicesQuery } from "@/stores/apis/adminApi";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

export default function ServicesPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);

  const { data: servicesData, isLoading, error } = useGetAllServicesQuery({ pageNumber: page, pageSize: size });
  const services = servicesData?.data?.content || [];
  const totalPages = servicesData?.data?.totalPages || 0;
  const totalElements = servicesData?.data?.totalElements || 0;

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

  if (services.length === 0) {
    return (
      <EmptyData
        title="Chưa có dịch vụ"
        message="Danh sách dịch vụ đang trống."
        action={{
          label: "Thêm dịch vụ mới",
          onClick: () => console.log("Create service"),
        }}
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

        <div className="flex items-center gap-3">
          <Button variant="default" size="icon" className="mr-2">
            <Plus size={16} />
          </Button>
          <Button variant="ghost" size="sm">Thêm dịch vụ</Button>
        </div>
      </div>

      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          <Table className="w-full p-0">
            <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
              <TableRow>
                <TableHead className="rounded-tl-md">Dịch vụ</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead>Thời gian</TableHead>
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
