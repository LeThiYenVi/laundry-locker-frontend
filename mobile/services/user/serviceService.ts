import type { ApiResponse, LaundryService } from '@/types';
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
 * Get service by ID
 */
export const getServiceById = async (id: number): Promise<ApiResponse<LaundryService>> => {
    const response = await api.get<ApiResponse<LaundryService>>(`/services/${id}`);
    return response.data;
};

export const serviceService = {
    getAllServices,
    getServicesByStore,
    getServiceById,
};

export default serviceService;
