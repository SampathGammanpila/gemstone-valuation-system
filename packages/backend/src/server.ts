// packages/backend/src/server.ts
import express, { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';
import path from 'path';
import session from 'express-session';
import connectFlash from 'connect-flash';
import helmet from 'helmet';
import cors from './config/cors';
import environment from './config/environment';
import adminConfig from './config/admin.config';
import apiRoutes from './api/routes';
import adminRoutes from './admin/routes';
import errorMiddleware from './api/middlewares/error.middleware';
// Import the custom type definitions
import './types/express-extensions';

// Create Express application
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
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
app.use(cors);

// Static files middleware
app.use(express.static(path.join(__dirname, '../public')));

// Set up EJS as the view engine for admin panel
app.set('views', adminConfig.views.dir);
app.set('view engine', adminConfig.views.engine);

// Session and flash middleware for admin panel
app.use(
  (session({
    secret: adminConfig.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: adminConfig.cookie.secure,
      maxAge: adminConfig.cookie.maxAge,
    }
  }) as unknown) as RequestHandler
);

app.use((connectFlash() as unknown) as RequestHandler);

// Request logging middleware
app.use(((req: Request, res: Response, next: NextFunction): void => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}) as RequestHandler);

// Admin panel routes
app.use('/admin', adminRoutes);

// API routes
app.use('/api', apiRoutes);

// Root route for API information
app.get('/', ((req: Request, res: Response): void => {
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
}) as RequestHandler);

// 404 handler for undefined routes
app.use(((req: Request, res: Response): void => {
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
}) as RequestHandler);

// Global error handler
app.use(errorMiddleware as ErrorRequestHandler);

export default app;