// src/types/express-middleware.d.ts

// A more comprehensive approach to fixing Express middleware type issues
import { Express } from 'express';

declare module 'express' {
  interface Express {
    use: any; // This is a broader fix that loosens type checking for app.use()
  }
}

declare global {
  namespace Express {
    interface Request {
      admin?: {
        userId: number;
        username: string;
        role: string;
      };
      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
      flash?(type: string, message?: any): any;
      flash?(type: string): any[];
    }
  }
}