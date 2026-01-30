// ============================================
// Admin Enums & Constants (from api.md)
// ============================================

// ============================================
// Auth Provider
// ============================================
export const AuthProvider = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
  FACEBOOK: 'FACEBOOK',
  GITHUB: 'GITHUB',
  ZALO: 'ZALO',
  PHONE: 'PHONE',
  EMAIL: 'EMAIL',
} as const;

export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];

// ============================================
// Role Name
// ============================================
export const RoleName = {
  USER: 'USER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  PARTNER: 'PARTNER',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

// ============================================
// Locker Status
// ============================================
export const LockerStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE',
  DISCONNECTED: 'DISCONNECTED',
} as const;

export type LockerStatus = (typeof LockerStatus)[keyof typeof LockerStatus];

// ============================================
// Box Status
// ============================================
export const BoxStatus = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  RESERVED: 'RESERVED',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type BoxStatus = (typeof BoxStatus)[keyof typeof BoxStatus];

// ============================================
// Order Type
// ============================================
export const OrderType = {
  LAUNDRY: 'LAUNDRY',
  DRY_CLEAN: 'DRY_CLEAN',
  STORAGE: 'STORAGE',
} as const;

export type OrderType = (typeof OrderType)[keyof typeof OrderType];

// ============================================
// Order Status
// ============================================
export const OrderStatus = {
  INITIALIZED: 'INITIALIZED',
  RESERVED: 'RESERVED',
  WAITING: 'WAITING',
  COLLECTED: 'COLLECTED',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  RETURNED: 'RETURNED',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// ============================================
// Payment Method
// ============================================
export const PaymentMethod = {
  CASH: 'CASH',
  WALLET: 'WALLET',
  BANK_TRANSFER: 'BANK_TRANSFER',
  MOMO: 'MOMO',
  VNPAY: 'VNPAY',
  ZALOPAY: 'ZALOPAY',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

// ============================================
// Payment Status
// ============================================
export const PaymentStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELED: 'CANCELED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// ============================================
// Partner Status
// ============================================
export const PartnerStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const;

export type PartnerStatus = (typeof PartnerStatus)[keyof typeof PartnerStatus];

// ============================================
// Point Transaction Type
// ============================================
export const PointTransactionType = {
  EARN: 'EARN',
  REDEEM: 'REDEEM',
  EXPIRE: 'EXPIRE',
  ADJUST: 'ADJUST',
  BONUS: 'BONUS',
  REFUND: 'REFUND',
} as const;

export type PointTransactionType =
  (typeof PointTransactionType)[keyof typeof PointTransactionType];

// ============================================
// Stamp Type
// ============================================
export const StampType = {
  BOX: 'BOX',
  SERVICE: 'SERVICE',
} as const;

export type StampType = (typeof StampType)[keyof typeof StampType];
