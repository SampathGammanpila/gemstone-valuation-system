// packages/backend/src/utils/validators.ts

/**
 * Validate if a value is a valid number within specified range
 */
export const isValidNumber = (
    value: any,
    min: number = Number.MIN_SAFE_INTEGER,
    max: number = Number.MAX_SAFE_INTEGER
  ): boolean => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  };
  
  /**
   * Validate if a value is a valid integer
   */
  export const isValidInteger = (
    value: any,
    min: number = Number.MIN_SAFE_INTEGER,
    max: number = Number.MAX_SAFE_INTEGER
  ): boolean => {
    const num = Number(value);
    return !isNaN(num) && Number.isInteger(num) && num >= min && num <= max;
  };
  
  /**
   * Validate if a value is a valid ID (positive integer)
   */
  export const isValidId = (value: any): boolean => {
    return isValidInteger(value, 1);
  };
  
  /**
   * Validate if a value is a valid array of IDs
   */
  export const isValidIdArray = (value: any): boolean => {
    if (!Array.isArray(value)) {
      return false;
    }
    
    return value.every(id => isValidId(id));
  };
  
  /**
   * Validate if a value is a valid email address
   */
  export const isValidEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };
  
  /**
   * Validate if a value is a valid URL
   */
  export const isValidUrl = (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Validate if a value is a valid date string
   */
  export const isValidDate = (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  };
  
  /**
   * Validate if a value is a valid future date string
   */
  export const isValidFutureDate = (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime()) && date > new Date();
  };
  
  /**
   * Validate if a value is a valid past date string
   */
  export const isValidPastDate = (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime()) && date < new Date();
  };
  
  /**
   * Validate if a value contains only alphanumeric characters
   */
  export const isAlphanumeric = (value: string): boolean => {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(value);
  };
  
  /**
   * Validate if a value has a valid length
   */
  export const hasValidLength = (
    value: string,
    minLength: number = 0,
    maxLength: number = Number.MAX_SAFE_INTEGER
  ): boolean => {
    return value.length >= minLength && value.length <= maxLength;
  };
  
  /**
   * Validate if a password meets complexity requirements
   */
  export const isValidPassword = (value: string): boolean => {
    // At least 8 characters with at least one uppercase, one lowercase, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(value);
  };
  
  /**
   * Validate if a user role is valid
   */
  export const isValidUserRole = (value: string): boolean => {
    const validRoles = ['admin', 'user', 'collector', 'dealer', 'cutter', 'appraiser'];
    return validRoles.includes(value);
  };
  
  /**
   * Validate if a gemstone status is valid
   */
  export const isValidGemstoneStatus = (value: string): boolean => {
    const validStatuses = ['draft', 'published', 'private', 'sold'];
    return validStatuses.includes(value);
  };
  
  /**
   * Validate if color values are valid
   */
  export const isValidColorValue = (
    value: number,
    min: number = 0,
    max: number = 255
  ): boolean => {
    return isValidInteger(value, min, max);
  };
  
  /**
   * Validate if an RGB color array is valid
   */
  export const isValidRgbColor = (value: number[]): boolean => {
    if (!Array.isArray(value) || value.length !== 3) {
      return false;
    }
    
    return value.every(component => isValidColorValue(component));
  };
  
  /**
   * Validate if a HEX color string is valid
   */
  export const isValidHexColor = (value: string): boolean => {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(value);
  };
  
  /**
   * Validate if an array of image URLs is valid
   */
  export const isValidImageUrlArray = (value: string[]): boolean => {
    if (!Array.isArray(value)) {
      return false;
    }
    
    return value.every(url => {
      if (!isValidUrl(url)) {
        return false;
      }
      
      // Check if URL ends with common image extensions
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const endsWithImageExtension = imageExtensions.some(ext => 
        url.toLowerCase().endsWith(ext)
      );
      
      return endsWithImageExtension;
    });
  };