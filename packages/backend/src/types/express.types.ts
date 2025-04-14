// packages/backend/src/types/express.types.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Define the route handler type correctly
export type RouteHandler = (
  req: Request, 
  res: Response, 
  next?: NextFunction
) => Promise<void> | void;

// Helper function to properly type route handlers
export const createHandler = (handler: RouteHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next && next(error);
    }
  };
};