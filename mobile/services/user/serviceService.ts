import type { ApiResponse, LaundryService, ServiceCategory } from '@/types';
import api from '../api';

/**
 * Get all laundry services
 */
export const getAllServices = async (): Promise<ApiResponse<LaundryService[]>> => {
    const response = await api.get<ApiResponse<LaundryService[]>>('/services');
    return response.data;
};

/**
 * Get services by store ID
 */
export const getServicesByStore = async (storeId: number): Promise<ApiResponse<LaundryService[]>> => {
    const response = await api.get<ApiResponse<LaundryService[]>>(`/services?storeId=${storeId}`);
    return response.data;
};

/**
 * Get services filtered by category (STORAGE or LAUNDRY)
 */
export const getServicesByCategory = async (category: ServiceCategory): Promise<ApiResponse<LaundryService[]>> => {
    const response = await api.get<ApiResponse<LaundryService[]>>(`/services?category=${category}`);
    return response.data;
};

/**
 * Get services by store ID and category
 */
export const getServicesByStoreAndCategory = async (
    storeId: number,
    category: ServiceCategory
): Promise<ApiResponse<LaundryService[]>> => {
    const response = await api.get<ApiResponse<LaundryService[]>>(`/services?storeId=${storeId}&category=${category}`);
    return response.data;
};

/**
 * Get service by ID
 */
export const getServiceById = async (id: number): Promise<ApiResponse<LaundryService>> => {
    const response = await api.get<ApiResponse<LaundryService>>(`/services/${id}`);
    return response.data;
};

export const serviceService = {
    getAllServices,
    getServicesByStore,
    getServicesByCategory,
    getServicesByStoreAndCategory,
    getServiceById,
};

export default serviceService;
