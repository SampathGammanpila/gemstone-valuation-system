// Import session type definitions early to ensure they're available
import './types/express-session';

import app from './server';
import environment from './config/environment';

// Start the server
const server = app.listen(environment.port, () => {
  console.log(`
    ################################################
    🚀 Server listening on port ${environment.port}
    🌎 Environment: ${environment.nodeEnv}
    🔗 Frontend URL: ${environment.frontendUrl}
    ################################################
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Close server & exit process
  server.close(() => process.exit(1));
});