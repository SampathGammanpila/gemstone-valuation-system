import jwt, { Secret } from 'jsonwebtoken';
import crypto from 'crypto';
import userModel from '../db/models/user.model';
import { LoginCredentials, RegisterInput, PasswordResetInput, ForgotPasswordInput, EmailVerificationInput } from '../types/user.types';
import environment from '../config/environment';

class AuthService {
  /**
   * Login a user and generate a JWT token
   */
  async login(credentials: LoginCredentials) {
    try {
      // Find user by email
      const user = await userModel.findByEmail(credentials.email);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Check password
      const isPasswordValid = await userModel.checkPassword(user, credentials.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }
      
      // Check if email is verified
      // if (!user.is_verified) {
      //   throw new Error('Please verify your email before logging in');
      // }
      
      // Update last login
      await userModel.updateLastLogin(user.id);
      
      // Generate JWT token
      const token = this.generateToken(user.id, user.role_name || 'user');
      
      // Prepare user data to return (without sensitive info)
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image_url,
        role: user.role_name || 'user',
        isVerified: user.is_verified,
        createdAt: user.created_at,
        lastLogin: user.last_login
      };
      
      // Get appropriate profile data based on role
      let profileData = null;
      
      if (user.role_name === 'cutter') {
        profileData = await userModel.getCutterProfile(user.id);
      } else if (user.role_name === 'dealer') {
        profileData = await userModel.getDealerProfile(user.id);
      }
      
      return {
        token,
        user: userData,
        profile: profileData
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  /**
   * Register a new user
   */
  async register(userData: RegisterInput) {
    try {
      // Check if email already exists
      const existingEmail = await userModel.findByEmail(userData.email);
      if (existingEmail) {
        throw new Error('Email already in use');
      }
      
      // Check if username already exists
      const existingUsername = await userModel.findByUsername(userData.username);
      if (existingUsername) {
        throw new Error('Username already in use');
      }
      
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      // Create user
      const createdUser = await userModel.create({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'collector',
        isVerified: false,
        verificationToken,
        cutterProfile: userData.role === 'cutter' ? userData.cutterProfile : undefined,
        dealerProfile: userData.role === 'dealer' ? userData.dealerProfile : undefined,
        appraiserProfile: userData.role === 'appraiser' ? userData.appraiserProfile : undefined
      });
      
      // TODO: Send verification email
      // This would typically be done via an email service
      
      return {
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        userId: createdUser.id,
        verificationToken // In production, this should NOT be returned to the client
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  /**
   * Verify user email with token
   */
  async verifyEmail(data: EmailVerificationInput) {
    try {
      // Find user by verification token
      const users = await userModel.findByVerificationToken(data.token);
      
      if (!users || users.length === 0) {
        throw new Error('Invalid verification token');
      }
      
      const user = users[0];
      
      // Update user to verified
      await userModel.update(user.id, {
        isVerified: true,
        verificationToken: null
      });
      
      return {
        success: true,
        message: 'Email verified successfully',
        userId: user.id
      };
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }
  
  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordInput) {
    try {
      // Find user by email
      const user = await userModel.findByEmail(data.email);
      
      if (!user) {
        // For security reasons, still return success even if email doesn't exist
        return {
          success: true,
          message: 'If the email exists, a password reset link has been sent.'
        };
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set token expiration to 1 hour from now
      const resetTokenExpires = new Date();
      resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);
      
      // Update user with reset token
      await userModel.update(user.id, {
        resetToken,
        resetTokenExpires
      });
      
      // TODO: Send password reset email
      // This would typically be done via an email service
      
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
        resetToken // In production, this should NOT be returned to the client
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }
  
  /**
   * Reset password with token
   */
  async resetPassword(data: PasswordResetInput) {
    try {
      // Find user by reset token
      const user = await userModel.findByResetToken(data.token);
      
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }
      
      // Check if token is expired
      if (user.reset_token_expires && new Date() > user.reset_token_expires) {
        throw new Error('Reset token has expired');
      }
      
      // Update user with new password
      await userModel.update(user.id, {
        password: data.password,
        resetToken: null,
        resetTokenExpires: null
      });
      
      return {
        success: true,
        message: 'Password has been reset successfully'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
  
  /**
   * Generate JWT token
   */
  generateToken(userId: number, role: string): string {
    // Using type assertion and any to bypass type checking
    const secret: any = environment.jwtSecret;
    const options: any = { expiresIn: environment.jwtExpiresIn };
    
    return jwt.sign({ userId, role }, secret, options);
  }
  
  
  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: number; role: string } {
    try {
      // Using type assertion and any to bypass type checking
      const secret: any = environment.jwtSecret;
      const decoded = jwt.verify(token, secret) as { userId: number; role: string };
      return decoded;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Add methods for finding users by verification and reset tokens
   */
  async findByVerificationToken(token: string) {
    try {
      return userModel.findByVerificationToken(token);
    } catch (error) {
      console.error('Find by verification token error:', error);
      throw error;
    }
  }

  async findByResetToken(token: string) {
    try {
      return userModel.findByResetToken(token);
    } catch (error) {
      console.error('Find by reset token error:', error);
      throw error;
    }
  }
}

export default new AuthService();