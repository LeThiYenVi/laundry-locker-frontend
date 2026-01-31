import { baseApi } from '../../baseAPi';
import { PARTNER_ENDPOINTS } from '../../../constants';
import type { ApiResponse } from '../../../types';
import { PARTNER_TAGS } from './types';
import {
  StoreResponseSchema,
  type StoreResponse,
} from '../../../schemas';

export const partnerStoresApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Partner Stores
    getPartnerStores: builder.query<ApiResponse<StoreResponse[]>, void>({
      query: () => ({
        url: PARTNER_ENDPOINTS.PARTNER_STORES,
        method: 'GET',
      }),
      providesTags: [PARTNER_TAGS.PARTNER_STORES],
      // Zod validation for response
      transformResponse: (response: ApiResponse<StoreResponse[]>) => {
        if (Array.isArray(response.data)) {
          response.data.forEach((store, index) => {
            const validated = StoreResponseSchema.safeParse(store);
            if (!validated.success) {
              console.warn(`Store ${index} response validation failed:`, validated.error);
            }
          });
        }
        return response;
      },
    }),
  }),
});

export const {
  useGetPartnerStoresQuery,
} = partnerStoresApi;
