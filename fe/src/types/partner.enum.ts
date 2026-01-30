// ============================================
// Partner Enums & Constants
// ============================================

export const OrderStatus = {
  RESERVED: "RESERVED",
  INITIALIZED: "INITIALIZED",
  WAITING: "WAITING",
  COLLECTED: "COLLECTED",
  PROCESSING: "PROCESSING",
  PROCESSED: "PROCESSED",
  RETURNED: "RETURNED",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ServiceType = {
  STORAGE: "STORAGE",
  LAUNDRY: "LAUNDRY",
  DELIVERY: "DELIVERY",
} as const;

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];

export const ReturnMethod = {
  LOCKER: "LOCKER",
  HOME_DELIVERY: "HOME_DELIVERY",
} as const;

export type ReturnMethod = (typeof ReturnMethod)[keyof typeof ReturnMethod];

export const StaffRole = {
  LAUNDRY_ATTENDANT: "LAUNDRY_ATTENDANT",
  DELIVERY_DRIVER: "DELIVERY_DRIVER",
  MANAGER: "MANAGER",
} as const;

export type StaffRole = (typeof StaffRole)[keyof typeof StaffRole];

export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  CASH: "CASH",
  QR_CODE: "QR_CODE",
  BANK_TRANSFER: "BANK_TRANSFER",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
