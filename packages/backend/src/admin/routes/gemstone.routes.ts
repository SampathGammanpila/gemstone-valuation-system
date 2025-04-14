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