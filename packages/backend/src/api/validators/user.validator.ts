import { Request, Response, NextFunction } from 'express';

/**
 * Validate change password request
 */
export const validateChangePassword = (req: Request, res: Response, next: NextFunction): void => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
    return;
  }
  
  // Validate password strength (min 8 chars, at least one uppercase, one lowercase, one number)
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    res.status(400).json({
      success: false,
      message: 'New password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number'
    });
    return;
  }
  
  next();
};

/**
 * Validate profile update request
 */
export const validateUpdateProfile = (req: Request, res: Response, next: NextFunction): void => {
  const { email, username } = req.body;
  
  // If email is being updated, validate format
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
      return;
    }
  }
  
  // If username is being updated, validate format
  if (username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      res.status(400).json({
        success: false,
        message: 'Username must be 3-30 characters and may contain only letters, numbers, and underscores'
      });
      return;
    }
  }
  
  // Validate cutter profile updates
  if (req.body.cutterProfile) {
    const { experienceYears, expertiseLevel } = req.body.cutterProfile;
    
    // Validate experience years if provided
    if (experienceYears !== undefined && (isNaN(experienceYears) || experienceYears < 0)) {
      res.status(400).json({
        success: false,
        message: 'Experience years must be a non-negative number'
      });
      return;
    }
    
    // Validate expertise level if provided
    if (expertiseLevel && !['Beginner', 'Intermediate', 'Expert', 'Master'].includes(expertiseLevel)) {
      res.status(400).json({
        success: false,
        message: 'Expertise level must be one of: Beginner, Intermediate, Expert, Master'
      });
      return;
    }
  }
  
  // Validate dealer profile updates
  if (req.body.dealerProfile) {
    const { yearsInBusiness } = req.body.dealerProfile;
    
    // Validate years in business if provided
    if (yearsInBusiness !== undefined && (isNaN(yearsInBusiness) || yearsInBusiness < 0)) {
      res.status(400).json({
        success: false,
        message: 'Years in business must be a non-negative number'
      });
      return;
    }
  }
  
  next();
};

/**
 * Validate portfolio item
 */
export const validatePortfolioItem = (req: Request, res: Response, next: NextFunction): void => {
  const { title, gemstone_type, cut_type, image_urls } = req.body;
  
  // For portfolio item creation
  if (req.method === 'POST') {
    if (!title || !gemstone_type || !cut_type) {
      res.status(400).json({
        success: false,
        message: 'Title, gemstone type, and cut type are required'
      });
      return;
    }
    
    if (!image_urls || !Array.isArray(image_urls) || image_urls.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one image URL is required'
      });
      return;
    }
  }
  
  // For updates, at least one field should be present
  if (req.method === 'PUT' && Object.keys(req.body).length === 0) {
    res.status(400).json({
      success: false,
      message: 'No fields to update'
    });
    return;
  }
  
  next();
};