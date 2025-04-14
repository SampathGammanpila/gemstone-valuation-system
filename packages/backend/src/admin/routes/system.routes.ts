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