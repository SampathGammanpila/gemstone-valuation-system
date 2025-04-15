// packages/backend/src/admin/routes/index.ts
import { Router } from 'express';
import authController from '../controllers/auth.controller';
import dashboardRoutes from './dashboard.routes';
import userRoutes from './user.routes';
import gemstoneRoutes from './gemstone.routes';
import referenceDataRoutes from './reference-data.routes';
import systemRoutes from './system.routes';
import { authenticate, requireAdmin } from '../middlewares/admin-auth.middleware';
import { createHandler } from '../../types/express.types';

const router = Router();

// Auth routes (no authentication required)
router.get('/login', createHandler(authController.getLoginPage));
router.post('/login', createHandler(authController.loginAdmin));
router.get('/logout', createHandler(authController.logoutAdmin));

// Password change routes - No authentication check here to avoid redirect loops
// The controller will handle proper validation
router.get('/change-password', createHandler(authController.getChangePasswordPage));
router.post('/change-password', createHandler(authController.changePassword));

// Routes requiring authentication
router.use(authenticate);

// MFA setup routes
router.get('/setup-mfa', requireAdmin, createHandler(authController.getSetupMfaPage));
router.post('/setup-mfa', requireAdmin, createHandler(authController.enableMfa));
router.post('/disable-mfa', requireAdmin, createHandler(authController.disableMfa));

// Use other route modules with additional admin role check
router.use('/dashboard', requireAdmin, dashboardRoutes);
router.use('/users', requireAdmin, userRoutes);
router.use('/gemstones', requireAdmin, gemstoneRoutes);
router.use('/reference-data', requireAdmin, referenceDataRoutes);
router.use('/system', requireAdmin, systemRoutes);

// Simple admin home redirect to dashboard
router.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

export default router;