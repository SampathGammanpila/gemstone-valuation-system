// Type definitions to resolve compatibility issues
import { Request } from 'express';
import 'express-session';
import { SessionData } from 'express-session';

// Extend express-session to avoid TypeScript errors
declare module 'express-session' {
  interface SessionData {
    user: any;
    isAuthenticated: boolean;
    [key: string]: any;
  }
}

// Add flash function to Express Request interface
declare module 'express' {
  interface Request {
    flash(type: string, message?: any): any;
    flash(type: string): any[];
    session: SessionData;
  }
}