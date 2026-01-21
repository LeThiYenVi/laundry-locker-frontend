import { baseApi } from "../baseAPi";
import { ADMIN_ENDPOINTS } from "../../constants";

interface DashboardStats {
  totalUsers: number;
  totalLockers: number;
  totalOrders: number;
  activeOrders: number;
  revenue: number;
  utilization: number;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Locker {
  id: string;
  location: string;
  status: 'available' | 'occupied' | 'maintenance';
  capacity: number;
  currentUsage: number;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard Stats
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ADMIN_ENDPOINTS.DASHBOARD,
      providesTags: ["Admin"],
    }),

    // Users Management
    getUsers: builder.query<{ users: User[]; total: number }, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: ADMIN_ENDPOINTS.USERS,
        params,
      }),
      providesTags: ["Admin"],
    }),

    createUser: builder.mutation<User, Omit<User, 'id' | 'createdAt'>>({
      query: (userData) => ({
        url: ADMIN_ENDPOINTS.USERS,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Admin"],
    }),

    updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `${ADMIN_ENDPOINTS.USERS}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `${ADMIN_ENDPOINTS.USERS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin"],
    }),

    // Lockers Management
    getLockers: builder.query<{ lockers: Locker[]; total: number }, { page?: number; limit?: number; status?: string }>({
      query: (params) => ({
        url: ADMIN_ENDPOINTS.LOCKERS,
        params,
      }),
      providesTags: ["Admin"],
    }),

    updateLocker: builder.mutation<Locker, { id: string; data: Partial<Locker> }>({
      query: ({ id, data }) => ({
        url: `${ADMIN_ENDPOINTS.LOCKERS}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),

    // Orders Management
    getOrders: builder.query<any[], { page?: number; limit?: number; status?: string }>({
      query: (params) => ({
        url: ADMIN_ENDPOINTS.ORDERS,
        params,
      }),
      providesTags: ["Admin"],
    }),

    // Analytics
    getAnalytics: builder.query<any, { startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: ADMIN_ENDPOINTS.ANALYTICS,
        params,
      }),
      providesTags: ["Admin"],
    }),

    // Settings
    getSettings: builder.query<any, void>({
      query: () => ADMIN_ENDPOINTS.SETTINGS,
      providesTags: ["Admin"],
    }),

    updateSettings: builder.mutation<any, Partial<any>>({
      query: (settings) => ({
        url: ADMIN_ENDPOINTS.SETTINGS,
        method: "PUT",
        body: settings,
      }),
      invalidatesTags: ["Admin"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetLockersQuery,
  useUpdateLockerMutation,
  useGetOrdersQuery,
  useGetAnalyticsQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} = adminApi;