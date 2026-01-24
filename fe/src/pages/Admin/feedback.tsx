import * as React from "react";
import { MessageSquare, MoreHorizontal, Star, Settings, Plus, AlertCircle } from "lucide-react";
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
  PageLoading,
  ErrorState,
  EmptyData,
} from "~/components/ui";
import { Avatar, Badge } from "~/components/ui";
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
import { 
  getPaginatedFeedbacks, 
  getFeedbackTypeColor, 
  getFeedbackStatusColor, 
  getFeedbackPriorityColor,
  type FeedbackItem 
} from "@/mockdata";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
  radius: "rounded-md",
};

export default function FeedbackPage(): React.JSX.Element {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<any>(null);

  // Simulate API call with mock data
  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [page, size]);

  const feedbackData = getPaginatedFeedbacks(page, size);
  const feedbacks = feedbackData.content;
  const totalPages = feedbackData.totalPages;
  const totalElements = feedbackData.totalElements;

  const toggleSelect = (id: number) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectAll = (on: boolean) => {
    if (on) {
      const all: Record<string, boolean> = {};
      feedbacks.forEach((f) => (all[f.id] = true));
      setSelected(all);
    } else setSelected({});
  };

  // Handle page size change
  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0);
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách feedback..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải dữ liệu feedback"
        error={error}
        onRetry={() => window.location.reload()}
        onClose={() => window.history.back()}
      />
    );
  }

  if (feedbacks.length === 0) {
    return (
      <EmptyData
        title="Chưa có feedback"
        message="Danh sách feedback đang trống."
        icon={<MessageSquare className="h-16 w-16 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">Tất cả Feedback</div>
            <div className="font-semibold">{totalElements.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Settings size={16} /> Cài đặt
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className={`${tableHeader.bg} border rounded-md flex hover:text-amber-300 px-2 py-1`}>
          <Button variant="default" size="icon" className=" text-amber-100 ">
            <Plus size={16} />
          </Button>
          <Button variant="default" size="sm" className=" text-amber-100 ">
            Trả lời
          </Button>
        </div>
        <div className="flex items-center gap-2 border rounded-2xl px-2 py-1">
          <Button variant="ghost">Đánh dấu đã đọc</Button>
          <Button variant="ghost">Lưu trữ</Button>
          <Button variant="ghost" className="text-red-600">Xóa</Button>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          <Table className="w-full p-0">
            <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
              <TableRow>
                <TableHead className="rounded-tl-md">
                  <input
                    type="checkbox"
                    checked={Object.keys(selected).length === feedbacks.length}
                    onChange={(e) => selectAll(e.target.checked)}
                  />
                </TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Cửa hàng</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="rounded-tr-md">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {feedbacks.map((feedback) => (
                <TableRow key={feedback.id} className="h-10">
                  <TableCell className="py-2">
                    <input 
                      type="checkbox" 
                      checked={!!selected[feedback.id]} 
                      onChange={() => toggleSelect(feedback.id)} 
                    />
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 text-sm">
                        <img src={feedback.userAvatar} alt={feedback.userName} />
                      </Avatar>
                      <div>
                        <div className="font-medium">{feedback.userName}</div>
                        <div className="text-sm text-muted-foreground">{feedback.userEmail}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-2">
                    <Badge variant={getFeedbackTypeColor(feedback.type) as any}>
                      {feedback.type}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-2">
                    <Badge variant={getFeedbackPriorityColor(feedback.priority) as any}>
                      {feedback.priority}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{feedback.subject}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {feedback.message}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-2">
                    {feedback.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{feedback.rating}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="py-2">
                    <Badge variant={getFeedbackStatusColor(feedback.status) as any}>
                      {feedback.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-2">
                    {feedback.storeName ? (
                      <div className="text-sm">{feedback.storeName}</div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="text-sm">
                      {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
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
                onChange={(e) => handleSizeChange(Number(e.target.value))}
              >
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <div className="text-sm text-muted-foreground">
                {page * size + 1}-{Math.min((page + 1) * size, totalElements)} of {totalElements}
              </div>
            </div>

            <Pagination className="">
              <PaginationContent>
                <PaginationPrevious onClick={() => setPage(Math.max(0, page - 1))} />
                {[...Array(Math.min(5, totalPages))].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      href="#" 
                      isActive={page === i}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(totalPages - 1);
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationNext onClick={() => setPage(Math.min(totalPages - 1, page + 1))} />
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
