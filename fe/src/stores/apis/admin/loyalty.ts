import { baseApi } from '../../baseAPi';
import { ADMIN_ENDPOINTS } from '../../../constants';
import type {
  ApiResponse,
  Page,
  PageableRequest,
  LoyaltySummaryResponse,
  AdjustPointsRequest,
  PointsTransactionResponse,
  LoyaltyStatisticsResponse,
} from '../../../types';
import { AdjustUserPointsRequestSchema, createValidator } from '../../../schemas';

const TAGS = {
  LOYALTY: 'Loyalty',
} as const;

const adjustPointsValidator = createValidator(AdjustUserPointsRequestSchema);

export const loyaltyManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user loyalty summary
    getUserLoyaltySummary: builder.query<ApiResponse<LoyaltySummaryResponse>, number>({
      query: (userId) => ADMIN_ENDPOINTS.LOYALTY_USERS(userId),
      providesTags: (result, error, userId) => [{ type: TAGS.LOYALTY, id: userId }],
    }),

    // Adjust user points
    adjustUserPoints: builder.mutation<
      ApiResponse<PointsTransactionResponse>,
      { userId: number; data: AdjustPointsRequest }
    >({
      query: ({ userId, data }) => {
        // Validate request body with Zod
        adjustPointsValidator.validateRequestBody(data);
        return {
          url: ADMIN_ENDPOINTS.LOYALTY_POINTS(userId),
          method: 'POST',
          body: data,
        };
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: TAGS.LOYALTY, id: userId },
        TAGS.LOYALTY,
      ],
    }),

    // Get user points history
    getUserPointsHistory: builder.query<
      ApiResponse<Page<PointsTransactionResponse>>,
      { userId: number } & PageableRequest
    >({
      query: ({ userId, pageNumber, pageSize, sort }) => ({
        url: ADMIN_ENDPOINTS.LOYALTY_HISTORY(userId),
        params: { page: pageNumber, size: pageSize, sort },
      }),
      providesTags: (result, error, { userId }) => [
        { type: TAGS.LOYALTY, id: `${userId}-history` },
      ],
    }),

    // Get loyalty statistics
    getLoyaltyStatistics: builder.query<ApiResponse<LoyaltyStatisticsResponse>, void>({
      query: () => ADMIN_ENDPOINTS.LOYALTY_STATISTICS,
      providesTags: [TAGS.LOYALTY],
    }),
  }),
});

export const {
  useGetUserLoyaltySummaryQuery,
  useAdjustUserPointsMutation,
  useGetUserPointsHistoryQuery,
  useGetLoyaltyStatisticsQuery,
} = loyaltyManagementApi;
