// ============================================
// Partner Enums
// ============================================

export const OrderStatus = {
  INITIALIZED: "INITIALIZED",
  RESERVED: "RESERVED",
  WAITING: "WAITING",
  COLLECTED: "COLLECTED",
  PROCESSING: "PROCESSING",
  READY: "READY",
  RETURNED: "RETURNED",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderType = {
  LAUNDRY: "LAUNDRY",
  DRY_CLEAN: "DRY_CLEAN",
  STORAGE: "STORAGE",
} as const;

export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export const PartnerStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  SUSPENDED: "SUSPENDED",
} as const;

export type PartnerStatus = (typeof PartnerStatus)[keyof typeof PartnerStatus];

export const AccessCodeAction = {
  COLLECT: "COLLECT",
  RETURN: "RETURN",
} as const;

export type AccessCodeAction = (typeof AccessCodeAction)[keyof typeof AccessCodeAction];

export const AccessCodeStatus = {
  ACTIVE: "ACTIVE",
  USED: "USED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;

export type AccessCodeStatus = (typeof AccessCodeStatus)[keyof typeof AccessCodeStatus];

export const BoxStatus = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  RESERVED: "RESERVED",
  MAINTENANCE: "MAINTENANCE",
} as const;

export type BoxStatus = (typeof BoxStatus)[keyof typeof BoxStatus];

export const LockerStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  MAINTENANCE: "MAINTENANCE",
  DISCONNECTED: "DISCONNECTED",
} as const;

export type LockerStatus = (typeof LockerStatus)[keyof typeof LockerStatus];

export const StoreStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  CLOSED: "CLOSED",
} as const;

export type StoreStatus = (typeof StoreStatus)[keyof typeof StoreStatus];

export const ServiceType = {
  STORAGE: "STORAGE",
  LAUNDRY: "LAUNDRY",
  DELIVERY: "DELIVERY",
} as const;

export type ServiceType = (typeof ServiceType)[keyof typeof ServiceType];

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
  BANK_TRANSFER: "BANK_TRANSFER",
  MOMO: "MOMO",
  VNPAY: "VNPAY",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const ReturnMethod = {
  LOCKER: "LOCKER",
  HOME_DELIVERY: "HOME_DELIVERY",
} as const;

export type ReturnMethod = (typeof ReturnMethod)[keyof typeof ReturnMethod];
