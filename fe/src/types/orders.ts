export const OrderStatus= {
  INITIALIZED : "INITIALIZED",
  RESERVED : "RESERVED",
  WAITING : "WAITING",
  COLLECTED : "COLLECTED",
  PROCESSING : "PROCESSING",
  READY : "READY",
  RETURNED : "RETURNED",
  COMPLETED : "COMPLETED",
  CANCELED : "CANCELED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export type OrderItem = {
  id: string;
  sku?: string;
  name?: string;
  qty: number;
  price?: number; // per-item price
};

export interface Order {
  id: string;
  customerId?: string;
  customerName?: string;
  status: OrderStatus;
  items?: OrderItem[];
  total?: number; // total in cents or number depending on app conventions
  createdAt?: string; // ISO date
  updatedAt?: string; // ISO date
  notes?: string;
}

export type OrderSummary = Pick<Order, "id" | "customerName" | "status" | "total" | "createdAt">;

export const isTerminalStatus = (s: OrderStatus) =>
  s === OrderStatus.COMPLETED || s === OrderStatus.CANCELED || s === OrderStatus.RETURNED;
