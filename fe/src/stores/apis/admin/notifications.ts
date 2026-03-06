import { baseApi } from "../../baseAPi";
import { ADMIN_ENDPOINTS } from "../../../constants";
import type {
  ApiResponse,
  Page,
  PageableRequest,
  AdminNotificationResponse,
  CreateNotificationRequest,
  BroadcastNotificationRequest,
  UpdateNotificationStatusRequest,
  NotificationStatsResponse,
  BroadcastResult,
  NotificationTemplateResponse,
} from "../../../types";
import type {
  NotificationStatus,
  NotificationType,
  NotificationChannel,
} from "../../../types/admin/enums";

const TAGS = {
  NOTIFICATIONS: "Notifications",
  NOTIFICATION_STATS: "NotificationStats",
  NOTIFICATION_TEMPLATES: "NotificationTemplates",
} as const;

export interface GetNotificationsParams extends PageableRequest {
  type?: NotificationType;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  recipientId?: number;
}

export const notificationManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllNotifications: builder.query<
      ApiResponse<Page<AdminNotificationResponse>>,
      GetNotificationsParams
    >({
      query: (params) => ({
        url: ADMIN_ENDPOINTS.NOTIFICATIONS,
        params,
      }),
      providesTags: [TAGS.NOTIFICATIONS],
    }),

    getNotificationById: builder.query<
      ApiResponse<AdminNotificationResponse>,
      number
    >({
      query: (id) => ADMIN_ENDPOINTS.NOTIFICATION_BY_ID(id),
      providesTags: (result, error, id) => [{ type: TAGS.NOTIFICATIONS, id }],
    }),

    createNotification: builder.mutation<
      ApiResponse<AdminNotificationResponse>,
      CreateNotificationRequest
    >({
      query: (data) => ({
        url: ADMIN_ENDPOINTS.NOTIFICATIONS,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TAGS.NOTIFICATIONS, TAGS.NOTIFICATION_STATS],
    }),

    updateNotificationStatus: builder.mutation<
      ApiResponse<AdminNotificationResponse>,
      { id: number; data: UpdateNotificationStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: ADMIN_ENDPOINTS.NOTIFICATION_STATUS(id),
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: TAGS.NOTIFICATIONS, id },
        TAGS.NOTIFICATIONS,
        TAGS.NOTIFICATION_STATS,
      ],
    }),

    deleteNotification: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: ADMIN_ENDPOINTS.NOTIFICATION_BY_ID(id),
        method: "DELETE",
      }),
      invalidatesTags: [TAGS.NOTIFICATIONS, TAGS.NOTIFICATION_STATS],
    }),

    bulkDeleteNotifications: builder.mutation<ApiResponse<void>, number[]>({
      query: (ids) => ({
        url: ADMIN_ENDPOINTS.NOTIFICATION_BULK_DELETE,
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: [TAGS.NOTIFICATIONS, TAGS.NOTIFICATION_STATS],
    }),

    broadcastNotification: builder.mutation<
      ApiResponse<BroadcastResult>,
      BroadcastNotificationRequest
    >({
      query: (data) => ({
        url: ADMIN_ENDPOINTS.NOTIFICATION_BROADCAST,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [TAGS.NOTIFICATIONS, TAGS.NOTIFICATION_STATS],
    }),

    getNotificationStats: builder.query<
      ApiResponse<NotificationStatsResponse>,
      void
    >({
      query: () => ADMIN_ENDPOINTS.NOTIFICATION_STATS,
      providesTags: [TAGS.NOTIFICATION_STATS],
    }),

    getNotificationTemplates: builder.query<
      ApiResponse<NotificationTemplateResponse[]>,
      void
    >({
      query: () => ADMIN_ENDPOINTS.NOTIFICATION_TEMPLATES,
      providesTags: [TAGS.NOTIFICATION_TEMPLATES],
    }),

    resendNotification: builder.mutation<
      ApiResponse<AdminNotificationResponse>,
      number
    >({
      query: (id) => ({
        url: ADMIN_ENDPOINTS.NOTIFICATION_RESEND(id),
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: TAGS.NOTIFICATIONS, id },
        TAGS.NOTIFICATIONS,
      ],
    }),
  }),
});

export const {
  useGetAllNotificationsQuery,
  useGetNotificationByIdQuery,
  useCreateNotificationMutation,
  useUpdateNotificationStatusMutation,
  useDeleteNotificationMutation,
  useBulkDeleteNotificationsMutation,
  useBroadcastNotificationMutation,
  useGetNotificationStatsQuery,
  useGetNotificationTemplatesQuery,
  useResendNotificationMutation,
} = notificationManagementApi;
