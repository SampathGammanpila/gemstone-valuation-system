// This file extends the Express session to include our custom properties
import 'express-session';

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
  }
}