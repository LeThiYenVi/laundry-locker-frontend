import { baseApi } from '../../baseAPi';
import type { ApiResponse } from '../../../types';

// ---- Types mirroring locker-service Phase 1/2 DTOs ----

export interface CellResponse {
  id: number;
  boxNumber: number;
  size: string | null;
  cellType: 'DRONE' | 'STANDARD' | 'XL';
  rowIndex: number | null;
  colIndex: number | null;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'FAULT' | string;
  faultReason: string | null;
}

export interface LockerLayoutResponse {
  lockerId: number;
  code: string;
  name: string;
  status: string;
  landingPad: boolean;
  landingMarkerId: string | null;
  totalCells: number;
  availableCells: number;
  faultCells: number;
  cells: CellResponse[];
}

export interface LockerStatsResponse {
  lockerId: number;
  code: string;
  name: string;
  status: string;
  landingPad: boolean;
  totalCells: number;
  availableCells: number;
  reservedCells: number;
  occupiedCells: number;
  faultCells: number;
  utilization: number;
  openReports: number;
}

export interface FaultCellResponse {
  lockerId: number;
  lockerCode: string | null;
  lockerName: string | null;
  lockerAddress: string | null;
  lockerLatitude: number | null;
  lockerLongitude: number | null;
  boxId: number;
  boxNumber: number;
  cellType: string;
  rowIndex: number | null;
  colIndex: number | null;
  faultReason: string | null;
  openReportId: number | null;
}

export interface LockerReportResponse {
  id: number;
  lockerId: number;
  boxId: number | null;
  userId: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | string;
  assignedToUserId: number | null;
  assignedAt: string | null;
  resolvedByUserId: number | null;
  resolvedAt: string | null;
  createdAt: string;
  lockerCode: string | null;
  lockerName: string | null;
  lockerAddress: string | null;
  lockerLatitude: number | null;
  lockerLongitude: number | null;
  boxNumber: number | null;
  cellType: string | null;
}

const TAG = 'Lockers' as const;

export const lockerOpsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLockerStats: builder.query<ApiResponse<LockerStatsResponse[]>, void>({
      query: () => '/api/manage/lockers/stats',
      providesTags: [TAG],
    }),

    getLockerLayout: builder.query<ApiResponse<LockerLayoutResponse>, number>({
      query: (lockerId) => `/api/lockers/${lockerId}/layout`,
      providesTags: (_r, _e, id) => [{ type: TAG, id }],
    }),

    getFaultCells: builder.query<ApiResponse<FaultCellResponse[]>, void>({
      query: () => '/api/maintenance/faults',
      providesTags: [TAG],
    }),

    getMaintenanceReports: builder.query<ApiResponse<LockerReportResponse[]>, void>({
      query: () => '/api/maintenance/reports',
      providesTags: [TAG],
    }),

    claimReport: builder.mutation<ApiResponse<LockerReportResponse>, number>({
      query: (reportId) => ({
        url: `/api/maintenance/reports/${reportId}/claim`,
        method: 'PUT',
      }),
      invalidatesTags: [TAG],
    }),

    resolveReport: builder.mutation<ApiResponse<LockerReportResponse>, number>({
      query: (reportId) => ({
        url: `/api/maintenance/reports/${reportId}/resolve`,
        method: 'PUT',
      }),
      invalidatesTags: [TAG],
    }),

    reportBoxFault: builder.mutation<ApiResponse<CellResponse>, { boxId: number; reason: string }>({
      query: ({ boxId, reason }) => ({
        url: `/api/boxes/${boxId}/fault`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [TAG],
    }),

    clearBoxFault: builder.mutation<ApiResponse<CellResponse>, number>({
      query: (boxId) => ({
        url: `/api/maintenance/boxes/${boxId}/clear-fault`,
        method: 'POST',
      }),
      invalidatesTags: [TAG],
    }),

    // L5 — vòng đời ô: ngưng dùng / vệ sinh / khôi phục
    setBoxOutOfService: builder.mutation<
      ApiResponse<CellResponse>,
      { boxId: number; reason?: string }
    >({
      query: ({ boxId, reason }) => ({
        url: `/api/maintenance/boxes/${boxId}/out-of-service`,
        method: 'POST',
        body: reason ? { reason } : undefined,
      }),
      invalidatesTags: [TAG],
    }),

    setBoxCleaning: builder.mutation<ApiResponse<CellResponse>, number>({
      query: (boxId) => ({
        url: `/api/maintenance/boxes/${boxId}/cleaning`,
        method: 'POST',
      }),
      invalidatesTags: [TAG],
    }),

    returnBoxToService: builder.mutation<ApiResponse<CellResponse>, number>({
      query: (boxId) => ({
        url: `/api/maintenance/boxes/${boxId}/return-to-service`,
        method: 'POST',
      }),
      invalidatesTags: [TAG],
    }),
  }),
});

export const {
  useGetLockerStatsQuery,
  useGetLockerLayoutQuery,
  useGetFaultCellsQuery,
  useGetMaintenanceReportsQuery,
  useClaimReportMutation,
  useResolveReportMutation,
  useReportBoxFaultMutation,
  useClearBoxFaultMutation,
  useSetBoxOutOfServiceMutation,
  useSetBoxCleaningMutation,
  useReturnBoxToServiceMutation,
} = lockerOpsApi;
