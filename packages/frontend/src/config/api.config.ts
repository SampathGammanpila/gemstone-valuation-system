// API configuration with endpoints
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // Health check
  HEALTH: `${API_URL}/health`,
  
  // Reference data endpoints
  REFERENCE: {
    GEMSTONE_FAMILIES: `${API_URL}/reference/gemstone-families`,
    GEMSTONE_FAMILY: (id: number) => `${API_URL}/reference/gemstone-families/${id}`,
    CUT_SHAPES: `${API_URL}/reference/cut-shapes`,
    CUT_SHAPE: (id: number) => `${API_URL}/reference/cut-shapes/${id}`,
    COLORS: `${API_URL}/reference/colors`,
    COLOR: (id: number) => `${API_URL}/reference/colors/${id}`,
    COLOR_GRADES: `${API_URL}/reference/color-grades`,
    COLOR_GRADE: (id: number) => `${API_URL}/reference/color-grades/${id}`,
    CLARITY_GRADES: `${API_URL}/reference/clarity-grades`,
    CLARITY_GRADE: (id: number) => `${API_URL}/reference/clarity-grades/${id}`,
  },
  
  // Authentication endpoints
  AUTH: {
    LOGIN: `${API_URL}/auth/login`,
    REGISTER: `${API_URL}/auth/register`,
    FORGOT_PASSWORD: `${API_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_URL}/auth/reset-password`,
    VERIFY_EMAIL: `${API_URL}/auth/verify-email`,
    CSRF_TOKEN: `${API_URL}/auth/csrf-token`, // Added missing CSRF token endpoint
  },
  
  // User endpoints
  USER: {
    PROFILE: `${API_URL}/user/profile`,
    GEMSTONES: `${API_URL}/user/gemstones`,
    GEMSTONE: (id: number) => `${API_URL}/user/gemstones/${id}`,
    TRANSFERS: `${API_URL}/user/transfers`,
    TRANSFER: (id: number) => `${API_URL}/user/transfers/${id}`,
  },
  
  // Admin endpoints
  ADMIN: {
    DASHBOARD: `${API_URL}/admin/dashboard`,
    USERS: `${API_URL}/admin/users`,
    USER: (id: number) => `${API_URL}/admin/users/${id}`,
    GEMSTONES: `${API_URL}/admin/gemstones`,
    GEMSTONE: (id: number) => `${API_URL}/admin/gemstones/${id}`,
    TRANSFERS: `${API_URL}/admin/transfers`,
    TRANSFER: (id: number) => `${API_URL}/admin/transfers/${id}`,
    AUDIT_LOG: `${API_URL}/admin/audit-log`,
    SYSTEM_SETTINGS: `${API_URL}/admin/system-settings`,
  },
};

export default API_ENDPOINTS;