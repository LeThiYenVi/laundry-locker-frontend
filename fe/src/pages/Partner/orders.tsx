import * as React from "react";
import { Package, MoreHorizontal, Search, Filter, Eye } from "lucide-react";
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
  Badge,
  Input,
} from "~/components/ui";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { t } from "@/lib/i18n";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "~/components/ui/pagination";
import { 
  useGetPartnerOrdersQuery, 
  useGetPendingOrdersQuery,
} from "@/stores/apis/partner";
import { OrderStatus } from "@/schemas/partner.schemas";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  INITIALIZED: "Khởi tạo",
  RESERVED: "Đã đặt trước",
  WAITING: "Chờ lấy đồ",
  COLLECTED: "Đã lấy",
  PROCESSING: "Đang giặt",
  READY: "Sẵn sàng trả",
  RETURNED: "Đã trả",
  COMPLETED: "Hoàn thành",
  CANCELED: "Đã hủy",
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  INITIALIZED: "bg-gray-100 text-gray-700",
  RESERVED: "bg-blue-100 text-blue-700",
  WAITING: "bg-yellow-100 text-yellow-700",
  COLLECTED: "bg-orange-100 text-orange-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  READY: "bg-cyan-100 text-cyan-700",
  RETURNED: "bg-teal-100 text-teal-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELED: "bg-red-100 text-red-700",
};

export default function PartnerOrders(): React.JSX.Element {
  const [activeTab, setActiveTab] = React.useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Use RTK Query instead of mock data
  const { 
    data: ordersData, 
    isLoading, 
    error,
    refetch 
  } = useGetPartnerOrdersQuery({ 
    status: activeTab === "ALL" ? undefined : activeTab,
    page, 
    size 
  });

  const orders = ordersData?.data?.content || [];
  const totalPages = ordersData?.data?.totalPages || 0;
  const totalElements = ordersData?.data?.totalElements || 0;

  const getStatusBadgeClass = (status: string) => {
    return ORDER_STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    return ORDER_STATUS_LABELS[status] || status;
  };

  const handleViewOrder = (orderId: number) => {
    console.log("View order:", orderId);
    // TODO: Navigate to order detail page
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách đơn hàng..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải đơn hàng"
        error={error}
        onRetry={refetch}
        onClose={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t("partner.orders.title")}</h1>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder={t("partner.orders.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={18} />
          {t("partner.orders.filter")}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as OrderStatus | "ALL");
          setPage(0);
        }}
      >
        <TabsList>
          <TabsTrigger value="ALL">{t("partner.orders.all")}</TabsTrigger>
          <TabsTrigger value="WAITING">{t("partner.orders.waiting")}</TabsTrigger>
          <TabsTrigger value="COLLECTED">{t("partner.orders.collected")}</TabsTrigger>
          <TabsTrigger value="PROCESSING">{t("partner.orders.processing")}</TabsTrigger>
          <TabsTrigger value="READY">{t("partner.orders.ready")}</TabsTrigger>
          <TabsTrigger value="COMPLETED">{t("partner.orders.completed")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <EmptyData
          title={t("partner.orders.empty")}
          message={activeTab !== "ALL" ? t("partner.orders.empty") : ""}
          icon={<Package className="h-16 w-16 text-muted-foreground" />}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader className={tableHeader.bg}>
                <TableRow>
                  <TableHead className={tableHeader.text}>Mã đơn</TableHead>
                  <TableHead className={tableHeader.text}>Khách hàng</TableHead>
                  <TableHead className={tableHeader.text}>Locker</TableHead>
                  <TableHead className={tableHeader.text}>Trạng thái</TableHead>
                  <TableHead className={tableHeader.text}>Giá trị</TableHead>
                  <TableHead className={tableHeader.text}>Ngày tạo</TableHead>
                  <TableHead className={`${tableHeader.text} text-right`}>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono font-medium">
                      #{order.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.senderName}</p>
                        <p className="text-sm text-gray-500">{order.senderPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.lockerName}</p>
                        <p className="text-sm text-gray-500">Box {order.sendBoxNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {order.totalPrice ? `${order.totalPrice.toLocaleString()}đ` : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <Eye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
