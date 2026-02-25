import type { ApiResponse, User } from '@/types';
import api from '../api';

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    birthday?: string;
}): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>('/user/profile', data);
    return response.data;
};

/**
 * Update user avatar
 */
export const updateAvatar = async (imageUrl: string): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>('/user/avatar', { imageUrl });
    return response.data;
};

/**
 * Change password
 */
export const changePassword = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}): Promise<ApiResponse<any>> => {
    const response = await api.put<ApiResponse<any>>('/user/password', data);
    return response.data;
};

/**
 * Register FCM token for push notifications
 */
export const registerFcmToken = async (fcmToken: string): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/user/fcm-token', { fcmToken });
    return response.data;
};

export const userService = {
    getProfile,
    updateProfile,
    updateAvatar,
    changePassword,
    registerFcmToken,
};

export default userService;

