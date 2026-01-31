import { baseApi } from '../../baseAPi';
import { PARTNER_ENDPOINTS } from '../../../constants';
import type { ApiResponse } from '../../../types';
import { PARTNER_TAGS } from './types';
import {
  PartnerRevenueResponseSchema,
  RevenueQueryParamsSchema,
  createValidator,
  type PartnerRevenueResponse,
  type RevenueQueryParams,
} from '../../../schemas';

// Create validators
const revenueQueryValidator = createValidator(RevenueQueryParamsSchema);

export const partnerRevenueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Partner Revenue
    getPartnerRevenue: builder.query<ApiResponse<PartnerRevenueResponse>, RevenueQueryParams>({
      query: (params) => {
        // Validate request params with Zod
        revenueQueryValidator.validateRequestBody?.(params);
        return {
          url: PARTNER_ENDPOINTS.PARTNER_REVENUE,
          method: 'GET',
          params,
        };
      },
      providesTags: [PARTNER_TAGS.PARTNER_REVENUE],
      // Zod validation for response
      transformResponse: (response: ApiResponse<PartnerRevenueResponse>) => {
        const validated = PartnerRevenueResponseSchema.safeParse(response.data);
        if (!validated.success) {
          console.warn('Revenue response validation failed:', validated.error);
        }
        return response;
      },
    }),
  }),
});

export const {
  useGetPartnerRevenueQuery,
} = partnerRevenueApi;
