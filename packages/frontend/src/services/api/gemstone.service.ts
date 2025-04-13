import api from './api.service';
import API_ENDPOINTS from '../../config/api.config';

// Types for gemstone families
export interface GemstoneFamily {
  id: number;
  name: string;
  category: string;
  mineral_group: string | null;
  chemical_formula: string | null;
  hardness_min: number | null;
  hardness_max: number | null;
  rarity_level: string | null;
  value_category: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Service for gemstone reference data
export const GemstoneFamilyService = {
  // Get all gemstone families
  getAllGemstoneFamilies: async (): Promise<GemstoneFamily[]> => {
    return api.get<GemstoneFamily[]>(API_ENDPOINTS.REFERENCE.GEMSTONE_FAMILIES);
  },
  
  // Get a specific gemstone family by ID
  getGemstoneFamilyById: async (id: number): Promise<GemstoneFamily> => {
    return api.get<GemstoneFamily>(API_ENDPOINTS.REFERENCE.GEMSTONE_FAMILY(id));
  },
  
  // Create a new gemstone family
  createGemstoneFamily: async (data: Partial<GemstoneFamily>): Promise<GemstoneFamily> => {
    return api.post<GemstoneFamily>(API_ENDPOINTS.REFERENCE.GEMSTONE_FAMILIES, data);
  },
  
  // Update an existing gemstone family
  updateGemstoneFamily: async (id: number, data: Partial<GemstoneFamily>): Promise<GemstoneFamily> => {
    return api.put<GemstoneFamily>(API_ENDPOINTS.REFERENCE.GEMSTONE_FAMILY(id), data);
  },
  
  // Delete a gemstone family
  deleteGemstoneFamily: async (id: number): Promise<GemstoneFamily> => {
    return api.delete<GemstoneFamily>(API_ENDPOINTS.REFERENCE.GEMSTONE_FAMILY(id));
  }
};

export default GemstoneFamilyService;