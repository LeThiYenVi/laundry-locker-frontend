import * as React from "react";
import { MoreHorizontal, Plus, MapPin, Phone, Clock } from "lucide-react";
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
import { useGetAllStoresQuery } from "@/stores/apis/adminApi";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

export default function StoresPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);

  const { data: storesData, isLoading, error } = useGetAllStoresQuery({ pageNumber: page, pageSize: size });
  const stores = storesData?.data?.content || [];
  const totalPages = storesData?.data?.totalPages || 0;
  const totalElements = storesData?.data?.totalElements || 0;

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

  if (stores.length === 0) {
    return (
      <EmptyData
        title="Chưa có cửa hàng"
        message="Danh sách cửa hàng đang trống."
        action={{
          label: "Thêm cửa hàng mới",
          onClick: () => console.log("Create store"),
        }}
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

        <div className="flex items-center gap-3">
          <Button variant="default" size="icon" className="mr-2">
            <Plus size={16} />
          </Button>
          <Button variant="ghost" size="sm">Thêm cửa hàng</Button>
        </div>
      </div>

      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
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
