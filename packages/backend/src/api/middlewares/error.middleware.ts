import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
}

// Global error handling middleware
export default function errorMiddleware(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Something went wrong';

  console.error(`Error [${statusCode}]: ${message}`);
  
  // Log detailed error information in development
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
}