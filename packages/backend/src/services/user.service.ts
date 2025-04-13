import { Pool } from 'pg';
import pool from '../config/database';
import userModel from '../db/models/user.model';
import { UserUpdateInput, CutterPortfolioItem } from '../types/user.types';
import bcrypt from 'bcrypt';

class UserService {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }
  
  /**
   * Get user profile with appropriate role-specific data
   */
  async getUserProfile(userId: number) {
    try {
      // Get basic user data
      const user = await userModel.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Prepare profile data (exclude sensitive fields)
      const profileData = {
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
      
      // Get role-specific profile data
      let roleProfile = null;
      
      if (user.role_name === 'cutter') {
        roleProfile = await userModel.getCutterProfile(userId);
        
        // Get cutter portfolio items if it's a cutter
        if (roleProfile) {
          const portfolioItems = await this.getCutterPortfolio(userId);
          roleProfile.portfolioItems = portfolioItems;
        }
      } else if (user.role_name === 'dealer') {
        roleProfile = await userModel.getDealerProfile(userId);
      } else if (user.role_name === 'appraiser') {
        roleProfile = await this.getAppraiserProfile(userId);
      }
      
      return {
        user: profileData,
        profile: roleProfile
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   */
  async updateUserProfile(userId: number, updateData: UserUpdateInput) {
    try {
      // Get current user data
      const user = await userModel.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Update user data
      const updatedUser = await userModel.update(userId, updateData);
      
      // Return updated profile
      return this.getUserProfile(userId);
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }
  
  /**
   * Change user password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      // Get user
      const user = await userModel.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Verify current password
      const isPasswordValid = await userModel.checkPassword(user, currentPassword);
      
      if (!isPasswordValid) {
        throw new Error('Invalid current password');
      }
      
      // Update password
      await userModel.update(userId, { password: newPassword });
      
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
  
  /**
   * Get cutter portfolio
   */
  async getCutterPortfolio(cutterId: number) {
    try {
      // Check if user is a cutter
      const user = await userModel.findById(cutterId);
      
      if (!user || user.role_name !== 'cutter') {
        throw new Error('Cutter not found');
      }
      
      // Get cutter profile
      const cutterProfile = await userModel.getCutterProfile(cutterId);
      
      if (!cutterProfile) {
        throw new Error('Cutter profile not found');
      }
      
      // Get portfolio items
      const query = `
        SELECT * FROM cutter_portfolio_items
        WHERE cutter_profile_id = $1
        ORDER BY created_at DESC
      `;
      
      const result = await this.pool.query(query, [cutterProfile.id]);
      
      return result.rows;
    } catch (error) {
      console.error('Get cutter portfolio error:', error);
      throw error;
    }
  }
  
  /**
   * Add portfolio item
   */
  async addPortfolioItem(userId: number, itemData: CutterPortfolioItem) {
    try {
      // Check if user is a cutter
      const user = await userModel.findById(userId);
      
      if (!user || user.role_name !== 'cutter') {
        throw new Error('Only cutters can add portfolio items');
      }
      
      // Get cutter profile
      const cutterProfile = await userModel.getCutterProfile(userId);
      
      if (!cutterProfile) {
        throw new Error('Cutter profile not found');
      }
      
      // Insert portfolio item
      const query = `
        INSERT INTO cutter_portfolio_items (
          cutter_profile_id,
          title,
          description,
          gemstone_type,
          cut_type,
          image_urls
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const values = [
        cutterProfile.id,
        itemData.title,
        itemData.description,
        itemData.gemstone_type,
        itemData.cut_type,
        itemData.image_urls
      ];
      
      const result = await this.pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      console.error('Add portfolio item error:', error);
      throw error;
    }
  }
  
  /**
   * Update portfolio item
   */
  async updatePortfolioItem(userId: number, itemId: number, itemData: Partial<CutterPortfolioItem>) {
    try {
      // Check if user is a cutter
      const user = await userModel.findById(userId);
      
      if (!user || user.role_name !== 'cutter') {
        throw new Error('Only cutters can update portfolio items');
      }
      
      // Get cutter profile
      const cutterProfile = await userModel.getCutterProfile(userId);
      
      if (!cutterProfile) {
        throw new Error('Cutter profile not found');
      }
      
      // Check if portfolio item belongs to this cutter
      const itemCheckQuery = `
        SELECT * FROM cutter_portfolio_items
        WHERE id = $1 AND cutter_profile_id = $2
      `;
      
      const itemCheckResult = await this.pool.query(itemCheckQuery, [itemId, cutterProfile.id]);
      
      if (itemCheckResult.rows.length === 0) {
        throw new Error('Portfolio item not found or does not belong to this cutter');
      }
      
      // Build update query dynamically
      let query = 'UPDATE cutter_portfolio_items SET ';
      const updateParts = [];
      const values = [];
      let valueIndex = 1;
      
      if (itemData.title !== undefined) {
        updateParts.push(`title = $${valueIndex++}`);
        values.push(itemData.title);
      }
      
      if (itemData.description !== undefined) {
        updateParts.push(`description = $${valueIndex++}`);
        values.push(itemData.description);
      }
      
      if (itemData.gemstone_type !== undefined) {
        updateParts.push(`gemstone_type = $${valueIndex++}`);
        values.push(itemData.gemstone_type);
      }
      
      if (itemData.cut_type !== undefined) {
        updateParts.push(`cut_type = $${valueIndex++}`);
        values.push(itemData.cut_type);
      }
      
      if (itemData.image_urls !== undefined) {
        updateParts.push(`image_urls = $${valueIndex++}`);
        values.push(itemData.image_urls);
      }
      
      // Add updated_at timestamp
      updateParts.push(`updated_at = CURRENT_TIMESTAMP`);
      
      if (updateParts.length === 0) {
        return itemCheckResult.rows[0];
      }
      
      query += updateParts.join(', ');
      query += ` WHERE id = $${valueIndex++} AND cutter_profile_id = $${valueIndex++} RETURNING *`;
      values.push(itemId);
      values.push(cutterProfile.id);
      
      const result = await this.pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      console.error('Update portfolio item error:', error);
      throw error;
    }
  }
  
  /**
   * Delete portfolio item
   */
  async deletePortfolioItem(userId: number, itemId: number) {
    try {
      // Check if user is a cutter
      const user = await userModel.findById(userId);
      
      if (!user || user.role_name !== 'cutter') {
        throw new Error('Only cutters can delete portfolio items');
      }
      
      // Get cutter profile
      const cutterProfile = await userModel.getCutterProfile(userId);
      
      if (!cutterProfile) {
        throw new Error('Cutter profile not found');
      }
      
      // Delete portfolio item if it belongs to this cutter
      const query = `
        DELETE FROM cutter_portfolio_items
        WHERE id = $1 AND cutter_profile_id = $2
        RETURNING id
      `;
      
      const result = await this.pool.query(query, [itemId, cutterProfile.id]);
      
      if (result.rows.length === 0) {
        throw new Error('Portfolio item not found or does not belong to this cutter');
      }
      
      return true;
    } catch (error) {
      console.error('Delete portfolio item error:', error);
      throw error;
    }
  }
  
  /**
   * Get all cutters with their profiles
   */
  async getAllCutters() {
    try {
      const cutters = await userModel.getAllCutters();
      
      return cutters.map(cutter => ({
        id: cutter.id,
        username: cutter.username,
        firstName: cutter.first_name,
        lastName: cutter.last_name,
        profileImage: cutter.profile_image_url,
        specialty: cutter.specialty,
        experienceYears: cutter.experience_years,
        expertise: cutter.expertise_level,
        workshopLocation: cutter.workshop_location,
        availableForCustomWork: cutter.available_for_custom_work,
        portfolioVerified: cutter.portfolio_verified
      }));
    } catch (error) {
      console.error('Get all cutters error:', error);
      throw error;
    }
  }
  
  /**
   * Get cutter details with portfolio
   */
  async getCutterDetails(cutterId: number) {
    try {
      // Get cutter user data
      const user = await userModel.findById(cutterId);
      
      if (!user || user.role_name !== 'cutter') {
        return null;
      }
      
      // Get cutter profile
      const cutterProfile = await userModel.getCutterProfile(cutterId);
      
      if (!cutterProfile) {
        return null;
      }
      
      // Get portfolio items
      const portfolio = await this.getCutterPortfolio(cutterId);
      
      // Get cutter skills
      const skillsQuery = `
        SELECT cs.skill_id, cs.proficiency_level, csk.name, csk.description
        FROM cutter_skills cs
        JOIN cutting_skills csk ON cs.skill_id = csk.id
        WHERE cs.cutter_profile_id = $1
      `;
      
      const skillsResult = await this.pool.query(skillsQuery, [cutterProfile.id]);
      
      return {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        profileImage: user.profile_image_url,
        profile: {
          specialty: cutterProfile.specialty,
          experienceYears: cutterProfile.experience_years,
          certifications: cutterProfile.certification,
          bio: cutterProfile.bio,
          workshopLocation: cutterProfile.workshop_location,
          expertiseLevel: cutterProfile.expertise_level,
          availableForCustomWork: cutterProfile.available_for_custom_work,
          portfolioVerified: cutterProfile.portfolio_verified,
          toolsUsed: cutterProfile.tools_used
        },
        skills: skillsResult.rows,
        portfolio: portfolio
      };
    } catch (error) {
      console.error('Get cutter details error:', error);
      throw error;
    }
  }
  
  /**
   * Get appraiser profile
   */
  async getAppraiserProfile(userId: number) {
    try {
      const query = `
        SELECT * FROM appraiser_profiles WHERE user_id = $1
      `;
      const result = await this.pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Get appraiser profile error:', error);
      throw error;
    }
  }
}

export default new UserService();