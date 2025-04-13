import { Request, Response } from 'express';
import userService from '../../services/user.service';

class UserController {
  /**
   * Get user profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      const userProfile = await userService.getUserProfile(userId);
      
      res.status(200).json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile'
      });
    }
  }
  
  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      const updatedProfile = await userService.updateUserProfile(userId, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }
  
  /**
   * Change password
   */
  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      await userService.changePassword(userId, currentPassword, newPassword);
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      
      // Determine appropriate status code
      const statusCode = 
        error instanceof Error && 
        error.message.includes('Invalid current password') 
          ? 400 // Bad Request
          : 500; // Server Error
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to change password'
      });
    }
  }
  
  /**
   * Get cutter portfolio
   */
  async getCutterPortfolio(req: Request, res: Response) {
    try {
      const cutterId = parseInt(req.params.cutterId);
      
      const portfolio = await userService.getCutterPortfolio(cutterId);
      
      res.status(200).json({
        success: true,
        data: portfolio
      });
    } catch (error) {
      console.error('Get cutter portfolio error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cutter portfolio'
      });
    }
  }
  
  /**
   * Add item to cutter portfolio
   */
  async addPortfolioItem(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      const portfolioItem = await userService.addPortfolioItem(userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Portfolio item added successfully',
        data: portfolioItem
      });
    } catch (error) {
      console.error('Add portfolio item error:', error);
      
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add portfolio item'
      });
    }
  }
  
  /**
   * Update portfolio item
   */
  async updatePortfolioItem(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      const itemId = parseInt(req.params.itemId);
      
      const portfolioItem = await userService.updatePortfolioItem(userId, itemId, req.body);
      
      res.status(200).json({
        success: true,
        message: 'Portfolio item updated successfully',
        data: portfolioItem
      });
    } catch (error) {
      console.error('Update portfolio item error:', error);
      
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update portfolio item'
      });
    }
  }
  
  /**
   * Delete portfolio item
   */
  async deletePortfolioItem(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      const itemId = parseInt(req.params.itemId);
      
      await userService.deletePortfolioItem(userId, itemId);
      
      res.status(200).json({
        success: true,
        message: 'Portfolio item deleted successfully'
      });
    } catch (error) {
      console.error('Delete portfolio item error:', error);
      
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete portfolio item'
      });
    }
  }
  
  /**
   * Get all cutters
   */
  async getAllCutters(req: Request, res: Response) {
    try {
      const cutters = await userService.getAllCutters();
      
      res.status(200).json({
        success: true,
        data: cutters
      });
    } catch (error) {
      console.error('Get all cutters error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cutters'
      });
    }
  }
  
  /**
   * Get cutter details
   */
  async getCutterDetails(req: Request, res: Response) {
    try {
      const cutterId = parseInt(req.params.cutterId);
      
      const cutterDetails = await userService.getCutterDetails(cutterId);
      
      if (!cutterDetails) {
        return res.status(404).json({
          success: false,
          message: 'Cutter not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: cutterDetails
      });
    } catch (error) {
      console.error('Get cutter details error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cutter details'
      });
    }
  }
}

export default new UserController();