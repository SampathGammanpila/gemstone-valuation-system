// packages/frontend/src/services/api/gemstone-draft.service.ts

import api from './api.service';
import API_ENDPOINTS from '../../config/api.config';
import { GemstoneValuationState } from '../../types/validation.types';

/**
 * Service for managing gemstone drafts
 */
const GemstoneDraftService = {
  /**
   * Get all drafts for the current user
   */
  getAllDrafts: async (): Promise<any[]> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: any[];
      }>(API_ENDPOINTS.USER.GEMSTONE_DRAFTS);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching drafts:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific draft by ID
   */
  getDraft: async (draftId: number): Promise<GemstoneValuationState> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: GemstoneValuationState;
      }>(API_ENDPOINTS.USER.GEMSTONE_DRAFT(draftId));
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching draft ${draftId}:`, error);
      throw error;
    }
  },
  
  /**
   * Create a new draft
   */
  createDraft: async (data: Partial<GemstoneValuationState>): Promise<any> => {
    try {
      // Make sure status is set to draft
      const draftData = {
        ...data,
        status: 'draft'
      };
      
      const response = await api.post<{
        success: boolean;
        data: any;
      }>(API_ENDPOINTS.USER.GEMSTONE_DRAFTS, draftData);
      
      return response.data;
    } catch (error) {
      console.error('Error creating draft:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing draft
   */
  updateDraft: async (draftId: number, data: Partial<GemstoneValuationState>): Promise<any> => {
    try {
      // Make sure status is set to draft
      const draftData = {
        ...data,
        status: 'draft'
      };
      
      const response = await api.put<{
        success: boolean;
        data: any;
      }>(API_ENDPOINTS.USER.GEMSTONE_DRAFT(draftId), draftData);
      
      return response.data;
    } catch (error) {
      console.error(`Error updating draft ${draftId}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a draft
   */
  deleteDraft: async (draftId: number): Promise<void> => {
    try {
      await api.delete(API_ENDPOINTS.USER.GEMSTONE_DRAFT(draftId));
    } catch (error) {
      console.error(`Error deleting draft ${draftId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get draft count
   */
  getDraftCount: async (): Promise<number> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: {
          count: number;
        };
      }>(API_ENDPOINTS.USER.GEMSTONE_DRAFTS_COUNT);
      
      return response.data.count;
    } catch (error) {
      console.error('Error fetching draft count:', error);
      throw error;
    }
  }
};

export default GemstoneDraftService;