import { baseApi } from '../../baseAPi';
import { PARTNER_ENDPOINTS } from '../../../constants';
import type { ApiResponse } from '../../../types';
import { PARTNER_TAGS } from './types';
import {
  UserResponseSchema,
  type UserResponse,
} from '../../../schemas';

export const partnerStaffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Partner Staff
    getPartnerStaff: builder.query<ApiResponse<UserResponse[]>, void>({
      query: () => ({
        url: PARTNER_ENDPOINTS.PARTNER_STAFF,
        method: 'GET',
      }),
      providesTags: [PARTNER_TAGS.PARTNER_STAFF],
      // Zod validation for response
      transformResponse: (response: ApiResponse<UserResponse[]>) => {
        if (Array.isArray(response.data)) {
          response.data.forEach((user, index) => {
            const validated = UserResponseSchema.safeParse(user);
            if (!validated.success) {
              console.warn(`User ${index} response validation failed:`, validated.error);
            }
          });
        }
        return response;
      },
    }),

    // Add Staff to Partner
    addStaff: builder.mutation<ApiResponse<UserResponse>, number>({
      query: (staffId) => ({
        url: PARTNER_ENDPOINTS.PARTNER_STAFF_ADD(staffId),
        method: 'POST',
      }),
      invalidatesTags: [PARTNER_TAGS.PARTNER_STAFF],
      // Zod validation for response
      transformResponse: (response: ApiResponse<UserResponse>) => {
        const validated = UserResponseSchema.safeParse(response.data);
        if (!validated.success) {
          console.warn('Add staff response validation failed:', validated.error);
        }
        return response;
      },
    }),

    // Remove Staff from Partner
    removeStaff: builder.mutation<ApiResponse<void>, number>({
      query: (staffId) => ({
        url: PARTNER_ENDPOINTS.PARTNER_STAFF_REMOVE(staffId),
        method: 'DELETE',
      }),
      invalidatesTags: [PARTNER_TAGS.PARTNER_STAFF],
    }),
  }),
});

export const {
  useGetPartnerStaffQuery,
  useAddStaffMutation,
  useRemoveStaffMutation,
} = partnerStaffApi;
