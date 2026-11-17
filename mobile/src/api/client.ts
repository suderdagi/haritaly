import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '@/src/types';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
export const TOKEN_KEY = 'userToken';

const http = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Lets the auth store log the user out when the server rejects the token
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRoute) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

/** Every endpoint returns `{ success, data }`; this unwraps `data`. */
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<ApiResponse<T>>(config);
  return response.data.data as T;
}

export const api = {
  get: <T>(url: string, params?: Record<string, unknown>) => request<T>({ method: 'GET', url, params }),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ method: 'POST', url, data, ...config }),
  put: <T>(url: string, data?: unknown) => request<T>({ method: 'PUT', url, data }),
  delete: <T>(url: string, params?: Record<string, unknown>) =>
    request<T>({ method: 'DELETE', url, params }),
};

/** Human readable message for alerts, using the API's error text when there is one. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Could not reach the server. Check your connection.';
    return (error.response.data as ApiResponse<unknown>)?.error ?? fallback;
  }
  return fallback;
}

/** Uploaded photos are stored as relative paths like `/uploads/abc.jpg`. */
export function assetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return API_URL.replace(/\/api\/?$/, '') + path;
}
