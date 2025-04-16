// packages/backend/src/api/middlewares/csrf.middleware.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Generate CSRF token middleware
export const generateCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Generate a random token
  const csrfToken = crypto.randomBytes(32).toString('hex');
  
  // Store the token in the session
  if (req.session) {
    req.session.csrfToken = csrfToken;
  }
  
  // Set cookie with the token
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false, // Must be false so client JS can read it
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  });
  
  // Also attach to response locals for EJS templates
  res.locals.csrfToken = csrfToken;
  
  next();
};

// Validate CSRF token middleware
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF validation for GET, HEAD, OPTIONS and the CSRF token endpoint
  if (req.path === '/api/auth/csrf-token' || ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const tokenFromHeader = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
  const tokenFromSession = req.session?.csrfToken;
  const tokenFromCookie = req.cookies?.['XSRF-TOKEN'];
  const tokenFromBody = req.body?._csrf;

  // Use any available token source
  const sentToken = tokenFromHeader || tokenFromBody;
  const storedToken = tokenFromSession || tokenFromCookie;

  // Log tokens in development to help debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('CSRF validation:', {
      sentToken,
      storedToken,
      headerToken: tokenFromHeader,
      bodyToken: tokenFromBody,
      sessionToken: tokenFromSession,
      cookieToken: tokenFromCookie,
    });
  }

  // Skip validation in development if no token is available
  if (!storedToken && process.env.NODE_ENV !== 'production') {
    console.warn('CSRF validation skipped - no stored token available');
    return next();
  }

  // Check if the token matches
  if (sentToken && storedToken && sentToken === storedToken) {
    return next();
  }

  // Allow in development with a warning
  if (process.env.NODE_ENV !== 'production') {
    console.warn('CSRF token validation failed, but allowing in development mode');
    return next();
  }

  // Reject in production
  res.status(403).json({
    success: false,
    message: 'Invalid or missing CSRF token'
  });
}