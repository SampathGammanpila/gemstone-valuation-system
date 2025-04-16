// packages/frontend/src/contexts/GemstoneValuationContext.tsx

import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gemstoneService from '../services/api/gemstone.service';
import gemstoneValuationService from '../services/api/valuation.service';
import gemstoneDraftService from '../services/api/gemstone-draft.service';
import { GemstoneValuationState } from '../types/validation.types';
import { getDefaultGemstoneState } from '../utils/gemstoneStateHelpers';
import { useAuth } from '../hooks/useAuth';

// Define context interface
interface GemstoneValuationContextType {
  // State
  currentStep: number;
  totalSteps: number;
  gemstoneState: GemstoneValuationState;
  isLoading: boolean;
  errors: Record<string, string>;
  draftId: number | null;
  draftSaved: boolean;
  estimatedValue: number | null;
  
  // Functions
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateGemstoneState: (updates: Partial<GemstoneValuationState>) => void;
  saveAsDraft: () => Promise<number>;
  loadDraft: (draftId: number) => Promise<void>;
  submitValuation: () => Promise<void>;
  calculateEstimatedValue: () => Promise<number>;
  resetForm: () => void;
}

// Create the context
export const GemstoneValuationContext = createContext<GemstoneValuationContextType | undefined>(undefined);

// Context provider component
interface GemstoneValuationProviderProps {
  children: ReactNode;
  initialStep?: number;
  initialDraftId?: number;
}

export const GemstoneValuationProvider: React.FC<GemstoneValuationProviderProps> = ({
  children,
  initialStep = 1,
  initialDraftId = null
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [totalSteps] = useState<number>(5); // 5 steps in the valuation process
  const [gemstoneState, setGemstoneState] = useState<GemstoneValuationState>(getDefaultGemstoneState());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draftId, setDraftId] = useState<number | null>(initialDraftId);
  const [draftSaved, setDraftSaved] = useState<boolean>(false);
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);

  // Load draft if initialDraftId is provided
  useEffect(() => {
    if (initialDraftId && isAuthenticated) {
      loadDraft(initialDraftId);
    }
  }, [initialDraftId, isAuthenticated]);

  // Auto-save draft every 2 minutes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (isAuthenticated && Object.keys(gemstoneState).length > 1) {
        saveAsDraft().catch(err => {
          console.error('Auto-save draft failed:', err);
        });
      }
    }, 120000); // 2 minutes

    return () => clearInterval(autoSaveInterval);
  }, [gemstoneState, isAuthenticated]);

  // Reset form when navigating away
  useEffect(() => {
    return () => {
      // This will be called when the component unmounts
      localStorage.setItem('gemstone_valuation_state', JSON.stringify(gemstoneState));
    };
  }, [gemstoneState]);

  // Step navigation
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Update gemstone state
  const updateGemstoneState = useCallback((updates: Partial<GemstoneValuationState>) => {
    setGemstoneState(prev => ({
      ...prev,
      ...updates
    }));
    
    // Clear any errors for updated fields
    const updatedFields = Object.keys(updates);
    if (updatedFields.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        updatedFields.forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
    }
  }, []);

  // Save as draft
  const saveAsDraft = useCallback(async (): Promise<number> => {
    try {
      setIsLoading(true);
      
      // Ensure the status is set to draft
      const draftData = {
        ...gemstoneState,
        status: 'draft'
      };
      
      let savedDraftId: number;
      
      if (draftId) {
        // Update existing draft
        const response = await gemstoneDraftService.updateDraft(draftId, draftData);
        savedDraftId = response.id;
      } else {
        // Create new draft
        const response = await gemstoneDraftService.createDraft(draftData);
        savedDraftId = response.id;
        setDraftId(savedDraftId);
      }
      
      setDraftSaved(true);
      
      // Show success status briefly
      setTimeout(() => {
        setDraftSaved(false);
      }, 3000);
      
      return savedDraftId;
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrors({
        ...errors,
        draft: 'Failed to save draft. Please try again.'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [gemstoneState, draftId, errors]);

  // Load draft
  const loadDraft = useCallback(async (draftId: number): Promise<void> => {
    try {
      setIsLoading(true);
      
      const draft = await gemstoneDraftService.getDraft(draftId);
      
      setGemstoneState(draft);
      setDraftId(draftId);
      setErrors({});
    } catch (error) {
      console.error('Error loading draft:', error);
      setErrors({
        ...errors,
        draft: 'Failed to load draft. Please try again.'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [errors]);

  // Submit valuation
  const submitValuation = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Calculate estimated value if not already done
      if (!gemstoneState.estimatedValue) {
        const value = await calculateEstimatedValue();
        updateGemstoneState({ estimatedValue: value });
      }
      
      // Submit gemstone data
      const submissionData = {
        ...gemstoneState,
        status: 'published'
      };
      
      let response;
      
      if (draftId) {
        // Convert draft to published gemstone
        response = await gemstoneService.createFromDraft(draftId, submissionData);
      } else {
        // Create new published gemstone
        response = await gemstoneService.createGemstone(submissionData);
      }
      
      // Reset form and navigate to the gemstone detail page
      setGemstoneState(getDefaultGemstoneState());
      setDraftId(null);
      setCurrentStep(1);
      
      navigate(`/gemstones/${response.id}`);
    } catch (error) {
      console.error('Error submitting valuation:', error);
      setErrors({
        ...errors,
        submission: 'Failed to submit gemstone. Please try again.'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [gemstoneState, draftId, errors, navigate, calculateEstimatedValue, updateGemstoneState]);

  // Calculate estimated value
  const calculateEstimatedValue = useCallback(async (): Promise<number> => {
    try {
      setIsLoading(true);
      
      // Send valuation request
      const response = await gemstoneValuationService.calculateValue(gemstoneState);
      
      // Update estimated value
      setEstimatedValue(response.estimatedValue);
      
      return response.estimatedValue;
    } catch (error) {
      console.error('Error calculating value:', error);
      setErrors({
        ...errors,
        valuation: 'Failed to calculate estimated value. Please try again.'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [gemstoneState, errors]);

  // Reset form
  const resetForm = useCallback(() => {
    setGemstoneState(getDefaultGemstoneState());
    setDraftId(null);
    setCurrentStep(1);
    setErrors({});
    setEstimatedValue(null);
  }, []);

  // Context value
  const value: GemstoneValuationContextType = {
    currentStep,
    totalSteps,
    gemstoneState,
    isLoading,
    errors,
    draftId,
    draftSaved,
    estimatedValue,
    goToStep,
    nextStep,
    prevStep,
    updateGemstoneState,
    saveAsDraft,
    loadDraft,
    submitValuation,
    calculateEstimatedValue,
    resetForm
  };

  return (
    <GemstoneValuationContext.Provider value={value}>
      {children}
    </GemstoneValuationContext.Provider>
  );
};