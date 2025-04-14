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