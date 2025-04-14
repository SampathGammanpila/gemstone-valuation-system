// packages/backend/src/admin/routes/index.ts
import { Router } from 'express';
import authController from '../controllers/auth.controller';
import dashboardRoutes from './dashboard.routes';
import userRoutes from './user.routes';
import gemstoneRoutes from './gemstone.routes';
import referenceDataRoutes from './reference-data.routes';
import systemRoutes from './system.routes';
import { requireAdmin } from '../middlewares/admin-auth.middleware';

const router = Router();

// Auth routes (no authentication required)
router.get('/login', authController.getLoginPage);
router.post('/login', authController.loginAdmin);
router.get('/logout', authController.logoutAdmin);

// Password change routes
router.get('/change-password', authController.getChangePasswordPage);
router.post('/change-password', authController.changePassword);

// MFA setup routes (require authentication)
router.get('/setup-mfa', requireAdmin, authController.getSetupMfaPage);
router.post('/setup-mfa', requireAdmin, authController.enableMfa);
router.post('/disable-mfa', requireAdmin, authController.disableMfa);

// Use other route modules
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