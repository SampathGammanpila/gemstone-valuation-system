import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development' });

export default {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};