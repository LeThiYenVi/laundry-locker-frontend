import type { ApiResponse } from '@/types';
import api from '../api';

// ===== Promotion Types =====

export interface PromotionValidateResponse {
    id: number;
    code: string;
    title: string;
    description?: string;
    status: 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'DEPLETED' | 'INACTIVE';
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SERVICE';
    discountValue: number;
    maxDiscountAmount?: number;
    minOrderAmount?: number;
    remainingUses?: number;
    perUserLimit?: number;
    stackable?: boolean;
    startDate?: string;
    endDate?: string;
    applicableServiceIds?: number[];
    applicableStoreIds?: number[];
    applicableTiers?: string[];
}

// ===== API Calls =====

/**
 * Validate a promotion code
 * API: GET /api/admin/promotions/validate/{code}
 * Auth: isAuthenticated() — any logged-in user can use
 */
export const validatePromotionCode = async (
    code: string
): Promise<ApiResponse<PromotionValidateResponse>> => {
    const response = await api.get<ApiResponse<PromotionValidateResponse>>(
        `/promotions/validate/${code.toUpperCase()}`
    );
    return response.data;
};

/**
 * Get active promotions (available vouchers)
 * API: GET /api/admin/promotions/active
 * Auth: ADMIN only (for future use)
 */
export const getActivePromotions = async (): Promise<ApiResponse<PromotionValidateResponse[]>> => {
    const response = await api.get<ApiResponse<PromotionValidateResponse[]>>(
        '/promotions/active'
    );
    return response.data;
};

/**
 * Calculate discount amount based on promotion and order total
 */
export const calculateDiscount = (
    promotion: PromotionValidateResponse,
    orderTotal: number
): number => {
    if (orderTotal < (promotion.minOrderAmount || 0)) {
        return 0;
    }

    let discount = 0;

    switch (promotion.discountType) {
        case 'PERCENTAGE':
            discount = orderTotal * promotion.discountValue / 100;
            if (promotion.maxDiscountAmount) {
                discount = Math.min(discount, promotion.maxDiscountAmount);
            }
            break;
        case 'FIXED_AMOUNT':
            discount = promotion.discountValue;
            break;
        case 'FREE_SERVICE':
            discount = 0; // TODO: not yet implemented on backend
            break;
    }

    // Discount never exceeds order total
    return Math.min(discount, orderTotal);
};

export const promotionService = {
    validatePromotionCode,
    getActivePromotions,
    calculateDiscount,
};

export default promotionService;
