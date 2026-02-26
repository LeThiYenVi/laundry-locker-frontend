import * as React from "react";
import { Card, CardContent, PageLoading, ErrorState, EmptyData } from "~/components/ui";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui";
import { Badge, Button } from "~/components/ui";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "~/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { t } from "@/lib/i18n";
import { useGetAllLockersQuery } from "@/stores/apis/adminApi";

export default function LockersPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);

  const { data: lockersData, isLoading, error, refetch } = useGetAllLockersQuery({ pageNumber: page, pageSize: size });
  const lockers = lockersData?.data?.content || [];
  const totalPages = lockersData?.data?.totalPages || 0;
  const totalElements = lockersData?.data?.totalElements || 0;
  const currentPage = lockersData?.data?.number || 0;

  const handleSizeChange = (newSize: string) => {
    setSize(Number(newSize));
    setPage(0);
  };

  // Generate page numbers for pagination
  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    const pages: (number | "ellipsis")[] = [];
    pages.push(0);
    if (currentPage > 2) pages.push("ellipsis");
    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages - 2, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 3) pages.push("ellipsis");
    if (totalPages > 1) pages.push(totalPages - 1);
    return pages;
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
        onRetry={refetch}
        onClose={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{t("admin.lockers.title")}</h1>

      <Card>
        <CardContent>
          {lockers.length === 0 ? (
            <div className="text-muted-foreground">{t("admin.lockers.empty")}</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.lockers.table.id")}</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>{t("admin.lockers.table.location")}</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>{t("admin.lockers.table.status")}</TableHead>
                    <TableHead>Boxes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lockers.map((locker) => (
                    <TableRow key={locker.id}>
                      <TableCell>{locker.id}</TableCell>
                      <TableCell className="font-mono">{locker.code}</TableCell>
                      <TableCell>{locker.name}</TableCell>
                      <TableCell>{locker.address}</TableCell>
                      <TableCell>{locker.storeName}</TableCell>
                      <TableCell>
                        <Badge variant={
                          locker.status === "ACTIVE" ? "default" : 
                          locker.status === "MAINTENANCE" ? "secondary" : 
                          "destructive"
                        }>
                          {locker.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {locker.availableBoxes}/{locker.totalBoxes} available
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="flex items-center justify-between px-4 py-4 border-t mt-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-600">
                      Hiển thị {currentPage * size + 1} -{" "}
                      {Math.min((currentPage + 1) * size, totalElements)} / {totalElements} tủ khóa
                    </p>
                    <Select value={size.toString()} onValueChange={handleSizeChange}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 / trang</SelectItem>
                        <SelectItem value="10">10 / trang</SelectItem>
                        <SelectItem value="20">20 / trang</SelectItem>
                        <SelectItem value="50">50 / trang</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {totalPages > 1 && (
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setPage(Math.max(0, currentPage - 1))}
                            className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>

                        {getPageNumbers().map((pageNum, idx) =>
                          pageNum === "ellipsis" ? (
                            <PaginationItem key={`ellipsis-${idx}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                isActive={pageNum === currentPage}
                                onClick={() => setPage(pageNum)}
                                className="cursor-pointer"
                              >
                                {pageNum + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ),
                        )}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
                            className={currentPage >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
