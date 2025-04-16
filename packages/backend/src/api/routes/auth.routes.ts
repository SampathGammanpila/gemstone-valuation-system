import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { createHandler } from '../../types/express.types';
import { validateLogin, validateRegister, validateForgotPassword, validateResetPassword, validateVerifyEmail } from '../validators/auth.validator';
import { validateCsrfToken } from '../middlewares/csrf.middleware';

const router = Router();

// CSRF token endpoint - no CSRF validation needed for this
router.get('/csrf-token', createHandler(authController.getCsrfToken));

// Protected auth routes with CSRF validation
router.post('/login', validateCsrfToken, validateLogin, createHandler(authController.login));
router.post('/register', validateCsrfToken, validateRegister, createHandler(authController.register));
router.post('/verify-email', validateCsrfToken, validateVerifyEmail, createHandler(authController.verifyEmail));
router.post('/forgot-password', validateCsrfToken, validateForgotPassword, createHandler(authController.forgotPassword));
router.post('/reset-password', validateCsrfToken, validateResetPassword, createHandler(authController.resetPassword));

export default router;