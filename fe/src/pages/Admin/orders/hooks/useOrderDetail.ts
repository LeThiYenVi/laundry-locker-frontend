import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { OrderStatus } from "~/types/admin/enums";
import { isMockEnabled, mockDelay } from "~/hooks/useMockData";
import type { Order } from "~/types/orders";

// Extended Order type with detail fields
interface OrderDetail extends Order {
  senderName?: string;
  senderPhone?: string;
  receiverName?: string;
  lockerName?: string;
  lockerCode?: string;
  sendBoxNumber?: number;
  receiveBoxNumber?: number;
  pinCode?: string;
  isPaid?: boolean;
  paymentMethod?: string;
  actualWeight?: number;
  updatedAt?: string;
  timeline?: OrderTimelineEvent[];
}

interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

// Mock order detail data
const mockOrderDetail: Record<string, OrderDetail> = {
  "ORD-001": {
    id: "ORD-001",
    customerId: "CUST-001",
    customerName: "Nguyễn Văn A",
    status: OrderStatus.INITIALIZED,
    items: [
      { id: "ITEM-001", name: "Áo sơ mi", qty: 2, price: 50000 },
      { id: "ITEM-002", name: "Quần tây", qty: 1, price: 80000 },
    ],
    total: 180000,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    notes: "Giặt ủi thường, lấy sau 2 ngày",
    senderName: "Nguyễn Văn A",
    senderPhone: "0901234567",
    lockerName: "Tủ KTX A",
    lockerCode: "ESP8266_01",
    sendBoxNumber: 5,
    pinCode: "847291",
    isPaid: false,
    paymentMethod: "VNPAY",
    timeline: [
      { status: OrderStatus.INITIALIZED, timestamp: "2024-01-15T10:30:00Z", note: "Đơn hàng được tạo" },
    ],
  },
  "ORD-002": {
    id: "ORD-002",
    customerId: "CUST-002",
    customerName: "Trần Thị B",
    status: OrderStatus.PROCESSING,
    items: [
      { id: "ITEM-003", name: "Vest", qty: 1, price: 150000 },
      { id: "ITEM-004", name: "Cà vạt", qty: 2, price: 30000 },
    ],
    total: 210000,
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    notes: "Giặt hấp cao cấp",
    senderName: "Trần Thị B",
    senderPhone: "0912345678",
    lockerName: "Tủ Quận 1",
    lockerCode: "ESP8266_02",
    sendBoxNumber: 3,
    receiveBoxNumber: 8,
    actualWeight: 2.5,
    isPaid: true,
    paymentMethod: "MOMO",
    timeline: [
      { status: OrderStatus.INITIALIZED, timestamp: "2024-01-15T09:00:00Z", note: "Đơn hàng được tạo" },
      { status: OrderStatus.WAITING, timestamp: "2024-01-15T09:15:00Z", note: "Khách đã bỏ đồ vào tủ" },
      { status: OrderStatus.COLLECTED, timestamp: "2024-01-15T10:00:00Z", note: "Staff đã thu gom" },
      { status: OrderStatus.PROCESSING, timestamp: "2024-01-15T14:30:00Z", note: "Bắt đầu giặt hấp" },
    ],
  },
  "ORD-003": {
    id: "ORD-003",
    customerId: "CUST-003",
    customerName: "Lê Văn C",
    status: OrderStatus.COMPLETED,
    items: [
      { id: "ITEM-005", name: "Chăn ga", qty: 1, price: 200000 },
    ],
    total: 200000,
    createdAt: "2024-01-14T15:30:00Z",
    updatedAt: "2024-01-15T08:00:00Z",
    senderName: "Lê Văn C",
    senderPhone: "0923456789",
    lockerName: "Tủ KTX B",
    lockerCode: "ESP8266_03",
    sendBoxNumber: 12,
    receiveBoxNumber: 12,
    isPaid: true,
    paymentMethod: "CASH",
    timeline: [
      { status: OrderStatus.INITIALIZED, timestamp: "2024-01-14T15:30:00Z" },
      { status: OrderStatus.WAITING, timestamp: "2024-01-14T15:45:00Z" },
      { status: OrderStatus.COLLECTED, timestamp: "2024-01-14T16:30:00Z" },
      { status: OrderStatus.PROCESSING, timestamp: "2024-01-14T17:00:00Z" },
      { status: OrderStatus.READY, timestamp: "2024-01-14T20:00:00Z" },
      { status: OrderStatus.RETURNED, timestamp: "2024-01-15T07:00:00Z" },
      { status: OrderStatus.COMPLETED, timestamp: "2024-01-15T08:00:00Z" },
    ],
  },
  "ORD-004": {
    id: "ORD-004",
    customerId: "CUST-004",
    customerName: "Phạm Thị D",
    status: OrderStatus.WAITING,
    items: [
      { id: "ITEM-006", name: "Đầm dạ hội", qty: 1, price: 300000 },
    ],
    total: 300000,
    createdAt: "2024-01-16T08:00:00Z",
    updatedAt: "2024-01-16T08:15:00Z",
    notes: "Giặt khô, cẩn thận",
    senderName: "Phạm Thị D",
    senderPhone: "0934567890",
    lockerName: "Tủ Quận 3",
    lockerCode: "ESP8266_04",
    sendBoxNumber: 7,
    pinCode: "593817",
    isPaid: false,
    timeline: [
      { status: OrderStatus.INITIALIZED, timestamp: "2024-01-16T08:00:00Z" },
      { status: OrderStatus.WAITING, timestamp: "2024-01-16T08:15:00Z" },
    ],
  },
  "ORD-005": {
    id: "ORD-005",
    customerId: "CUST-005",
    customerName: "Hoàng Văn E",
    status: OrderStatus.CANCELED,
    items: [
      { id: "ITEM-007", name: "Quần tây", qty: 3, price: 40000 },
    ],
    total: 120000,
    createdAt: "2024-01-10T14:00:00Z",
    updatedAt: "2024-01-11T09:00:00Z",
    notes: "Khách hủy đơn",
    senderName: "Hoàng Văn E",
    senderPhone: "0945678901",
    lockerName: "Tủ KTX A",
    lockerCode: "ESP8266_01",
    sendBoxNumber: 2,
    isPaid: false,
    timeline: [
      { status: OrderStatus.INITIALIZED, timestamp: "2024-01-10T14:00:00Z" },
      { status: OrderStatus.CANCELED, timestamp: "2024-01-11T09:00:00Z", note: "Khách hủy đơn" },
    ],
  },
  "ORD-006": {
    id: "ORD-006",
    customerId: "CUST-006",
    customerName: "Ngô Thị F",
    status: OrderStatus.READY,
    items: [
      { id: "ITEM-008", name: "Áo khoác", qty: 1, price: 80000 },
    ],
    total: 80000,
    createdAt: "2024-01-12T11:00:00Z",
    updatedAt: "2024-01-14T16:00:00Z",
    senderName: "Ngô Thị F",
    senderPhone: "0956789012",
    lockerName: "Tủ Quận 1",
    lockerCode: "ESP8266_02",
    sendBoxNumber: 9,
    receiveBoxNumber: 4,
    actualWeight: 1.2,
    isPaid: false,
    timeline: [
      { status: OrderStatus.INITIALIZED, timestamp: "2024-01-12T11:00:00Z" },
      { status: OrderStatus.WAITING, timestamp: "2024-01-12T11:20:00Z" },
      { status: OrderStatus.COLLECTED, timestamp: "2024-01-12T14:00:00Z" },
      { status: OrderStatus.PROCESSING, timestamp: "2024-01-12T15:00:00Z" },
      { status: OrderStatus.READY, timestamp: "2024-01-14T16:00:00Z" },
    ],
  },
};

export function useOrderDetail(orderId: string | undefined) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    const timer = setTimeout(() => {
      const detail = mockOrderDetail[orderId];
      setOrder(detail || null);
      setIsLoading(false);
    }, mockDelay);

    return () => clearTimeout(timer);
  }, [orderId]);

  const cancelOrder = useCallback(() => {
    if (order) {
      setOrder({
        ...order,
        status: OrderStatus.CANCELED,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(order.timeline || []),
          {
            status: OrderStatus.CANCELED,
            timestamp: new Date().toISOString(),
            note: "Đơn hàng bị hủy bởi admin",
          },
        ],
      });
    }
  }, [order]);

  const updateStatus = useCallback((newStatus: OrderStatus) => {
    if (order) {
      setOrder({
        ...order,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(order.timeline || []),
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }
  }, [order]);

  return {
    order,
    isLoading,
    cancelOrder,
    updateStatus,
  };
}
