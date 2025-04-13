import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { createHandler } from '../../types/express.types';
import { validateLogin, validateRegister, validateForgotPassword, validateResetPassword, validateVerifyEmail } from '../validators/auth.validator';

const router = Router();

// Auth routes
router.post('/login', validateLogin, createHandler(authController.login));
router.post('/register', validateRegister, createHandler(authController.register));
router.post('/verify-email', validateVerifyEmail, createHandler(authController.verifyEmail));
router.post('/forgot-password', validateForgotPassword, createHandler(authController.forgotPassword));
router.post('/reset-password', validateResetPassword, createHandler(authController.resetPassword));

export default router;