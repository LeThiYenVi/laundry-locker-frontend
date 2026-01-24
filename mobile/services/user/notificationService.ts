import type { ApiResponse, Notification, PaginatedResponse } from '@/types';
import api from '../api';

/**
 * Get notifications with pagination
 */
export const getNotifications = async (
    page: number = 0,
    size: number = 20
): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Notification>>>(
        `/notifications?page=${page}&size=${size}`
    );
    return response.data;
};

/**
 * Get all notifications
 */
export const getAllNotifications = async (): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications/all');
    return response.data;
};

/**
 * Get unread notifications
 */
export const getUnreadNotifications = async (): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications/unread');
    return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread/count');
    return response.data;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id: number): Promise<ApiResponse<Notification>> => {
    const response = await api.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.put<ApiResponse<{ message: string }>>('/notifications/read-all');
    return response.data;
};

/**
 * Delete notification
 */
export const deleteNotification = async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/notifications/${id}`);
    return response.data;
};

export const notificationService = {
    getNotifications,
    getAllNotifications,
    getUnreadNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};

export default notificationService;
