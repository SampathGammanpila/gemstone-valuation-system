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
    // Added properties for enhanced security features
    tempUserId?: number;
    tempUserEmail?: string;
    mfaVerification?: boolean;
    passwordChangeRequired?: boolean;
    // Add any other session properties used in the application
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