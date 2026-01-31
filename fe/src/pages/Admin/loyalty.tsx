import * as React from "react";
import { Gift, Star, TrendingUp, Users, Loader2, Plus, Minus, History } from "lucide-react";
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
import { ActionMenu } from "@/components/admin";
import {
  useGetLoyaltyStatisticsQuery,
  useGetAllUsersQuery,
  useGetUserLoyaltySummaryQuery,
  useGetUserPointsHistoryQuery,
  useAdjustUserPointsMutation,
} from "@/stores/apis/admin";
import type { AdminUserResponse } from "@/types";
import { useToast } from "@/hooks/use-toast";
import StatusCard from "~/components/ui/status-card";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

const adjustPointsSchema = z.object({
  points: z.number().int().min(1, "Số điểm phải lớn hơn 0"),
  reason: z.string().optional(),
});

type AdjustPointsFormValues = z.infer<typeof adjustPointsSchema>;

export default function LoyaltyPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [isAdjustOpen, setIsAdjustOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<AdminUserResponse | null>(null);
  const [adjustType, setAdjustType] = React.useState<'add' | 'subtract'>('add');
  
  const { toast } = useToast();

  const { data: usersData, isLoading, error } = useGetAllUsersQuery({ pageNumber: page, pageSize: size });
  const { data: statsData } = useGetLoyaltyStatisticsQuery();
  const { data: loyaltySummary } = useGetUserLoyaltySummaryQuery(selectedUser?.id || 0, {
    skip: !selectedUser || !isViewOpen,
  });
  const { data: pointsHistory } = useGetUserPointsHistoryQuery(
    { userId: selectedUser?.id || 0, pageNumber: 0, pageSize: 10 },
    { skip: !selectedUser || !isHistoryOpen }
  );
  
  const [adjustUserPoints, { isLoading: isAdjusting }] = useAdjustUserPointsMutation();

  const users = usersData?.data?.content || [];
  const totalPages = usersData?.data?.totalPages || 0;
  const totalElements = usersData?.data?.totalElements || 0;
  const stats = statsData?.data;

  const form = useForm<AdjustPointsFormValues>({
    resolver: zodResolver(adjustPointsSchema),
    defaultValues: {
      points: 0,
      reason: "",
    },
  });

  const handleAdjustPoints = async (values: AdjustPointsFormValues) => {
    if (!selectedUser) return;
    try {
      const points = adjustType === 'subtract' ? -values.points : values.points;
      await adjustUserPoints({ 
        userId: selectedUser.id, 
        data: { 
          userId: selectedUser.id,
          points, 
          reason: values.reason 
        } 
      }).unwrap();
      toast({ 
        title: "Thành công", 
        description: `Đã ${adjustType === 'add' ? 'cộng' : 'trừ'} ${values.points} điểm cho ngườii dùng` 
      });
      setIsAdjustOpen(false);
      setSelectedUser(null);
      form.reset();
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể điều chỉnh điểm. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const openAdjustDialog = (user: AdminUserResponse, type: 'add' | 'subtract') => {
    setSelectedUser(user);
    setAdjustType(type);
    form.reset({ points: 0, reason: "" });
    setIsAdjustOpen(true);
  };

  const openViewDialog = (user: AdminUserResponse) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const openHistoryDialog = (user: AdminUserResponse) => {
    setSelectedUser(user);
    setIsHistoryOpen(true);
  };

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
            count={stats.totalMembers || 0}
            icon={<Users size={20} />}
            variant="blue"
          />
          <StatusCard
            title="Điểm đã phát hành"
            count={(stats.totalPointsIssued || 0).toLocaleString()}
            icon={<Star size={20} />}
            variant="amber"
          />
          <StatusCard
            title="Điểm đã đổi"
            count={(stats.totalPointsRedeemed || 0).toLocaleString()}
            icon={<Gift size={20} />}
            variant="green"
          />
          <StatusCard
            title="Rewards đã đổi"
            count={stats.totalRewardsRedeemed || 0}
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
          </div>

          {users.length === 0 ? (
            <EmptyData
              title="Chưa có thành viên nào"
              message="Danh sách thành viên đang trống."
            />
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
                        <ActionMenu
                          onView={() => openViewDialog(user)}
                          customActions={[
                            {
                              label: "Cộng điểm",
                              icon: <Plus size={14} className="text-green-500" />,
                              onClick: () => openAdjustDialog(user, 'add'),
                            },
                            {
                              label: "Trừ điểm",
                              icon: <Minus size={14} className="text-red-500" />,
                              onClick: () => openAdjustDialog(user, 'subtract'),
                            },
                            {
                              label: "Lịch sử điểm",
                              icon: <History size={14} />,
                              onClick: () => openHistoryDialog(user),
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

      {/* Adjust Points Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {adjustType === 'add' ? 'Cộng điểm' : 'Trừ điểm'} cho {selectedUser?.name || selectedUser?.email}
            </DialogTitle>
            <DialogDescription>
              Nhập số điểm và lý do để {adjustType === 'add' ? 'cộng' : 'trừ'} điểm.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAdjustPoints)} className="space-y-4">
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điểm *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="100"
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
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Lý do điều chỉnh điểm..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={isAdjusting}
                  className={adjustType === 'add' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                >
                  {isAdjusting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {adjustType === 'add' ? 'Cộng điểm' : 'Trừ điểm'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Loyalty Summary Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thông tin Loyalty - {selectedUser?.name || selectedUser?.email}</DialogTitle>
          </DialogHeader>
          {loyaltySummary?.data && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-amber-600">
                    {loyaltySummary.data.currentPoints.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground">Điểm hiện tại</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-xl font-semibold text-green-600">
                    +{loyaltySummary.data.totalPointsEarned.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Tổng điểm nhận</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded">
                  <div className="text-xl font-semibold text-red-600">
                    -{loyaltySummary.data.totalPointsRedeemed.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Tổng điểm đổi</div>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span>Cấp độ hiện tại:</span>
                  <Badge variant="default" className="bg-purple-100 text-purple-800">
                    {loyaltySummary.data.currentTier}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => openAdjustDialog(selectedUser!, 'add')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Cộng điểm
                </Button>
                <Button 
                  onClick={() => openAdjustDialog(selectedUser!, 'subtract')}
                  variant="destructive"
                  className="flex-1"
                >
                  <Minus className="mr-2 h-4 w-4" />
                  Trừ điểm
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Points History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lịch sử điểm - {selectedUser?.name || selectedUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {pointsHistory?.data?.content && pointsHistory.data.content.length > 0 ? (
              <div className="space-y-2">
                {pointsHistory.data.content.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className={`flex justify-between items-center p-3 rounded ${
                      transaction.points > 0 ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{transaction.reason || 'Điều chỉnh điểm'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyData
                title="Chưa có lịch sử"
                message="Ngườii dùng này chưa có giao dịch điểm nào."
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
