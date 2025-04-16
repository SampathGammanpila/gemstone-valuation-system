import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';

// Custom interface extending Session
interface CustomSession extends Session {
  csrfToken?: string;
}

/**
 * Middleware to validate CSRF tokens
 * This middleware checks that the token in the request header matches the one in the session
 */
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF validation for CSRF token endpoint and non-mutating methods
  if (req.path === '/csrf-token' || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const tokenFromHeader = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
  // Use type assertion to access csrfToken
  const tokenFromSession = req.session ? (req.session as CustomSession).csrfToken : undefined;
  const tokenFromCookie = req.cookies?.['XSRF-TOKEN'];

  // Skip validation if CSRF protection is not fully set up yet
  if (!tokenFromSession && !tokenFromCookie) {
    // Log this as a warning if in development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('CSRF validation skipped because no token was found in session or cookie');
    }
    return next();
  }

  // Check if the token in the header matches the one in the session or cookie
  if (tokenFromHeader && (tokenFromHeader === tokenFromSession || tokenFromHeader === tokenFromCookie)) {
    return next();
  }

  // If in development mode, provide a warning but still allow the request
  if (process.env.NODE_ENV !== 'production') {
    console.warn('CSRF token validation failed, but allowing request in development mode');
    console.warn('Header token:', tokenFromHeader);
    console.warn('Session token:', tokenFromSession);
    return next();
  }

  // In production, reject requests with invalid CSRF tokens
  res.status(403).json({
    success: false,
    message: 'Invalid or missing CSRF token'
  });
}