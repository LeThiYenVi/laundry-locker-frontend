import { PARTNER_ENDPOINTS } from "../../constants";
import { baseApi } from "../baseAPi";
import type {
  PartnerOrder,
  PartnerDashboardOverview,
  PartnerDashboardResponse,
  PartnerResponse,
  PartnerRevenueResponse,
  StaffAccessCode,
  GenerateAccessCodeRequest,
  AcceptOrderResponse,
  MarkReadyResponse,
  UpdateWeightRequest,
  UpdateWeightResponse,
  PartnerLocker,
  StaffContact,
  CreateStaffContactRequest,
  UpdatePartnerProfileRequest,
} from "../../types";
import type { OrderStatus } from "../../types/partner.enum";

// ============================================
// Request/Response Types
// ============================================

interface GetOrdersParams {
  status?: OrderStatus | "ALL";
  page?: number;
  size?: number;
  search?: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================
// Partner API Endpoints
// ============================================

export const partnerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ============================================
    // Profile Endpoints
    // ============================================
    
    getPartnerProfile: builder.query<PartnerResponse, void>({
      query: () => PARTNER_ENDPOINTS.PROFILE,
      transformResponse: (response: ApiResponse<PartnerResponse>) => response.data,
      providesTags: ["User"],
    }),

    updatePartnerProfile: builder.mutation<PartnerResponse, UpdatePartnerProfileRequest>({
      query: (data) => ({
        url: PARTNER_ENDPOINTS.PROFILE,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<PartnerResponse>) => response.data,
      invalidatesTags: ["User"],
    }),

    // ============================================
    // Dashboard Endpoints
    // ============================================

    getPartnerDashboard: builder.query<PartnerDashboardResponse, void>({
      query: () => PARTNER_ENDPOINTS.DASHBOARD,
      transformResponse: (response: ApiResponse<PartnerDashboardResponse>) => response.data,
      providesTags: ["Dashboard"],
    }),

    // ============================================
    // Order Endpoints
    // ============================================

    getPartnerOrders: builder.query<PaginatedResponse<PartnerOrder>, GetOrdersParams>({
      query: ({ status, page = 0, size = 10, search }) => {
        const params = new URLSearchParams();
        if (status && status !== "ALL") params.append("status", status);
        if (page !== undefined) params.append("page", page.toString());
        if (size !== undefined) params.append("size", size.toString());
        if (search) params.append("search", search);
        return `${PARTNER_ENDPOINTS.ORDERS}?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<PaginatedResponse<PartnerOrder>>) => response.data,
      providesTags: ["Orders"],
    }),

    getPendingOrders: builder.query<PartnerOrder[], void>({
      query: () => PARTNER_ENDPOINTS.ORDERS_PENDING,
      transformResponse: (response: ApiResponse<PartnerOrder[]>) => response.data,
      providesTags: ["Orders"],
    }),

    getPartnerOrderById: builder.query<PartnerOrder, number>({
      query: (id) => PARTNER_ENDPOINTS.ORDER_BY_ID(id),
      transformResponse: (response: ApiResponse<PartnerOrder>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Orders", id }],
    }),

    // Accept order and generate COLLECT access code
    acceptOrder: builder.mutation<AcceptOrderResponse, number>({
      query: (orderId) => ({
        url: PARTNER_ENDPOINTS.ORDER_ACCEPT(orderId),
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<AcceptOrderResponse>) => response.data,
      invalidatesTags: ["Orders", "Dashboard"],
    }),

    // Update order weight after collection
    updateOrderWeight: builder.mutation<UpdateWeightResponse, UpdateWeightRequest>({
      query: ({ orderId, ...data }) => ({
        url: PARTNER_ENDPOINTS.ORDER_WEIGHT(orderId),
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<UpdateWeightResponse>) => response.data,
      invalidatesTags: (_result, _error, { orderId }) => [
        { type: "Orders", id: orderId },
        "Orders",
      ],
    }),

    // Start processing order
    processOrder: builder.mutation<PartnerOrder, number>({
      query: (orderId) => ({
        url: PARTNER_ENDPOINTS.ORDER_PROCESS(orderId),
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<PartnerOrder>) => response.data,
      invalidatesTags: ["Orders", "Dashboard"],
    }),

    // Mark order ready and generate RETURN access code
    markOrderReady: builder.mutation<MarkReadyResponse, number>({
      query: (orderId) => ({
        url: PARTNER_ENDPOINTS.ORDER_READY(orderId),
        method: "POST",
      }),
      transformResponse: (response: ApiResponse<MarkReadyResponse>) => response.data,
      invalidatesTags: ["Orders", "Dashboard"],
    }),

    // ============================================
    // Access Code Endpoints
    // ============================================

    generateAccessCode: builder.mutation<StaffAccessCode, GenerateAccessCodeRequest>({
      query: (data) => ({
        url: PARTNER_ENDPOINTS.ACCESS_CODE_GENERATE,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<StaffAccessCode>) => response.data,
    }),

    getAccessCodesByOrder: builder.query<StaffAccessCode[], number>({
      query: (orderId) => PARTNER_ENDPOINTS.ACCESS_CODES_BY_ORDER(orderId),
      transformResponse: (response: ApiResponse<StaffAccessCode[]>) => response.data,
    }),

    cancelAccessCode: builder.mutation<void, number>({
      query: (codeId) => ({
        url: PARTNER_ENDPOINTS.ACCESS_CODE_CANCEL(codeId),
        method: "POST",
      }),
    }),

    // ============================================
    // Staff Directory Endpoints (Simple contacts)
    // ============================================

    getStaffContacts: builder.query<StaffContact[], void>({
      query: () => PARTNER_ENDPOINTS.STAFF,
      transformResponse: (response: ApiResponse<StaffContact[]>) => response.data,
    }),

    addStaffContact: builder.mutation<StaffContact, CreateStaffContactRequest>({
      query: (data) => ({
        url: PARTNER_ENDPOINTS.STAFF,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<StaffContact>) => response.data,
    }),

    deleteStaffContact: builder.mutation<void, number>({
      query: (id) => ({
        url: PARTNER_ENDPOINTS.STAFF_BY_ID(id),
        method: "DELETE",
      }),
    }),

    // ============================================
    // Locker Endpoints
    // ============================================

    getPartnerLockers: builder.query<PartnerLocker[], void>({
      query: () => PARTNER_ENDPOINTS.LOCKERS,
      transformResponse: (response: ApiResponse<PartnerLocker[]>) => response.data,
      providesTags: ["Lockers"],
    }),

    getAvailableBoxes: builder.query<any[], number>({
      query: (lockerId) => PARTNER_ENDPOINTS.LOCKER_AVAILABLE_BOXES(lockerId),
      transformResponse: (response: ApiResponse<any[]>) => response.data,
    }),

    // ============================================
    // Revenue Endpoints
    // ============================================

    getPartnerRevenue: builder.query<PartnerRevenueResponse, { fromDate?: string; toDate?: string }>({
      query: ({ fromDate, toDate }) => {
        const params = new URLSearchParams();
        if (fromDate) params.append("fromDate", fromDate);
        if (toDate) params.append("toDate", toDate);
        return `${PARTNER_ENDPOINTS.REVENUE}?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<PartnerRevenueResponse>) => response.data,
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Profile
  useGetPartnerProfileQuery,
  useUpdatePartnerProfileMutation,
  
  // Dashboard
  useGetPartnerDashboardQuery,
  
  // Orders
  useGetPartnerOrdersQuery,
  useGetPendingOrdersQuery,
  useGetPartnerOrderByIdQuery,
  useAcceptOrderMutation,
  useUpdateOrderWeightMutation,
  useProcessOrderMutation,
  useMarkOrderReadyMutation,
  
  // Access Codes
  useGenerateAccessCodeMutation,
  useGetAccessCodesByOrderQuery,
  useCancelAccessCodeMutation,
  
  // Staff Directory
  useGetStaffContactsQuery,
  useAddStaffContactMutation,
  useDeleteStaffContactMutation,
  
  // Lockers
  useGetPartnerLockersQuery,
  useGetAvailableBoxesQuery,
  
  // Revenue
  useGetPartnerRevenueQuery,
} = partnerApi;
