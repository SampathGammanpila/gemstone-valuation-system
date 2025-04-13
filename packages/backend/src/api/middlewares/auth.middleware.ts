import { Request, Response, NextFunction } from 'express';
import authService from '../../services/auth.service';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests with JWT
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = authService.verifyToken(token);
    
    // Attach user to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
    return;
  }
};

/**
 * Middleware to require specific roles
 */
export const requireRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }
      
      // Check if user's role is in the required roles
      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
        return;
      }
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
      return;
    }
  };
};

/**
 * Predefined role checks
 */
export const requireAdmin = requireRoles(['admin']);
export const requireCutter = requireRoles(['cutter', 'admin']);
export const requireDealer = requireRoles(['dealer', 'admin']);
export const requireCollector = requireRoles(['collector', 'admin']);
export const requireAppraiser = requireRoles(['appraiser', 'admin']);