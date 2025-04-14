// packages/backend/src/admin/middlewares/admin-validators.middleware.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Validate gemstone family form
 */
export const validateGemstoneFamilyForm = (req: Request, res: Response, next: NextFunction): void => {
  const { name, category } = req.body;
  
  if (!name || !category) {
    req.flash('error', 'Name and category are required');
    return res.redirect('back');
  }
  
  next();
};

/**
 * Validate user form
 */
export const validateUserForm = (req: Request, res: Response, next: NextFunction): void => {
  const { username, email, password, role_id } = req.body;
  
  if (!username || !email || !role_id) {
    req.flash('error', 'Username, email, and role are required');
    return res.redirect('back');
  }
  
  // If creating a new user (password required)
  if (req.path.includes('/create') && !password) {
    req.flash('error', 'Password is required for new users');
    return res.redirect('back');
  }
  
  next();
};

/**
 * Validate system settings form
 */
export const validateSystemSettingsForm = (req: Request, res: Response, next: NextFunction): void => {
  // Add validation logic for system settings
  next();
};