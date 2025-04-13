import { Pool } from 'pg';
import pool from '../../config/database';
import bcrypt from 'bcrypt';
import { UserCreateInput, UserUpdateInput, User, UserWithProfile } from '../../types/user.types';

export class UserModel {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  /**
   * Find a user by ID
   */
  async findById(id: number): Promise<User | null> {
    try {
      const query = `
        SELECT u.*, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
      `;
      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT u.*, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1
      `;
      const result = await this.pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find a user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      const query = `
        SELECT u.*, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.username = $1
      `;
      const result = await this.pool.query(query, [username]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async create(userData: UserCreateInput): Promise<User> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Get role ID based on role name
      let roleId = null;
      if (userData.role) {
        const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', [userData.role]);
        if (roleResult.rows.length > 0) {
          roleId = roleResult.rows[0].id;
        }
      } else {
        // Default to 'user' role if not specified
        const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', ['user']);
        roleId = roleResult.rows[0].id;
      }
      
      // Insert the user
      const query = `
        INSERT INTO users (
          username, 
          email, 
          password_hash, 
          first_name, 
          last_name, 
          profile_image_url, 
          role_id, 
          is_verified,
          verification_token
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *
      `;
      
      const values = [
        userData.username,
        userData.email,
        hashedPassword,
        userData.firstName || null,
        userData.lastName || null,
        userData.profileImageUrl || null,
        roleId,
        userData.isVerified || false,
        userData.verificationToken || null
      ];
      
      const result = await client.query(query, values);
      const user = result.rows[0];
      
      // If role is cutter, create a cutter profile
      if (userData.role === 'cutter' && userData.cutterProfile) {
        const cutterProfileQuery = `
          INSERT INTO cutter_profiles (
            user_id, 
            specialty, 
            experience_years, 
            certification, 
            bio, 
            workshop_location, 
            expertise_level,
            available_for_custom_work
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
          RETURNING *
        `;
        
        const cutterValues = [
          user.id,
          userData.cutterProfile.specialty || null,
          userData.cutterProfile.experienceYears || null,
          userData.cutterProfile.certification || null,
          userData.cutterProfile.bio || null,
          userData.cutterProfile.workshopLocation || null,
          userData.cutterProfile.expertiseLevel || 'Beginner',
          userData.cutterProfile.availableForCustomWork !== undefined 
            ? userData.cutterProfile.availableForCustomWork 
            : true
        ];
        
        await client.query(cutterProfileQuery, cutterValues);
      }
      
      // If role is dealer, create a dealer profile
      if (userData.role === 'dealer' && userData.dealerProfile) {
        const dealerProfileQuery = `
          INSERT INTO dealer_profiles (
            user_id, 
            company_name, 
            business_license, 
            specialty_types, 
            years_in_business
          ) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING *
        `;
        
        const dealerValues = [
          user.id,
          userData.dealerProfile.companyName || null,
          userData.dealerProfile.businessLicense || null,
          userData.dealerProfile.specialtyTypes || null,
          userData.dealerProfile.yearsInBusiness || null
        ];
        
        await client.query(dealerProfileQuery, dealerValues);
      }
      
      // Get role name for the created user
      const roleQuery = 'SELECT name FROM roles WHERE id = $1';
      const roleResult = await client.query(roleQuery, [user.role_id]);
      user.role_name = roleResult.rows[0].name;
      
      await client.query('COMMIT');
      return user;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update a user
   */
  async update(id: number, userData: UserUpdateInput): Promise<User | null> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Build the query dynamically based on what's being updated
      let query = 'UPDATE users SET ';
      const values: any[] = [];
      const updateFields: string[] = [];
      let valueIndex = 1;
      
      if (userData.username) {
        updateFields.push(`username = $${valueIndex++}`);
        values.push(userData.username);
      }
      
      if (userData.email) {
        updateFields.push(`email = $${valueIndex++}`);
        values.push(userData.email);
      }
      
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        updateFields.push(`password_hash = $${valueIndex++}`);
        values.push(hashedPassword);
      }
      
      if (userData.firstName !== undefined) {
        updateFields.push(`first_name = $${valueIndex++}`);
        values.push(userData.firstName);
      }
      
      if (userData.lastName !== undefined) {
        updateFields.push(`last_name = $${valueIndex++}`);
        values.push(userData.lastName);
      }
      
      if (userData.profileImageUrl !== undefined) {
        updateFields.push(`profile_image_url = $${valueIndex++}`);
        values.push(userData.profileImageUrl);
      }
      
      if (userData.role) {
        const roleResult = await client.query('SELECT id FROM roles WHERE name = $1', [userData.role]);
        if (roleResult.rows.length > 0) {
          updateFields.push(`role_id = $${valueIndex++}`);
          values.push(roleResult.rows[0].id);
        }
      }
      
      if (userData.isVerified !== undefined) {
        updateFields.push(`is_verified = $${valueIndex++}`);
        values.push(userData.isVerified);
      }
      
      if (userData.verificationToken !== undefined) {
        updateFields.push(`verification_token = $${valueIndex++}`);
        values.push(userData.verificationToken);
      }
      
      if (userData.resetToken !== undefined) {
        updateFields.push(`reset_token = $${valueIndex++}`);
        values.push(userData.resetToken);
      }
      
      if (userData.resetTokenExpires !== undefined) {
        updateFields.push(`reset_token_expires = $${valueIndex++}`);
        values.push(userData.resetTokenExpires);
      }
      
      // Always update the updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      if (updateFields.length === 0) {
        // Nothing to update
        return this.findById(id);
      }
      
      query += updateFields.join(', ');
      query += ` WHERE id = $${valueIndex++} RETURNING *`;
      values.push(id);
      
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }
      
      const user = result.rows[0];
      
      // Update cutter profile if role is cutter
      if (userData.role === 'cutter' && userData.cutterProfile) {
        // Check if cutter profile exists
        const cutterProfileCheck = await client.query(
          'SELECT id FROM cutter_profiles WHERE user_id = $1',
          [id]
        );
        
        if (cutterProfileCheck.rows.length > 0) {
          // Update existing profile
          const cutterProfileId = cutterProfileCheck.rows[0].id;
          let cutterQuery = 'UPDATE cutter_profiles SET ';
          const cutterUpdateFields: string[] = [];
          const cutterValues: any[] = [];
          let cutterValueIndex = 1;
          
          if (userData.cutterProfile.specialty !== undefined) {
            cutterUpdateFields.push(`specialty = $${cutterValueIndex++}`);
            cutterValues.push(userData.cutterProfile.specialty);
          }
          
          if (userData.cutterProfile.experienceYears !== undefined) {
            cutterUpdateFields.push(`experience_years = $${cutterValueIndex++}`);
            cutterValues.push(userData.cutterProfile.experienceYears);
          }
          
          if (userData.cutterProfile.certification !== undefined) {
            cutterUpdateFields.push(`certification = $${cutterValueIndex++}`);
            cutterValues.push(userData.cutterProfile.certification);
          }
          
          if (userData.cutterProfile.bio !== undefined) {
            cutterUpdateFields.push(`bio = $${cutterValueIndex++}`);
            cutterValues.push(userData.cutterProfile.bio);
          }
          
          if (userData.cutterProfile.workshopLocation !== undefined) {
            cutterUpdateFields.push(`workshop_location = $${cutterValueIndex++}`);
            cutterValues.push(userData.cutterProfile.workshopLocation);
          }
          
          if (userData.cutterProfile.expertiseLevel !== undefined) {
            cutterUpdateFields.push(`expertise_level = $${cutterValueIndex++}`);
            cutterValues.push(userData.cutterProfile.expertiseLevel);
          }
          
          if (userData.cutterProfile.availableForCustomWork !== undefined) {
            cutterUpdateFields.push(`available_for_custom_work = $${cutterValueIndex++}`);
            cutterValues.push(userData.cutterProfile.availableForCustomWork);
          }
          
          // Always update the updated_at timestamp
          cutterUpdateFields.push(`updated_at = CURRENT_TIMESTAMP`);
          
          if (cutterUpdateFields.length > 0) {
            cutterQuery += cutterUpdateFields.join(', ');
            cutterQuery += ` WHERE id = $${cutterValueIndex++}`;
            cutterValues.push(cutterProfileId);
            
            await client.query(cutterQuery, cutterValues);
          }
        } else {
          // Create new profile
          const cutterProfileQuery = `
            INSERT INTO cutter_profiles (
              user_id, 
              specialty, 
              experience_years, 
              certification, 
              bio, 
              workshop_location, 
              expertise_level,
              available_for_custom_work
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `;
          
          const cutterValues = [
            id,
            userData.cutterProfile.specialty || null,
            userData.cutterProfile.experienceYears || null,
            userData.cutterProfile.certification || null,
            userData.cutterProfile.bio || null,
            userData.cutterProfile.workshopLocation || null,
            userData.cutterProfile.expertiseLevel || 'Beginner',
            userData.cutterProfile.availableForCustomWork !== undefined 
              ? userData.cutterProfile.availableForCustomWork 
              : true
          ];
          
          await client.query(cutterProfileQuery, cutterValues);
        }
      }
      
      // Update dealer profile if role is dealer
      if (userData.role === 'dealer' && userData.dealerProfile) {
        // Check if dealer profile exists
        const dealerProfileCheck = await client.query(
          'SELECT id FROM dealer_profiles WHERE user_id = $1',
          [id]
        );
        
        if (dealerProfileCheck.rows.length > 0) {
          // Update existing profile
          const dealerProfileId = dealerProfileCheck.rows[0].id;
          let dealerQuery = 'UPDATE dealer_profiles SET ';
          const dealerUpdateFields: string[] = [];
          const dealerValues: any[] = [];
          let dealerValueIndex = 1;
          
          if (userData.dealerProfile.companyName !== undefined) {
            dealerUpdateFields.push(`company_name = $${dealerValueIndex++}`);
            dealerValues.push(userData.dealerProfile.companyName);
          }
          
          if (userData.dealerProfile.businessLicense !== undefined) {
            dealerUpdateFields.push(`business_license = $${dealerValueIndex++}`);
            dealerValues.push(userData.dealerProfile.businessLicense);
          }
          
          if (userData.dealerProfile.specialtyTypes !== undefined) {
            dealerUpdateFields.push(`specialty_types = $${dealerValueIndex++}`);
            dealerValues.push(userData.dealerProfile.specialtyTypes);
          }
          
          if (userData.dealerProfile.yearsInBusiness !== undefined) {
            dealerUpdateFields.push(`years_in_business = $${dealerValueIndex++}`);
            dealerValues.push(userData.dealerProfile.yearsInBusiness);
          }
          
          // Always update the updated_at timestamp
          dealerUpdateFields.push(`updated_at = CURRENT_TIMESTAMP`);
          
          if (dealerUpdateFields.length > 0) {
            dealerQuery += dealerUpdateFields.join(', ');
            dealerQuery += ` WHERE id = $${dealerValueIndex++}`;
            dealerValues.push(dealerProfileId);
            
            await client.query(dealerQuery, dealerValues);
          }
        } else {
          // Create new profile
          const dealerProfileQuery = `
            INSERT INTO dealer_profiles (
              user_id, 
              company_name, 
              business_license, 
              specialty_types, 
              years_in_business
            ) 
            VALUES ($1, $2, $3, $4, $5)
          `;
          
          const dealerValues = [
            id,
            userData.dealerProfile.companyName || null,
            userData.dealerProfile.businessLicense || null,
            userData.dealerProfile.specialtyTypes || null,
            userData.dealerProfile.yearsInBusiness || null
          ];
          
          await client.query(dealerProfileQuery, dealerValues);
        }
      }
      
      // Get role name for the updated user
      const roleQuery = 'SELECT name FROM roles WHERE id = $1';
      const roleResult = await client.query(roleQuery, [user.role_id]);
      user.role_name = roleResult.rows[0].name;
      
      await client.query('COMMIT');
      return user;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a user by ID
   */
  async delete(id: number): Promise<boolean> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Delete related profiles first
      await client.query('DELETE FROM cutter_profiles WHERE user_id = $1', [id]);
      await client.query('DELETE FROM dealer_profiles WHERE user_id = $1', [id]);
      await client.query('DELETE FROM appraiser_profiles WHERE user_id = $1', [id]);
      
      // Delete the user
      const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
      
      await client.query('COMMIT');
      return result.rows.length > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Find user by verification token
   */
  async findByVerificationToken(token: string): Promise<User[]> {
    try {
      const query = `
        SELECT u.*, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.verification_token = $1
      `;
      const result = await this.pool.query(query, [token]);
      return result.rows;
    } catch (error) {
      console.error('Error finding user by verification token:', error);
      throw error;
    }
  }

  /**
   * Find user by reset token
   */
  async findByResetToken(token: string): Promise<User | null> {
    try {
      const query = `
        SELECT u.*, r.name as role_name 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.reset_token = $1
      `;
      const result = await this.pool.query(query, [token]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      throw error;
    }
  }

  /**
   * Check if a password matches
   */
  async checkPassword(user: User, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.password_hash);
    } catch (error) {
      console.error('Error checking password:', error);
      throw error;
    }
  }

  /**
   * Get cutter profile by user ID
   */
  async getCutterProfile(userId: number) {
    try {
      const query = `
        SELECT * FROM cutter_profiles WHERE user_id = $1
      `;
      const result = await this.pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error finding cutter profile:', error);
      throw error;
    }
  }

  /**
   * Get dealer profile by user ID
   */
  async getDealerProfile(userId: number) {
    try {
      const query = `
        SELECT * FROM dealer_profiles WHERE user_id = $1
      `;
      const result = await this.pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error finding dealer profile:', error);
      throw error;
    }
  }

  /**
   * Get all cutters with their profiles
   */
  async getAllCutters() {
    try {
      const query = `
        SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
               u.profile_image_url, cp.* 
        FROM users u
        JOIN cutter_profiles cp ON u.id = cp.user_id
        JOIN roles r ON u.role_id = r.id
        WHERE r.name = 'cutter'
        ORDER BY u.id
      `;
      
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching cutters:', error);
      throw error;
    }
  }

  /**
   * Update user's last login
   */
  async updateLastLogin(id: number): Promise<void> {
    try {
      await this.pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
}

export default new UserModel();