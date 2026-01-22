import type { ApiResponse, Store } from '@/types';
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

export const storeService = {
    getAllStores,
    getStoreById,
};

export default storeService;
