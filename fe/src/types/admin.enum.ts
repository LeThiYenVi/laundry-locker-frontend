// ============================================
// Admin Enums & Constants
// ============================================

// User Management Enums
export const AuthProvider = {
  LOCAL: "LOCAL",
  GOOGLE: "GOOGLE",
  FACEBOOK: "FACEBOOK",
} as const;

export type AuthProvider = typeof AuthProvider[keyof typeof AuthProvider];

export const RoleName = {
  USER: "USER",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
} as const;

export type RoleName = typeof RoleName[keyof typeof RoleName];

// Locker & Box Management Enums
export const LockerStatus = {
  ACTIVE: "ACTIVE",
  MAINTENANCE: "MAINTENANCE",
  INACTIVE: "INACTIVE",
} as const;

export type LockerStatus = typeof LockerStatus[keyof typeof LockerStatus];

export const BoxStatus = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  RESERVED: "RESERVED",
  MAINTENANCE: "MAINTENANCE",
} as const;

export type BoxStatus = typeof BoxStatus[keyof typeof BoxStatus];

// Order Management Enums
export const OrderType = {
  LAUNDRY: "LAUNDRY",
  DELIVERY: "DELIVERY",
  STORAGE: "STORAGE",
} as const;

export type OrderType = typeof OrderType[keyof typeof OrderType];

export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PROCESSING: "PROCESSING",
  READY: "READY",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// Payment Management Enums
export const PaymentMethod = {
  CASH: "CASH",
  CARD: "CARD",
  MOMO: "MOMO",
  VNPAY: "VNPAY",
  ZALOPAY: "ZALOPAY",
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];
