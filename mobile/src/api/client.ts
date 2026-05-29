import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hardcoded baseURL for iOS simulator local development. No .env, no EXPO_PUBLIC_API_URL.
const API_BASE_URL = 'http://localhost:3001/api';
console.log('[apiClient] FINAL API BASE URL:', API_BASE_URL);

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('[apiClient] Using API base URL:', API_BASE_URL);

    // Add token to requests
    this.client.interceptors.request.use(async (config) => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('[API] Error getting token:', error);
      }
      return config;
    });

    // Add response error logging
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('[API] Request failed:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config = {}) {
    console.log('[apiClient] GET', this.client.defaults.baseURL + url);
    return this.client.get<T>(url, config);
  }

  async post<T>(url: string, data = {}, config = {}) {
    return this.client.post<T>(url, data, config);
  }

  async put<T>(url: string, data = {}, config = {}) {
    return this.client.put<T>(url, data, config);
  }

  async delete<T>(url: string, config = {}) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
