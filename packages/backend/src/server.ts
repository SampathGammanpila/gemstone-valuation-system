// packages/backend/src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import session from 'express-session';
import connectFlash from 'connect-flash';
import helmet from 'helmet';
import ejsLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import cors from './config/cors';
import environment from './config/environment';
import adminConfig from './config/admin.config';
import apiRoutes from './api/routes';
import adminRoutes from './admin/routes';
import errorMiddleware from './api/middlewares/error.middleware';

// Create Express application
const app = express();

// Add admin to Request interface without redefining flash
declare global {
  namespace Express {
    interface Request {
      admin?: {
        userId: number;
        username: string;
        role: string;
      };
    }
  }
}

// Express middleware has incorrect types that cause TS errors
// We'll use a variable to suppress these errors
const expressUse: any = app.use.bind(app);

// Security middleware
expressUse(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Basic middleware
expressUse(express.json());
expressUse(express.urlencoded({ extended: true }));
expressUse(cookieParser());

// Apply CORS to all API routes
expressUse('/api', cors); 

// Static files middleware
expressUse('/admin', express.static(path.join(__dirname, '../public/admin')));
expressUse('/public', express.static(path.join(__dirname, '../public')));

// Set up EJS as the view engine for admin panel
app.set('views', adminConfig.views.dir);
app.set('view engine', adminConfig.views.engine);

// Fix for EJS layouts middleware
expressUse(ejsLayouts);
app.set('layout', 'layouts/main');

// Session configuration
expressUse(session({
  secret: adminConfig.sessionSecret,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: adminConfig.cookie.maxAge,
  }
}));

// Use connect-flash middleware
expressUse(connectFlash());

// Make flash messages available to all views
expressUse((req: Request, res: Response, next: NextFunction) => {
  // Safe way to handle flash messages without type errors
  try {
    // Cast req.flash to any to avoid type errors
    const flashFn = req.flash as any;
    if (typeof flashFn === 'function') {
      res.locals.success = flashFn('success') || [];
      res.locals.error = flashFn('error') || [];
      res.locals.warning = flashFn('warning') || [];
      res.locals.info = flashFn('info') || [];
      res.locals.messages = flashFn('messages') || {};
    } else {
      // Fallback if flash is not available
      res.locals.success = [];
      res.locals.error = [];
      res.locals.warning = [];
      res.locals.info = [];
      res.locals.messages = {};
    }
  } catch (err) {
    console.error('Error processing flash messages:', err);
    // Ensure locals are defined even if there's an error
    res.locals.success = [];
    res.locals.error = [];
    res.locals.warning = [];
    res.locals.info = [];
    res.locals.messages = {};
  }
  
  next();
});

// Request logging middleware
expressUse((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Admin panel routes
expressUse('/admin', adminRoutes);

// API routes
expressUse('/api', apiRoutes);

// Root route for API information
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'Gemstone Valuation System API',
    version: '1.0.0',
    environment: environment.nodeEnv,
    endpoints: {
      api: '/api',
      health: '/api/health',
      admin: '/admin'
    }
  });
});

// 404 handler for undefined routes
const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  // Check if it's an admin route
  if (req.url.startsWith('/admin')) {
    return res.status(404).render('error', {
      title: '404 - Page Not Found',
      message: 'The page you are looking for does not exist.'
    });
  }
  
  // API route 404 response
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
};

// Apply 404 handler
expressUse(notFoundHandler);

// Global error handler
expressUse(errorMiddleware);

export default app;