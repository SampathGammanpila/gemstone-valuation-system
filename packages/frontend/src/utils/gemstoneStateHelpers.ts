// packages/frontend/src/utils/gemstoneStateHelpers.ts

import { GemstoneValuationState } from '../types/validation.types';

/**
 * Returns a default empty state for gemstone valuation
 */
export const getDefaultGemstoneState = (): GemstoneValuationState => {
  return {
    title: '',
    description: '',
    gemstoneFamilyId: 0,
    caratWeight: 0,
    width: 0,
    height: 0,
    depth: 0,
    pieceCount: 1,
    cutShapeId: 0,
    colorId: 0,
    colorGradeId: 0,
    clarityId: 0,
    status: 'draft',
    imageUrls: []
  };
};

/**
 * Checks if a gemstone state is complete for a specific step
 */
export const isStepComplete = (
  state: GemstoneValuationState,
  step: number
): boolean => {
  switch (step) {
    case 1: // Basic Info
      return (
        !!state.title &&
        state.title.length >= 3 &&
        !!state.gemstoneFamilyId &&
        state.gemstoneFamilyId > 0
      );
    case 2: // Gemstone Type Selection
      return (
        isStepComplete(state, 1) &&
        !!state.cutShapeId &&
        state.cutShapeId > 0
      );
    case 3: // Color and Appearance
      return (
        isStepComplete(state, 2) &&
        !!state.colorId &&
        state.colorId > 0 &&
        !!state.colorGradeId &&
        state.colorGradeId > 0 &&
        !!state.clarityId &&
        state.clarityId > 0
      );
    case 4: // Measurements and Details
      return (
        isStepComplete(state, 3) &&
        !!state.caratWeight &&
        state.caratWeight > 0 &&
        !!state.width &&
        state.width > 0 &&
        !!state.height &&
        state.height > 0 &&
        !!state.depth &&
        state.depth > 0
      );
    case 5: // Preview and Submit
      return isStepComplete(state, 4);
    default:
      return false;
  }
};

/**
 * Gets the field mapping between frontend and backend gemstone models
 */
export const getGemstoneFieldMapping = (): Record<string, string> => {
  return {
    title: 'title',
    description: 'description',
    gemstoneFamilyId: 'gemstone_family_id',
    cutShapeId: 'cut_shape_id',
    colorId: 'color_id',
    colorGradeId: 'color_grade_id',
    clarityId: 'clarity_id',
    treatmentId: 'treatment_id',
    clarityCharacteristicsIds: 'clarity_characteristics_ids',
    blemishIds: 'blemish_ids',
    caratWeight: 'carat_weight',
    width: 'width_mm',
    height: 'height_mm',
    depth: 'depth_mm',
    pieceCount: 'piece_count',
    miningLocationId: 'mining_location_id',
    miningMethodId: 'mining_method_id',
    status: 'status',
    imageUrls: 'image_urls',
    specialNotes: 'special_notes',
    estimatedValue: 'estimated_value'
  };
};

/**
 * Converts frontend gemstone model to backend model
 */
export const toBackendGemstoneModel = (
  state: GemstoneValuationState
): Record<string, any> => {
  const mapping = getGemstoneFieldMapping();
  const backendModel: Record<string, any> = {};

  // Apply mapping
  Object.entries(state).forEach(([key, value]) => {
    if (mapping[key]) {
      backendModel[mapping[key]] = value;
    }
  });

  return backendModel;
};

/**
 * Converts backend gemstone model to frontend model
 */
export const toFrontendGemstoneModel = (
  backendModel: Record<string, any>
): GemstoneValuationState => {
  const mapping = getGemstoneFieldMapping();
  const reversedMapping: Record<string, string> = {};
  
  // Reverse the mapping
  Object.entries(mapping).forEach(([frontendKey, backendKey]) => {
    reversedMapping[backendKey] = frontendKey;
  });

  const frontendModel = getDefaultGemstoneState();

  // Apply reversed mapping
  Object.entries(backendModel).forEach(([key, value]) => {
    if (reversedMapping[key]) {
      // Need to use type assertion since we're using dynamic keys
      (frontendModel as any)[reversedMapping[key]] = value;
    }
  });

  return frontendModel;
};

