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

const AuthService = {
  /**
   * Login user
   */
  login: async (credentials: LoginInput): Promise<{ token: string; user: User; profile: any }> => {
    const response = await api.post<{ token: string; user: User; profile: any }>(
      API_ENDPOINTS.AUTH.LOGIN, 
      credentials
    );
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  },

  /**
   * Register user
   */
  register: async (userData: RegisterInput): Promise<{ success: boolean; message: string; userId: number }> => {
    return api.post<{ success: boolean; message: string; userId: number }>(
      API_ENDPOINTS.AUTH.REGISTER, 
      userData
    );
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
   * Request password reset
   */
  forgotPassword: async (data: PasswordResetRequestInput): Promise<{ success: boolean; message: string }> => {
    return api.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD, 
      data
    );
  },

  /**
   * Reset password
   */
  resetPassword: async (data: PasswordResetInput): Promise<{ success: boolean; message: string }> => {
    return api.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD, 
      data
    );
  },

  /**
   * Logout user
   */
  logout: (): void => {
    localStorage.removeItem('token');
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get token
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  }
};

export default AuthService;