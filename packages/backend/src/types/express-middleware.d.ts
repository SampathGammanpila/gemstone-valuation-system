// Import type declarations
import { Express, RequestHandler } from 'express-serve-static-core';

// Declare module augmentation to fix TypeScript middleware issues
declare module 'express-serve-static-core' {
  interface Express {
    use(path: string | RegExp | Array<string | RegExp>, ...handlers: Array<RequestHandler | any>): Express;
    use(...handlers: Array<RequestHandler | any>): Express;
  }
}