import type {
    ApiResponse,
    AuthTokens,
    CompleteRegistrationRequest,
    LogoutRequest,
    PhoneLoginRequest,
    PhoneLoginResponse,
    RefreshTokenRequest,
    SendOtpRequest,
    VerifyOtpRequest,
    VerifyOtpResponse,
} from '@/types';
import api from '../api';

/**
 * Phone Login - Firebase phone authentication
 */
export const phoneLogin = async (idToken: string): Promise<ApiResponse<PhoneLoginResponse>> => {
    const payload: PhoneLoginRequest = { idToken };
    const response = await api.post<ApiResponse<PhoneLoginResponse>>('/auth/phone-login', payload);
    return response.data;
};

/**
 * Complete Registration after phone login
 */
export const completeRegistration = async (
    data: CompleteRegistrationRequest
): Promise<ApiResponse<AuthTokens>> => {
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/complete-registration', data);
    return response.data;
};

/**
 * Send Email OTP
 */
export const sendEmailOtp = async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const payload: SendOtpRequest = { email };
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/email/send-otp', payload);
    return response.data;
};

/**
 * Verify Email OTP
 */
export const verifyEmailOtp = async (
    email: string,
    otp: string
): Promise<ApiResponse<VerifyOtpResponse>> => {
    const payload: VerifyOtpRequest = { email, otp };
    const response = await api.post<ApiResponse<VerifyOtpResponse>>('/auth/email/verify-otp', payload);
    return response.data;
};

/**
 * Complete Registration after email verification
 */
export const emailCompleteRegistration = async (
    data: CompleteRegistrationRequest
): Promise<ApiResponse<AuthTokens>> => {
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/email/complete-registration', data);
    return response.data;
};

/**
 * Refresh Token
 */
export const refreshToken = async (token: string): Promise<ApiResponse<AuthTokens>> => {
    const payload: RefreshTokenRequest = { refreshToken: token };
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/refresh-token', payload);
    return response.data;
};

/**
 * Logout
 */
export const logout = async (token: string): Promise<ApiResponse<{ message: string }>> => {
    const payload: LogoutRequest = { refreshToken: token };
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/logout', payload);
    return response.data;
};

export const authService = {
    phoneLogin,
    completeRegistration,
    sendEmailOtp,
    verifyEmailOtp,
    emailCompleteRegistration,
    refreshToken,
    logout,
};

export default authService;
