// packages/backend/src/api/routes/reference-data.routes.ts
import { Router } from 'express';
import referenceDataController from '../controllers/reference-data.controller';
import { RequestHandler } from 'express';

const router = Router();

// Type assertion to make TypeScript happy
const asHandler = (fn: any): RequestHandler => fn as RequestHandler;

// Gemstone family routes
router.get('/gemstone-families', asHandler(referenceDataController.getAllGemstoneFamilies));
router.get('/gemstone-families/:id', asHandler(referenceDataController.getGemstoneFamilyById));
router.post('/gemstone-families', asHandler(referenceDataController.createGemstoneFamily));
router.put('/gemstone-families/:id', asHandler(referenceDataController.updateGemstoneFamily));
router.delete('/gemstone-families/:id', asHandler(referenceDataController.deleteGemstoneFamily));

export default router;