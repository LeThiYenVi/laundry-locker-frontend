import type { ApiResponse, Payment, PaymentMethod } from '@/types';
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

export const paymentService = {
    createPayment,
    getPaymentById,
    getPaymentsByOrder,
};

export default paymentService;
