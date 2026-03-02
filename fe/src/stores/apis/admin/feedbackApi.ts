import { baseApi } from "../../baseAPi";
import { ADMIN_ENDPOINTS } from "../../../constants";
import type { ApiResponse, Page } from "../../../types";
import type {
  FeedbackDTO,
  FeedbackDetailDTO,
  UpdateFeedbackStatusRequest,
  ReplyFeedbackRequest,
  ReportDTO,
  ReportDetailDTO,
  ReportStatsDTO,
  UpdateReportStatusRequest,
  AssignReportRequest,
  AddNoteRequest,
  ResolveReportRequest,
  FeedbackAnalyticsDTO,
  SatisfactionMetricsDTO,
} from "../../../types/admin/feedback";

const TAG = "Loyalty" as const; // reuse allowed tag; swap to 'Orders' if preferred

export const feedbackManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── FEEDBACK ───────────────────────────────────────────────────────────

    // 1. GET /api/admin/feedback
    getAllFeedback: builder.query<
      ApiResponse<Page<FeedbackDTO>>,
      {
        page?: number;
        size?: number;
        minRating?: number;
        maxRating?: number;
        isResolved?: boolean;
      }
    >({
      query: ({
        page = 0,
        size = 20,
        minRating,
        maxRating,
        isResolved,
      } = {}) => ({
        url: ADMIN_ENDPOINTS.FEEDBACK,
        params: {
          page,
          size,
          ...(minRating !== undefined && { minRating }),
          ...(maxRating !== undefined && { maxRating }),
          ...(isResolved !== undefined && { isResolved }),
        },
      }),
      providesTags: ["Notifications"], // using an allowed tag
    }),

    // 2. GET /api/admin/feedback/{id}
    getFeedbackById: builder.query<ApiResponse<FeedbackDetailDTO>, number>({
      query: (id) => ADMIN_ENDPOINTS.FEEDBACK_BY_ID(id),
      providesTags: (_, __, id) => [{ type: "Notifications", id }],
    }),

    // 3. PATCH /api/admin/feedback/{id}/status
    updateFeedbackStatus: builder.mutation<
      ApiResponse<FeedbackDTO>,
      { id: number; data: UpdateFeedbackStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: ADMIN_ENDPOINTS.FEEDBACK_STATUS(id),
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Notifications"],
    }),

    // 4. POST /api/admin/feedback/{id}/reply
    replyToFeedback: builder.mutation<
      ApiResponse<FeedbackDetailDTO>,
      { id: number; data: ReplyFeedbackRequest }
    >({
      query: ({ id, data }) => ({
        url: ADMIN_ENDPOINTS.FEEDBACK_REPLY(id),
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Notifications", id },
        "Notifications",
      ],
    }),

    // ── REPORTS ────────────────────────────────────────────────────────────

    // 5. GET /api/admin/reports
    getAllReports: builder.query<
      ApiResponse<Page<ReportDTO>>,
      {
        page?: number;
        size?: number;
        status?: string;
        category?: string;
        userId?: number;
      }
    >({
      query: ({ page = 0, size = 20, status, category, userId } = {}) => ({
        url: ADMIN_ENDPOINTS.REPORTS,
        params: {
          page,
          size,
          ...(status && { status }),
          ...(category && { category }),
          ...(userId && { userId }),
        },
      }),
      providesTags: ["NotificationStats"],
    }),

    // 6. GET /api/admin/reports/{id}
    getReportById: builder.query<ApiResponse<ReportDetailDTO>, number>({
      query: (id) => ADMIN_ENDPOINTS.REPORT_BY_ID(id),
      providesTags: (_, __, id) => [{ type: "NotificationStats", id }],
    }),

    // 7. PATCH /api/admin/reports/{id}/status
    updateReportStatus: builder.mutation<
      ApiResponse<ReportDTO>,
      { id: number; data: UpdateReportStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: ADMIN_ENDPOINTS.REPORT_STATUS(id),
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["NotificationStats"],
    }),

    // 8. PATCH /api/admin/reports/{id}/assign
    assignReport: builder.mutation<
      ApiResponse<ReportDTO>,
      { id: number; data: AssignReportRequest }
    >({
      query: ({ id, data }) => ({
        url: ADMIN_ENDPOINTS.REPORT_ASSIGN(id),
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["NotificationStats"],
    }),

    // 9. POST /api/admin/reports/{id}/notes
    addReportNote: builder.mutation<
      ApiResponse<ReportDetailDTO>,
      { id: number; data: AddNoteRequest }
    >({
      query: ({ id, data }) => ({
        url: ADMIN_ENDPOINTS.REPORT_NOTES(id),
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "NotificationStats", id }],
    }),

    // 10. POST /api/admin/reports/{id}/resolve
    resolveReport: builder.mutation<
      ApiResponse<ReportDTO>,
      { id: number; data: ResolveReportRequest }
    >({
      query: ({ id, data }) => ({
        url: ADMIN_ENDPOINTS.REPORT_RESOLVE(id),
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["NotificationStats"],
    }),

    // 11. GET /api/admin/reports/stats
    getReportStats: builder.query<ApiResponse<ReportStatsDTO>, void>({
      query: () => ADMIN_ENDPOINTS.REPORTS_STATS,
      providesTags: ["NotificationStats"],
    }),

    // ── ANALYTICS ──────────────────────────────────────────────────────────

    // 12. GET /api/admin/analytics/feedback
    getFeedbackAnalytics: builder.query<
      ApiResponse<FeedbackAnalyticsDTO>,
      { period?: "day" | "week" | "month" }
    >({
      query: ({ period } = {}) => ({
        url: ADMIN_ENDPOINTS.ANALYTICS_FEEDBACK,
        params: { ...(period && { period }) },
      }),
      providesTags: ["Notifications"],
    }),

    // 13. GET /api/admin/analytics/satisfaction
    getSatisfactionMetrics: builder.query<
      ApiResponse<SatisfactionMetricsDTO>,
      void
    >({
      query: () => ADMIN_ENDPOINTS.ANALYTICS_SATISFACTION,
      providesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetAllFeedbackQuery,
  useGetFeedbackByIdQuery,
  useUpdateFeedbackStatusMutation,
  useReplyToFeedbackMutation,
  useGetAllReportsQuery,
  useGetReportByIdQuery,
  useUpdateReportStatusMutation,
  useAssignReportMutation,
  useAddReportNoteMutation,
  useResolveReportMutation,
  useGetReportStatsQuery,
  useGetFeedbackAnalyticsQuery,
  useGetSatisfactionMetricsQuery,
} = feedbackManagementApi;
