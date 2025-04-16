// packages/backend/src/api/controllers/valuation.controller.ts

import { Request, Response, NextFunction } from 'express';
import valuationService from '../../services/valuation.service';
import referenceDataService from '../../services/referenceData.service';
import { ApiError } from '../middlewares/error.middleware';

/**
 * Controller for gemstone valuation operations
 */
class ValuationController {
  /**
   * Calculate estimated value for a gemstone
   */
  async calculateValue(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      const gemstoneData = req.body;
      
      // Validate that the required properties for valuation are present
      const requiredFields = ['gemstone_family_id', 'carat_weight', 'color_id', 'clarity_id', 'cut_grade_id'];
      const missingFields = requiredFields.filter(field => !gemstoneData[field]);
      
      if (missingFields.length > 0) {
        throw new ApiError(
          400,
          `Missing required fields for valuation: ${missingFields.join(', ')}`,
          { fields: missingFields }
        );
      }
      
      const estimatedValue = await valuationService.calculateValue(gemstoneData);
      
      res.status(200).json({
        success: true,
        data: {
          estimatedValue
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get all reference data for valuation form
   */
  async getReferenceData(req: Request, res: Response, next: NextFunction) {
    try {
      // Load all reference data in parallel
      const [
        gemstoneFamilies,
        cutShapes,
        colors,
        colorGrades,
        clarityGrades,
        treatments,
        clarityCharacteristics,
        blemishes,
        miningLocations,
        miningMethods
      ] = await Promise.all([
        referenceDataService.getAllGemstoneFamilies(),
        referenceDataService.getAllCutShapes(),
        referenceDataService.getAllColors(),
        referenceDataService.getAllColorGrades(),
        referenceDataService.getAllClarityGrades(),
        referenceDataService.getAllTreatments(),
        referenceDataService.getAllClarityCharacteristics(),
        referenceDataService.getAllBlemishes(),
        referenceDataService.getAllMiningLocations(),
        referenceDataService.getAllMiningMethods()
      ]);
      
      res.status(200).json({
        success: true,
        data: {
          gemstoneFamilies,
          cutShapes,
          colors,
          colorGrades,
          clarityGrades,
          treatments,
          clarityCharacteristics,
          blemishes,
          miningLocations,
          miningMethods
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get comparison data for similar gemstones
   */
  async getComparisonData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      const {
        gemstone_family_id,
        carat_weight,
        color_id,
        clarity_id,
        cut_grade_id
      } = req.query;
      
      // Validate query parameters
      if (!gemstone_family_id || !carat_weight) {
        throw new ApiError(
          400,
          'Missing required parameters for comparison',
          { fields: ['gemstone_family_id', 'carat_weight'] }
        );
      }
      
      const comparisonData = await valuationService.getComparisonData({
        gemstone_family_id: parseInt(gemstone_family_id as string),
        carat_weight: parseFloat(carat_weight as string),
        color_id: color_id ? parseInt(color_id as string) : undefined,
        clarity_id: clarity_id ? parseInt(clarity_id as string) : undefined,
        cut_grade_id: cut_grade_id ? parseInt(cut_grade_id as string) : undefined
      });
      
      res.status(200).json({
        success: true,
        data: comparisonData
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get market trends for a gemstone type
   */
  async getMarketTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const { gemstone_family_id } = req.params;
      
      if (!gemstone_family_id) {
        throw new ApiError(
          400,
          'Missing gemstone family ID',
          { fields: ['gemstone_family_id'] }
        );
      }
      
      const marketTrends = await valuationService.getMarketTrends(
        parseInt(gemstone_family_id as string)
      );
      
      res.status(200).json({
        success: true,
        data: marketTrends
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get price factors that influence gemstone value
   */
  async getPriceFactors(req: Request, res: Response, next: NextFunction) {
    try {
      const { gemstone_family_id } = req.params;
      
      if (!gemstone_family_id) {
        throw new ApiError(
          400,
          'Missing gemstone family ID',
          { fields: ['gemstone_family_id'] }
        );
      }
      
      const priceFactors = await valuationService.getPriceFactors(
        parseInt(gemstone_family_id as string)
      );
      
      res.status(200).json({
        success: true,
        data: priceFactors
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ValuationController();