import type { ApiResponse, CreateOrderRequest, Order, OrderComplaintRequest, OrderComplaintResponse, OrderRatingRequest, OrderRatingResponse, OrderTimelineResponse, OrderTrackingDetail, PaginatedResponse, PaymentMethod } from '@/types';
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
        `/orders/my-orders?page=${page}&size=${size}&sort=createdAt,desc`
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

/**
 * Pickup Storage Order
 * API: POST /api/v1/orders/{orderId}/pickup-storage
 */
export const pickupStorageOrder = async (orderId: number): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/pickup-storage`);
    return response.data;
};

/**
 * Reset Order PIN
 * API: POST /api/v1/orders/{orderId}/reset-pin
 */
export const resetOrderPin = async (orderId: number): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/reset-pin`);
    return response.data;
};

/**
 * Rate a completed order
 * API: POST /api/v1/orders/{orderId}/rate
 */
export const rateOrder = async (
    orderId: number,
    data: OrderRatingRequest
): Promise<ApiResponse<OrderRatingResponse>> => {
    const response = await api.post<ApiResponse<OrderRatingResponse>>(`/orders/${orderId}/rate`, data);
    return response.data;
};

/**
 * Get order rating
 * API: GET /api/v1/orders/{orderId}/rating
 */
export const getOrderRating = async (orderId: number): Promise<ApiResponse<OrderRatingResponse>> => {
    const response = await api.get<ApiResponse<OrderRatingResponse>>(`/orders/${orderId}/rating`);
    return response.data;
};

/**
 * Get all ratings by current user
 * API: GET /api/v1/orders/my-ratings
 */
export const getMyRatings = async (): Promise<ApiResponse<OrderRatingResponse[]>> => {
    const response = await api.get<ApiResponse<OrderRatingResponse[]>>('/orders/my-ratings');
    return response.data;
};

/**
 * Get order timeline
 * API: GET /api/v1/orders/{orderId}/timeline
 */
export const getOrderTimeline = async (orderId: number): Promise<ApiResponse<OrderTimelineResponse>> => {
    const response = await api.get<ApiResponse<OrderTimelineResponse>>(`/orders/${orderId}/timeline`);
    return response.data;
};

/**
 * Get order by order code (e.g., ORD-20260202-ABC123)
 * API: GET /api/v1/orders/code/{orderCode}
 */
export const getOrderByCode = async (orderCode: string): Promise<ApiResponse<Order>> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/code/${orderCode}`);
    return response.data;
};

/**
 * Create complaint for a completed order
 * API: POST /api/v1/orders/{orderId}/complaint
 */
export const createComplaint = async (
    orderId: number,
    data: OrderComplaintRequest
): Promise<ApiResponse<OrderComplaintResponse>> => {
    const response = await api.post<ApiResponse<OrderComplaintResponse>>(`/orders/${orderId}/complaint`, data);
    return response.data;
};

/**
 * Get complaints for an order
 * API: GET /api/v1/orders/{orderId}/complaints
 */
export const getOrderComplaints = async (orderId: number): Promise<ApiResponse<OrderComplaintResponse[]>> => {
    const response = await api.get<ApiResponse<OrderComplaintResponse[]>>(`/orders/${orderId}/complaints`);
    return response.data;
};

/**
 * Get all complaints by current user
 * API: GET /api/v1/orders/my-complaints
 */
export const getMyComplaints = async (): Promise<ApiResponse<OrderComplaintResponse[]>> => {
    const response = await api.get<ApiResponse<OrderComplaintResponse[]>>('/orders/my-complaints');
    return response.data;
};
/**
 * Reorder — Clone from existing completed/canceled order
 * API: POST /api/v1/orders/{orderId}/reorder
 */
export const reorderFromExisting = async (orderId: number): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>(`/orders/${orderId}/reorder`);
    return response.data;
};

export const orderService = {
    createOrder,
    getOrders,
    getOrderById,
    getOrderByPin,
    getOrderByCode,
    getOrderStatus,
    getOrderTimeline,
    confirmOrder,
    checkoutOrder,
    cancelOrder,
    applyPromotion,
    removePromotion,
    completeOrder,
    pickupStorageOrder,
    resetOrderPin,
    rateOrder,
    getOrderRating,
    getMyRatings,
    createComplaint,
    getOrderComplaints,
    getMyComplaints,
    reorderFromExisting,
};

export default orderService;
