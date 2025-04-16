// packages/backend/src/api/routes/valuation.routes.ts

import { Router } from 'express';
import valuationController from '../controllers/valuation.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateIdParam } from '../middlewares/validation.middleware';

const router = Router();

// Get reference data for valuation form (no authentication required)
router.get('/reference-data', valuationController.getReferenceData);

// The rest of the routes require authentication
router.use(authenticate);

// Calculate estimated value for a gemstone
router.post('/calculate', valuationController.calculateValue);

// Get comparison data for similar gemstones
router.get('/comparison', valuationController.getComparisonData);

// Get market trends for a gemstone type
router.get('/market-trends/:gemstone_family_id', validateIdParam('gemstone_family_id'), valuationController.getMarketTrends);

// Get price factors that influence gemstone value
router.get('/price-factors/:gemstone_family_id', validateIdParam('gemstone_family_id'), valuationController.getPriceFactors);

export default router;