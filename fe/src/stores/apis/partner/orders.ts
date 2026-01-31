import { baseApi } from '../../baseAPi';
import { PARTNER_ENDPOINTS } from '../../../constants';
import type { ApiResponse, Page } from '../../../types';
import { PARTNER_TAGS } from './types';
import {
  OrderResponseSchema,
  StaffAccessCodeResponseSchema,
  UpdateOrderWeightRequestSchema,
  createValidator,
  type OrderResponse,
  type StaffAccessCodeResponse,
  type UpdateOrderWeightRequest,
  type OrderQueryParams,
  type PendingOrdersQueryParams,
  type OrderStatus,
} from '../../../schemas';

// Create validators
const updateWeightValidator = createValidator(UpdateOrderWeightRequestSchema);

export const partnerOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Pending Orders
    getPendingOrders: builder.query<ApiResponse<Page<OrderResponse>>, PendingOrdersQueryParams>({
      query: (params) => ({
        url: PARTNER_ENDPOINTS.PARTNER_ORDERS_PENDING,
        method: 'GET',
        params,
      }),
      providesTags: [PARTNER_TAGS.PARTNER_ORDERS],
    }),

    // Get Partner Orders
    getPartnerOrders: builder.query<ApiResponse<Page<OrderResponse>>, OrderQueryParams>({
      query: (params) => ({
        url: PARTNER_ENDPOINTS.PARTNER_ORDERS,
        method: 'GET',
        params,
      }),
      providesTags: [PARTNER_TAGS.PARTNER_ORDERS],
    }),

    // Get Order Detail
    getOrderDetail: builder.query<ApiResponse<OrderResponse>, number>({
      query: (orderId) => ({
        url: PARTNER_ENDPOINTS.PARTNER_ORDER_BY_ID(orderId),
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [
        { type: PARTNER_TAGS.PARTNER_ORDERS, id: orderId },
      ],
      // Zod validation for response
      transformResponse: (response: ApiResponse<OrderResponse>) => {
        const validated = OrderResponseSchema.safeParse(response.data);
        if (!validated.success) {
          console.warn('Order detail response validation failed:', validated.error);
        }
        return response;
      },
    }),

    // Accept Order
    acceptOrder: builder.mutation<
      ApiResponse<StaffAccessCodeResponse>,
      { orderId: number; expirationHours?: number; notes?: string }
    >({
      query: ({ orderId, expirationHours, notes }) => ({
        url: PARTNER_ENDPOINTS.PARTNER_ORDER_ACCEPT(orderId),
        method: 'POST',
        params: { expirationHours, notes },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: PARTNER_TAGS.PARTNER_ORDERS, id: orderId },
        PARTNER_TAGS.PARTNER_ORDERS,
        PARTNER_TAGS.PARTNER_DASHBOARD,
        PARTNER_TAGS.PARTNER_STATISTICS,
      ],
      // Zod validation for response
      transformResponse: (response: ApiResponse<StaffAccessCodeResponse>) => {
        const validated = StaffAccessCodeResponseSchema.safeParse(response.data);
        if (!validated.success) {
          console.warn('Accept order response validation failed:', validated.error);
        }
        return response;
      },
    }),

    // Process Order
    processOrder: builder.mutation<ApiResponse<OrderResponse>, number>({
      query: (orderId) => ({
        url: PARTNER_ENDPOINTS.PARTNER_ORDER_PROCESS(orderId),
        method: 'POST',
      }),
      invalidatesTags: (result, error, orderId) => [
        { type: PARTNER_TAGS.PARTNER_ORDERS, id: orderId },
        PARTNER_TAGS.PARTNER_ORDERS,
        PARTNER_TAGS.PARTNER_DASHBOARD,
      ],
    }),

    // Mark Order Ready
    markOrderReady: builder.mutation<
      ApiResponse<StaffAccessCodeResponse>,
      { orderId: number; expirationHours?: number; notes?: string }
    >({
      query: ({ orderId, expirationHours, notes }) => ({
        url: PARTNER_ENDPOINTS.PARTNER_ORDER_READY(orderId),
        method: 'POST',
        params: { expirationHours, notes },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: PARTNER_TAGS.PARTNER_ORDERS, id: orderId },
        PARTNER_TAGS.PARTNER_ORDERS,
        PARTNER_TAGS.PARTNER_DASHBOARD,
        PARTNER_TAGS.PARTNER_STATISTICS,
      ],
      // Zod validation for response
      transformResponse: (response: ApiResponse<StaffAccessCodeResponse>) => {
        const validated = StaffAccessCodeResponseSchema.safeParse(response.data);
        if (!validated.success) {
          console.warn('Mark ready response validation failed:', validated.error);
        }
        return response;
      },
    }),

    // Update Order Weight
    updateOrderWeight: builder.mutation<
      ApiResponse<OrderResponse>,
      { orderId: number; data: UpdateOrderWeightRequest }
    >({
      query: ({ orderId, data }) => {
        // Validate request with Zod
        updateWeightValidator.validateRequestBody?.(data);
        return {
          url: PARTNER_ENDPOINTS.PARTNER_ORDER_WEIGHT(orderId),
          method: 'PUT',
          body: data,
        };
      },
      invalidatesTags: (result, error, { orderId }) => [
        { type: PARTNER_TAGS.PARTNER_ORDERS, id: orderId },
        PARTNER_TAGS.PARTNER_ORDERS,
      ],
    }),
  }),
});

export const {
  useGetPendingOrdersQuery,
  useGetPartnerOrdersQuery,
  useGetOrderDetailQuery,
  useAcceptOrderMutation,
  useProcessOrderMutation,
  useMarkOrderReadyMutation,
  useUpdateOrderWeightMutation,
} = partnerOrdersApi;
