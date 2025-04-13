import cors from 'cors';
import environment from './environment';

// Configure CORS options
const corsOptions = {
  origin: environment.frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

export default cors(corsOptions);