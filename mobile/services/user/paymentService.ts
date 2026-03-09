import type { ApiResponse, Payment, PaymentMethod, RefundResponse } from '@/types';
import api from '../api';

/**
 * Create payment for an order
 */
export const createPayment = async (
    orderId: number,
    paymentMethod: PaymentMethod
): Promise<ApiResponse<Payment>> => {
    const response = await api.post<ApiResponse<Payment>>('/payments/create', {
        orderId,
        paymentMethod,
    });
    return response.data;
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (id: number): Promise<ApiResponse<Payment>> => {
    const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data;
};

/**
 * Get all payments for an order
 */
export const getPaymentsByOrder = async (orderId: number): Promise<ApiResponse<Payment[]>> => {
    const response = await api.get<ApiResponse<Payment[]>>(`/payments/order/${orderId}`);
    return response.data;
};

/**
 * Request a refund for a payment
 */
export const requestRefund = async (
    paymentId: number,
    data: { reason: string; amount?: number }
): Promise<ApiResponse<RefundResponse>> => {
    const response = await api.post<ApiResponse<RefundResponse>>(`/payments/${paymentId}/refund`, data);
    return response.data;
};

/**
 * Get refund status
 */
export const getRefundStatus = async (refundId: number): Promise<ApiResponse<RefundResponse>> => {
    const response = await api.get<ApiResponse<RefundResponse>>(`/payments/refunds/${refundId}`);
    return response.data;
};

/**
 * Get refunds for an order
 */
export const getOrderRefunds = async (orderId: number): Promise<ApiResponse<RefundResponse[]>> => {
    const response = await api.get<ApiResponse<RefundResponse[]>>(`/payments/orders/${orderId}/refunds`);
    return response.data;
};

export const paymentService = {
    createPayment,
    getPaymentById,
    getPaymentsByOrder,
    requestRefund,
    getRefundStatus,
    getOrderRefunds,
};

export default paymentService;
