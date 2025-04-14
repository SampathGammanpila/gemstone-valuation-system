// packages/backend/src/admin/middlewares/admin-auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../../db/models/user.model';
import environment from '../../config/environment';

// Extend Express Request type to include admin property
declare global {
  namespace Express {
    interface Request {
      admin?: {
        userId: number;
        username: string;
        role: string;
      };
      session: any; // For session functionality
      flash: (type: string, message?: string) => any;
    }
  }
}

/**
 * Middleware to authenticate admin requests
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  // Check if user is logged in
  if (!req.session || !req.session.adminUser) {
    req.flash('error', 'You must be logged in to access this page');
    return res.redirect('/admin/login');
  }
  
  // Add admin user to request
  req.admin = req.session.adminUser;
  
  // Add admin user data to all view renders
  res.locals.admin = req.admin;
  
  next();
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.admin) {
      req.flash('error', 'Authentication required');
      return res.redirect('/admin/login');
    }
    
    // Verify admin role
    const user = await userModel.findById(req.admin.userId);
    
    if (!user || user.role_name !== 'admin') {
      req.flash('error', 'You do not have permission to access the admin panel');
      req.session.destroy(() => {
        res.redirect('/admin/login');
      });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    req.flash('error', 'Authentication error');
    res.redirect('/admin/login');
  }
};

/**
 * Middleware to validate admin login token
 */
export const validateAdminToken = async (token: string): Promise<any> => {
  try {
    // Verify token
    const decoded = jwt.verify(token, environment.jwtSecret as string) as { userId: number; role: string };
    
    // Check if user exists and is admin
    const user = await userModel.findById(decoded.userId);
    
    if (!user || user.role_name !== 'admin') {
      throw new Error('Invalid admin user');
    }
    
    return {
      userId: user.id,
      username: user.username,
      role: user.role_name
    };
  } catch (error) {
    console.error('Admin token validation error:', error);
    throw new Error('Invalid or expired token');
  }
};

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