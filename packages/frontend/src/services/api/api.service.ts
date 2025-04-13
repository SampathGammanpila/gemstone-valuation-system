import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create base axios instance
const api = axios.create({
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic GET request
export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: T }> = await api.get(url, config);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    throw error;
  }
};

// Generic POST request
export const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: T }> = await api.post(url, data, config);
    return response.data.data;
  } catch (error) {
    console.error(`Error posting data to ${url}:`, error);
    throw error;
  }
};

// Generic PUT request
export const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: T }> = await api.put(url, data, config);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating data at ${url}:`, error);
    throw error;
  }
};

// Generic DELETE request
export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: T }> = await api.delete(url, config);
    return response.data.data;
  } catch (error) {
    console.error(`Error deleting data at ${url}:`, error);
    throw error;
  }
};

export default {
  get,
  post,
  put,
  delete: del,
};