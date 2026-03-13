import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

// Configure base URL - update this for production
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8080/api";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Increased to 60 seconds
});

// Log the base URL for debugging
console.log("API Base URL:", BASE_URL);

// Token storage keys
export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

// Token helpers
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setTokens = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

// Global logout callback — registered by AuthProvider so the interceptor can
// force-logout the user when the refresh token is invalid (e.g. stale JWT after DB reset).
let _logoutCallback: (() => Promise<void>) | null = null;
export const setLogoutCallback = (cb: () => Promise<void>) => {
  _logoutCallback = cb;
};

// Request interceptor - add token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details for debugging
    console.log("API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      hasAuth: !!config.headers.Authorization,
    });

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log("=== API RESPONSE ===");
    console.log(`URL: ${response.config.url}`);
    console.log(`Status: ${response.status}`);
    console.log(`Data:`, JSON.stringify(response.data, null, 2));
    console.log("====================");
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const responseData = (error.response?.data || {}) as {
      code?: string;
      message?: string;
    };

    // Backend can return 400 E_LOYALTY001 when JWT userId no longer exists in DB
    // (common in dev after resetting DB). Treat it like an unauthorized session.
    if (
      error.response?.status === 400 &&
      responseData.code === "E_LOYALTY001"
    ) {
      await clearTokens();
      if (_logoutCallback) {
        await _logoutCallback().catch(() => {});
      }
      return Promise.reject(error);
    }

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          await clearTokens();
          return Promise.reject(error);
        }

        // Refresh the token
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data.data;
        await setTokens(newAccessToken, newRefreshToken || refreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await clearTokens();
        if (_logoutCallback) {
          _logoutCallback().catch(() => {});
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
