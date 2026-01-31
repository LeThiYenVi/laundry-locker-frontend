import { baseApi } from '../../baseAPi';
import { PARTNER_ENDPOINTS } from '../../../constants';
import type { ApiResponse } from '../../../types';
import { PARTNER_TAGS } from './types';
import {
  PartnerDashboardResponseSchema,
  PartnerOrderStatisticsResponseSchema,
  type PartnerDashboardResponse,
  type PartnerOrderStatisticsResponse,
} from '../../../schemas';

export const partnerDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Partner Dashboard
    getPartnerDashboard: builder.query<ApiResponse<PartnerDashboardResponse>, void>({
      query: () => ({
        url: PARTNER_ENDPOINTS.PARTNER_DASHBOARD,
        method: 'GET',
      }),
      providesTags: [PARTNER_TAGS.PARTNER_DASHBOARD],
      // Zod validation for response
      transformResponse: (response: ApiResponse<PartnerDashboardResponse>) => {
        const validated = PartnerDashboardResponseSchema.safeParse(response.data);
        if (!validated.success) {
          console.warn('Dashboard response validation failed:', validated.error);
        }
        return response;
      },
    }),

    // Get Order Statistics
    getPartnerOrderStatistics: builder.query<ApiResponse<PartnerOrderStatisticsResponse>, void>({
      query: () => ({
        url: PARTNER_ENDPOINTS.PARTNER_ORDER_STATISTICS,
        method: 'GET',
      }),
      providesTags: [PARTNER_TAGS.PARTNER_STATISTICS],
      // Zod validation for response
      transformResponse: (response: ApiResponse<PartnerOrderStatisticsResponse>) => {
        const validated = PartnerOrderStatisticsResponseSchema.safeParse(response.data);
        if (!validated.success) {
          console.warn('Order statistics response validation failed:', validated.error);
        }
        return response;
      },
    }),
  }),
});

export const {
  useGetPartnerDashboardQuery,
  useGetPartnerOrderStatisticsQuery,
} = partnerDashboardApi;
