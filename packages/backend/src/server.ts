// packages/backend/src/server.ts
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
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
// Import the custom type definitions
import './types/express-extensions';
// Import the middleware type definitions
import './types/express-middleware';

// Create Express application
const app = express();

// Security middleware
app.use(helmet({
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Apply CORS to all API routes
app.use('/api', cors); 

// Static files middleware
app.use('/admin', express.static(path.join(__dirname, '../public/admin')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Set up EJS as the view engine for admin panel
app.set('views', adminConfig.views.dir);
app.set('view engine', adminConfig.views.engine);
// Fix for EJS layouts middleware
app.use(ejsLayouts);
app.set('layout', 'layouts/main');

// Session configuration in server.ts
app.use(session({
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

app.use(connectFlash());

// Make flash messages available to all views
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  res.locals.info = req.flash('info');
  res.locals.messages = req.flash('messages') || {};
  next();
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Admin panel routes
app.use('/admin', adminRoutes);

// API routes
app.use('/api', apiRoutes);

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
app.use(notFoundHandler);

// Global error handler
app.use(errorMiddleware);

export default app;