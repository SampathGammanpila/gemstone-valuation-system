// packages/backend/src/config/admin.config.ts
import path from 'path';
import environment from './environment';

export default {
  // Session secret for admin panel
  sessionSecret: process.env.ADMIN_SESSION_SECRET || 'admin-secret-key-change-in-production',
  
  // Cookie settings
  cookie: {
    secure: environment.nodeEnv === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // View engine settings
  views: {
    engine: 'ejs',
    dir: path.join(__dirname, '../admin/views'),
  },
  
  // Upload paths
  uploads: {
    gemstoneImages: path.join(__dirname, '../../public/uploads/gemstones'),
    userAvatars: path.join(__dirname, '../../public/uploads/users'),
    tempUploads: path.join(__dirname, '../../public/uploads/temp'),
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
};