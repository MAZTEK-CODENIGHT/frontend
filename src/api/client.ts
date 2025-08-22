import axios, { AxiosResponse, AxiosError } from 'axios';

const BASE_URL = 'http://10.0.2.2:2020/api';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    console.log('API Response:', response.status, response.config.url);

    // Check if backend response has success field
    if (response.data && typeof response.data.success === 'boolean') {
      if (!response.data.success) {
        return Promise.reject({
          response: {
            data: response.data.error || { message: 'Unknown error' },
            status: response.status,
          },
        });
      }
    }

    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    console.error(
      'API Response Error:',
      error.response?.status,
      error.response?.data,
    );

    // Handle backend error format
    if (error.response?.data?.error) {
      return Promise.reject({
        response: {
          data: error.response.data.error,
          status: error.response.status,
        },
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
