// packages/frontend/src/types/validation.types.ts

/**
 * Types for validation errors
 */
export type ValidationErrorType = 
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'email'
  | 'number'
  | 'min'
  | 'max'
  | 'pattern'
  | 'custom';

/**
 * Validation error object
 */
export interface ValidationError {
  type: ValidationErrorType;
  message: string;
}

/**
 * Validation rules for a field
 */
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  isEmail?: boolean;
  isNumber?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp | string;
  validator?: (value: any) => boolean | string;
  messages?: {
    required?: string;
    minLength?: string;
    maxLength?: string;
    email?: string;
    number?: string;
    min?: string;
    max?: string;
    pattern?: string;
    custom?: string;
  };
}

/**
 * Validation schema for a form
 */
export type ValidationSchema<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRules;
};

/**
 * Form state with validation
 */
export interface ValidatedFormState<T extends Record<string, any>> {
  values: T;
  errors: Record<keyof T, ValidationError | null>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

/**
 * Gemstone specific validation types
 */

export interface GemstoneBasicInfo {
  title: string;
  description?: string;
  gemstoneFamilyId: number;
}

export interface GemstoneDimensions {
  caratWeight: number;
  width: number;
  height: number;
  depth: number;
  pieceCount?: number;
}

export interface GemstoneAppearance {
  cutShapeId: number;
  colorId: number;
  colorGradeId: number;
  clarityId: number;
  treatmentId?: number;
  clarityCharacteristicsIds?: number[];
  blemishIds?: number[];
}

export interface GemstoneOrigin {
  miningLocationId?: number;
  miningMethodId?: number;
  certificateNumber?: string;
  certificateAuthority?: string;
}

export interface GemstoneValuationState extends 
  GemstoneBasicInfo,
  GemstoneDimensions,
  GemstoneAppearance,
  GemstoneOrigin {
  estimatedValue?: number;
  status: 'draft' | 'published' | 'private' | 'sold';
  imageUrls?: string[];
  specialNotes?: string;
}