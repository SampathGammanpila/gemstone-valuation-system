import { Request, Response, NextFunction } from 'express';

// Define the route handler type with correct return type
export type RouteHandler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => Promise<void> | void;

// Helper function to properly type route handlers
export const createHandler = (handler: Function): RouteHandler => {
  return async (req: Request, res: Response, next?: NextFunction): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next && next(error);
    }
  };
};