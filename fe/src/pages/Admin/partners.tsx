import * as React from "react";
import { MoreHorizontal, Plus, Building2, Phone, CheckCircle, XCircle, Clock, AlertCircle, Check, X, Ban, Eye } from "lucide-react";
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
  Input,
  Textarea,
  Label,
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
import { t } from "@/lib/i18n";
import {
  useGetAllPartnersQuery,
  useGetPartnerByIdQuery,
  useGetPartnerStatisticsQuery,
  useApprovePartnerMutation,
  useRejectPartnerMutation,
  useSuspendPartnerMutation,
} from "@/stores/apis/admin";
import { ActionMenu } from "@/components/admin";
import type { PartnerResponse, PartnerStatus } from "@/types";
import StatusCard from "~/components/ui/status-card";
import { useToast } from "@/hooks/use-toast";

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
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isRejectOpen, setIsRejectOpen] = React.useState(false);
  const [selectedPartner, setSelectedPartner] = React.useState<PartnerResponse | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  
  const { toast } = useToast();

  const { data: partnersData, isLoading, error } = useGetAllPartnersQuery({ pageNumber: page, pageSize: size });
  const { data: statsData } = useGetPartnerStatisticsQuery();
  const { data: partnerDetail } = useGetPartnerByIdQuery(selectedPartner?.id || 0, {
    skip: !selectedPartner || !isViewOpen,
  });
  
  const [approvePartner, { isLoading: isApproving }] = useApprovePartnerMutation();
  const [rejectPartner, { isLoading: isRejecting }] = useRejectPartnerMutation();
  const [suspendPartner, { isLoading: isSuspending }] = useSuspendPartnerMutation();

  const partners = partnersData?.data?.content || [];
  const totalPages = partnersData?.data?.totalPages || 0;
  const totalElements = partnersData?.data?.totalElements || 0;
  const stats = statsData?.data;

  const handleApprove = async (partnerId: number) => {
    try {
      await approvePartner(partnerId).unwrap();
      toast({ title: "Thành công", description: "Đã phê duyệt đối tác" });
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể phê duyệt đối tác. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async () => {
    if (!selectedPartner) return;
    try {
      await rejectPartner({ partnerId: selectedPartner.id, reason: rejectReason }).unwrap();
      toast({ title: "Thành công", description: "Đã từ chối đối tác" });
      setIsRejectOpen(false);
      setRejectReason("");
      setSelectedPartner(null);
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể từ chối đối tác. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleSuspend = async (partnerId: number) => {
    try {
      await suspendPartner(partnerId).unwrap();
      toast({ title: "Thành công", description: "Đã tạm ngưng đối tác" });
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể tạm ngưng đối tác. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const openViewDialog = (partner: PartnerResponse) => {
    setSelectedPartner(partner);
    setIsViewOpen(true);
  };

  const openRejectDialog = (partner: PartnerResponse) => {
    setSelectedPartner(partner);
    setRejectReason("");
    setIsRejectOpen(true);
  };

  const getPartnerActions = (partner: PartnerResponse) => {
    const actions = [];
    
    if (partner.status === 'PENDING') {
      actions.push({
        label: "Phê duyệt",
        icon: <Check size={14} className="text-green-500" />,
        onClick: () => handleApprove(partner.id),
      });
      actions.push({
        label: "Từ chối",
        icon: <X size={14} className="text-red-500" />,
        onClick: () => openRejectDialog(partner),
        variant: "destructive" as const,
      });
    }
    
    if (partner.status === 'APPROVED') {
      actions.push({
        label: "Tạm ngưng",
        icon: <Ban size={14} className="text-amber-500" />,
        onClick: () => handleSuspend(partner.id),
      });
    }
    
    return actions;
  };

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
                        <ActionMenu
                          onView={() => openViewDialog(partner)}
                          customActions={getPartnerActions(partner)}
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

      {/* View Partner Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết đối tác</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về đối tác.
            </DialogDescription>
          </DialogHeader>
          {partnerDetail?.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tên doanh nghiệp</Label>
                  <p className="font-medium">{partnerDetail.data.businessName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngườii đại diện</Label>
                  <p className="font-medium">{partnerDetail.data.userName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mã số thuế</Label>
                  <p className="font-medium">{partnerDetail.data.taxId || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mã ĐKKD</Label>
                  <p className="font-medium">{partnerDetail.data.businessRegistrationNumber || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Điện thoại</Label>
                  <p className="font-medium">{partnerDetail.data.contactPhone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{partnerDetail.data.contactEmail}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Chiết khấu</Label>
                  <p className="font-medium">{partnerDetail.data.revenueSharePercent}%</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <Badge variant={getStatusBadgeVariant(partnerDetail.data.status)}>
                    {partnerDetail.data.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Địa chỉ</Label>
                <p className="font-medium">{partnerDetail.data.businessAddress || 'N/A'}</p>
              </div>
              {partnerDetail.data.rejectionReason && (
                <div>
                  <Label className="text-muted-foreground">Lý do từ chối</Label>
                  <p className="text-red-600">{partnerDetail.data.rejectionReason}</p>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                {partnerDetail.data.status === 'PENDING' && (
                  <>
                    <Button 
                      onClick={() => handleApprove(partnerDetail.data.id)}
                      disabled={isApproving}
                      className="flex-1"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Phê duyệt
                    </Button>
                    <Button 
                      onClick={() => openRejectDialog(partnerDetail.data)}
                      disabled={isRejecting}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Từ chối
                    </Button>
                  </>
                )}
                {partnerDetail.data.status === 'APPROVED' && (
                  <Button 
                    onClick={() => handleSuspend(partnerDetail.data.id)}
                    disabled={isSuspending}
                    variant="outline"
                    className="w-full"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Tạm ngưng
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Từ chối đối tác</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối đối tác <strong>{selectedPartner?.businessName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Lý do</Label>
              <Textarea
                id="reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
                Hủy
              </Button>
              <Button 
                onClick={handleReject} 
                disabled={!rejectReason.trim() || isRejecting}
                variant="destructive"
              >
                {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Từ chối
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
