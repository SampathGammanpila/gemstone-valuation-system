import api from './api.service';
import API_ENDPOINTS from '../../config/api.config';
import { 
  LoginInput, 
  RegisterInput, 
  PasswordResetRequestInput, 
  PasswordResetInput, 
  EmailVerificationInput,
  User
} from '../../types/user.types';

// Enhanced security utility function for token storage 
const secureStorage = {
  setToken: (token: string): void => {
    // Set token with httpOnly flag if possible via secure cookie
    // For localStorage version, add timestamp for token expiration
    localStorage.setItem('token', token);
    localStorage.setItem('token_timestamp', Date.now().toString());
  },
  
  getToken: (): string | null => {
    const token = localStorage.getItem('token');
    const timestamp = localStorage.getItem('token_timestamp');
    
    // Check token expiration (24 hours)
    if (token && timestamp) {
      const now = Date.now();
      const tokenTime = parseInt(timestamp, 10);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (now - tokenTime > maxAge) {
        // Token expired, clear it
        secureStorage.clearToken();
        return null;
      }
    }
    
    return token;
  },
  
  clearToken: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_timestamp');
  }
};

const AuthService = {
  /**
   * Login user with CSRF protection
   */
  login: async (credentials: LoginInput): Promise<{ token: string; user: User; profile: any }> => {
    try {
      // Check if CSRF endpoint is configured
      if (!API_ENDPOINTS.AUTH.CSRF_TOKEN) {
        // If CSRF endpoint isn't available, proceed without it
        const response = await api.post<{ token: string; user: User; profile: any }>(
          API_ENDPOINTS.AUTH.LOGIN, 
          credentials
        );
        
        // Securely store token
        if (response.token) {
          secureStorage.setToken(response.token);
        }
        
        return response;
      }
      
      // Try to get CSRF token (with fallback if it fails)
      let csrfHeader = {};
      try {
        const csrfResponse = await api.get<any>(API_ENDPOINTS.AUTH.CSRF_TOKEN);
        
        // Handle different possible response formats
        if (csrfResponse && typeof csrfResponse === 'object') {
          // Option 1: { csrfToken: "token-value" }
          if (csrfResponse.csrfToken) {
            csrfHeader = { 'X-CSRF-Token': csrfResponse.csrfToken };
          } 
          // Option 2: { data: { csrfToken: "token-value" } }
          else if (csrfResponse.data && csrfResponse.data.csrfToken) {
            csrfHeader = { 'X-CSRF-Token': csrfResponse.data.csrfToken };
          }
          // Option 3: { token: "token-value" }
          else if (csrfResponse.token) {
            csrfHeader = { 'X-CSRF-Token': csrfResponse.token };
          }
        }
      } catch (error) {
        console.warn('Failed to get CSRF token, proceeding without it:', error);
        // Continue without CSRF token
      }
      
      // Add CSRF token to request headers (if available)
      const response = await api.post<{ token: string; user: User; profile: any }>(
        API_ENDPOINTS.AUTH.LOGIN, 
        credentials,
        {
          headers: csrfHeader
        }
      );
      
      // Securely store token
      if (response.token) {
        secureStorage.setToken(response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register user with CSRF protection
   */
  register: async (userData: RegisterInput): Promise<{ success: boolean; message: string; userId: number }> => {
    try {
      // Check if CSRF endpoint is configured
      if (!API_ENDPOINTS.AUTH.CSRF_TOKEN) {
        return api.post<{ success: boolean; message: string; userId: number }>(
          API_ENDPOINTS.AUTH.REGISTER, 
          userData
        );
      }
      
      // Try to get CSRF token (with fallback if it fails)
      let csrfHeader = {};
      try {
        const csrfResponse = await api.get<any>(API_ENDPOINTS.AUTH.CSRF_TOKEN);
        
        // Handle different possible response formats
        if (csrfResponse && typeof csrfResponse === 'object') {
          if (csrfResponse.csrfToken) {
            csrfHeader = { 'X-CSRF-Token': csrfResponse.csrfToken };
          } else if (csrfResponse.data && csrfResponse.data.csrfToken) {
            csrfHeader = { 'X-CSRF-Token': csrfResponse.data.csrfToken };
          } else if (csrfResponse.token) {
            csrfHeader = { 'X-CSRF-Token': csrfResponse.token };
          }
        }
      } catch (error) {
        console.warn('Failed to get CSRF token, proceeding without it:', error);
      }
      
      return api.post<{ success: boolean; message: string; userId: number }>(
        API_ENDPOINTS.AUTH.REGISTER, 
        userData,
        {
          headers: csrfHeader
        }
      );
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Verify email
   */
  verifyEmail: async (data: EmailVerificationInput): Promise<{ success: boolean; message: string }> => {
    return api.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL, 
      data
    );
  },

  /**
   * Request password reset with CSRF protection
   */
  forgotPassword: async (data: PasswordResetRequestInput): Promise<{ success: boolean; message: string }> => {
    try {
      // Similar CSRF handling as login
      let csrfHeader = {};
      
      if (API_ENDPOINTS.AUTH.CSRF_TOKEN) {
        try {
          const csrfResponse = await api.get<any>(API_ENDPOINTS.AUTH.CSRF_TOKEN);
          if (csrfResponse && typeof csrfResponse === 'object') {
            if (csrfResponse.csrfToken) {
              csrfHeader = { 'X-CSRF-Token': csrfResponse.csrfToken };
            } else if (csrfResponse.data && csrfResponse.data.csrfToken) {
              csrfHeader = { 'X-CSRF-Token': csrfResponse.data.csrfToken };
            } else if (csrfResponse.token) {
              csrfHeader = { 'X-CSRF-Token': csrfResponse.token };
            }
          }
        } catch (error) {
          console.warn('Failed to get CSRF token, proceeding without it:', error);
        }
      }
      
      return api.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD, 
        data,
        {
          headers: csrfHeader
        }
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  /**
   * Reset password with CSRF protection
   */
  resetPassword: async (data: PasswordResetInput): Promise<{ success: boolean; message: string }> => {
    try {
      // Similar CSRF handling as login
      let csrfHeader = {};
      
      if (API_ENDPOINTS.AUTH.CSRF_TOKEN) {
        try {
          const csrfResponse = await api.get<any>(API_ENDPOINTS.AUTH.CSRF_TOKEN);
          if (csrfResponse && typeof csrfResponse === 'object') {
            if (csrfResponse.csrfToken) {
              csrfHeader = { 'X-CSRF-Token': csrfResponse.csrfToken };
            } else if (csrfResponse.data && csrfResponse.data.csrfToken) {
              csrfHeader = { 'X-CSRF-Token': csrfResponse.data.csrfToken };
            } else if (csrfResponse.token) {
              csrfHeader = { 'X-CSRF-Token': csrfResponse.token };
            }
          }
        } catch (error) {
          console.warn('Failed to get CSRF token, proceeding without it:', error);
        }
      }
      
      return api.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD, 
        data,
        {
          headers: csrfHeader
        }
      );
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: (): void => {
    secureStorage.clearToken();
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn: (): boolean => {
    return !!secureStorage.getToken();
  },

  /**
   * Get token with auto-expiration check
   */
  getToken: (): string | null => {
    return secureStorage.getToken();
  }
};

export default AuthService;