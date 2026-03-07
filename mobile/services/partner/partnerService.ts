import type { ApiResponse } from '@/types';
import api from '../api';

// ===== Response Types =====

export interface PartnerDashboard {
    partnerId: number;
    businessName: string;
    totalStores: number;
    activeStores: number;
    totalStaff: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    canceledOrders: number;
    totalRevenue: number;
    partnerRevenue: number;
    platformFee: number;
    todayRevenue: number;
    monthRevenue: number;
}

export interface PartnerProfile {
    id: number;
    businessName: string;
    businessRegistrationNumber?: string;
    taxId?: string;
    businessAddress: string;
    contactPhone: string;
    contactEmail?: string;
    user?: {
        id: number;
        fullName?: string;
    };
    status: string;
    approvedAt: string;
    approvedBy: number;
    rejectionReason: string;
    revenueSharePercent: number;
    storeCount: number;
    staffCount: number;
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface PartnerRegistration {
    businessName: string;
    businessRegistrationNumber?: string;
    taxId?: string;
    businessAddress: string;
    contactPhone: string;
    contactEmail?: string;
    notes?: string;
}

export interface PartnerOrderStatistics {
    partnerId: number;
    totalOrders: number;
    todayOrders: number;
    weekOrders: number;
    monthOrders: number;
    initializedOrders: number;
    waitingOrders: number;
    collectedOrders: number;
    processingOrders: number;
    readyOrders: number;
    returnedOrders: number;
    completedOrders: number;
    canceledOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    averageOrderValue: number;
    ordersByStore: Record<number, number>;
}

export interface StaffOrderSummary {
    waitingCount: number;
    processingCount: number;
    readyCount: number;
    collectedCount: number;
    recentOrders: any[];
}

// ===== API Calls =====

/**
 * Get partner dashboard (stats + revenue overview)
 */
export const getDashboard = async (): Promise<ApiResponse<PartnerDashboard>> => {
    const response = await api.get<ApiResponse<PartnerDashboard>>('/partner/dashboard');
    return response.data;
};

/**
 * Get partner profile
 */
export const getProfile = async (): Promise<ApiResponse<PartnerProfile>> => {
    const response = await api.get<ApiResponse<PartnerProfile>>('/partner');
    return response.data;
};

/**
 * Get partner order statistics (detailed breakdown by status)
 */
export const getOrderStatistics = async (): Promise<ApiResponse<PartnerOrderStatistics>> => {
    const response = await api.get<ApiResponse<PartnerOrderStatistics>>('/partner/orders/statistics');
    return response.data;
};

/**
 * Get partner orders (paginated, optionally filtered by status)
 */
export const getOrders = async (status?: string, page = 0, size = 10): Promise<ApiResponse<any>> => {
    const params: any = { page, size };
    if (status) params.status = status;
    const response = await api.get<ApiResponse<any>>('/partner/orders', { params });
    return response.data;
};

/**
 * Get staff order summary (waiting/processing/ready counts + recent orders)
 */
export const getStaffOrderSummary = async (): Promise<ApiResponse<StaffOrderSummary>> => {
    const response = await api.get<ApiResponse<StaffOrderSummary>>('/staff/orders');
    return response.data;
};

/**
 * Get partner stores
 */
export const getStores = async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get<ApiResponse<any[]>>('/partner/stores');
    return response.data;
};

/**
 * Register current user as a business partner
 */
export const registerPartner = async (data: PartnerRegistration): Promise<ApiResponse<PartnerProfile>> => {
    const response = await api.post<ApiResponse<PartnerProfile>>('/partner', data);
    return response.data;
};

export const partnerService = {
    getDashboard,
    getProfile,
    getOrderStatistics,
    getOrders,
    getStaffOrderSummary,
    getStores,
    registerPartner,
};

export default partnerService;
