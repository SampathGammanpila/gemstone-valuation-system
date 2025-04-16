// packages/backend/src/api/controllers/gemstone-draft.controller.ts

import { Request, Response, NextFunction } from 'express';
import gemstoneDraftService from '../../services/gemstone-draft.service';
import { ApiError } from '../middlewares/error.middleware';

/**
 * Controller for gemstone draft operations
 */
class GemstoneDraftController {
  /**
   * Get all drafts for the current user
   */
  async getAllDrafts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      const drafts = await gemstoneDraftService.getAllDrafts(userId);
      
      res.status(200).json({
        success: true,
        data: drafts
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get draft by ID
   */
  async getDraftById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const draftId = parseInt(req.params.id);
      
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      const draft = await gemstoneDraftService.getDraftById(draftId, userId);
      
      if (!draft) {
        throw new ApiError(404, 'Draft not found');
      }
      
      res.status(200).json({
        success: true,
        data: draft
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Create a new draft
   */
  async createDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      // Set status to draft explicitly
      const draftData = {
        ...req.body,
        status: 'draft'
      };
      
      const draft = await gemstoneDraftService.createDraft(draftData, userId);
      
      res.status(201).json({
        success: true,
        message: 'Draft created successfully',
        data: draft
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update an existing draft
   */
  async updateDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const draftId = parseInt(req.params.id);
      
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      // Ensure the draft exists and belongs to the user
      const existingDraft = await gemstoneDraftService.getDraftById(draftId, userId);
      
      if (!existingDraft) {
        throw new ApiError(404, 'Draft not found');
      }
      
      // Set status to draft explicitly
      const draftData = {
        ...req.body,
        status: 'draft'
      };
      
      const updatedDraft = await gemstoneDraftService.updateDraft(draftId, draftData, userId);
      
      res.status(200).json({
        success: true,
        message: 'Draft updated successfully',
        data: updatedDraft
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete a draft
   */
  async deleteDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const draftId = parseInt(req.params.id);
      
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      // Ensure the draft exists and belongs to the user
      const existingDraft = await gemstoneDraftService.getDraftById(draftId, userId);
      
      if (!existingDraft) {
        throw new ApiError(404, 'Draft not found');
      }
      
      await gemstoneDraftService.deleteDraft(draftId, userId);
      
      res.status(200).json({
        success: true,
        message: 'Draft deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get draft count
   */
  async getDraftCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      const count = await gemstoneDraftService.getDraftCount(userId);
      
      res.status(200).json({
        success: true,
        data: {
          count
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new GemstoneDraftController();