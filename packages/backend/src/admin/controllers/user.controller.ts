// packages/backend/src/admin/controllers/user.controller.ts
import { Request, Response } from 'express';
import pool from '../../config/database';
import bcrypt from 'bcrypt';
import adminConfig from '../../config/admin.config';

class UserController {
  /**
   * Get all users with pagination
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || adminConfig.pagination.defaultLimit;
      const offset = (page - 1) * limit;
      
      // Optional filters
      const roleFilter = req.query.role ? ` AND r.name = '${req.query.role}'` : '';
      const searchQuery = req.query.search 
        ? ` AND (u.username ILIKE '%${req.query.search}%' OR u.email ILIKE '%${req.query.search}%')`
        : '';
      
      // Get users with pagination
      const usersQuery = `
        SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
               u.is_verified, u.created_at, u.last_login, r.name AS role
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE 1=1 ${roleFilter} ${searchQuery}
        ORDER BY u.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const users = await pool.query(usersQuery, [limit, offset]);
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE 1=1 ${roleFilter} ${searchQuery}
      `;
      
      const countResult = await pool.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalCount / limit);
      
      // Get roles for filter dropdown
      const rolesQuery = `SELECT id, name FROM roles`;
      const roles = await pool.query(rolesQuery);
      
      res.render('users/list', {
        title: 'All Users',
        users: users.rows,
        roles: roles.rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages
        },
        filters: {
          role: req.query.role || 'all',
          search: req.query.search || ''
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      req.flash('error', 'Failed to load users');
      res.redirect('/admin/dashboard');
    }
  }
  
  /**
   * Get create user form
   */
  async getCreateUserForm(req: Request, res: Response) {
    try {
      // Get roles for dropdown
      const rolesQuery = `SELECT id, name FROM roles`;
      const roles = await pool.query(rolesQuery);
      
      res.render('users/create', {
        title: 'Create User',
        roles: roles.rows
      });
    } catch (error) {
      console.error('Get create user form error:', error);
      req.flash('error', 'Failed to load create user form');
      res.redirect('/admin/users');
    }
  }
  
  /**
   * Create a new user
   */
  async createUser(req: Request, res: Response) {
    try {
      const { username, email, password, first_name, last_name, role_id, is_verified } = req.body;
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert user
      const userQuery = `
        INSERT INTO users (
          username, email, password_hash, first_name, last_name, 
          role_id, is_verified, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      
      const userResult = await pool.query(userQuery, [
        username, 
        email, 
        hashedPassword, 
        first_name || null, 
        last_name || null,
        role_id,
        is_verified === 'on'
      ]);
      
      const userId = userResult.rows[0].id;
      
      // Create role-specific profile if needed
      const roleResult = await pool.query('SELECT name FROM roles WHERE id = $1', [role_id]);
      const roleName = roleResult.rows[0].name;
      
      if (roleName === 'cutter') {
        await pool.query(`
          INSERT INTO cutter_profiles (user_id, created_at, updated_at)
          VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [userId]);
      } else if (roleName === 'dealer') {
        await pool.query(`
          INSERT INTO dealer_profiles (user_id, created_at, updated_at)
          VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [userId]);
      } else if (roleName === 'appraiser') {
        await pool.query(`
          INSERT INTO appraiser_profiles (user_id, created_at, updated_at)
          VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [userId]);
      }
      
