import referenceDataRepository from '../db/repositories/reference-data.repository';
import { ReferenceDataFilter } from '../types/reference-data.types';

// Reference data service class for business logic
export class ReferenceDataService {
  // ================ GEMSTONE FAMILIES ================
  
  // Get all gemstone families with optional filtering and pagination
  async getAllGemstoneFamilies(filters?: ReferenceDataFilter) {
    try {
      return await referenceDataRepository.getAllGemstoneFamilies(filters);
    } catch (error) {
      console.error('Service error fetching gemstone families:', error);
      throw error;
    }
  }

  // Get distinct gemstone family categories
  async getGemstoneFamilyCategories() {
    try {
      return await referenceDataRepository.getGemstoneFamilyCategories();
    } catch (error) {
      console.error('Service error fetching gemstone family categories:', error);
      throw error;
    }
  }

  // Get a specific gemstone family by ID
  async getGemstoneFamilyById(id: number) {
    try {
      const family = await referenceDataRepository.getGemstoneFamilyById(id);
      if (!family) {
        throw new Error(`Gemstone family with ID ${id} not found`);
      }
      return family;
    } catch (error) {
      console.error(`Service error fetching gemstone family with ID ${id}:`, error);
      throw error;
    }
  }

  // Create a new gemstone family
  async createGemstoneFamily(familyData: any) {
    try {
      // Validate required fields
      if (!familyData.name || !familyData.category) {
        throw new Error('Gemstone family name and category are required');
      }
      
      return await referenceDataRepository.createGemstoneFamily(familyData);
    } catch (error) {
      console.error('Service error creating gemstone family:', error);
      throw error;
    }
  }

