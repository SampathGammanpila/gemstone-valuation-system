import { Router } from 'express';
import referenceDataRoutes from './reference-data.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';

const router = Router();

// Mount route groups
router.use('/reference', referenceDataRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is up and running',
    timestamp: new Date().toISOString()
  });
});

export default router;