      req.flash('success', 'User created successfully');
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Create user error:', error);
      req.flash('error', 'Failed to create user');
      res.redirect('/admin/users/create');
    }
  }
  
  /**
   * Get user details
   */
  async getUserDetails(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      // Get user details
      const userQuery = `
        SELECT u.*, r.name AS role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
      `;
      
      const userResult = await pool.query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        req.flash('error', 'User not found');
        return res.redirect('/admin/users');
      }
      
      const user = userResult.rows[0];
      
      // Get role-specific profile
      let profile = null;
      
      if (user.role_name === 'cutter') {
        const profileQuery = `SELECT * FROM cutter_profiles WHERE user_id = $1`;
        const profileResult = await pool.query(profileQuery, [userId]);
        profile = profileResult.rows[0] || null;
      } else if (user.role_name === 'dealer') {
        const profileQuery = `SELECT * FROM dealer_profiles WHERE user_id = $1`;
        const profileResult = await pool.query(profileQuery, [userId]);
        profile = profileResult.rows[0] || null;
      } else if (user.role_name === 'appraiser') {
        const profileQuery = `SELECT * FROM appraiser_profiles WHERE user_id = $1`;
        const profileResult = await pool.query(profileQuery, [userId]);
        profile = profileResult.rows[0] || null;
      }
      
      // Get user's gemstones
      const gemstonesQuery = `
        SELECT id, title, status, created_at, is_verified
        FROM gemstones
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 10
      `;
      
      const gemstonesResult = await pool.query(gemstonesQuery, [userId]);
      
      res.render('users/details', {
        title: `User: ${user.username}`,
        user,
        profile,
        gemstones: gemstonesResult.rows
      });
    } catch (error) {
      console.error('Get user details error:', error);
      req.flash('error', 'Failed to load user details');
      res.redirect('/admin/users');
    }
  }
  
  /**
   * Get edit user form
   */
  async getEditUserForm(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      // Get user details
      const userQuery = `
        SELECT u.*, r.name AS role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
      `;
      
      const userResult = await pool.query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        req.flash('error', 'User not found');
        return res.redirect('/admin/users');
      }
      
      const user = userResult.rows[0];
      
      // Get roles for dropdown
      const rolesQuery = `SELECT id, name FROM roles`;
      const roles = await pool.query(rolesQuery);
      
      res.render('users/edit', {
        title: `Edit User: ${user.username}`,
        user,
        roles: roles.rows
      });
    } catch (error) {
      console.error('Get edit user form error:', error);
      req.flash('error', 'Failed to load edit user form');
      res.redirect('/admin/users');
    }
  }
  
  /**
   * Update user
   */
  async updateUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      const { username, email, password, first_name, last_name, role_id, is_verified } = req.body;
      
      // Start building the query
      let updateQuery = `
        UPDATE users SET
          username = $1,
          email = $2,
          first_name = $3,
          last_name = $4,
          role_id = $5,
          is_verified = $6,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      const queryParams = [
        username,
        email,
        first_name || null,
        last_name || null,
        role_id,
        is_verified === 'on'
      ];
      
      // Add password update if provided
      if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updateQuery += `, password_hash = ${queryParams.length + 1}`;
        queryParams.push(hashedPassword);
      }
      
      // Complete the query
      updateQuery += ` WHERE id = ${queryParams.length + 1}`;
      queryParams.push(userId);
      
      await pool.query(updateQuery, queryParams);
      
      // Check if role has changed, and handle role-specific profiles
      const oldRoleQuery = `
        SELECT r.name AS role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1
      `;
      
      const newRoleQuery = `
        SELECT r.name AS role_name
        FROM roles r
        WHERE r.id = $1
      `;
      
      const oldRoleResult = await pool.query(oldRoleQuery, [userId]);
      const newRoleResult = await pool.query(newRoleQuery, [role_id]);
      
      const oldRole = oldRoleResult.rows[0].role_name;
      const newRole = newRoleResult.rows[0].role_name;
      
      // If role has changed, create appropriate profile if needed
      if (oldRole !== newRole) {
        if (newRole === 'cutter') {
          // Check if profile already exists
          const profileCheck = await pool.query(
            'SELECT id FROM cutter_profiles WHERE user_id = $1',
            [userId]
          );
          
          if (profileCheck.rows.length === 0) {
            await pool.query(`
              INSERT INTO cutter_profiles (user_id, created_at, updated_at)
              VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [userId]);
          }
        } else if (newRole === 'dealer') {
          // Check if profile already exists
          const profileCheck = await pool.query(
            'SELECT id FROM dealer_profiles WHERE user_id = $1',
            [userId]
          );
          
          if (profileCheck.rows.length === 0) {
            await pool.query(`
              INSERT INTO dealer_profiles (user_id, created_at, updated_at)
              VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [userId]);
          }
        } else if (newRole === 'appraiser') {
          // Check if profile already exists
          const profileCheck = await pool.query(
            'SELECT id FROM appraiser_profiles WHERE user_id = $1',
            [userId]
          );
          
          if (profileCheck.rows.length === 0) {
            await pool.query(`
              INSERT INTO appraiser_profiles (user_id, created_at, updated_at)
              VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `, [userId]);
          }
        }
      }
      
      req.flash('success', 'User updated successfully');
      res.redirect(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Update user error:', error);
      req.flash('error', 'Failed to update user');
      res.redirect(`/admin/users/${req.params.id}/edit`);
    }
  }
  
  /**
   * Verify user
   */
  async verifyUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      await pool.query(`
        UPDATE users
        SET is_verified = true,
            verification_token = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [userId]);
      
      req.flash('success', 'User verified successfully');
      res.redirect(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Verify user error:', error);
      req.flash('error', 'Failed to verify user');
      res.redirect(`/admin/users/${req.params.id}`);
    }
  }
  
  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user has gemstones
      const gemstonesCheck = await pool.query(`
        SELECT COUNT(*) as gemstone_count 
        FROM gemstones 
        WHERE user_id = $1
      `, [userId]);
      
      if (parseInt(gemstonesCheck.rows[0].gemstone_count) > 0) {
        req.flash('error', 'Cannot delete user with gemstones');
        return res.redirect(`/admin/users/${userId}`);
      }
      
      // Delete user's profiles
      await pool.query('DELETE FROM cutter_profiles WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM dealer_profiles WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM appraiser_profiles WHERE user_id = $1', [userId]);
      
      // Delete user
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      
      req.flash('success', 'User deleted successfully');
      res.redirect('/admin/users');
    } catch (error) {
      console.error('Delete user error:', error);
      req.flash('error', 'Failed to delete user');
      res.redirect(`/admin/users/${req.params.id}`);
    }
  }
}

export default new UserController();