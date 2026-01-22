import type { ApiResponse, Order } from '@/types';
import api from '../api';

/**
 * [Staff/Partner] Collect order from locker
 */
export const collectOrder = async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}/collect`);
    return response.data;
};

/**
 * [Staff/Partner] Mark order as processing
 */
export const processOrder = async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}/process`);
    return response.data;
};

/**
 * [Staff/Partner] Mark order as ready
 */
export const markReady = async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}/ready`);
    return response.data;
};

/**
 * [Staff/Partner] Return order to locker
 */
export const returnOrder = async (id: number, boxId: number): Promise<ApiResponse<Order>> => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}/return?boxId=${boxId}`);
    return response.data;
};

export const partnerOrderService = {
    collectOrder,
    processOrder,
    markReady,
    returnOrder,
};

export default partnerOrderService;
