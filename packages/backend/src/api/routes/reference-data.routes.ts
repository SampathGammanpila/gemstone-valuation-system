import { Router } from 'express';
import { ReferenceDataController } from '../controllers/reference-data.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { RequestHandler } from 'express';

const router = Router();
const referenceDataController = new ReferenceDataController();

// Type assertion helper to make TypeScript happy
const asHandler = (fn: any): RequestHandler => fn as RequestHandler;

// ================ GEMSTONE FAMILIES ================
router.get('/gemstone-families', asHandler(referenceDataController.getAllGemstoneFamilies));
router.get('/gemstone-families/categories', asHandler(referenceDataController.getGemstoneFamilyCategories));
router.get('/gemstone-families/:id', asHandler(referenceDataController.getGemstoneFamilyById));

// These routes require authentication
router.post('/gemstone-families', authenticate, asHandler(referenceDataController.createGemstoneFamily));
router.put('/gemstone-families/:id', authenticate, asHandler(referenceDataController.updateGemstoneFamily));
router.delete('/gemstone-families/:id', authenticate, asHandler(referenceDataController.deleteGemstoneFamily));

// ================ CUT SHAPES ================
router.get('/cut-shapes', asHandler(referenceDataController.getAllCutShapes));
router.get('/cut-shapes/categories', asHandler(referenceDataController.getCutShapeCategories));
router.get('/cut-shapes/:id', asHandler(referenceDataController.getCutShapeById));

// ================ COLORS ================
router.get('/colors', asHandler(referenceDataController.getAllColors));
router.get('/colors/categories', asHandler(referenceDataController.getColorCategories));
router.get('/colors/:id', asHandler(referenceDataController.getColorById));

// ================ COLOR GRADES ================
router.get('/color-grades', asHandler(referenceDataController.getAllColorGrades));
router.get('/color-grades/:id', asHandler(referenceDataController.getColorGradeById));

// ================ CUT GRADES ================
router.get('/cut-grades', asHandler(referenceDataController.getAllCutGrades));
router.get('/cut-grades/:id', asHandler(referenceDataController.getCutGradeById));

// ================ CLARITIES ================
router.get('/clarities', asHandler(referenceDataController.getAllClarities));
router.get('/clarities/:id', asHandler(referenceDataController.getClarityById));

// ================ TREATMENTS ================
router.get('/treatments', asHandler(referenceDataController.getAllTreatments));
router.get('/treatments/:id', asHandler(referenceDataController.getTreatmentById));

// ================ MINING LOCATIONS ================
router.get('/mining-locations', asHandler(referenceDataController.getAllMiningLocations));
router.get('/mining-locations/countries', asHandler(referenceDataController.getMiningLocationCountries));
router.get('/mining-locations/:id', asHandler(referenceDataController.getMiningLocationById));

// ================ MINING METHODS ================
router.get('/mining-methods', asHandler(referenceDataController.getAllMiningMethods));
router.get('/mining-methods/:id', asHandler(referenceDataController.getMiningMethodById));

export default router;