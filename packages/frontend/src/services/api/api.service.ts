import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AuthService from './auth.service';

// Custom error class for API errors
class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Create base axios instance
const api = axios.create({
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Help prevent CSRF
    'X-Content-Type-Options': 'nosniff', // Security header
  },
});

// Request interceptor for adding auth token and security headers
api.interceptors.request.use(
  (config) => {
    // Use the enhanced token getter from AuthService
    const token = AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add security headers
    config.headers['X-Frame-Options'] = 'DENY'; // Prevent clickjacking
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject(new ApiError('Network error. Please check your connection.', 0));
    }
    
    // Handle token expiration
    if (error.response.status === 401) {
      // Clear token and redirect to login
      AuthService.logout();
      window.location.href = '/login?session=expired';
      return Promise.reject(new ApiError('Your session has expired. Please log in again.', 401));
    }
    
    // Handle forbidden
    if (error.response.status === 403) {
      return Promise.reject(new ApiError('You do not have permission to perform this action.', 403));
    }
    
    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
      return Promise.reject(new ApiError('Server error. Please try again later.', error.response.status));
    }
    
    // Handle other errors
    const message = error.response.data?.message || 'An error occurred';
    return Promise.reject(new ApiError(message, error.response.status, error.response.data));
  }
);

// Generic GET request
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: T }> = await api.get(url, config);
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Error fetching data from ${url}:`, error);
    throw new ApiError(`Failed to fetch data from ${url}`, 0);
  }
};

// Generic POST request
export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: T }> = await api.post(url, data, config);
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Error posting data to ${url}:`, error);
    throw new ApiError(`Failed to post data to ${url}`, 0);
  }
};

// Generic PUT request
export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: T }> = await api.put(url, data, config);
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Error updating data at ${url}:`, error);
    throw new ApiError(`Failed to update data at ${url}`, 0);
  }
};

// Generic DELETE request
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: T }> = await api.delete(url, config);
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Error deleting data at ${url}:`, error);
    throw new ApiError(`Failed to delete data at ${url}`, 0);
  }
};

// Public API with retry capability
export const withRetry = async <T>(apiCall: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    if (retries <= 0 || (error instanceof ApiError && error.status >= 400 && error.status < 500)) {
      throw error;
    }
    
    console.log(`Retrying API call. Attempts left: ${retries - 1}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(apiCall, retries - 1, delay * 2);
  }
};

export default {
  get,
  post,
  put,
  delete: del,
  withRetry,
};