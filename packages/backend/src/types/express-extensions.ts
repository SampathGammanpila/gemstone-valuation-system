// Create a new file: src/types/express-extensions.ts (note: .ts not .d.ts)

import 'express-session';
import 'connect-flash';

// This file just declares the type extensions
// No need to export anything

// Just having these declarations will extend the types
declare module 'express-session' {
  interface SessionData {
    adminUser?: {
      userId: number;
      username: string;
      role: string;
    };
  }
}

declare module 'express' {
  interface Request {
    admin?: {
      userId: number;
      username: string;
      role: string;
    };
    flash(type: string, message?: any): any;
    flash(type: string): any[];
  }
}