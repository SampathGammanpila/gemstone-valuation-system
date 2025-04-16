import { Request, Response, NextFunction } from 'express';
import referenceDataService from '../../services/reference-data.service';
import { ReferenceDataFilter } from '../../types/reference-data.types';

// Reference data controller for handling HTTP requests
export class ReferenceDataController {
  // ================ GEMSTONE FAMILIES ================
  
  // Get all gemstone families
  getAllGemstoneFamilies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse query parameters
      const filters: ReferenceDataFilter = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string | undefined,
        category: req.query.category as string | undefined
      };
      
      const result = await referenceDataService.getAllGemstoneFamilies(filters);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
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

  // Get gemstone family categories
  getGemstoneFamilyCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await referenceDataService.getGemstoneFamilyCategories();
      
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Controller error fetching gemstone family categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gemstone family categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get a specific gemstone family by ID
  getGemstoneFamilyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  createGemstoneFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newFamily = await referenceDataService.createGemstoneFamily(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Gemstone family created successfully',
        data: newFamily
      });
    } catch (error) {
      console.error('Controller error creating gemstone family:', error);
      
      if (error instanceof Error && error.message.includes('required')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create gemstone family',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Update an existing gemstone family
  updateGemstoneFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      
      if (error instanceof Error && error.message.includes('required')) {
        res.status(400).json({
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
  deleteGemstoneFamily = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  // ================ CUT SHAPES ================
  
  // Get all cut shapes
  getAllCutShapes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse query parameters
      const filters: ReferenceDataFilter = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string | undefined,
        category: req.query.category as string | undefined
      };
      
      const result = await referenceDataService.getAllCutShapes(filters);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Controller error fetching cut shapes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cut shapes',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get cut shape categories
  getCutShapeCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await referenceDataService.getCutShapeCategories();
      
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Controller error fetching cut shape categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cut shape categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get a specific cut shape by ID
  getCutShapeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const cutShape = await referenceDataService.getCutShapeById(id);
      
      res.status(200).json({
        success: true,
        data: cutShape
      });
    } catch (error) {
      console.error(`Controller error fetching cut shape:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cut shape',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // ================ COLORS ================
  
  // Get all colors
  getAllColors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse query parameters
      const filters: ReferenceDataFilter = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string | undefined,
        category: req.query.category as string | undefined
      };
      
      const result = await referenceDataService.getAllColors(filters);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Controller error fetching colors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch colors',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get color categories
  getColorCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await referenceDataService.getColorCategories();
      
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Controller error fetching color categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch color categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get a specific color by ID
  getColorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const color = await referenceDataService.getColorById(id);
      
      res.status(200).json({
        success: true,
        data: color
      });
    } catch (error) {
      console.error(`Controller error fetching color:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch color',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // ================ COLOR GRADES ================
  
  // Get all color grades
  getAllColorGrades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse query parameters
      const filters: ReferenceDataFilter = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string | undefined
      };
      
      const result = await referenceDataService.getAllColorGrades(filters);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Controller error fetching color grades:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch color grades',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get a specific color grade by ID
  getColorGradeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const colorGrade = await referenceDataService.getColorGradeById(id);
      
      res.status(200).json({
        success: true,
        data: colorGrade
      });
    } catch (error) {
      console.error(`Controller error fetching color grade:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch color grade',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // ================ CUT GRADES ================
  
  // Get all cut grades
  getAllCutGrades = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse query parameters
      const filters: ReferenceDataFilter = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string | undefined
      };
      
      const result = await referenceDataService.getAllCutGrades(filters);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Controller error fetching cut grades:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cut grades',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get a specific cut grade by ID
  getCutGradeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const cutGrade = await referenceDataService.getCutGradeById(id);
      
      res.status(200).json({
        success: true,
        data: cutGrade
      });
    } catch (error) {
      console.error(`Controller error fetching cut grade:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch cut grade',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // ================ CLARITIES ================
  
  // Get all clarities
  getAllClarities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse query parameters
      const filters: ReferenceDataFilter = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string | undefined
      };
      
      const result = await referenceDataService.getAllClarities(filters);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Controller error fetching clarities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch clarities',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get a specific clarity by ID
  getClarityById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const clarity = await referenceDataService.getClarityById(id);
      
      res.status(200).json({
        success: true,
        data: clarity
      });
    } catch (error) {
      console.error(`Controller error fetching clarity:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch clarity',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // ================ TREATMENTS ================
  
  // Get all treatments
  getAllTreatments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse query parameters
      const filters: ReferenceDataFilter = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string | undefined
      };
      
      const result = await referenceDataService.getAllTreatments(filters);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Controller error fetching treatments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch treatments',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get a specific treatment by ID
  getTreatmentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const treatment = await referenceDataService.getTreatmentById(id);
      
      res.status(200).json({
        success: true,
        data: treatment
      });
    } catch (error) {
      console.error(`Controller error fetching treatment:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch treatment',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // ================ MINING LOCATIONS ================
  
  // Get all mining locations
  getAllMiningLocations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse query parameters
      const filters: ReferenceDataFilter = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string | undefined,
        country: req.query.country as string | undefined
      };
      
      const result = await referenceDataService.getAllMiningLocations(filters);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Controller error fetching mining locations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mining locations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get mining location countries
  getMiningLocationCountries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const countries = await referenceDataService.getMiningLocationCountries();
      
      res.status(200).json({
        success: true,
        data: countries
      });
    } catch (error) {
      console.error('Controller error fetching mining location countries:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mining location countries',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get a specific mining location by ID
  getMiningLocationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const miningLocation = await referenceDataService.getMiningLocationById(id);
      
      res.status(200).json({
        success: true,
        data: miningLocation
      });
    } catch (error) {
      console.error(`Controller error fetching mining location:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mining location',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // ================ MINING METHODS ================
  
  // Get all mining methods
  getAllMiningMethods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse query parameters
      const filters: ReferenceDataFilter = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        search: req.query.search as string | undefined
      };
      
      const result = await referenceDataService.getAllMiningMethods(filters);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Controller error fetching mining methods:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mining methods',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get a specific mining method by ID
  getMiningMethodById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const miningMethod = await referenceDataService.getMiningMethodById(id);
      
      res.status(200).json({
        success: true,
        data: miningMethod
      });
    } catch (error) {
      console.error(`Controller error fetching mining method:`, error);
      
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mining method',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}