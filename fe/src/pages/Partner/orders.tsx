import * as React from "react";
import { Package, MoreHorizontal, Search, Filter } from "lucide-react";
import {
  Button,
  Card,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "~/components/ui/pagination";
import { PARTNER_ORDERS, ORDER_STATUS_COLORS } from "@/constants";
import type { PartnerOrder } from "@/types";
import type { OrderStatus } from "@/types/partner.enum";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
  radius: "rounded-md",
};

export default function PartnerOrders(): React.JSX.Element {
  const [activeTab, setActiveTab] = React.useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [orders, setOrders] = React.useState<PartnerOrder[]>([]);

  // TODO: Replace with actual API call
  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setOrders([]);
      setIsLoading(false);
    }, 500);
  }, [activeTab, page, size]);

  const getStatusBadgeClass = (status: OrderStatus) => {
    return ORDER_STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
  };

  const handleViewOrder = (orderId: number) => {
    console.log("View order:", orderId);
    // Navigate to order detail page
  };

  const handleAction = (order: PartnerOrder) => {
    console.log("Action for order:", order.id);
    // Handle different actions based on order status
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách đơn hàng..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600 mt-2">
            Theo dõi và xử lý đơn hàng giặt ủi
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            placeholder="Tìm kiếm theo mã đơn, khách hàng, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter size={18} />
          Bộ lọc
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as OrderStatus | "ALL")}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="ALL">Tất cả</TabsTrigger>
          <TabsTrigger value="WAITING">Chờ lấy đồ</TabsTrigger>
          <TabsTrigger value="COLLECTED">Đã lấy</TabsTrigger>
          <TabsTrigger value="PROCESSING">Đang giặt</TabsTrigger>
          <TabsTrigger value="PROCESSED">Giặt xong</TabsTrigger>
          <TabsTrigger value="RETURNED">Đã trả</TabsTrigger>
          <TabsTrigger value="COMPLETED">Hoàn thành</TabsTrigger>
        </TabsList>

        {orders.length === 0 ? (
          <EmptyData
            title="Chưa có đơn hàng"
            message={`Không có đơn hàng nào ${activeTab !== "ALL" ? `ở trạng thái ${activeTab}` : ""}.`}
            icon={<Package className="h-16 w-16 text-muted-foreground" />}
          />
        ) : (
          <Card>
            <Table>
              <TableHeader className={tableHeader.bg}>
                <TableRow>
                  <TableHead
                    className={`${tableHeader.text} ${tableHeader.radius}`}
                  >
                    Mã đơn
                  </TableHead>
                  <TableHead className={tableHeader.text}>Khách hàng</TableHead>
                  <TableHead className={tableHeader.text}>Locker</TableHead>
                  <TableHead className={tableHeader.text}>Dịch vụ</TableHead>
                  <TableHead className={tableHeader.text}>Trạng thái</TableHead>
                  <TableHead className={tableHeader.text}>Giá trị</TableHead>
                  <TableHead className={tableHeader.text}>Nhân viên</TableHead>
                  <TableHead className={tableHeader.text}>Ngày tạo</TableHead>
                  <TableHead
                    className={`${tableHeader.text} ${tableHeader.radius} text-right`}
                  >
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono font-semibold">
                      {order.orderCode}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-gray-500">
                          {order.customerPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.lockerName}</p>
                        <p className="text-sm text-gray-500">
                          Box {order.boxNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.serviceType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {order.totalPrice
                        ? `${order.totalPrice.toLocaleString()}đ`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {order.assignedStaffName || "-"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewOrder(order.id)}
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Tabs>
    </div>
  );
}
