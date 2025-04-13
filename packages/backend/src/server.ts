import express, { Request, Response, NextFunction } from 'express';
import cors from './config/cors';
import environment from './config/environment';
import apiRoutes from './api/routes';
import errorMiddleware from './api/middlewares/error.middleware';

// Create Express application
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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
      health: '/api/health'
    }
  });
});

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Global error handler
app.use(errorMiddleware);

export default app;