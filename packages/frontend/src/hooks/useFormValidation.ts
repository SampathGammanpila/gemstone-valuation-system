// packages/frontend/src/hooks/useFormValidation.ts

import { useState, useCallback, useEffect } from 'react';
import { validateField, validateForm, hasErrors } from '../utils/validators';
import { ValidationSchema, ValidationError } from '../types/validation.types';

/**
 * Custom hook for form validation
 */
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ValidationSchema<T>
) => {
  // State for form values, errors, and touched fields
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, ValidationError | null>>({} as Record<keyof T, ValidationError | null>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Initialize errors
  useEffect(() => {
    setErrors(validateForm(values, validationSchema));
  }, [values, validationSchema]);

  // Update isValid whenever errors change
  useEffect(() => {
    setIsValid(!hasErrors(errors));
  }, [errors]);

  // Handle input change
  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value
    }));
  }, []);

  // Handle input blur
  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
  }, []);

  // Validate a single field
  const validateSingleField = useCallback((name: keyof T) => {
    const value = values[name];
    const rules = validationSchema[name];
    
    if (!rules) return null;
    
    const fieldError = validateField(value, rules);
    
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: fieldError
    }));
    
    return fieldError;
  }, [values, validationSchema]);

  // Validate entire form
  const validateAllFields = useCallback(() => {
    const newErrors = validateForm(values, validationSchema);
    setErrors(newErrors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    
    setTouched(allTouched);
    
    return !hasErrors(newErrors);
  }, [values, validationSchema]);

  // Handle form submission
  const handleSubmit = useCallback(
    (callback: (values: T) => void) => (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      setIsSubmitting(true);
      
      const isFormValid = validateAllFields();
      
      if (isFormValid) {
        callback(values);
      }
      
      setIsSubmitting(false);
    },
    [values, validateAllFields]
  );

  // Reset form
  const resetForm = useCallback((newValues: T = initialValues) => {
    setValues(newValues);
    setErrors({} as Record<keyof T, ValidationError | null>);
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  // Set form values
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prevValues => ({
      ...prevValues,
      ...newValues
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    validateSingleField,
    validateAllFields,
    handleSubmit,
    resetForm,
    setFormValues
  };
};

export default useFormValidation;