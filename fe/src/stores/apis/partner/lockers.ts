import { baseApi } from '../../baseAPi';
import { PARTNER_ENDPOINTS } from '../../../constants';
import type { ApiResponse } from '../../../types';
import { PARTNER_TAGS } from './types';
import {
  LockerResponseSchema,
  BoxResponseSchema,
  type LockerResponse,
  type BoxResponse,
} from '../../../schemas';

export const partnerLockersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Partner Lockers
    getPartnerLockers: builder.query<ApiResponse<LockerResponse[]>, void>({
      query: () => ({
        url: PARTNER_ENDPOINTS.PARTNER_LOCKERS,
        method: 'GET',
      }),
      providesTags: [PARTNER_TAGS.PARTNER_LOCKERS],
      // Zod validation for response
      transformResponse: (response: ApiResponse<LockerResponse[]>) => {
        if (Array.isArray(response.data)) {
          response.data.forEach((locker, index) => {
            const validated = LockerResponseSchema.safeParse(locker);
            if (!validated.success) {
              console.warn(`Locker ${index} response validation failed:`, validated.error);
            }
          });
        }
        return response;
      },
    }),

    // Get Available Boxes by Locker
    getAvailableBoxes: builder.query<ApiResponse<BoxResponse[]>, number>({
      query: (lockerId) => ({
        url: PARTNER_ENDPOINTS.PARTNER_LOCKER_AVAILABLE_BOXES(lockerId),
        method: 'GET',
      }),
      providesTags: (result, error, lockerId) => [
        { type: PARTNER_TAGS.PARTNER_LOCKERS, id: lockerId },
      ],
      // Zod validation for response
      transformResponse: (response: ApiResponse<BoxResponse[]>) => {
        if (Array.isArray(response.data)) {
          response.data.forEach((box, index) => {
            const validated = BoxResponseSchema.safeParse(box);
            if (!validated.success) {
              console.warn(`Box ${index} response validation failed:`, validated.error);
            }
          });
        }
        return response;
      },
    }),
  }),
});

export const {
  useGetPartnerLockersQuery,
  useGetAvailableBoxesQuery,
} = partnerLockersApi;
