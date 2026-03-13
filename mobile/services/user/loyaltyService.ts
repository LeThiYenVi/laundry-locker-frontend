import type { ApiResponse } from '@/types';
import api from '../api';

// ===== Loyalty Types =====

export interface LoyaltyAccount {
    id: number;
    userId: number;
    userName: string;
    pointsBalance: number;
    pointsValueVnd: number;
    totalPointsEarned: number;
    totalPointsRedeemed: number;
    totalAmountSpent: number;
    createdAt: string;
    updatedAt: string;
}

export interface StampCard {
    id: number;
    userId: number;
    stampType: string;
    serviceId: number | null;
    serviceName: string;
    boxSize: string | null;
    stampsRequired: number;
    currentStamps: number;
    freeRewardsAvailable: number;
    totalStampsEarned: number;
    totalRewardsRedeemed: number;
    progressPercentage: number;
    createdAt: string;
    updatedAt: string;
}

export interface LoyaltySummary {
    pointsAccount: LoyaltyAccount;
    stampCards: StampCard[];
    totalRedeemableValue: number;
    totalFreeRewards: number;
}

export interface RewardItem {
    id: number;
    name: string;
    description: string;
    pointsRequired: number;
    type: string; // DISCOUNT, FREE_SERVICE, VOUCHER, MERCHANDISE
    value: string;
    imageUrl: string;
    canRedeem: boolean;
    remainingQuantity: number | null;
    expiresAt: string | null;
    minimumTier: string;
    category: string;
}

export interface RedeemedReward {
    id: number;
    rewardName: string;
    pointsSpent: number;
    redeemedAt: string;
    code: string;
    status: string; // ACTIVE, USED, EXPIRED
    expiresAt: string | null;
    usedAt: string | null;
}

export interface RewardsResponse {
    currentPoints: number;
    membershipTier: string;
    pointsToNextTier: number;
    availableRewards: RewardItem[];
    redeemedRewards: RedeemedReward[];
}

export interface PointTransaction {
    id: number;
    type: string;
    points: number;
    description: string;
    orderId: number | null;
    createdAt: string;
}

export interface ExpiringPoints {
    expiringPoints: number;
    expiringDate: string;
    recommendations: string[];
}

// ===== API Calls =====

/**
 * Get complete loyalty summary (points + stamps)
 */
export const getLoyaltySummary = async (): Promise<ApiResponse<LoyaltySummary>> => {
    const response = await api.get<ApiResponse<LoyaltySummary>>('/loyalty/summary');
    return response.data;
};

/**
 * Get points account details
 */
export const getPointsAccount = async (): Promise<ApiResponse<LoyaltyAccount>> => {
    const response = await api.get<ApiResponse<LoyaltyAccount>>('/loyalty/points');
    return response.data;
};

/**
 * Get points transaction history
 */
export const getPointsHistory = async (page = 0, size = 20): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>('/loyalty/points/history', {
        params: { page, size },
    });
    return response.data;
};

/**
 * Get stamp cards
 */
export const getStampCards = async (): Promise<ApiResponse<StampCard[]>> => {
    const response = await api.get<ApiResponse<StampCard[]>>('/loyalty/stamps');
    return response.data;
};

/**
 * Get available rewards (vouchers that can be redeemed with points)
 */
export const getAvailableRewards = async (): Promise<ApiResponse<RewardsResponse>> => {
    const response = await api.get<ApiResponse<RewardsResponse>>('/loyalty/rewards');
    return response.data;
};

/**
 * Redeem a specific reward by reward id.
 */
export const redeemReward = async (rewardId: number): Promise<ApiResponse<RedeemedReward>> => {
    const response = await api.post<ApiResponse<RedeemedReward>>(`/loyalty/rewards/${rewardId}/redeem`);
    return response.data;
};

/**
 * Get expiring points info
 */
export const getExpiringPoints = async (): Promise<ApiResponse<ExpiringPoints>> => {
    const response = await api.get<ApiResponse<ExpiringPoints>>('/loyalty/points/expiring');
    return response.data;
};

/**
 * Redeem points for discount on an order
 */
export const redeemPoints = async (orderId: number, points: number): Promise<ApiResponse<PointTransaction>> => {
    const response = await api.post<ApiResponse<PointTransaction>>('/loyalty/redeem-points', {
        orderId,
        points,
    });
    return response.data;
};

/**
 * Redeem stamp reward for an order
 */
export const redeemStampReward = async (stampCardId: number, orderId: number): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/loyalty/redeem-stamp', {
        stampCardId,
        orderId,
    });
    return response.data;
};

export const loyaltyService = {
    getLoyaltySummary,
    getPointsAccount,
    getPointsHistory,
    getStampCards,
    getAvailableRewards,
    redeemReward,
    getExpiringPoints,
    redeemPoints,
    redeemStampReward,
};

export default loyaltyService;
