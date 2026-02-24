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
 * Update user avatar
 */
export const updateAvatar = async (imageUrl: string): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>('/user/avatar', { imageUrl });
    return response.data;
};

export const userService = {
    getProfile,
    updateAvatar,
};

export default userService;
