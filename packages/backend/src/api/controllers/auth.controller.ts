import { Request, Response } from 'express';
import authService from '../../services/auth.service';
import { LoginCredentials, RegisterInput, ForgotPasswordInput, PasswordResetInput, EmailVerificationInput } from '../../types/user.types';

class AuthController {
  /**
   * Login a user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;
      
      const result = await authService.login(credentials);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('Login controller error:', error);
      
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Authentication failed'
      });
    }
  }
  
  /**
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      const userData: RegisterInput = req.body;
      
      const result = await authService.register(userData);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result
      });
    } catch (error) {
      console.error('Registration controller error:', error);
      
      // Determine appropriate status code
      const statusCode = 
        error instanceof Error && 
        (error.message.includes('already in use') || error.message.includes('already exists')) 
          ? 409 // Conflict
          : 400; // Bad Request
      
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }
  
  /**
   * Verify email with token
   */
  async verifyEmail(req: Request, res: Response) {
    try {
      const verificationData: EmailVerificationInput = req.body;
      
      const result = await authService.verifyEmail(verificationData);
      
      res.status(200).json({
        success: true,
        message: 'Email verification successful',
        data: result
      });
    } catch (error) {
      console.error('Email verification controller error:', error);
      
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Email verification failed'
      });
    }
  }
  
  /**
   * Request password reset
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const forgotPasswordData: ForgotPasswordInput = req.body;
      
      const result = await authService.forgotPassword(forgotPasswordData);
      
      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
        data: result
      });
    } catch (error) {
      console.error('Forgot password controller error:', error);
      
      res.status(400).json({
        success: false,
        message: 'Failed to process password reset request'
      });
    }
  }
  
  /**
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const resetPasswordData: PasswordResetInput = req.body;
      
      const result = await authService.resetPassword(resetPasswordData);
      
      res.status(200).json({
        success: true,
        message: 'Password reset successful',
        data: result
      });
    } catch (error) {
      console.error('Reset password controller error:', error);
      
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed'
      });
    }
  }
}

export default new AuthController();