import { baseApi } from "../../baseAPi";
import { ADMIN_ENDPOINTS } from "../../../constants";
import type {
  ApiResponse,
  SchedulerJobResponse,
  SchedulerStatusResponse,
} from "../../../types";

const TAGS = {
  SCHEDULER: "Scheduler",
  ORDERS: "Orders",
  LOCKERS: "Lockers",
} as const;

export const schedulerManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    triggerAutoCancel: builder.mutation<ApiResponse<SchedulerJobResponse>, void>({
      query: () => ({
        url: ADMIN_ENDPOINTS.SCHEDULER_AUTO_CANCEL,
        method: "POST",
      }),
      invalidatesTags: [TAGS.SCHEDULER, TAGS.ORDERS],
    }),

    triggerBoxRelease: builder.mutation<ApiResponse<SchedulerJobResponse>, void>({
      query: () => ({
        url: ADMIN_ENDPOINTS.SCHEDULER_RELEASE_BOXES,
        method: "POST",
      }),
      invalidatesTags: [TAGS.SCHEDULER, TAGS.LOCKERS],
    }),

    triggerPickupReminders: builder.mutation<ApiResponse<SchedulerJobResponse>, void>({
      query: () => ({
        url: ADMIN_ENDPOINTS.SCHEDULER_PICKUP_REMINDERS,
        method: "POST",
      }),
      invalidatesTags: [TAGS.SCHEDULER],
    }),

    getSchedulerStatus: builder.query<ApiResponse<SchedulerStatusResponse>, void>({
      query: () => ADMIN_ENDPOINTS.SCHEDULER_STATUS,
      providesTags: [TAGS.SCHEDULER],
    }),
  }),
});

export const {
  useTriggerAutoCancelMutation,
  useTriggerBoxReleaseMutation,
  useTriggerPickupRemindersMutation,
  useGetSchedulerStatusQuery,
} = schedulerManagementApi;
