// API Base URLs
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Root URIs
export const ROOT_URI = {
  AUTH: '/api/auth',
  USERS: '/api/user',
  ADMIN: '/api/admin',
} as const;

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  // Token Management
  REFRESH_TOKEN: `${ROOT_URI.AUTH}/refresh-token`,
  LOGOUT: `${ROOT_URI.AUTH}/logout`,

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

// Admin Endpoints
export const ADMIN_ENDPOINTS = {
  DASHBOARD: `${ROOT_URI.ADMIN}/dashboard`,
  USERS: `${ROOT_URI.ADMIN}/users`,
  LOCKERS: `${ROOT_URI.ADMIN}/lockers`,
  ORDERS: `${ROOT_URI.ADMIN}/orders`,
  ANALYTICS: `${ROOT_URI.ADMIN}/analytics`,
  SCHEDULE: `${ROOT_URI.ADMIN}/schedule`,
  INTEGRATIONS: `${ROOT_URI.ADMIN}/integrations`,
  SETTINGS: `${ROOT_URI.ADMIN}/settings`,
} as const;

// Combined API Paths for RTK Query
export const API_PATHS = {
  ...AUTH_ENDPOINTS,
  ...USER_ENDPOINTS,
  ...ADMIN_ENDPOINTS,
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