import { baseApi } from '../../baseAPi';
import { PARTNER_ENDPOINTS } from '../../../constants';
import type { ApiResponse, Page } from '../../../types';
import { PARTNER_TAGS } from './types';
import {
  StaffAccessCodeResponseSchema,
  GenerateAccessCodeRequestSchema,
  createValidator,
  type StaffAccessCodeResponse,
  type GenerateAccessCodeRequest,
  type AccessCodeQueryParams,
} from '../../../schemas';

// Create validators
const generateCodeValidator = createValidator(GenerateAccessCodeRequestSchema);

export const partnerAccessCodesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Generate Access Code
    generateAccessCode: builder.mutation<ApiResponse<StaffAccessCodeResponse>, GenerateAccessCodeRequest>({
      query: (data) => {
        // Validate request with Zod
        generateCodeValidator.validateRequestBody?.(data);
        return {
          url: PARTNER_ENDPOINTS.PARTNER_ACCESS_CODES_GENERATE,
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: [PARTNER_TAGS.PARTNER_ACCESS_CODES],
      // Zod validation for response
      transformResponse: (response: ApiResponse<StaffAccessCodeResponse>) => {
        const validated = StaffAccessCodeResponseSchema.safeParse(response.data);
        if (!validated.success) {
          console.warn('Generate access code response validation failed:', validated.error);
        }
        return response;
      },
    }),

    // Get Access Codes
    getAccessCodes: builder.query<ApiResponse<Page<StaffAccessCodeResponse>>, AccessCodeQueryParams>({
      query: (params) => ({
        url: PARTNER_ENDPOINTS.PARTNER_ACCESS_CODES,
        method: 'GET',
        params,
      }),
      providesTags: [PARTNER_TAGS.PARTNER_ACCESS_CODES],
    }),

    // Get Access Codes by Order
    getAccessCodesByOrder: builder.query<ApiResponse<StaffAccessCodeResponse[]>, number>({
      query: (orderId) => ({
        url: PARTNER_ENDPOINTS.PARTNER_ACCESS_CODES_BY_ORDER(orderId),
        method: 'GET',
      }),
      providesTags: (result, error, orderId) => [
        { type: PARTNER_TAGS.PARTNER_ACCESS_CODES, id: orderId },
      ],
    }),

    // Cancel Access Code
    cancelAccessCode: builder.mutation<ApiResponse<void>, number>({
      query: (codeId) => ({
        url: PARTNER_ENDPOINTS.PARTNER_ACCESS_CODE_CANCEL(codeId),
        method: 'POST',
      }),
      invalidatesTags: [PARTNER_TAGS.PARTNER_ACCESS_CODES],
    }),
  }),
});

export const {
  useGenerateAccessCodeMutation,
  useGetAccessCodesQuery,
  useGetAccessCodesByOrderQuery,
  useCancelAccessCodeMutation,
} = partnerAccessCodesApi;
