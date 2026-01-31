import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, CONTENT_TYPES } from '../constants';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', CONTENT_TYPES.JSON);
      return headers;
    },
  }),
  tagTypes: [
    'User',
    'Auth',
    'Users',
    'Stores',
    'Services',
    'Lockers',
    'Orders',
    'Payments',
    'Dashboard',
    'Scheduler',
    'Loyalty',
    'Partners',
    'Partner',
    'PartnerOrders',
    'PartnerAccessCodes',
    'PartnerStores',
    'PartnerStaff',
    'PartnerLockers',
    'PartnerRevenue',
    'PartnerStatistics',
  ],

  endpoints: () => ({}),
});
