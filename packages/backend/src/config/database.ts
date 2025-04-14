import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development' });

// Create a new pool instance with configuration from env variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'vikum5723',
  database: process.env.DB_NAME || 'gemstone_valuation',
  max: 20, // Maximum number of clients the pool should contain
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // Increased timeout from 2000ms to 10000ms (10 seconds)
});

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    console.log('Database connection failed. Using fallback mode for admin panel.');
    // Continue execution even if database connection fails
  } else {
    console.log('Connected to PostgreSQL database');
    if (release) release();
  }
});

// Export the pool for use in other files
export default pool;