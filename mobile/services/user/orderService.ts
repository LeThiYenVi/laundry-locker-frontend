import type { ApiResponse, CreateOrderRequest, Order, PaginatedResponse, PaymentMethod } from '@/types';
import api from '../api';

/**
 * Create a new order
 */
export const createOrder = async (data: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data;
};

/**
 * Get orders with pagination
 */
export const getOrders = async (
    page: number = 0,
    size: number = 10
): Promise<ApiResponse<PaginatedResponse<Order>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>(
        `/orders?page=${page}&size=${size}`
    );
    return response.data;
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
};

/**
 * Get order by PIN
 */
export const getOrderByPin = async (pin: string): Promise<ApiResponse<Order>> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/pin/${pin}`);
    return response.data;
};

/**
 * Confirm order (after placing items in locker)
 */
export const confirmOrder = async (id: number): Promise<ApiResponse<Order>> => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}/confirm`);
    return response.data;
};

/**
 * Checkout order with payment method
 */
export const checkoutOrder = async (
    id: number,
    paymentMethod: PaymentMethod
): Promise<ApiResponse<{ paymentUrl: string }>> => {
    const response = await api.post<ApiResponse<{ paymentUrl: string }>>(
        `/orders/${id}/checkout`,
        { paymentMethod }
    );
    return response.data;
};

/**
 * Cancel order
 */
export const cancelOrder = async (id: number, reason: string): Promise<ApiResponse<Order>> => {
    const response = await api.put<ApiResponse<Order>>(
        `/orders/${id}/cancel?reason=${encodeURIComponent(reason)}`
    );
    return response.data;
};

export const orderService = {
    createOrder,
    getOrders,
    getOrderById,
    getOrderByPin,
    confirmOrder,
    checkoutOrder,
    cancelOrder,
};

export default orderService;
