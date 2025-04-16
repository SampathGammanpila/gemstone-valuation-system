// src/types/express-session.d.ts
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    // Admin user information
    adminUser?: {
      userId: number;
      username: string;
      role: string;
    };
    
    // CSRF token for form security
    csrfToken?: string;
    
    // MFA verification flow
    mfaVerification?: boolean;
    
    // Password change requirements
    passwordChangeRequired?: boolean;
    
    // Temporary user data during auth flows
    tempUserId?: number;
    tempUserEmail?: string;
  }
}