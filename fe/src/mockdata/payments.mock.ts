import { PaymentStatus, PaymentMethod } from "~/types/admin/enums";

export interface MockPayment {
  id: string;
  orderId: string;
  orderCode: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export const mockPayments: MockPayment[] = [
  {
    id: "PAY-001",
    orderId: "ORD-001",
    orderCode: "ORD-001",
    customerName: "Nguyễn Văn A",
    amount: 150000,
    method: PaymentMethod.MOMO,
    status: PaymentStatus.COMPLETED,
    transactionId: "MOMO123456",
    paidAt: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "PAY-002",
    orderId: "ORD-002",
    orderCode: "ORD-002",
    customerName: "Trần Thị B",
    amount: 250000,
    method: PaymentMethod.VNPAY,
    status: PaymentStatus.COMPLETED,
    transactionId: "VNPAY789012",
    paidAt: "2024-01-15T09:00:00Z",
    createdAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "PAY-003",
    orderId: "ORD-003",
    orderCode: "ORD-003",
    customerName: "Lê Văn C",
    amount: 180000,
    method: PaymentMethod.CASH,
    status: PaymentStatus.PENDING,
    createdAt: "2024-01-14T15:30:00Z",
  },
  {
    id: "PAY-004",
    orderId: "ORD-004",
    orderCode: "ORD-004",
    customerName: "Phạm Thị D",
    amount: 300000,
    method: PaymentMethod.BANK_TRANSFER,
    status: PaymentStatus.PROCESSING,
    createdAt: "2024-01-16T08:00:00Z",
  },
  {
    id: "PAY-005",
    orderId: "ORD-005",
    orderCode: "ORD-005",
    customerName: "Hoàng Văn E",
    amount: 120000,
    method: PaymentMethod.WALLET,
    status: PaymentStatus.FAILED,
    createdAt: "2024-01-10T14:00:00Z",
  },
];

export const getPaginatedPayments = (page: number, size: number) => {
  const start = page * size;
  const end = start + size;
  const content = mockPayments.slice(start, end);
  
  return {
    content,
    totalElements: mockPayments.length,
    totalPages: Math.ceil(mockPayments.length / size),
    pageNumber: page,
    pageSize: size,
  };
};

export const paymentStatistics = {
  total: mockPayments.length,
  completed: mockPayments.filter(p => p.status === PaymentStatus.COMPLETED).length,
  pending: mockPayments.filter(p => p.status === PaymentStatus.PENDING).length,
  processing: mockPayments.filter(p => p.status === PaymentStatus.PROCESSING).length,
  failed: mockPayments.filter(p => p.status === PaymentStatus.FAILED).length,
  refunded: mockPayments.filter(p => p.status === PaymentStatus.REFUNDED).length,
  totalAmount: mockPayments.reduce((acc, p) => acc + p.amount, 0),
};