/**
 * Gets validation errors for a step
 */
export const getStepValidationErrors = (
  state: GemstoneValuationState,
  step: number
): Record<string, string> => {
  const errors: Record<string, string> = {};

  switch (step) {
    case 1: // Basic Info
      if (!state.title) {
        errors.title = 'Title is required';
      } else if (state.title.length < 3) {
        errors.title = 'Title must be at least 3 characters';
      } else if (state.title.length > 100) {
        errors.title = 'Title must be less than 100 characters';
      }

      if (!state.gemstoneFamilyId || state.gemstoneFamilyId <= 0) {
        errors.gemstoneFamilyId = 'Please select a gemstone family';
      }

      if (state.description && state.description.length > 2000) {
        errors.description = 'Description must be less than 2000 characters';
      }
      break;

    case 2: // Gemstone Type Selection
      if (!state.cutShapeId || state.cutShapeId <= 0) {
        errors.cutShapeId = 'Please select a cut shape';
      }
      break;

    case 3: // Color and Appearance
      if (!state.colorId || state.colorId <= 0) {
        errors.colorId = 'Please select a color';
      }

      if (!state.colorGradeId || state.colorGradeId <= 0) {
        errors.colorGradeId = 'Please select a color grade';
      }

      if (!state.clarityId || state.clarityId <= 0) {
        errors.clarityId = 'Please select a clarity grade';
      }
      break;

    case 4: // Measurements and Details
      if (!state.caratWeight || state.caratWeight <= 0) {
        errors.caratWeight = 'Carat weight is required';
      } else if (state.caratWeight < 0.001 || state.caratWeight > 9999.999) {
        errors.caratWeight = 'Carat weight must be between 0.001 and 9999.999';
      }

      if (!state.width || state.width <= 0) {
        errors.width = 'Width is required';
      } else if (state.width < 0.1 || state.width > 1000) {
        errors.width = 'Width must be between 0.1mm and 1000mm';
      }

      if (!state.height || state.height <= 0) {
        errors.height = 'Height is required';
      } else if (state.height < 0.1 || state.height > 1000) {
        errors.height = 'Height must be between 0.1mm and 1000mm';
      }

      if (!state.depth || state.depth <= 0) {
        errors.depth = 'Depth is required';
      } else if (state.depth < 0.1 || state.depth > 1000) {
        errors.depth = 'Depth must be between 0.1mm and 1000mm';
      }

      if (state.pieceCount !== undefined && (state.pieceCount < 1 || !Number.isInteger(state.pieceCount))) {
        errors.pieceCount = 'Piece count must be a positive integer';
      }
      break;

    case 5: // No specific validation for preview step
      break;
  }

  return errors;
};

/**
 * Calculates the completion percentage of the gemstone valuation
 */
export const calculateCompletionPercentage = (
  state: GemstoneValuationState
): number => {
  const totalFields = 12; // Number of essential fields
  let completedFields = 0;

  // Count completed essential fields
  if (state.title && state.title.length >= 3) completedFields++;
  if (state.gemstoneFamilyId && state.gemstoneFamilyId > 0) completedFields++;
  if (state.cutShapeId && state.cutShapeId > 0) completedFields++;
  if (state.colorId && state.colorId > 0) completedFields++;
  if (state.colorGradeId && state.colorGradeId > 0) completedFields++;
  if (state.clarityId && state.clarityId > 0) completedFields++;
  if (state.caratWeight && state.caratWeight > 0) completedFields++;
  if (state.width && state.width > 0) completedFields++;
  if (state.height && state.height > 0) completedFields++;
  if (state.depth && state.depth > 0) completedFields++;
  if (state.imageUrls && state.imageUrls.length > 0) completedFields++;
  if (state.status === 'published') completedFields++;

  return Math.round((completedFields / totalFields) * 100);
};