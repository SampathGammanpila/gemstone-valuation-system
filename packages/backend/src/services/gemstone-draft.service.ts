// packages/backend/src/services/gemstone-draft.service.ts

import gemstoneDraftRepository from '../db/repositories/gemstone-draft.repository';
import { ApiError } from '../api/middlewares/error.middleware';

/**
 * Service for gemstone draft operations
 */
class GemstoneDraftService {
  /**
   * Get all drafts for a user
   */
  async getAllDrafts(userId: number, page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;
      
      return await gemstoneDraftRepository.getAllDrafts(userId, limit, offset);
    } catch (error) {
      console.error('Error fetching all drafts:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific draft by ID
   */
  async getDraftById(draftId: number, userId: number) {
    try {
      const draft = await gemstoneDraftRepository.getDraftById(draftId);
      
      // Check if draft exists and belongs to the user
      if (!draft || draft.user_id !== userId) {
        return null;
      }
      
      return draft;
    } catch (error) {
      console.error(`Error fetching draft ${draftId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new draft
   */
  async createDraft(draftData: any, userId: number) {
    try {
      // Ensure status is 'draft'
      const data = {
        ...draftData,
        user_id: userId,
        status: 'draft'
      };
      
      // Check draft limit (max 20 drafts per user)
      const draftCount = await this.getDraftCount(userId);
      
      if (draftCount >= 20) {
        throw new ApiError(
          400,
          'You have reached the maximum number of drafts (20)',
          { limit: 20, current: draftCount }
        );
      }
      
      return await gemstoneDraftRepository.createDraft(data);
    } catch (error) {
      console.error('Error creating draft:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing draft
   */
  async updateDraft(draftId: number, draftData: any, userId: number) {
    try {
      // Ensure status is 'draft'
      const data = {
        ...draftData,
        status: 'draft'
      };
      
      // Remove user_id from update data if present
      delete data.user_id;
      
      // Check if draft exists and belongs to the user
      const existingDraft = await gemstoneDraftRepository.getDraftById(draftId);
      
      if (!existingDraft) {
        throw new ApiError(404, 'Draft not found');
      }
      
      if (existingDraft.user_id !== userId) {
        throw new ApiError(403, 'Unauthorized access to draft');
      }
      
      return await gemstoneDraftRepository.updateDraft(draftId, data);
    } catch (error) {
      console.error(`Error updating draft ${draftId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a draft
   */
  async deleteDraft(draftId: number, userId: number) {
    try {
      // Check if draft exists and belongs to the user
      const existingDraft = await gemstoneDraftRepository.getDraftById(draftId);
      
      if (!existingDraft) {
        throw new ApiError(404, 'Draft not found');
      }
      
      if (existingDraft.user_id !== userId) {
        throw new ApiError(403, 'Unauthorized access to draft');
      }
      
      return await gemstoneDraftRepository.deleteDraft(draftId);
    } catch (error) {
      console.error(`Error deleting draft ${draftId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get draft count for a user
   */
  async getDraftCount(userId: number): Promise<number> {
    try {
      return await gemstoneDraftRepository.getDraftCount(userId);
    } catch (error) {
      console.error('Error getting draft count:', error);
      throw error;
    }
  }
  
  /**
   * Convert draft to gemstone
   */
  async convertDraftToGemstone(draftId: number, gemstoneData: any, userId: number) {
    try {
      // Check if draft exists and belongs to the user
      const existingDraft = await gemstoneDraftRepository.getDraftById(draftId);
      
      if (!existingDraft) {
        throw new ApiError(404, 'Draft not found');
      }
      
      if (existingDraft.user_id !== userId) {
        throw new ApiError(403, 'Unauthorized access to draft');
      }
      
      // Create gemstone from draft data
      // This will be handled by the gemstone service, but we'll delete the draft here
      await gemstoneDraftRepository.deleteDraft(draftId);
      
      return true;
    } catch (error) {
      console.error(`Error converting draft ${draftId} to gemstone:`, error);
      throw error;
    }
  }
}

export default new GemstoneDraftService();