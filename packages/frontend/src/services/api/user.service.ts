import api from './api.service';
import API_ENDPOINTS from '../../config/api.config';
import { 
  UserProfileResponse, 
  ProfileUpdateInput, 
  PasswordChangeInput, 
  PortfolioItem,
  CutterListItem,
  CutterDetailResponse
} from '../../types/user.types';

const UserService = {
  /**
   * Get current user profile
   */
  getUserProfile: async (): Promise<UserProfileResponse> => {
    return api.get<UserProfileResponse>(API_ENDPOINTS.USER.PROFILE);
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: ProfileUpdateInput): Promise<UserProfileResponse> => {
    return api.put<UserProfileResponse>(API_ENDPOINTS.USER.PROFILE, data);
  },

  /**
   * Change password
   */
  changePassword: async (data: PasswordChangeInput): Promise<{ success: boolean; message: string }> => {
    return api.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.USER.CHANGE_PASSWORD, 
      data
    );
  },

  /**
   * Add portfolio item
   */
  addPortfolioItem: async (data: Partial<PortfolioItem>): Promise<PortfolioItem> => {
    return api.post<PortfolioItem>(API_ENDPOINTS.USER.PORTFOLIO, data);
  },

  /**
   * Update portfolio item
   */
  updatePortfolioItem: async (itemId: number, data: Partial<PortfolioItem>): Promise<PortfolioItem> => {
    return api.put<PortfolioItem>(
      `${API_ENDPOINTS.USER.PORTFOLIO}/${itemId}`, 
      data
    );
  },

  /**
   * Delete portfolio item
   */
  deletePortfolioItem: async (itemId: number): Promise<{ success: boolean; message: string }> => {
    return api.delete<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.USER.PORTFOLIO}/${itemId}`
    );
  },

  /**
   * Get all cutters
   */
  getAllCutters: async (): Promise<CutterListItem[]> => {
    return api.get<CutterListItem[]>(API_ENDPOINTS.USER.CUTTERS);
  },

  /**
   * Get cutter details
   */
  getCutterDetails: async (cutterId: number): Promise<CutterDetailResponse> => {
    return api.get<CutterDetailResponse>(`${API_ENDPOINTS.USER.CUTTERS}/${cutterId}`);
  },

  /**
   * Get cutter portfolio
   */
  getCutterPortfolio: async (cutterId: number): Promise<PortfolioItem[]> => {
    return api.get<PortfolioItem[]>(`${API_ENDPOINTS.USER.CUTTERS}/${cutterId}/portfolio`);
  }
};

export default UserService;