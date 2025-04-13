import { Router } from 'express';
import referenceDataController from '../controllers/reference-data.controller';
import { createHandler } from '../../types/express.types';

const router = Router();

// Gemstone family routes
router.get('/gemstone-families', createHandler(referenceDataController.getAllGemstoneFamilies));
router.get('/gemstone-families/:id', createHandler(referenceDataController.getGemstoneFamilyById));
router.post('/gemstone-families', createHandler(referenceDataController.createGemstoneFamily));
router.put('/gemstone-families/:id', createHandler(referenceDataController.updateGemstoneFamily));
router.delete('/gemstone-families/:id', createHandler(referenceDataController.deleteGemstoneFamily));

export default router;