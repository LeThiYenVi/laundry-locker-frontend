// API Base URLs
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://10.0.2.2:8080';

// Root URIs
export const ROOT_URI = {
  AUTH: '/api/auth',
  USERS: '/api/user',
  ADMIN: '/api/admin',
  PARTNER: '/api/partner',
} as const;

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  // Token Management
  REFRESH_TOKEN: `${ROOT_URI.AUTH}/refresh-token`,
  LOGOUT: `${ROOT_URI.AUTH}/logout`,

  // Email/Password Login
  LOGIN: `${ROOT_URI.AUTH}/login`,

  // Phone OTP Authentication
  PHONE_LOGIN: `${ROOT_URI.AUTH}/phone-login`,
  COMPLETE_REGISTRATION: `${ROOT_URI.AUTH}/complete-registration`,

  // Email OTP Authentication
  EMAIL_SEND_OTP: `${ROOT_URI.AUTH}/email/send-otp`,
  EMAIL_VERIFY_OTP: `${ROOT_URI.AUTH}/email/verify-otp`,
  EMAIL_COMPLETE_REGISTRATION: `${ROOT_URI.AUTH}/email/complete-registration`,
} as const;

// User Endpoints
export const USER_ENDPOINTS = {
  HELLO: `${ROOT_URI.USERS}/hello`,
  PROFILE: `${ROOT_URI.USERS}/profile`,
  DASHBOARD: `${ROOT_URI.USERS}/dashboard`,
  READ: `${ROOT_URI.USERS}/read`,
  SECURED: `${ROOT_URI.USERS}/secured`,
} as const;

// Admin Auth Endpoints
export const ADMIN_AUTH_ENDPOINTS = {
  LOGIN: `${ROOT_URI.ADMIN}/auth/login`,
  VERIFY_2FA: `${ROOT_URI.ADMIN}/auth/verify-2fa`,
  REFRESH: `${ROOT_URI.ADMIN}/auth/refresh`,
  LOGOUT: `${ROOT_URI.ADMIN}/auth/logout`,
} as const;

// Partner Auth Endpoints (Uses same as User Auth)
export const PARTNER_AUTH_ENDPOINTS = {
  PHONE_LOGIN: `${ROOT_URI.AUTH}/phone-login`,
  EMAIL_SEND_OTP: `${ROOT_URI.AUTH}/email/send-otp`,
  EMAIL_VERIFY_OTP: `${ROOT_URI.AUTH}/email/verify-otp`,
  REFRESH: `${ROOT_URI.AUTH}/refresh-token`,
  LOGOUT: `${ROOT_URI.AUTH}/logout`,
} as const;

// Admin Endpoints
export const ADMIN_ENDPOINTS = {
  // Dashboard
  DASHBOARD: `${ROOT_URI.ADMIN}/dashboard/overview`,

  // Users Management
  USERS: `${ROOT_URI.ADMIN}/users`,
  USER_BY_ID: (id: number) => `${ROOT_URI.ADMIN}/users/${id}`,
  USER_STATUS: (id: number) => `${ROOT_URI.ADMIN}/users/${id}/status`,
  USER_ROLES: (id: number) => `${ROOT_URI.ADMIN}/users/${id}/roles`,

  // Stores Management
  STORES: `${ROOT_URI.ADMIN}/stores`,
  STORE_BY_ID: (id: number) => `${ROOT_URI.ADMIN}/stores/${id}`,
  STORE_STATUS: (id: number) => `${ROOT_URI.ADMIN}/stores/${id}/status`,

  // Services Management
  SERVICES: `${ROOT_URI.ADMIN}/services`,
  SERVICE_BY_ID: (id: number) => `${ROOT_URI.ADMIN}/services/${id}`,
  SERVICE_PRICE: (id: number) => `${ROOT_URI.ADMIN}/services/${id}/price`,
  SERVICE_STATUS: (id: number) => `${ROOT_URI.ADMIN}/services/${id}/status`,

  // Lockers Management
  LOCKERS: `${ROOT_URI.ADMIN}/lockers`,
  LOCKER_BY_ID: (id: number) => `${ROOT_URI.ADMIN}/lockers/${id}`,
  LOCKERS_BY_STORE: (storeId: number) => `${ROOT_URI.ADMIN}/lockers/store/${storeId}`,
  LOCKER_MAINTENANCE: (id: number) => `${ROOT_URI.ADMIN}/lockers/${id}/maintenance`,
  LOCKER_BOXES: (id: number) => `${ROOT_URI.ADMIN}/lockers/${id}/boxes`,
  BOX_STATUS: (boxId: number) => `${ROOT_URI.ADMIN}/lockers/boxes/${boxId}/status`,

  // Orders Management
  ORDERS: `${ROOT_URI.ADMIN}/orders`,
  ORDER_BY_ID: (id: number) => `${ROOT_URI.ADMIN}/orders/${id}`,
  ORDER_STATUS: (id: number) => `${ROOT_URI.ADMIN}/orders/${id}/status`,
  ORDER_STATISTICS: `${ROOT_URI.ADMIN}/orders/statistics`,
  ORDER_REVENUE: `${ROOT_URI.ADMIN}/orders/revenue`,

  // Payments Management
  PAYMENTS: `${ROOT_URI.ADMIN}/payments`,
  PAYMENT_BY_ID: (paymentId: number) => `${ROOT_URI.ADMIN}/payments/${paymentId}`,
  PAYMENT_STATUS: (paymentId: number) => `${ROOT_URI.ADMIN}/payments/${paymentId}/status`,

  // Scheduler Management
  SCHEDULER_AUTO_CANCEL: `${ROOT_URI.ADMIN}/scheduler/auto-cancel`,
  SCHEDULER_RELEASE_BOXES: `${ROOT_URI.ADMIN}/scheduler/release-boxes`,
  SCHEDULER_PICKUP_REMINDERS: `${ROOT_URI.ADMIN}/scheduler/pickup-reminders`,
  SCHEDULER_STATUS: `${ROOT_URI.ADMIN}/scheduler/status`,

  // Loyalty Management
  LOYALTY_USERS: (userId: number) => `${ROOT_URI.ADMIN}/loyalty/users/${userId}`,
  LOYALTY_POINTS: (userId: number) => `${ROOT_URI.ADMIN}/loyalty/users/${userId}/points`,
  LOYALTY_HISTORY: (userId: number) => `${ROOT_URI.ADMIN}/loyalty/users/${userId}/history`,
  LOYALTY_STATISTICS: `${ROOT_URI.ADMIN}/loyalty/statistics`,

  // Partner Management
  PARTNERS: `${ROOT_URI.ADMIN}/partners`,
  PARTNER_BY_ID: (partnerId: number) => `${ROOT_URI.ADMIN}/partners/${partnerId}`,
  PARTNER_APPROVE: (partnerId: number) => `${ROOT_URI.ADMIN}/partners/${partnerId}/approve`,
  PARTNER_REJECT: (partnerId: number) => `${ROOT_URI.ADMIN}/partners/${partnerId}/reject`,
  PARTNER_SUSPEND: (partnerId: number) => `${ROOT_URI.ADMIN}/partners/${partnerId}/suspend`,

  // Legacy (keep for backward compatibility)
  ANALYTICS: `${ROOT_URI.ADMIN}/analytics`,
  SCHEDULE: `${ROOT_URI.ADMIN}/schedule`,
  INTEGRATIONS: `${ROOT_URI.ADMIN}/integrations`,
  SETTINGS: `${ROOT_URI.ADMIN}/settings`,
} as const;

