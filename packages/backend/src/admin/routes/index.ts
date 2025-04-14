// packages/backend/src/admin/routes/index.ts
import { Router } from 'express';
import dashboardRoutes from './dashboard.routes';
import gemstoneRoutes from './gemstone.routes';
import userRoutes from './user.routes';
import referenceDataRoutes from './reference-data.routes';
import systemRoutes from './system.routes';
import { authenticate, requireAdmin } from '../middlewares/admin-auth.middleware';

const router = Router();

// Admin authentication routes (accessible without auth)
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Admin Login', error: req.flash('error') });
});

router.post('/login', (req, res) => {
  // Login logic (to be implemented)
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Protected admin routes
router.use(authenticate);
router.use(requireAdmin);

// Mount admin routes
router.use('/dashboard', dashboardRoutes);
router.use('/gemstones', gemstoneRoutes);
router.use('/users', userRoutes);
router.use('/reference-data', referenceDataRoutes);
router.use('/system', systemRoutes);

// Root admin route
router.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

export default router;

// packages/backend/src/admin/routes/dashboard.routes.ts
import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';

const router = Router();

// Dashboard routes
router.get('/', dashboardController.getAdminDashboard);

export default router;

// packages/backend/src/admin/routes/gemstone.routes.ts
import { Router } from 'express';
import gemstoneController from '../controllers/gemstone.controller';

const router = Router();

// Gemstone management routes
router.get('/', gemstoneController.getAllGemstones);
router.get('/approval', gemstoneController.getApprovalQueue);
router.get('/:id', gemstoneController.getGemstoneDetails);
router.post('/:id/approve', gemstoneController.approveGemstone);
router.post('/:id/reject', gemstoneController.rejectGemstone);
router.post('/:id/feature', gemstoneController.featureGemstone);
router.delete('/:id', gemstoneController.deleteGemstone);

export default router;

// packages/backend/src/admin/routes/user.routes.ts
import { Router } from 'express';
import userController from '../controllers/user.controller';

const router = Router();

// User management routes
router.get('/', userController.getAllUsers);
router.get('/create', userController.getCreateUserForm);
router.post('/create', userController.createUser);
router.get('/:id', userController.getUserDetails);
router.get('/:id/edit', userController.getEditUserForm);
router.post('/:id/edit', userController.updateUser);
router.post('/:id/verify', userController.verifyUser);
router.delete('/:id', userController.deleteUser);

export default router;

// packages/backend/src/admin/routes/reference-data.routes.ts
import { Router } from 'express';
import referenceDataController from '../controllers/reference-data.controller';

const router = Router();

// Reference data routes
router.get('/gemstone-families', referenceDataController.getGemstoneFamilies);
router.get('/gemstone-families/create', referenceDataController.getCreateFamilyForm);
router.post('/gemstone-families/create', referenceDataController.createGemstoneFamily);
router.get('/gemstone-families/:id/edit', referenceDataController.getEditFamilyForm);
router.post('/gemstone-families/:id/edit', referenceDataController.updateGemstoneFamily);
router.delete('/gemstone-families/:id', referenceDataController.deleteGemstoneFamily);

router.get('/cut-shapes', referenceDataController.getCutShapes);
router.get('/colors', referenceDataController.getColors);
router.get('/quality-standards', referenceDataController.getQualityStandards);
router.get('/mining-locations', referenceDataController.getMiningLocations);

export default router;

// packages/backend/src/admin/routes/system.routes.ts
import { Router } from 'express';
import systemController from '../controllers/system.controller';

const router = Router();

// System management routes
router.get('/settings', systemController.getSystemSettings);
router.post('/settings', systemController.updateSystemSettings);
router.get('/audit-log', systemController.getAuditLog);
router.get('/backup', systemController.getBackupOptions);
router.post('/backup/create', systemController.createBackup);
router.post('/backup/restore', systemController.restoreBackup);

export default router;