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