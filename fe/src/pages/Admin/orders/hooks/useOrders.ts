import { useMemo, useState } from "react";
import { OrderStatus } from "~/types/admin/enums";
import { isMockEnabled, mockDelay } from "~/hooks/useMockData";
import type { Order } from "~/types/orders";

// Mock data cho demo
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerId: "CUST-001",
    customerName: "Nguyễn Văn A",
    status: OrderStatus.INITIALIZED,
    items: [
      { id: "ITEM-001", name: "Áo sơ mi", qty: 2, price: 50000 },
    ],
    total: 100000,
    createdAt: "2024-01-15T10:30:00Z",
    notes: "Giặt ủi thường",
  },
  {
    id: "ORD-002",
    customerId: "CUST-002",
    customerName: "Trần Thị B",
    status: OrderStatus.PROCESSING,
    items: [
      { id: "ITEM-002", name: "Vest", qty: 1, price: 150000 },
    ],
    total: 150000,
    createdAt: "2024-01-15T09:00:00Z",
    notes: "Giặt hấp",
  },
  {
    id: "ORD-003",
    customerId: "CUST-003",
    customerName: "Lê Văn C",
    status: OrderStatus.COMPLETED,
    items: [
      { id: "ITEM-003", name: "Chăn ga", qty: 1, price: 200000 },
    ],
    total: 200000,
    createdAt: "2024-01-14T15:30:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "ORD-004",
    customerId: "CUST-004",
    customerName: "Phạm Thị D",
    status: OrderStatus.WAITING,
    items: [
      { id: "ITEM-004", name: "Đầm dạ hội", qty: 1, price: 300000 },
    ],
    total: 300000,
    createdAt: "2024-01-16T08:00:00Z",
    notes: "Giặt khô",
  },
  {
    id: "ORD-005",
    customerId: "CUST-005",
    customerName: "Hoàng Văn E",
    status: OrderStatus.CANCELED,
    items: [
      { id: "ITEM-005", name: "Quần tây", qty: 3, price: 40000 },
    ],
    total: 120000,
    createdAt: "2024-01-10T14:00:00Z",
    updatedAt: "2024-01-11T09:00:00Z",
    notes: "Khách hủy",
  },
  {
    id: "ORD-006",
    customerId: "CUST-006",
    customerName: "Ngô Thị F",
    status: OrderStatus.READY,
    items: [
      { id: "ITEM-006", name: "Áo khoác", qty: 1, price: 80000 },
    ],
    total: 80000,
    createdAt: "2024-01-12T11:00:00Z",
    updatedAt: "2024-01-14T16:00:00Z",
  },
];

type OrderStatusFilter = "ALL" | OrderStatus;

export function useOrders() {
  const [status, setStatus] = useState<OrderStatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Mock loading state
  const [isLoading, setIsLoading] = useState(isMockEnabled);
  
  if (isMockEnabled && isLoading) {
    setTimeout(() => setIsLoading(false), mockDelay);
  }

  const filteredOrders = useMemo(() => {
    let result = [...mockOrders];

    if (status !== "ALL") {
      result = result.filter((order) => order.status === status);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.id?.toLowerCase().includes(query) ||
          order.customerName?.toLowerCase().includes(query)
      );
    }

    // Pagination for mock data
    const start = page * pageSize;
    result = result.slice(start, start + pageSize);

    return result;
  }, [status, searchQuery, page, pageSize]);

  const statusCounts = useMemo(() => {
    return {
      ALL: mockOrders.length,
      [OrderStatus.INITIALIZED]: mockOrders.filter((o) => o.status === OrderStatus.INITIALIZED).length,
      [OrderStatus.RESERVED]: mockOrders.filter((o) => o.status === OrderStatus.RESERVED).length,
      [OrderStatus.WAITING]: mockOrders.filter((o) => o.status === OrderStatus.WAITING).length,
      [OrderStatus.COLLECTED]: mockOrders.filter((o) => o.status === OrderStatus.COLLECTED).length,
      [OrderStatus.PROCESSING]: mockOrders.filter((o) => o.status === OrderStatus.PROCESSING).length,
      [OrderStatus.READY]: mockOrders.filter((o) => o.status === OrderStatus.READY).length,
      [OrderStatus.RETURNED]: mockOrders.filter((o) => o.status === OrderStatus.RETURNED).length,
      [OrderStatus.COMPLETED]: mockOrders.filter((o) => o.status === OrderStatus.COMPLETED).length,
      [OrderStatus.CANCELED]: mockOrders.filter((o) => o.status === OrderStatus.CANCELED).length,
    };
  }, []);

  return {
    orders: isMockEnabled ? filteredOrders : filteredOrders,
    totalElements: mockOrders.length,
    totalPages: Math.ceil(mockOrders.length / pageSize),
    isLoading,
    error: null,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    statusCounts,
    isMock: isMockEnabled,
  };
}
