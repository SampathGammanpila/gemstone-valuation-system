// packages/frontend/src/utils/validators.ts

import { ValidationError, ValidationSchema, ValidationRules } from '../types/validation.types';

/**
 * Validates a single field value based on provided rules
 */
export const validateField = (value: any, rules: ValidationRules): ValidationError | null => {
  // Check required
  if (rules.required && !value) {
    return { type: 'required', message: rules.messages?.required || 'This field is required' };
  }

  // Check min length
  if (rules.minLength && value && value.length < rules.minLength) {
    return { 
      type: 'minLength', 
      message: rules.messages?.minLength || `Minimum length is ${rules.minLength} characters` 
    };
  }

  // Check max length
  if (rules.maxLength && value && value.length > rules.maxLength) {
    return { 
      type: 'maxLength', 
      message: rules.messages?.maxLength || `Maximum length is ${rules.maxLength} characters` 
    };
  }

  // Check email format
  if (rules.isEmail && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { type: 'email', message: rules.messages?.email || 'Invalid email format' };
    }
  }

  // Check number
  if (rules.isNumber && value) {
    if (isNaN(Number(value))) {
      return { type: 'number', message: rules.messages?.number || 'Value must be a number' };
    }
  }

  // Check min value
  if (rules.min !== undefined && value && Number(value) < rules.min) {
    return { 
      type: 'min', 
      message: rules.messages?.min || `Value must be at least ${rules.min}` 
    };
  }

  // Check max value
  if (rules.max !== undefined && value && Number(value) > rules.max) {
    return { 
      type: 'max', 
      message: rules.messages?.max || `Value must be at most ${rules.max}` 
    };
  }

  // Check pattern
  if (rules.pattern && value) {
    const regex = new RegExp(rules.pattern);
    if (!regex.test(value)) {
      return { 
        type: 'pattern', 
        message: rules.messages?.pattern || 'Value does not match the required pattern' 
      };
    }
  }

  // Check custom validator
  if (rules.validator && value) {
    const customValidation = rules.validator(value);
    if (customValidation !== true) {
      return { 
        type: 'custom', 
        message: typeof customValidation === 'string' 
          ? customValidation 
          : rules.messages?.custom || 'Invalid value' 
      };
    }
  }

  return null;
};

/**
 * Validates an entire form against a validation schema
 */
export const validateForm = <T extends Record<string, any>>(
  values: T,
  schema: ValidationSchema<T>
): Record<keyof T, ValidationError | null> => {
  const errors: Record<string, ValidationError | null> = {};

  // Validate each field in the schema
  Object.keys(schema).forEach((key) => {
    const fieldKey = key as keyof T;
    const fieldRules = schema[fieldKey];
    const fieldValue = values[fieldKey];

    errors[key] = validateField(fieldValue, fieldRules);
  });

  return errors as Record<keyof T, ValidationError | null>;
};

/**
 * Checks if a form has any validation errors
 */
export const hasErrors = <T extends Record<string, any>>(
  errors: Record<keyof T, ValidationError | null>
): boolean => {
  return Object.values(errors).some(error => error !== null);
};

/**
 * Gemstone specific validation
 */
export const gemstoneValidators = {
  // Validates carat weight (0.001 to 9999.999)
  caratWeight: (value: number): boolean | string => {
    if (value < 0.001) return 'Carat weight must be at least 0.001';
    if (value > 9999.999) return 'Carat weight must be less than 10,000';
    return true;
  },

  // Validates gemstone dimensions (0.1mm to 1000mm)
  dimension: (value: number): boolean | string => {
    if (value < 0.1) return 'Dimension must be at least 0.1mm';
    if (value > 1000) return 'Dimension must be less than 1000mm';
    return true;
  },

  // Validates Mohs hardness (1 to 10)
  hardness: (value: number): boolean | string => {
    if (value < 1) return 'Hardness must be at least 1';
    if (value > 10) return 'Hardness must be at most 10';
    return true;
  },

  // Validates estimated value (minimum 0)
  estimatedValue: (value: number): boolean | string => {
    if (value < 0) return 'Estimated value cannot be negative';
    return true;
  },
};

// Common validation schemas for different sections of the gemstone form
export const gemstoneBasicInfoSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
    messages: {
      required: 'Gemstone title is required',
      minLength: 'Title must be at least 3 characters',
      maxLength: 'Title must be less than 100 characters',
    }
  },
  description: {
    maxLength: 2000,
    messages: {
      maxLength: 'Description must be less than 2000 characters',
    }
  },
  gemstoneFamilyId: {
    required: true,
    messages: {
      required: 'Please select a gemstone family',
    }
  },
};

export const gemstoneDimensionsSchema = {
  caratWeight: {
    required: true,
    isNumber: true,
    validator: gemstoneValidators.caratWeight,
    messages: {
      required: 'Carat weight is required',
      number: 'Carat weight must be a number',
    }
  },
  width: {
    required: true,
    isNumber: true,
    validator: gemstoneValidators.dimension,
    messages: {
      required: 'Width is required',
      number: 'Width must be a number in millimeters',
    }
  },
  height: {
    required: true,
    isNumber: true,
    validator: gemstoneValidators.dimension,
    messages: {
      required: 'Height is required',
      number: 'Height must be a number in millimeters',
    }
  },
  depth: {
    required: true,
    isNumber: true,
    validator: gemstoneValidators.dimension,
    messages: {
      required: 'Depth is required',
      number: 'Depth must be a number in millimeters',
    }
  },
};

export const gemstoneAppearanceSchema = {
  cutShapeId: {
    required: true,
    messages: {
      required: 'Please select a cut shape',
    }
  },
  colorId: {
    required: true,
    messages: {
      required: 'Please select a color',
    }
  },
  colorGradeId: {
    required: true,
    messages: {
      required: 'Please select a color grade',
    }
  },
  clarityId: {
    required: true,
    messages: {
      required: 'Please select a clarity grade',
    }
  },
};