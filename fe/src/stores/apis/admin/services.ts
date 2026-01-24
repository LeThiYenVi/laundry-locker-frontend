import { baseApi } from "../../baseAPi";
import { ADMIN_ENDPOINTS } from "../../../constants";
import type {
  ApiResponse,
  Page,
  PageableRequest,
  AdminServiceResponse,
  CreateServiceRequest,
  UpdateServicePriceRequest,
  UpdateUserStatusRequest,
} from "../../../types";

const TAGS = {
  SERVICES: "Services",
} as const;

export const serviceManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllServices: builder.query<ApiResponse<Page<AdminServiceResponse>>, PageableRequest>({
      query: (params) => ({
        url: ADMIN_ENDPOINTS.SERVICES,
        params,
      }),
      providesTags: [TAGS.SERVICES],
    }),

    getServiceById: builder.query<ApiResponse<AdminServiceResponse>, number>({
      query: (id) => ADMIN_ENDPOINTS.SERVICE_BY_ID(id),
      providesTags: (result, error, id) => [{ type: TAGS.SERVICES, id }],
    }),

    createService: builder.mutation<ApiResponse<AdminServiceResponse>, CreateServiceRequest>({
      query: (serviceData) => ({
        url: ADMIN_ENDPOINTS.SERVICES,
        method: "POST",
        body: serviceData,
      }),
      invalidatesTags: [TAGS.SERVICES],
    }),

    updateService: builder.mutation<
      ApiResponse<AdminServiceResponse>,
      { id: number; data: CreateServiceRequest }
    >({
      query: ({ id, data }) => ({
        url: ADMIN_ENDPOINTS.SERVICE_BY_ID(id),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAGS.SERVICES, id }, TAGS.SERVICES],
    }),

    updateServicePrice: builder.mutation<
      ApiResponse<AdminServiceResponse>,
      { id: number; data: UpdateServicePriceRequest }
    >({
      query: ({ id, data }) => ({
        url: ADMIN_ENDPOINTS.SERVICE_PRICE(id),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAGS.SERVICES, id }, TAGS.SERVICES],
    }),

    updateServiceStatus: builder.mutation<
      ApiResponse<AdminServiceResponse>,
      { id: number; data: UpdateUserStatusRequest }
    >({
      query: ({ id, data }) => ({
        url: ADMIN_ENDPOINTS.SERVICE_STATUS(id),
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: TAGS.SERVICES, id }, TAGS.SERVICES],
    }),

    deleteService: builder.mutation<ApiResponse<void>, number>({
      query: (id) => ({
        url: ADMIN_ENDPOINTS.SERVICE_BY_ID(id),
        method: "DELETE",
      }),
      invalidatesTags: [TAGS.SERVICES],
    }),
  }),
});

export const {
  useGetAllServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useUpdateServicePriceMutation,
  useUpdateServiceStatusMutation,
  useDeleteServiceMutation,
} = serviceManagementApi;
