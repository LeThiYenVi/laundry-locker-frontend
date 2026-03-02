import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  ClipboardList,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  useGetAllReportsQuery,
  useGetReportStatsQuery,
} from "~/stores/apis/admin";
import {
  fmtDate,
  REPORT_STATUS_META,
  CATEGORY_META,
  ErrorBanner,
} from "./shared";

export function ReportsTab() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch } = useGetAllReportsQuery({
    page,
    size: 20,
    ...(status !== "all" && { status }),
    ...(category !== "all" && { category }),
  });

  const { data: statsRes, isLoading: statsLoading } = useGetReportStatsQuery();
  const stats = statsRes?.data;

  const list = data?.data?.content ?? [];
  const total = data?.data?.totalElements ?? 0;

  const STAT_CARDS = [
    {
      key: "totalReports" as const,
      label: "Tổng báo cáo",
      icon: ClipboardList,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      key: "openReports" as const,
      label: "Mới / Chờ xử lý",
      icon: AlertCircle,
      bg: "bg-red-50",
      color: "text-red-600",
    },
    {
      key: "inProgressReports" as const,
      label: "Đang xử lý",
      icon: Clock,
      bg: "bg-yellow-50",
      color: "text-yellow-600",
    },
    {
      key: "resolvedReports" as const,
      label: "Đã giải quyết",
      icon: CheckCircle2,
      bg: "bg-green-50",
      color: "text-green-600",
    },
  ] as const;

  return (
    <div className="space-y-4">
      {isError && <ErrorBanner onRetry={refetch} />}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ key, label, icon: Icon, bg, color }) => (
          <Card key={key} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}
                >
                  <Icon size={18} className={color} />
                </div>
                <div>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-14" />
                  ) : (
                    <p className="text-xl font-bold text-gray-900">
                      {(stats?.[key] ?? 0).toLocaleString("vi-VN")}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="OPEN">Mới</SelectItem>
            <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
            <SelectItem value="RESOLVED">Đã giải quyết</SelectItem>
            <SelectItem value="CLOSED">Đóng</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            <SelectItem value="DAMAGED">Hư hỏng</SelectItem>
            <SelectItem value="LOST">Thất lạc</SelectItem>
            <SelectItem value="QUALITY">Chất lượng</SelectItem>
            <SelectItem value="BILLING">Thanh toán</SelectItem>
            <SelectItem value="OTHER">Khác</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-gray-500 ml-auto">
          {isLoading ? "..." : `${total.toLocaleString("vi-VN")} báo cáo`}
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Phụ trách</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-gray-400"
                  >
                    Không có báo cáo nào
                  </TableCell>
                </TableRow>
              )}
              {list.map((r) => {
                const statusMeta =
                  REPORT_STATUS_META[r.status] ?? REPORT_STATUS_META.OPEN;
                const catMeta =
                  CATEGORY_META[r.category] ?? CATEGORY_META.OTHER;
                return (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/admin/reports/${r.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {r.userName}
                        </p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {r.title}
                      </p>
                      {r.relatedOrderId && (
                        <p className="text-xs text-gray-400">
                          #{r.relatedOrderId}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${catMeta.cls}`}>
                        {catMeta.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusMeta.cls}`}>
                        {statusMeta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {r.assignedStaffName ?? (
                        <span className="text-gray-300">Chưa phân công</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                      {fmtDate(r.createdAt)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => navigate(`/admin/reports/${r.id}`)}
                      >
                        <Eye size={15} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </Button>
          <span className="text-sm text-gray-600">
            Trang {page + 1} / {Math.ceil(total / 20)}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={(page + 1) * 20 >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Tiếp
          </Button>
        </div>
      )}
    </div>
  );
}
