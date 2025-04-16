// src/types/express-extensions.d.ts
import 'express-session';

// Extend Express Session
declare module 'express-session' {
  interface SessionData {
    adminUser?: {
      userId: number;
      username: string;
      role: string;
    };
    csrfToken?: string;
    mfaVerification?: boolean;
    passwordChangeRequired?: boolean;
    tempUserId?: number;
    tempUserEmail?: string;
  }
}