// Partner Endpoints
export const PARTNER_ENDPOINTS = {
  // Profile
  PARTNER_PROFILE: `${ROOT_URI.PARTNER}`,
  PARTNER_REGISTER: `${ROOT_URI.PARTNER}`,
  PARTNER_UPDATE: `${ROOT_URI.PARTNER}`,
  
  // Dashboard
  PARTNER_DASHBOARD: `${ROOT_URI.PARTNER}/dashboard`,
  
  // Orders
  PARTNER_ORDERS_PENDING: `${ROOT_URI.PARTNER}/orders/pending`,
  PARTNER_ORDERS: `${ROOT_URI.PARTNER}/orders`,
  PARTNER_ORDER_BY_ID: (orderId: number) => `${ROOT_URI.PARTNER}/orders/${orderId}`,
  PARTNER_ORDER_ACCEPT: (orderId: number) => `${ROOT_URI.PARTNER}/orders/${orderId}/accept`,
  PARTNER_ORDER_PROCESS: (orderId: number) => `${ROOT_URI.PARTNER}/orders/${orderId}/process`,
  PARTNER_ORDER_READY: (orderId: number) => `${ROOT_URI.PARTNER}/orders/${orderId}/ready`,
  PARTNER_ORDER_WEIGHT: (orderId: number) => `${ROOT_URI.PARTNER}/orders/${orderId}/weight`,
  
  // Access Codes
  PARTNER_ACCESS_CODES_GENERATE: `${ROOT_URI.PARTNER}/access-codes/generate`,
  PARTNER_ACCESS_CODES: `${ROOT_URI.PARTNER}/access-codes`,
  PARTNER_ACCESS_CODES_BY_ORDER: (orderId: number) => `${ROOT_URI.PARTNER}/access-codes/order/${orderId}`,
  PARTNER_ACCESS_CODE_CANCEL: (codeId: number) => `${ROOT_URI.PARTNER}/access-codes/${codeId}/cancel`,
  
  // Stores
  PARTNER_STORES: `${ROOT_URI.PARTNER}/stores`,
  
  // Staff
  PARTNER_STAFF: `${ROOT_URI.PARTNER}/staff`,
  PARTNER_STAFF_ADD: (staffId: number) => `${ROOT_URI.PARTNER}/staff/${staffId}`,
  PARTNER_STAFF_REMOVE: (staffId: number) => `${ROOT_URI.PARTNER}/staff/${staffId}`,
  
  // Lockers
  PARTNER_LOCKERS: `${ROOT_URI.PARTNER}/lockers`,
  PARTNER_LOCKER_AVAILABLE_BOXES: (lockerId: number) => `${ROOT_URI.PARTNER}/lockers/${lockerId}/boxes/available`,
  
  // Revenue & Statistics
  PARTNER_REVENUE: `${ROOT_URI.PARTNER}/revenue`,
  PARTNER_ORDER_STATISTICS: `${ROOT_URI.PARTNER}/orders/statistics`,
} as const;

// Combined API Paths for RTK Query
export const API_PATHS = {
  ...AUTH_ENDPOINTS,
  ...USER_ENDPOINTS,
  ...ADMIN_AUTH_ENDPOINTS,
  ...ADMIN_ENDPOINTS,
  ...PARTNER_AUTH_ENDPOINTS,
  ...PARTNER_ENDPOINTS,
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;

// API Response Status
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Error Messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;
