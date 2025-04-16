// packages/frontend/src/services/api/valuation.service.ts

import api from './api.service';
import API_ENDPOINTS from '../../config/api.config';
import { GemstoneValuationState } from '../../types/validation.types';
import { toBackendGemstoneModel } from '../../utils/gemstoneStateHelpers';

/**
 * Service for gemstone valuation
 */
const GemstoneValuationService = {
  /**
   * Calculate estimated value for a gemstone
   */
  calculateValue: async (gemstoneData: Partial<GemstoneValuationState>): Promise<{ estimatedValue: number }> => {
    try {
      // Convert frontend model to backend model
      const backendModel = toBackendGemstoneModel(gemstoneData as GemstoneValuationState);
      
      const response = await api.post<{
        success: boolean;
        data: {
          estimatedValue: number;
        };
      }>(API_ENDPOINTS.VALUATION.CALCULATE, backendModel);
      
      return response.data;
    } catch (error) {
      console.error('Error calculating gemstone value:', error);
      throw error;
    }
  },
  
  /**
   * Get reference data for valuation form
   */
  getReferenceData: async (): Promise<any> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: any;
      }>(API_ENDPOINTS.VALUATION.REFERENCE_DATA);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching valuation reference data:', error);
      throw error;
    }
  },
  
  /**
   * Get gemstone families
   */
  getGemstoneFamilies: async (): Promise<any[]> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: any[];
      }>(API_ENDPOINTS.REFERENCE.GEMSTONE_FAMILIES);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching gemstone families:', error);
      throw error;
    }
  },
  
  /**
   * Get cut shapes
   */
  getCutShapes: async (): Promise<any[]> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: any[];
      }>(API_ENDPOINTS.REFERENCE.CUT_SHAPES);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching cut shapes:', error);
      throw error;
    }
  },
  
  /**
   * Get colors
   */
  getColors: async (): Promise<any[]> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: any[];
      }>(API_ENDPOINTS.REFERENCE.COLORS);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching colors:', error);
      throw error;
    }
  },
  
  /**
   * Get color grades
   */
  getColorGrades: async (): Promise<any[]> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: any[];
      }>(API_ENDPOINTS.REFERENCE.COLOR_GRADES);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching color grades:', error);
      throw error;
    }
  },
  
  /**
   * Get clarity grades
   */
  getClarityGrades: async (): Promise<any[]> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: any[];
      }>(API_ENDPOINTS.REFERENCE.CLARITY_GRADES);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching clarity grades:', error);
      throw error;
    }
  },
  
  /**
   * Get treatments
   */
  getTreatments: async (): Promise<any[]> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: any[];
      }>(API_ENDPOINTS.REFERENCE.TREATMENTS);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching treatments:', error);
      throw error;
    }
  },
  
  /**
   * Get mining locations
   */
  getMiningLocations: async (): Promise<any[]> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: any[];
      }>(API_ENDPOINTS.REFERENCE.MINING_LOCATIONS);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching mining locations:', error);
      throw error;
    }
  },
  
  /**
   * Get mining methods
   */
  getMiningMethods: async (): Promise<any[]> => {
    try {
      const response = await api.get<{
        success: boolean;
        data: any[];
      }>(API_ENDPOINTS.REFERENCE.MINING_METHODS);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching mining methods:', error);
      throw error;
    }
  }
};

export default GemstoneValuationService;