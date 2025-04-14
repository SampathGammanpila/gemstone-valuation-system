// packages/backend/src/admin/routes/index.ts
import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/admin-auth.middleware';

// Route imports - make sure these files exist
import dashboardRoutes from './dashboard.routes';
import gemstoneRoutes from './gemstone.routes';
import userRoutes from './user.routes';
import referenceDataRoutes from './reference-data.routes';
import systemRoutes from './system.routes';

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