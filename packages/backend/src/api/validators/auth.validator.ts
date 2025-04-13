import { Request, Response, NextFunction } from 'express';

/**
 * Validate login request
 */
export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
    return;
  }
  
  next();
};

/**
 * Validate registration request
 */
export const validateRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { username, email, password, role, cutterProfile, dealerProfile, appraiserProfile } = req.body;
  
  // Check required fields
  if (!username || !email || !password) {
    res.status(400).json({
      success: false,
      message: 'Username, email, and password are required'
    });
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
    return;
  }
  
  // Validate username format (alphanumeric plus underscores, 3-30 chars)
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  if (!usernameRegex.test(username)) {
    res.status(400).json({
      success: false,
      message: 'Username must be 3-30 characters and may contain only letters, numbers, and underscores'
    });
    return;
  }
  
  // Validate password strength (min 8 chars, at least one uppercase, one lowercase, one number)
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number'
    });
    return;
  }
  
  // Validate role if provided
  if (role && !['collector', 'dealer', 'cutter', 'appraiser'].includes(role)) {
    res.status(400).json({
      success: false,
      message: 'Invalid role. Must be one of: collector, dealer, cutter, appraiser'
    });
    return;
  }
  
  // Validate cutter profile if role is cutter
  if (role === 'cutter' && !cutterProfile) {
    res.status(400).json({
      success: false,
      message: 'Cutter profile is required for cutter role'
    });
    return;
  }
  
  // Validate dealer profile if role is dealer
  if (role === 'dealer' && !dealerProfile) {
    res.status(400).json({
      success: false,
      message: 'Dealer profile is required for dealer role'
    });
    return;
  }
  
  // Validate appraiser profile if role is appraiser
  if (role === 'appraiser' && !appraiserProfile) {
    res.status(400).json({
      success: false,
      message: 'Appraiser profile is required for appraiser role'
    });
    return;
  }
  
  next();
};

/**
 * Validate email verification request
 */
export const validateVerifyEmail = (req: Request, res: Response, next: NextFunction): void => {
  const { token } = req.body;
  
  if (!token) {
    res.status(400).json({
      success: false,
      message: 'Verification token is required'
    });
    return;
  }
  
  next();
};

/**
 * Validate forgot password request
 */
export const validateForgotPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400).json({
      success: false,
      message: 'Email is required'
    });
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
    return;
  }
  
  next();
};

/**
 * Validate password reset request
 */
export const validateResetPassword = (req: Request, res: Response, next: NextFunction): void => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    res.status(400).json({
      success: false,
      message: 'Token and password are required'
    });
    return;
  }
  
  // Validate password strength (min 8 chars, at least one uppercase, one lowercase, one number)
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number'
    });
    return;
  }
  
  next();
};