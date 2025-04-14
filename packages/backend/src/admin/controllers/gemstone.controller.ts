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