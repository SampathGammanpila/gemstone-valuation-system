// packages/backend/src/api/validators/gemstone.validator.ts

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../middlewares/error.middleware';
import * as validators from '../../utils/validators';

/**
 * Validate create gemstone request
 */
export const validateCreateGemstone = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const {
      title,
      description,
      gemstone_family_id,
      cut_shape_id,
      color_id,
      color_grade_id,
      cut_grade_id,
      clarity_id,
      treatment_id,
      clarity_characteristics_ids,
      blemish_ids,
      width_mm,
      height_mm,
      depth_mm,
      carat_weight,
      piece_count,
      mining_method_id,
      mining_location_id,
      special_notes,
      image_urls,
      status
    } = req.body;

    // Required fields validation
    const requiredFields = [
      { field: 'title', value: title, message: 'Title is required' },
      { field: 'gemstone_family_id', value: gemstone_family_id, message: 'Gemstone family is required' },
      { field: 'cut_shape_id', value: cut_shape_id, message: 'Cut shape is required' },
      { field: 'color_id', value: color_id, message: 'Color is required' },
      { field: 'color_grade_id', value: color_grade_id, message: 'Color grade is required' },
      { field: 'cut_grade_id', value: cut_grade_id, message: 'Cut grade is required' },
      { field: 'clarity_id', value: clarity_id, message: 'Clarity is required' },
      { field: 'carat_weight', value: carat_weight, message: 'Carat weight is required' },
    ];

    const missingFields = requiredFields.filter(field => !field.value);
    if (missingFields.length > 0) {
      throw new ApiError(
        400,
        `Missing required fields: ${missingFields.map(f => f.field).join(', ')}`,
        { fields: missingFields.map(f => ({ field: f.field, message: f.message })) }
      );
    }

    // Title validation
    if (title && (title.length < 3 || title.length > 100)) {
      throw new ApiError(
        400,
        'Title must be between 3 and 100 characters',
        { fields: [{ field: 'title', message: 'Title must be between 3 and 100 characters' }] }
      );
    }

    // Description validation
    if (description && description.length > 2000) {
      throw new ApiError(
        400,
        'Description must be less than 2000 characters',
        { fields: [{ field: 'description', message: 'Description must be less than 2000 characters' }] }
      );
    }

    // Special notes validation
    if (special_notes && special_notes.length > 2000) {
      throw new ApiError(
        400,
        'Special notes must be less than 2000 characters',
        { fields: [{ field: 'special_notes', message: 'Special notes must be less than 2000 characters' }] }
      );
    }

    // Numeric validations
    if (!validators.isValidNumber(carat_weight, 0.001, 9999.999)) {
      throw new ApiError(
        400,
        'Carat weight must be between 0.001 and 9999.999',
        { fields: [{ field: 'carat_weight', message: 'Carat weight must be between 0.001 and 9999.999' }] }
      );
    }

    if (width_mm && !validators.isValidNumber(width_mm, 0.1, 1000)) {
      throw new ApiError(
        400,
        'Width must be between 0.1mm and 1000mm',
        { fields: [{ field: 'width_mm', message: 'Width must be between 0.1mm and 1000mm' }] }
      );
    }

    if (height_mm && !validators.isValidNumber(height_mm, 0.1, 1000)) {
      throw new ApiError(
        400,
        'Height must be between 0.1mm and 1000mm',
        { fields: [{ field: 'height_mm', message: 'Height must be between 0.1mm and 1000mm' }] }
      );
    }

    if (depth_mm && !validators.isValidNumber(depth_mm, 0.1, 1000)) {
      throw new ApiError(
        400,
        'Depth must be between 0.1mm and 1000mm',
        { fields: [{ field: 'depth_mm', message: 'Depth must be between 0.1mm and 1000mm' }] }
      );
    }

    if (piece_count && (!Number.isInteger(piece_count) || piece_count < 1)) {
      throw new ApiError(
        400,
        'Piece count must be a positive integer',
        { fields: [{ field: 'piece_count', message: 'Piece count must be a positive integer' }] }
      );
    }

    // ID validations
    const idFields = [
      { field: 'gemstone_family_id', value: gemstone_family_id },
      { field: 'cut_shape_id', value: cut_shape_id },
      { field: 'color_id', value: color_id },
      { field: 'color_grade_id', value: color_grade_id },
      { field: 'cut_grade_id', value: cut_grade_id },
      { field: 'clarity_id', value: clarity_id },
      { field: 'treatment_id', value: treatment_id },
      { field: 'mining_method_id', value: mining_method_id },
      { field: 'mining_location_id', value: mining_location_id }
    ];

    idFields.forEach(field => {
      if (field.value && !validators.isValidId(field.value)) {
        throw new ApiError(
          400,
          `Invalid ${field.field.replace('_id', '')} ID`,
          { fields: [{ field: field.field, message: `Invalid ${field.field.replace('_id', '')} ID` }] }
        );
      }
    });

    // Array validations
    if (clarity_characteristics_ids && !validators.isValidIdArray(clarity_characteristics_ids)) {
      throw new ApiError(
        400,
        'Invalid clarity characteristics IDs',
        { fields: [{ field: 'clarity_characteristics_ids', message: 'Invalid clarity characteristics IDs' }] }
      );
    }

    if (blemish_ids && !validators.isValidIdArray(blemish_ids)) {
      throw new ApiError(
        400,
        'Invalid blemish IDs',
        { fields: [{ field: 'blemish_ids', message: 'Invalid blemish IDs' }] }
      );
    }

    if (image_urls && !Array.isArray(image_urls)) {
      throw new ApiError(
        400,
        'Image URLs must be an array',
        { fields: [{ field: 'image_urls', message: 'Image URLs must be an array' }] }
      );
    }

    // Status validation
    if (status && !['draft', 'published', 'private', 'sold'].includes(status)) {
      throw new ApiError(
        400,
        'Invalid status. Must be one of: draft, published, private, sold',
        { fields: [{ field: 'status', message: 'Invalid status. Must be one of: draft, published, private, sold' }] }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate update gemstone request
 */
export const validateUpdateGemstone = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Only validate fields that are being updated
    const {
      title,
      description,
      gemstone_family_id,
      cut_shape_id,
      color_id,
      color_grade_id,
      cut_grade_id,
      clarity_id,
      treatment_id,
      clarity_characteristics_ids,
      blemish_ids,
      width_mm,
      height_mm,
      depth_mm,
      carat_weight,
      piece_count,
      mining_method_id,
      mining_location_id,
      special_notes,
      image_urls,
      status
    } = req.body;

    // Title validation
    if (title !== undefined && (title.length < 3 || title.length > 100)) {
      throw new ApiError(
        400,
        'Title must be between 3 and 100 characters',
        { fields: [{ field: 'title', message: 'Title must be between 3 and 100 characters' }] }
      );
    }

    // Description validation
    if (description !== undefined && description.length > 2000) {
      throw new ApiError(
        400,
        'Description must be less than 2000 characters',
        { fields: [{ field: 'description', message: 'Description must be less than 2000 characters' }] }
      );
    }

    // Special notes validation
    if (special_notes !== undefined && special_notes.length > 2000) {
      throw new ApiError(
        400,
        'Special notes must be less than 2000 characters',
        { fields: [{ field: 'special_notes', message: 'Special notes must be less than 2000 characters' }] }
      );
    }

    // Numeric validations
    if (carat_weight !== undefined && !validators.isValidNumber(carat_weight, 0.001, 9999.999)) {
      throw new ApiError(
        400,
        'Carat weight must be between 0.001 and 9999.999',
        { fields: [{ field: 'carat_weight', message: 'Carat weight must be between 0.001 and 9999.999' }] }
      );
    }

    if (width_mm !== undefined && !validators.isValidNumber(width_mm, 0.1, 1000)) {
      throw new ApiError(
        400,
        'Width must be between 0.1mm and 1000mm',
        { fields: [{ field: 'width_mm', message: 'Width must be between 0.1mm and 1000mm' }] }
      );
    }

    if (height_mm !== undefined && !validators.isValidNumber(height_mm, 0.1, 1000)) {
      throw new ApiError(
        400,
        'Height must be between 0.1mm and 1000mm',
        { fields: [{ field: 'height_mm', message: 'Height must be between 0.1mm and 1000mm' }] }
      );
    }

    if (depth_mm !== undefined && !validators.isValidNumber(depth_mm, 0.1, 1000)) {
      throw new ApiError(
        400,
        'Depth must be between 0.1mm and 1000mm',
        { fields: [{ field: 'depth_mm', message: 'Depth must be between 0.1mm and 1000mm' }] }
      );
    }

    if (piece_count !== undefined && (!Number.isInteger(piece_count) || piece_count < 1)) {
      throw new ApiError(
        400,
        'Piece count must be a positive integer',
        { fields: [{ field: 'piece_count', message: 'Piece count must be a positive integer' }] }
      );
    }

    // ID validations
    const idFields = [
      { field: 'gemstone_family_id', value: gemstone_family_id },
      { field: 'cut_shape_id', value: cut_shape_id },
      { field: 'color_id', value: color_id },
      { field: 'color_grade_id', value: color_grade_id },
      { field: 'cut_grade_id', value: cut_grade_id },
      { field: 'clarity_id', value: clarity_id },
      { field: 'treatment_id', value: treatment_id },
      { field: 'mining_method_id', value: mining_method_id },
      { field: 'mining_location_id', value: mining_location_id }
    ];

    idFields.forEach(field => {
      if (field.value !== undefined && !validators.isValidId(field.value)) {
        throw new ApiError(
          400,
          `Invalid ${field.field.replace('_id', '')} ID`,
          { fields: [{ field: field.field, message: `Invalid ${field.field.replace('_id', '')} ID` }] }
        );
      }
    });

    // Array validations
    if (clarity_characteristics_ids !== undefined && !validators.isValidIdArray(clarity_characteristics_ids)) {
      throw new ApiError(
        400,
        'Invalid clarity characteristics IDs',
        { fields: [{ field: 'clarity_characteristics_ids', message: 'Invalid clarity characteristics IDs' }] }
      );
    }

    if (blemish_ids !== undefined && !validators.isValidIdArray(blemish_ids)) {
      throw new ApiError(
        400,
        'Invalid blemish IDs',
        { fields: [{ field: 'blemish_ids', message: 'Invalid blemish IDs' }] }
      );
    }

    if (image_urls !== undefined && !Array.isArray(image_urls)) {
      throw new ApiError(
        400,
        'Image URLs must be an array',
        { fields: [{ field: 'image_urls', message: 'Image URLs must be an array' }] }
      );
    }

    // Status validation
    if (status !== undefined && !['draft', 'published', 'private', 'sold'].includes(status)) {
      throw new ApiError(
        400,
        'Invalid status. Must be one of: draft, published, private, sold',
        { fields: [{ field: 'status', message: 'Invalid status. Must be one of: draft, published, private, sold' }] }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate save draft request
 */
export const validateSaveDraft = (req: Request, res: Response, next: NextFunction): void => {
    try {
      // For drafts, we allow incomplete data
      const {
        title,
        description,
        gemstone_family_id,
        cut_shape_id,
        color_id,
        color_grade_id,
        clarity_id,
        carat_weight,
        width_mm,
        height_mm,
        depth_mm,
        status
      } = req.body;
  
      // Title validation if provided
      if (title && (title.length < 3 || title.length > 100)) {
        throw new ApiError(
          400,
          'Title must be between 3 and 100 characters',
          { fields: [{ field: 'title', message: 'Title must be between 3 and 100 characters' }] }
        );
      }
  
      // Description validation if provided
      if (description && description.length > 2000) {
        throw new ApiError(
          400,
          'Description must be less than 2000 characters',
          { fields: [{ field: 'description', message: 'Description must be less than 2000 characters' }] }
        );
      }
  
      // Validate IDs if provided
      if (gemstone_family_id && !validators.isValidId(gemstone_family_id)) {
        throw new ApiError(
          400,
          'Invalid gemstone family ID',
          { fields: [{ field: 'gemstone_family_id', message: 'Invalid gemstone family ID' }] }
        );
      }
  
      if (cut_shape_id && !validators.isValidId(cut_shape_id)) {
        throw new ApiError(
          400,
          'Invalid cut shape ID',
          { fields: [{ field: 'cut_shape_id', message: 'Invalid cut shape ID' }] }
        );
      }
  
      if (color_id && !validators.isValidId(color_id)) {
        throw new ApiError(
          400,
          'Invalid color ID',
          { fields: [{ field: 'color_id', message: 'Invalid color ID' }] }
        );
      }
  
      if (color_grade_id && !validators.isValidId(color_grade_id)) {
        throw new ApiError(
          400,
          'Invalid color grade ID',
          { fields: [{ field: 'color_grade_id', message: 'Invalid color grade ID' }] }
        );
      }
  
      if (clarity_id && !validators.isValidId(clarity_id)) {
        throw new ApiError(
          400,
          'Invalid clarity ID',
          { fields: [{ field: 'clarity_id', message: 'Invalid clarity ID' }] }
        );
      }
  
      // Validate measurements if provided
      if (carat_weight && !validators.isValidNumber(carat_weight, 0.001, 9999.999)) {
        throw new ApiError(
          400,
          'Carat weight must be between 0.001 and 9999.999',
          { fields: [{ field: 'carat_weight', message: 'Carat weight must be between 0.001 and 9999.999' }] }
        );
      }
  
      if (width_mm && !validators.isValidNumber(width_mm, 0.1, 1000)) {
        throw new ApiError(
          400,
          'Width must be between 0.1mm and 1000mm',
          { fields: [{ field: 'width_mm', message: 'Width must be between 0.1mm and 1000mm' }] }
        );
      }
  
      if (height_mm && !validators.isValidNumber(height_mm, 0.1, 1000)) {
        throw new ApiError(
          400,
          'Height must be between 0.1mm and 1000mm',
          { fields: [{ field: 'height_mm', message: 'Height must be between 0.1mm and 1000mm' }] }
        );
      }
  
      if (depth_mm && !validators.isValidNumber(depth_mm, 0.1, 1000)) {
        throw new ApiError(
          400,
          'Depth must be between 0.1mm and 1000mm',
          { fields: [{ field: 'depth_mm', message: 'Depth must be between 0.1mm and 1000mm' }] }
        );
      }
  
      // Status validation
      if (status && status !== 'draft') {
        throw new ApiError(
          400,
          'Status must be "draft" for saving drafts',
          { fields: [{ field: 'status', message: 'Status must be "draft" for saving drafts' }] }
        );
      }
  
      next();
    } catch (error) {
      next(error);
    }
  };