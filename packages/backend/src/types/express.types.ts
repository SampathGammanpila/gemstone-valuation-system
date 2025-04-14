// packages/backend/src/types/express.types.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Define the route handler type correctly to accept any return type
export type RouteHandler = (
  req: Request, 
  res: Response, 
  next?: NextFunction
) => Promise<any> | any;

// Helper function to properly type route handlers with type assertion
export const createHandler = (handler: RouteHandler): RequestHandler => {
  return (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next && next(error);
    }
  }) as RequestHandler;
};