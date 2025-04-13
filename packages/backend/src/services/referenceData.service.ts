import referenceDataRepository from '../db/repositories/referenceData.repository';

// Reference data service class for business logic
export class ReferenceDataService {
  // Get all gemstone families
  async getAllGemstoneFamilies() {
    try {
      return await referenceDataRepository.getAllGemstoneFamilies();
    } catch (error) {
      console.error('Service error fetching gemstone families:', error);
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
      // You could add validation logic here
      return await referenceDataRepository.createGemstoneFamily(familyData);
    } catch (error) {
      console.error('Service error creating gemstone family:', error);
      throw error;
    }
  }

  // Update an existing gemstone family
  async updateGemstoneFamily(id: number, familyData: any) {
    try {
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
}

export default new ReferenceDataService();