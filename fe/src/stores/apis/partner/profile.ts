import { baseApi } from '../../baseAPi';
import { PARTNER_ENDPOINTS } from '../../../constants';
import type { ApiResponse } from '../../../types';
import { PARTNER_TAGS } from './types';
import {
  PartnerResponseSchema,
  PartnerRegistrationRequestSchema,
  PartnerUpdateRequestSchema,
  createValidator,
  type PartnerResponse,
  type PartnerRegistrationRequest,
  type PartnerUpdateRequest,
} from '../../../schemas';

// Create validators
const registerValidator = createValidator(PartnerRegistrationRequestSchema);
const updateValidator = createValidator(PartnerUpdateRequestSchema);

export const partnerProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get My Partner Profile
    getPartnerProfile: builder.query<ApiResponse<PartnerResponse>, void>({
      query: () => ({
        url: PARTNER_ENDPOINTS.PARTNER_PROFILE,
        method: 'GET',
      }),
      providesTags: [PARTNER_TAGS.PARTNER, PARTNER_TAGS.PARTNER_PROFILE],
      // Zod validation for response
      transformResponse: (response: ApiResponse<PartnerResponse>) => {
        const validated = PartnerResponseSchema.safeParse(response.data);
        if (!validated.success) {
          console.warn('Partner profile response validation failed:', validated.error);
        }
        return response;
      },
    }),

    // Register as Partner
    registerPartner: builder.mutation<ApiResponse<PartnerResponse>, PartnerRegistrationRequest>({
      query: (data) => {
        // Validate request with Zod
        registerValidator.validateRequestBody?.(data);
        return {
          url: PARTNER_ENDPOINTS.PARTNER_REGISTER,
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: [PARTNER_TAGS.PARTNER, PARTNER_TAGS.PARTNER_PROFILE],
    }),

    // Update Partner Profile
    updatePartner: builder.mutation<ApiResponse<PartnerResponse>, PartnerUpdateRequest>({
      query: (data) => {
        // Validate request with Zod
        updateValidator.validateRequestBody?.(data);
        return {
          url: PARTNER_ENDPOINTS.PARTNER_UPDATE,
          method: 'PUT',
          body: data,
        };
      },
      invalidatesTags: [PARTNER_TAGS.PARTNER, PARTNER_TAGS.PARTNER_PROFILE],
    }),
  }),
});

export const {
  useGetPartnerProfileQuery,
  useRegisterPartnerMutation,
  useUpdatePartnerMutation,
} = partnerProfileApi;
