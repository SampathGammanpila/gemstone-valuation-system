import { Request, Response } from 'express';
import referenceDataService from '../../services/referenceData.service';

// Reference data controller for handling HTTP requests
class ReferenceDataController {
  // Get all gemstone families
  getAllGemstoneFamilies = async (req: Request, res: Response): Promise<void> => {
    try {
      const families = await referenceDataService.getAllGemstoneFamilies();
      res.status(200).json({
        success: true,
        data: families
      });
    } catch (error) {
      console.error('Controller error fetching gemstone families:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gemstone families',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get a specific gemstone family by ID
  getGemstoneFamilyById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const family = await referenceDataService.getGemstoneFamilyById(id);
      res.status(200).json({
        success: true,
        data: family
      });
    } catch (error) {
      console.error(`Controller error fetching gemstone family:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gemstone family',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Create a new gemstone family
  createGemstoneFamily = async (req: Request, res: Response): Promise<void> => {
    try {
      const newFamily = await referenceDataService.createGemstoneFamily(req.body);
      res.status(201).json({
        success: true,
        message: 'Gemstone family created successfully',
        data: newFamily
      });
    } catch (error) {
      console.error('Controller error creating gemstone family:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create gemstone family',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Update an existing gemstone family
  updateGemstoneFamily = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const updatedFamily = await referenceDataService.updateGemstoneFamily(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Gemstone family updated successfully',
        data: updatedFamily
      });
    } catch (error) {
      console.error(`Controller error updating gemstone family:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update gemstone family',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Delete a gemstone family
  deleteGemstoneFamily = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const deletedFamily = await referenceDataService.deleteGemstoneFamily(id);
      res.status(200).json({
        success: true,
        message: 'Gemstone family deleted successfully',
        data: deletedFamily
      });
    } catch (error) {
      console.error(`Controller error deleting gemstone family:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to delete gemstone family',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

export default new ReferenceDataController();