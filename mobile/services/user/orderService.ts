import type { ApiResponse, CreateOrderRequest, Order, OrderTrackingDetail, PaginatedResponse, PaymentMethod } from '@/types';
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
        `/orders/my-orders?page=${page}&size=${size}`
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
        `/orders/${id}/cancel`,
        { reason }
    );
    return response.data;
};

/**
 * Get detailed order status tracking
 */
export const getOrderStatus = async (id: number): Promise<ApiResponse<OrderTrackingDetail>> => {
    const response = await api.get<ApiResponse<OrderTrackingDetail>>(`/orders/${id}/status`);
    return response.data;
};

/**
 * Apply promotion code to an order
 * API: PUT /api/v1/orders/{orderId}/promotion?code={promotionCode}
 */
export const applyPromotion = async (
    orderId: number,
    promotionCode: string
): Promise<ApiResponse<Order>> => {
    const response = await api.put<ApiResponse<Order>>(
        `/orders/${orderId}/promotion?code=${promotionCode}`
    );
    return response.data;
};

/**
 * Remove promotion code from an order
 * API: DELETE /api/v1/orders/{orderId}/promotion
 */
export const removePromotion = async (orderId: number): Promise<ApiResponse<Order>> => {
    const response = await api.delete<ApiResponse<Order>>(`/orders/${orderId}/promotion`);
    return response.data;
};

/**
 * Complete order (customer picks up items)
 * API: PUT /api/v1/orders/{orderId}/complete
 */
export const completeOrder = async (orderId: number): Promise<ApiResponse<Order>> => {
    const response = await api.put<ApiResponse<Order>>(`/orders/${orderId}/complete`);
    return response.data;
};

export const orderService = {
    createOrder,
    getOrders,
    getOrderById,
    getOrderByPin,
    getOrderStatus,
    confirmOrder,
    checkoutOrder,
    cancelOrder,
    applyPromotion,
    removePromotion,
    completeOrder,
};

export default orderService;
