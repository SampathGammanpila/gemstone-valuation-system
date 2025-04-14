// packages/backend/src/admin/routes/dashboard.routes.ts
import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller';

const router = Router();

// Dashboard routes
router.get('/', dashboardController.getAdminDashboard);

export default router;