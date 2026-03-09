import type { ApiResponse, Box, Locker, LockerReportRequest, LockerReportResponse } from '@/types';
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

/**
 * Report a broken locker
 */
export const reportLocker = async (
    lockerId: number,
    data: LockerReportRequest
): Promise<ApiResponse<LockerReportResponse>> => {
    const response = await api.post<ApiResponse<LockerReportResponse>>(`/lockers/${lockerId}/report`, data);
    return response.data;
};

export const lockerService = {
    getAllLockers,
    getLockersByStore,
    getLockerById,
    getBoxesByLocker,
    getAvailableBoxes,
    reportLocker,
};

export default lockerService;
