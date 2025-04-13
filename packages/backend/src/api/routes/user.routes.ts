import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate, requireCutter } from '../middlewares/auth.middleware';
import { createHandler } from '../../types/express.types';
import { validateChangePassword, validateUpdateProfile, validatePortfolioItem } from '../validators/user.validator';

const router = Router();

// Protected routes (require authentication)
router.use(authenticate);

// Profile routes
router.get('/profile', createHandler(userController.getProfile));
router.put('/profile', validateUpdateProfile, createHandler(userController.updateProfile));
router.post('/change-password', validateChangePassword, createHandler(userController.changePassword));

// Cutter portfolio routes (cutter role required)
router.post('/portfolio', requireCutter, validatePortfolioItem, createHandler(userController.addPortfolioItem));
router.put('/portfolio/:itemId', requireCutter, validatePortfolioItem, createHandler(userController.updatePortfolioItem));
router.delete('/portfolio/:itemId', requireCutter, createHandler(userController.deletePortfolioItem));

// Public routes (no authentication required)
router.get('/cutters', createHandler(userController.getAllCutters));
router.get('/cutters/:cutterId', createHandler(userController.getCutterDetails));
router.get('/cutters/:cutterId/portfolio', createHandler(userController.getCutterPortfolio));

export default router;