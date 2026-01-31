import { baseApi } from '../../baseAPi';
import { PARTNER_AUTH_ENDPOINTS } from '../../../constants';
import type { ApiResponse } from '../../../types';
import { PARTNER_TAGS } from './types';

// ============================================
// Types (Using User Auth Flow)
// ============================================

export interface SendEmailOTPRequest {
  email: string;
}

export interface VerifyEmailOTPRequest {
  email: string;
  otp: string;
}

export interface PhoneLoginRequest {
  phone: string;
}

export interface VerifyPhoneOTPRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    name?: string;
    fullName?: string;
    role?: string[];
    permissions?: string[];
  };
}

// ============================================
// API (Uses User Auth Endpoints)
// ============================================

export const partnerAuthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Email: Send OTP
    sendEmailOTP: builder.mutation<ApiResponse<{ message: string; email: string }>, SendEmailOTPRequest>({
      query: (data) => ({
        url: PARTNER_AUTH_ENDPOINTS.EMAIL_SEND_OTP,
        method: 'POST',
        body: data,
      }),
    }),

    // Email: Verify OTP and login (Partner is existing user)
    verifyEmailOTP: builder.mutation<ApiResponse<AuthResponse>, VerifyEmailOTPRequest>({
      query: (data) => ({
        url: PARTNER_AUTH_ENDPOINTS.EMAIL_VERIFY_OTP,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [PARTNER_TAGS.PARTNER, 'Auth'],
    }),

    // Phone: Login (sends OTP)
    phoneLogin: builder.mutation<ApiResponse<{ message: string; phone: string }>, PhoneLoginRequest>({
      query: (data) => ({
        url: PARTNER_AUTH_ENDPOINTS.PHONE_LOGIN,
        method: 'POST',
        body: data,
      }),
    }),

    // Phone: Verify OTP and login (Partner is existing user)
    verifyPhoneOTP: builder.mutation<ApiResponse<AuthResponse>, VerifyPhoneOTPRequest>({
      query: (data) => ({
        url: `${PARTNER_AUTH_ENDPOINTS.PHONE_LOGIN}/verify`, // Assuming this endpoint
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [PARTNER_TAGS.PARTNER, 'Auth'],
    }),
  }),
});

export const {
  useSendEmailOTPMutation,
  useVerifyEmailOTPMutation,
  usePhoneLoginMutation,
  useVerifyPhoneOTPMutation,
} = partnerAuthApi;
