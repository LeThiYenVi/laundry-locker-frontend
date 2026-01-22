import type { ApiResponse, Box, Locker } from '@/types';
import api from '../api';

/**
 * Get all lockers
 */
export const getAllLockers = async (): Promise<ApiResponse<Locker[]>> => {
    const response = await api.get<ApiResponse<Locker[]>>('/lockers');
    return response.data;
};

/**
 * Get lockers by store ID
 */
export const getLockersByStore = async (storeId: number): Promise<ApiResponse<Locker[]>> => {
    const response = await api.get<ApiResponse<Locker[]>>(`/lockers?storeId=${storeId}`);
    return response.data;
};

/**
 * Get locker by ID
 */
export const getLockerById = async (id: number): Promise<ApiResponse<Locker>> => {
    const response = await api.get<ApiResponse<Locker>>(`/lockers/${id}`);
    return response.data;
};

/**
 * Get all boxes in a locker
 */
export const getBoxesByLocker = async (lockerId: number): Promise<ApiResponse<Box[]>> => {
    const response = await api.get<ApiResponse<Box[]>>(`/lockers/${lockerId}/boxes`);
    return response.data;
};

/**
 * Get available boxes in a locker
 */
export const getAvailableBoxes = async (lockerId: number): Promise<ApiResponse<Box[]>> => {
    const response = await api.get<ApiResponse<Box[]>>(`/lockers/${lockerId}/boxes/available`);
    return response.data;
};

export const lockerService = {
    getAllLockers,
    getLockersByStore,
    getLockerById,
    getBoxesByLocker,
    getAvailableBoxes,
};

export default lockerService;