  // Update an existing gemstone family
  async updateGemstoneFamily(id: number, familyData: any) {
    try {
      // Validate required fields
      if (!familyData.name || !familyData.category) {
        throw new Error('Gemstone family name and category are required');
      }
      
      const family = await referenceDataRepository.updateGemstoneFamily(id, familyData);
      if (!family) {
        throw new Error(`Gemstone family with ID ${id} not found`);
      }
      return family;
    } catch (error) {
      console.error(`Service error updating gemstone family with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a gemstone family
  async deleteGemstoneFamily(id: number) {
    try {
      // Check if the gemstone family is in use
      // This would typically check if any gemstones reference this family
      // For now, we'll just do a simple check
      const family = await referenceDataRepository.deleteGemstoneFamily(id);
      if (!family) {
        throw new Error(`Gemstone family with ID ${id} not found`);
      }
      return family;
    } catch (error) {
      console.error(`Service error deleting gemstone family with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ CUT SHAPES ================
  
  // Get all cut shapes with optional filtering and pagination
  async getAllCutShapes(filters?: ReferenceDataFilter) {
    try {
      return await referenceDataRepository.getAllCutShapes(filters);
    } catch (error) {
      console.error('Service error fetching cut shapes:', error);
      throw error;
    }
  }

  // Get distinct cut shape categories
  async getCutShapeCategories() {
    try {
      return await referenceDataRepository.getCutShapeCategories();
    } catch (error) {
      console.error('Service error fetching cut shape categories:', error);
      throw error;
    }
  }

  // Get a specific cut shape by ID
  async getCutShapeById(id: number) {
    try {
      const cutShape = await referenceDataRepository.getCutShapeById(id);
      if (!cutShape) {
        throw new Error(`Cut shape with ID ${id} not found`);
      }
      return cutShape;
    } catch (error) {
      console.error(`Service error fetching cut shape with ID ${id}:`, error);
      throw error;
    }
  }

  // Create a new cut shape
  async createCutShape(cutShapeData: any) {
    try {
      // Validate required fields
      if (!cutShapeData.name || !cutShapeData.category) {
        throw new Error('Cut shape name and category are required');
      }
      
      return await referenceDataRepository.createCutShape(cutShapeData);
    } catch (error) {
      console.error('Service error creating cut shape:', error);
      throw error;
    }
  }

  // Update an existing cut shape
  async updateCutShape(id: number, cutShapeData: any) {
    try {
      // Validate required fields
      if (!cutShapeData.name || !cutShapeData.category) {
        throw new Error('Cut shape name and category are required');
      }
      
      const cutShape = await referenceDataRepository.updateCutShape(id, cutShapeData);
      if (!cutShape) {
        throw new Error(`Cut shape with ID ${id} not found`);
      }
      return cutShape;
    } catch (error) {
      console.error(`Service error updating cut shape with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a cut shape
  async deleteCutShape(id: number) {
    try {
      const cutShape = await referenceDataRepository.deleteCutShape(id);
      if (!cutShape) {
        throw new Error(`Cut shape with ID ${id} not found`);
      }
      return cutShape;
    } catch (error) {
      console.error(`Service error deleting cut shape with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ COLORS ================
  
  // Get all colors with optional filtering and pagination
  async getAllColors(filters?: ReferenceDataFilter) {
    try {
      return await referenceDataRepository.getAllColors(filters);
    } catch (error) {
      console.error('Service error fetching colors:', error);
      throw error;
    }
  }

  // Get distinct color categories
  async getColorCategories() {
    try {
      return await referenceDataRepository.getColorCategories();
    } catch (error) {
      console.error('Service error fetching color categories:', error);
      throw error;
    }
  }

  // Get a specific color by ID
  async getColorById(id: number) {
    try {
      const color = await referenceDataRepository.getColorById(id);
      if (!color) {
        throw new Error(`Color with ID ${id} not found`);
      }
      return color;
    } catch (error) {
      console.error(`Service error fetching color with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ COLOR GRADES ================
  
  // Get all color grades with optional filtering and pagination
  async getAllColorGrades(filters?: ReferenceDataFilter) {
    try {
      return await referenceDataRepository.getAllColorGrades(filters);
    } catch (error) {
      console.error('Service error fetching color grades:', error);
      throw error;
    }
  }

  // Get a specific color grade by ID
  async getColorGradeById(id: number) {
    try {
      const colorGrade = await referenceDataRepository.getColorGradeById(id);
      if (!colorGrade) {
        throw new Error(`Color grade with ID ${id} not found`);
      }
      return colorGrade;
    } catch (error) {
      console.error(`Service error fetching color grade with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ CUT GRADES ================
  
  // Get all cut grades with optional filtering and pagination
  async getAllCutGrades(filters?: ReferenceDataFilter) {
    try {
      return await referenceDataRepository.getAllCutGrades(filters);
    } catch (error) {
      console.error('Service error fetching cut grades:', error);
      throw error;
    }
  }

  // Get a specific cut grade by ID
  async getCutGradeById(id: number) {
    try {
      const cutGrade = await referenceDataRepository.getCutGradeById(id);
      if (!cutGrade) {
        throw new Error(`Cut grade with ID ${id} not found`);
      }
      return cutGrade;
    } catch (error) {
      console.error(`Service error fetching cut grade with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ CLARITIES ================
  
  // Get all clarities with optional filtering and pagination
  async getAllClarities(filters?: ReferenceDataFilter) {
    try {
      return await referenceDataRepository.getAllClarities(filters);
    } catch (error) {
      console.error('Service error fetching clarities:', error);
      throw error;
    }
  }

  // Get a specific clarity by ID
  async getClarityById(id: number) {
    try {
      const clarity = await referenceDataRepository.getClarityById(id);
      if (!clarity) {
        throw new Error(`Clarity with ID ${id} not found`);
      }
      return clarity;
    } catch (error) {
      console.error(`Service error fetching clarity with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ TREATMENTS ================
  
  // Get all treatments with optional filtering and pagination
  async getAllTreatments(filters?: ReferenceDataFilter) {
    try {
      return await referenceDataRepository.getAllTreatments(filters);
    } catch (error) {
      console.error('Service error fetching treatments:', error);
      throw error;
    }
  }

  // Get a specific treatment by ID
  async getTreatmentById(id: number) {
    try {
      const treatment = await referenceDataRepository.getTreatmentById(id);
      if (!treatment) {
        throw new Error(`Treatment with ID ${id} not found`);
      }
      return treatment;
    } catch (error) {
      console.error(`Service error fetching treatment with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ MINING LOCATIONS ================
  
  // Get all mining locations with optional filtering and pagination
  async getAllMiningLocations(filters?: ReferenceDataFilter) {
    try {
      return await referenceDataRepository.getAllMiningLocations(filters);
    } catch (error) {
      console.error('Service error fetching mining locations:', error);
      throw error;
    }
  }

  // Get distinct mining location countries
  async getMiningLocationCountries() {
    try {
      return await referenceDataRepository.getMiningLocationCountries();
    } catch (error) {
      console.error('Service error fetching mining location countries:', error);
      throw error;
    }
  }

  // Get a specific mining location by ID
  async getMiningLocationById(id: number) {
    try {
      const miningLocation = await referenceDataRepository.getMiningLocationById(id);
      if (!miningLocation) {
        throw new Error(`Mining location with ID ${id} not found`);
      }
      return miningLocation;
    } catch (error) {
      console.error(`Service error fetching mining location with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ MINING METHODS ================
  
  // Get all mining methods with optional filtering and pagination
  async getAllMiningMethods(filters?: ReferenceDataFilter) {
    try {
      return await referenceDataRepository.getAllMiningMethods(filters);
    } catch (error) {
      console.error('Service error fetching mining methods:', error);
      throw error;
    }
  }

  // Get a specific mining method by ID
  async getMiningMethodById(id: number) {
    try {
      const miningMethod = await referenceDataRepository.getMiningMethodById(id);
      if (!miningMethod) {
        throw new Error(`Mining method with ID ${id} not found`);
      }
      return miningMethod;
    } catch (error) {
      console.error(`Service error fetching mining method with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new ReferenceDataService();