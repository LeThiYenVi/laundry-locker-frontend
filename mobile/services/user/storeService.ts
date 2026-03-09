import type { ApiResponse, Store, PaginatedResponse, OrderRatingResponse } from '@/types';
import api from '../api';

/**
 * Get all stores
 */
export const getAllStores = async (): Promise<ApiResponse<Store[]>> => {
    const response = await api.get<ApiResponse<Store[]>>('/stores');
    return response.data;
};

/**
 * Get store by ID
 */
export const getStoreById = async (id: number): Promise<ApiResponse<Store>> => {
    const response = await api.get<ApiResponse<Store>>(`/stores/${id}`);
    return response.data;
};

/**
 * Search nearby stores
 * API: GET /stores/nearby?latitude=...&longitude=...&radiusMeters=...&limit=...
 */
export const getNearbyStores = async (
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000,
    limit: number = 20
): Promise<ApiResponse<any[]>> => {
    const response = await api.get<ApiResponse<any[]>>(
        `/stores/nearby?latitude=${latitude}&longitude=${longitude}&radiusMeters=${radiusMeters}&limit=${limit}`
    );
    return response.data;
};

/**
 * Get store ratings
 * API: GET /stores/{storeId}/ratings
 */
export const getStoreRatings = async (
    storeId: number,
    page: number = 0,
    size: number = 10
): Promise<ApiResponse<PaginatedResponse<OrderRatingResponse>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<OrderRatingResponse>>>(
        `/stores/${storeId}/ratings?page=${page}&size=${size}`
    );
    return response.data;
};

export const storeService = {
    getAllStores,
    getStoreById,
    getNearbyStores,
    getStoreRatings,
};

export default storeService;
