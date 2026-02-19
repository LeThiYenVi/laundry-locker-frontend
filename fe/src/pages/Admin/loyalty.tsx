import * as React from "react";
import { MoreHorizontal, Plus, Gift, Star, TrendingUp, Users } from "lucide-react";
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
import { useGetLoyaltyStatisticsQuery, useGetAllUsersQuery } from "@/stores/apis/adminApi";
import StatusCard from "~/components/ui/status-card";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

export default function LoyaltyPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);

  // Get users for loyalty table (in real app, would have dedicated loyalty users endpoint)
  const { data: usersData, isLoading, error } = useGetAllUsersQuery({ pageNumber: page, pageSize: size });
  const { data: statsData } = useGetLoyaltyStatisticsQuery();
  
  const users = usersData?.data?.content || [];
  const totalPages = usersData?.data?.totalPages || 0;
  const totalElements = usersData?.data?.totalElements || 0;
  const stats = statsData?.data;

  if (isLoading) {
    return <PageLoading message="Đang tải dữ liệu loyalty..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải dữ liệu loyalty"
        error={error}
        onRetry={() => window.location.reload()}
        onClose={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Loyalty Program</h1>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <StatusCard
            title="Tổng thành viên"
            count={stats.totalMembers}
            icon={<Users size={20} />}
            variant="blue"
          />
          <StatusCard
            title="Điểm đã phát hành"
            count={stats.totalPointsIssued.toLocaleString()}
            icon={<Star size={20} />}
            variant="amber"
          />
          <StatusCard
            title="Điểm đã đổi"
            count={stats.totalPointsRedeemed.toLocaleString()}
            icon={<Gift size={20} />}
            variant="green"
          />
          <StatusCard
            title="Rewards đã đổi"
            count={stats.totalRewardsRedeemed}
            icon={<TrendingUp size={20} />}
            variant="violet"
          />
        </div>
      )}

      {/* Users Table */}
      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">Thành viên</div>
              <div className="font-semibold">{totalElements}</div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="default" size="icon">
                <Plus size={16} />
              </Button>
              <Button variant="ghost" size="sm">Thêm điểm</Button>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="p-4 text-muted-foreground">Chưa có thành viên nào.</div>
          ) : (
            <>
              <Table className="w-full p-0">
                <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
                  <TableRow>
                    <TableHead className="rounded-tl-md">Thành viên</TableHead>
                    <TableHead>Điểm hiện tại</TableHead>
                    <TableHead>Tổng điểm nhận</TableHead>
                    <TableHead>Tổng điểm đổi</TableHead>
                    <TableHead>Chi tiêu</TableHead>
                    <TableHead className="rounded-tr-md">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="h-10">
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                            {user.name?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{user.name || user.email}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <Badge variant="default" className="bg-amber-100 text-amber-800">
                          <Star size={12} className="mr-1" />
                          {(Math.random() * 5000).toFixed(0)} pts
                        </Badge>
                      </TableCell>

                      <TableCell className="py-2">
                        <span className="text-sm text-green-600">+{(Math.random() * 10000).toFixed(0)}</span>
                      </TableCell>

                      <TableCell className="py-2">
                        <span className="text-sm text-red-600">-{(Math.random() * 5000).toFixed(0)}</span>
                      </TableCell>

                      <TableCell className="py-2">
                        <span className="text-sm">{(Math.random() * 10000000).toFixed(0).toLocaleString()} VNĐ</span>
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
