// packages/backend/src/api/middlewares/validation.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ApiError } from './error.middleware';

/**
 * Interface for validation error
 */
interface ValidationErrorField {
  field: string;
  message: string;
}

/**
 * Middleware for validating request body
 */
export const validateRequestBody = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.body, { abortEarly: false });
      
      if (error) {
        const validationErrors: ValidationErrorField[] = error.details.map((detail: any) => ({
          field: detail.context?.key || detail.path.join('.'),
          message: detail.message
        }));
        
        throw new ApiError(
          400,
          'Validation failed',
          { fields: validationErrors }
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware for validating request query parameters
 */
export const validateRequestQuery = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.query, { abortEarly: false });
      
      if (error) {
        const validationErrors: ValidationErrorField[] = error.details.map((detail: any) => ({
          field: detail.context?.key || detail.path.join('.'),
          message: detail.message
        }));
        
        throw new ApiError(
          400,
          'Query validation failed',
          { fields: validationErrors }
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware for validating request parameters
 */
export const validateRequestParams = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.params, { abortEarly: false });
      
      if (error) {
        const validationErrors: ValidationErrorField[] = error.details.map((detail: any) => ({
          field: detail.context?.key || detail.path.join('.'),
          message: detail.message
        }));
        
        throw new ApiError(
          400,
          'Parameter validation failed',
          { fields: validationErrors }
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validate ID parameter
 */
export const validateIdParam = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(req.params[paramName]);
      
      if (isNaN(id) || id <= 0) {
        throw new ApiError(
          400,
          `Invalid ${paramName} parameter`,
          { fields: [{ field: paramName, message: `${paramName} must be a positive integer` }] }
        );
      }
      
      req.params[paramName] = id.toString();
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    if (page < 1) {
      throw new ApiError(
        400,
        'Page number must be positive',
        { fields: [{ field: 'page', message: 'Page number must be positive' }] }
      );
    }
    
    if (limit < 1 || limit > 100) {
      throw new ApiError(
        400,
        'Limit must be between 1 and 100',
        { fields: [{ field: 'limit', message: 'Limit must be between 1 and 100' }] }
      );
    }
    
    // Add pagination to request for later use
    req.pagination = {
      page,
      limit,
      offset: (page - 1) * limit
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

// Extend Express Request interface to include pagination
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
    }
  }
}