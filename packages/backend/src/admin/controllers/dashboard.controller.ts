// packages/backend/src/admin/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import pool from '../../config/database';

class DashboardController {
  /**
   * Get admin dashboard with statistics
   */
  async getAdminDashboard(req: Request, res: Response) {
    try {
      // Get gemstone statistics
      const gemstoneStats = await pool.query(`
        SELECT 
          COUNT(*) AS total_gemstones,
          COUNT(CASE WHEN status = 'published' THEN 1 END) AS published_gemstones,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) AS draft_gemstones,
          COUNT(CASE WHEN is_verified = false AND status = 'published' THEN 1 END) AS pending_approval
        FROM gemstones
      `);
      
      // Get user statistics
      const userStats = await pool.query(`
        SELECT 
          COUNT(*) AS total_users,
          COUNT(CASE WHEN r.name = 'collector' THEN 1 END) AS collectors,
          COUNT(CASE WHEN r.name = 'dealer' THEN 1 END) AS dealers,
          COUNT(CASE WHEN r.name = 'cutter' THEN 1 END) AS cutters,
          COUNT(CASE WHEN r.name = 'appraiser' THEN 1 END) AS appraisers
        FROM users u
        JOIN roles r ON u.role_id = r.id
      `);
      
      // Get recent gemstones
      const recentGemstones = await pool.query(`
        SELECT g.id, g.title, g.status, g.created_at, u.username AS created_by
        FROM gemstones g
        JOIN users u ON g.user_id = u.id
        ORDER BY g.created_at DESC
        LIMIT 10
      `);
      
      // Get recent users
      const recentUsers = await pool.query(`
        SELECT u.id, u.username, u.email, u.created_at, r.name AS role
        FROM users u
        JOIN roles r ON u.role_id = r.id
        ORDER BY u.created_at DESC
        LIMIT 10
      `);
      
      // Get transfer statistics
      const transferStats = await pool.query(`
        SELECT 
          COUNT(*) AS total_transfers,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_transfers,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_transfers
        FROM ownership_transfers
      `);
      
      res.render('dashboard/index', {
        title: 'Admin Dashboard',
        gemstoneStats: gemstoneStats.rows[0],
        userStats: userStats.rows[0],
        recentGemstones: recentGemstones.rows,
        recentUsers: recentUsers.rows,
        transferStats: transferStats.rows[0]
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      req.flash('error', 'Failed to load dashboard data');
      res.render('dashboard/index', { 
        title: 'Admin Dashboard',
        error: 'Failed to load dashboard data'
      });
    }
  }
}

export default new DashboardController();

// packages/backend/src/admin/controllers/gemstone.controller.ts
import { Request, Response } from 'express';
import pool from '../../config/database';
import adminConfig from '../../config/admin.config';

class GemstoneController {
  /**
   * Get all gemstones with pagination
   */
  async getAllGemstones(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || adminConfig.pagination.defaultLimit;
      const offset = (page - 1) * limit;
      
      // Optional filters
      const statusFilter = req.query.status ? ` AND g.status = '${req.query.status}'` : '';
      const searchQuery = req.query.search 
        ? ` AND (g.title ILIKE '%${req.query.search}%' OR gf.name ILIKE '%${req.query.search}%')`
        : '';
      
      // Get gemstones with pagination
      const gemstonesQuery = `
        SELECT g.id, g.title, g.status, g.created_at, g.is_verified,
               u.username AS created_by, gf.name AS gemstone_family
        FROM gemstones g
        JOIN users u ON g.user_id = u.id
        JOIN gemstone_families gf ON g.gemstone_family_id = gf.id
        WHERE 1=1 ${statusFilter} ${searchQuery}
        ORDER BY g.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const gemstones = await pool.query(gemstonesQuery, [limit, offset]);
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM gemstones g
        JOIN gemstone_families gf ON g.gemstone_family_id = gf.id
        WHERE 1=1 ${statusFilter} ${searchQuery}
      `;
      
      const countResult = await pool.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalCount / limit);
      
      res.render('gemstones/list', {
        title: 'All Gemstones',
        gemstones: gemstones.rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages
        },
        filters: {
          status: req.query.status || 'all',
          search: req.query.search || ''
        }
      });
    } catch (error) {
      console.error('Get all gemstones error:', error);
      req.flash('error', 'Failed to load gemstones');
      res.redirect('/admin/dashboard');
    }
  }
  
  /**
   * Get gemstone approval queue
   */
  async getApprovalQueue(req: Request, res: Response) {
    try {
      const pendingGemstones = await pool.query(`
        SELECT g.id, g.title, g.status, g.created_at,
               u.username AS created_by, gf.name AS gemstone_family
        FROM gemstones g
        JOIN users u ON g.user_id = u.id
        JOIN gemstone_families gf ON g.gemstone_family_id = gf.id
        WHERE g.status = 'published' AND g.is_verified = false
        ORDER BY g.created_at ASC
      `);
      
      res.render('gemstones/approval', {
        title: 'Gemstone Approval Queue',
        gemstones: pendingGemstones.rows
      });
    } catch (error) {
      console.error('Get approval queue error:', error);
      req.flash('error', 'Failed to load approval queue');
      res.redirect('/admin/gemstones');
    }
  }
  
  /**
   * Get gemstone details
   */
  async getGemstoneDetails(req: Request, res: Response) {
    try {
      const gemstoneId = parseInt(req.params.id);
      
      // Get gemstone details
      const gemstoneQuery = `
        SELECT g.*, 
               u.username AS created_by, 
               gf.name AS gemstone_family,
               gf.category AS gemstone_category,
               cs.name AS cut_shape,
               c.name AS color_name,
               cg.grade AS color_grade,
               cl.name AS clarity,
               t.name AS treatment
        FROM gemstones g
        JOIN users u ON g.user_id = u.id
        JOIN gemstone_families gf ON g.gemstone_family_id = gf.id
        JOIN cut_shapes cs ON g.cut_shape_id = cs.id
        JOIN colors c ON g.color_id = c.id
        JOIN color_grades cg ON g.color_grade_id = cg.id
        JOIN clarities cl ON g.clarity_id = cl.id
        LEFT JOIN treatments t ON g.treatment_id = t.id
        WHERE g.id = $1
      `;
      
      const gemstoneResult = await pool.query(gemstoneQuery, [gemstoneId]);
      
      if (gemstoneResult.rows.length === 0) {
        req.flash('error', 'Gemstone not found');
        return res.redirect('/admin/gemstones');
      }
      
      const gemstone = gemstoneResult.rows[0];
      
      // Get transfer history
      const transfersQuery = `
        SELECT ot.*, 
               uf.username AS from_user, 
               ut.username AS to_user,
               ot.status
        FROM ownership_transfers ot
        JOIN users uf ON ot.from_user_id = uf.id
        JOIN users ut ON ot.to_user_id = ut.id
        WHERE ot.gemstone_id = $1
        ORDER BY ot.transfer_date DESC
      `;
      
      const transfersResult = await pool.query(transfersQuery, [gemstoneId]);
      
      res.render('gemstones/details', {
        title: `Gemstone: ${gemstone.title}`,
        gemstone,
        transfers: transfersResult.rows
      });
    } catch (error) {
      console.error('Get gemstone details error:', error);
      req.flash('error', 'Failed to load gemstone details');
      res.redirect('/admin/gemstones');
    }
  }
  
  /**
   * Approve a gemstone
   */
  async approveGemstone(req: Request, res: Response) {
    try {
      const gemstoneId = parseInt(req.params.id);
      const adminId = req.admin!.userId;
      
      // Update gemstone status
      await pool.query(`
        UPDATE gemstones
        SET is_verified = true,
            verified_by = $1,
            verification_date = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [adminId, gemstoneId]);
      
      req.flash('success', 'Gemstone has been approved successfully');
      res.redirect('/admin/gemstones/approval');
    } catch (error) {
      console.error('Approve gemstone error:', error);
      req.flash('error', 'Failed to approve gemstone');
      res.redirect(`/admin/gemstones/${req.params.id}`);
    }
  }
  
  /**
   * Reject a gemstone
   */
  async rejectGemstone(req: Request, res: Response) {
    try {
      const gemstoneId = parseInt(req.params.id);
      const { reason } = req.body;
      
      // Update gemstone status to draft
      await pool.query(`
        UPDATE gemstones
        SET status = 'draft',
            special_notes = CONCAT(special_notes, E'\n\nRejection Reason: ', $1)
        WHERE id = $2
      `, [reason || 'No reason provided', gemstoneId]);
      
      req.flash('success', 'Gemstone has been rejected');
      res.redirect('/admin/gemstones/approval');
    } catch (error) {
      console.error('Reject gemstone error:', error);
      req.flash('error', 'Failed to reject gemstone');
      res.redirect(`/admin/gemstones/${req.params.id}`);
    }
  }
  
  /**
   * Feature a gemstone
   */
  async featureGemstone(req: Request, res: Response) {
    try {
      const gemstoneId = parseInt(req.params.id);
      const { feature } = req.body;
      const isFeatured = feature === 'true';
      
      // Update gemstone featured status
      await pool.query(`
        UPDATE gemstones
        SET is_featured = $1
        WHERE id = $2
      `, [isFeatured, gemstoneId]);
      
      req.flash('success', isFeatured ? 'Gemstone has been featured' : 'Gemstone has been unfeatured');
      res.redirect(`/admin/gemstones/${gemstoneId}`);
    } catch (error) {
      console.error('Feature gemstone error:', error);
      req.flash('error', 'Failed to update featured status');
      res.redirect(`/admin/gemstones/${req.params.id}`);
    }
  }
  
  /**
   * Delete a gemstone
   */
  async deleteGemstone(req: Request, res: Response) {
    try {
      const gemstoneId = parseInt(req.params.id);
      
      // Check if gemstone has transfers
      const transfersCheck = await pool.query(`
        SELECT COUNT(*) as transfer_count 
        FROM ownership_transfers 
        WHERE gemstone_id = $1
      `, [gemstoneId]);
      
      if (parseInt(transfersCheck.rows[0].transfer_count) > 0) {
        req.flash('error', 'Cannot delete gemstone with ownership transfers');
        return res.redirect(`/admin/gemstones/${gemstoneId}`);
      }
      
      // Delete gemstone
      await pool.query('DELETE FROM gemstones WHERE id = $1', [gemstoneId]);
      
      req.flash('success', 'Gemstone has been deleted successfully');
      res.redirect('/admin/gemstones');
    } catch (error) {
      console.error('Delete gemstone error:', error);
      req.flash('error', 'Failed to delete gemstone');
      res.redirect(`/admin/gemstones/${req.params.id}`);
    }
  }
}

export default new GemstoneController();

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