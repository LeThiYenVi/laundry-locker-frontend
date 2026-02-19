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
    'Loyalty',      // Giữ từ main cho Admin
    'Partners',     // Giữ từ main cho Admin management
    'Partner',      // Thêm cho Partner profile
    'AccessCodes',  // Thêm cho Staff Access Code logic
    'PartnerOrder', // Thêm cho luồng xử lý đơn của Partner
    'Notifications', // Thêm cho hệ thống thông báo realtime
  ],

  endpoints: () => ({}),
});