import cors from 'cors';
import environment from './environment';

// Configure CORS options
const corsOptions = {
  origin: environment.frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-CSRF-Token', 
    'X-Requested-With',
    'X-Content-Type-Options',
    'X-Frame-Options'
  ],
  credentials: true
};

export default cors(corsOptions);