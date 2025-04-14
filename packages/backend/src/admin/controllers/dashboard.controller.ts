// packages/backend/src/admin/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import pool from '../../config/database';

// Define interfaces for our dashboard data types
interface GemstoneStats {
  total_gemstones: number;
  published_gemstones: number;
  draft_gemstones: number;
  pending_approval: number;
}

interface UserStats {
  total_users: number;
  collectors: number;
  dealers: number;
  cutters: number;
  appraisers: number;
}

interface RecentGemstone {
  id: number;
  title: string;
  status: string;
  created_at: Date;
  created_by: string;
}

interface RecentUser {
  id: number;
  username: string;
  email: string;
  created_at: Date;
  role: string;
}

interface TransferStats {
  total_transfers: number;
  pending_transfers: number;
  completed_transfers: number;
}

interface DashboardStats {
  gemstoneStats: GemstoneStats;
  userStats: UserStats;
  recentGemstones: RecentGemstone[];
  recentUsers: RecentUser[];
  transferStats: TransferStats;
}

class DashboardController {
  /**
   * Get admin dashboard with statistics
   */
  async getAdminDashboard(req: Request, res: Response) {
    try {
      console.log('Loading admin dashboard for user:', req.admin?.username);
      
      // Default stats in case of database failure
      const defaultStats: DashboardStats = {
        gemstoneStats: { 
          total_gemstones: 0, 
          published_gemstones: 0, 
          draft_gemstones: 0, 
          pending_approval: 0 
        },
        userStats: { 
          total_users: 0, 
          collectors: 0, 
          dealers: 0, 
          cutters: 0, 
          appraisers: 0 
        },
        recentGemstones: [],
        recentUsers: [],
        transferStats: { 
          total_transfers: 0, 
          pending_transfers: 0, 
          completed_transfers: 0 
        }
      };
      
      // Database statistics
      let stats: DashboardStats = { ...defaultStats };
      
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
        
        stats = {
          gemstoneStats: gemstoneStats.rows[0] as GemstoneStats,
          userStats: userStats.rows[0] as UserStats,
          recentGemstones: recentGemstones.rows as RecentGemstone[],
          recentUsers: recentUsers.rows as RecentUser[],
          transferStats: transferStats.rows[0] as TransferStats
        };
        
        console.log('Dashboard data loaded successfully');
      } catch (dbError) {
        console.error('Database error when loading dashboard:', dbError);
        console.log('Using default values for dashboard');
        req.flash('error', 'Database connection error. Showing default dashboard values.');
      }
      
      res.render('dashboard/index', {
        title: 'Admin Dashboard',
        ...stats,
        admin: req.admin || null
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      
      // Still try to render the dashboard even with an error
      res.render('dashboard/index', { 
        title: 'Admin Dashboard',
        error: 'Failed to load dashboard data: ' + (error instanceof Error ? error.message : 'Unknown error'),
        gemstoneStats: { total_gemstones: 0, published_gemstones: 0, draft_gemstones: 0, pending_approval: 0 },
        userStats: { total_users: 0, collectors: 0, dealers: 0, cutters: 0, appraisers: 0 },
        recentGemstones: [] as RecentGemstone[],
        recentUsers: [] as RecentUser[],
        transferStats: { total_transfers: 0, pending_transfers: 0, completed_transfers: 0 },
        admin: req.admin || null
      });
    }
  }
}

export default new DashboardController();