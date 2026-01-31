import { ADMIN_AUTH_ENDPOINTS } from "../../constants";
import { baseApi } from "../baseAPi";

// Admin User type
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role?: string[];
  permissions?: string[];
}

// Step 1: Login Request/Response
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  requiresTwoFactor: boolean;
  tempToken: string;
  expiresIn: number;
  maskedEmail: string;
  message: string;
}

// Step 2: Verify 2FA Request/Response
export interface AdminVerify2FARequest {
  tempToken: string;
  otpCode: string;
}

export interface AdminVerify2FAResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AdminUser;
}

// Refresh Token
export interface AdminRefreshRequest {
  refreshToken: string;
}

export interface AdminRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp?: string;
}

export const adminAuthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Step 1: Admin Login (email + password)
    adminLogin: builder.mutation<ApiResponse<AdminLoginResponse>, AdminLoginRequest>({
      query: (credentials) => ({
        url: ADMIN_AUTH_ENDPOINTS.LOGIN,
        method: "POST",
        body: credentials,
      }),
    }),

    // Step 2: Verify 2FA (tempToken + OTP)
    adminVerify2FA: builder.mutation<ApiResponse<AdminVerify2FAResponse>, AdminVerify2FARequest>({
      query: (data) => ({
        url: ADMIN_AUTH_ENDPOINTS.VERIFY_2FA,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Refresh Token
    adminRefreshToken: builder.mutation<ApiResponse<AdminRefreshResponse>, AdminRefreshRequest>({
      query: (data) => ({
        url: ADMIN_AUTH_ENDPOINTS.REFRESH,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Admin Logout
    adminLogout: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: ADMIN_AUTH_ENDPOINTS.LOGOUT,
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useAdminVerify2FAMutation,
  useAdminRefreshTokenMutation,
  useAdminLogoutMutation,
} = adminAuthApi;
