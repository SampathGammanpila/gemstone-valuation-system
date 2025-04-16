// packages/backend/src/admin/middlewares/admin-auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../../db/models/user.model';
import environment from '../../config/environment';

/**
 * Middleware to authenticate admin requests
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  // Check if user is in MFA verification or password change flow
  if (req.session.mfaVerification || req.session.passwordChangeRequired) {
    // Allow access to these specific routes without full admin authentication
    if (req.path === '/login' || req.path === '/change-password') {
      return next();
    }
  }

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
    try {
      const user = await userModel.findById(req.admin.userId);
      
      if (!user || user.role_name !== 'admin') {
        req.flash('error', 'You do not have permission to access the admin panel');
        req.session.destroy(() => {
          res.redirect('/admin/login');
        });
        return;
      }
    } catch (dbError) {
      // FIX: Don't allow admin access if we can't verify their role
      console.error('Database error during admin authentication:', dbError);
      req.flash('error', 'System error: Unable to verify admin permissions. Please try again later.');
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