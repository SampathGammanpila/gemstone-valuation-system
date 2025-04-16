// packages/backend/src/db/repositories/gemstone-draft.repository.ts

import pool from '../../config/database';

/**
 * Repository for gemstone draft database operations
 */
class GemstoneDraftRepository {
  /**
   * Get all drafts for a user
   */
  async getAllDrafts(userId: number, limit: number = 20, offset: number = 0) {
    try {
      const query = `
        SELECT 
          g.*,
          gf.name AS gemstone_family_name,
          cs.name AS cut_shape_name,
          c.name AS color_name,
          cg.grade AS color_grade_name
        FROM 
          gemstones g
        LEFT JOIN 
          gemstone_families gf ON g.gemstone_family_id = gf.id
        LEFT JOIN 
          cut_shapes cs ON g.cut_shape_id = cs.id
        LEFT JOIN 
          colors c ON g.color_id = c.id
        LEFT JOIN 
          color_grades cg ON g.color_grade_id = cg.id
        WHERE 
          g.user_id = $1 
          AND g.status = 'draft'
        ORDER BY 
          g.updated_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await pool.query(query, [userId, limit, offset]);
      
      return result.rows;
    } catch (error) {
      console.error('Database error fetching all drafts:', error);
      throw error;
    }
  }
  
  /**
   * Get a draft by ID
   */
  async getDraftById(draftId: number) {
    try {
      const query = `
        SELECT 
          g.*,
          gf.name AS gemstone_family_name,
          cs.name AS cut_shape_name,
          c.name AS color_name,
          cg.grade AS color_grade_name,
          cl.name AS clarity_name,
          t.name AS treatment_name
        FROM 
          gemstones g
        LEFT JOIN 
          gemstone_families gf ON g.gemstone_family_id = gf.id
        LEFT JOIN 
          cut_shapes cs ON g.cut_shape_id = cs.id
        LEFT JOIN 
          colors c ON g.color_id = c.id
        LEFT JOIN 
          color_grades cg ON g.color_grade_id = cg.id
        LEFT JOIN 
          clarities cl ON g.clarity_id = cl.id
        LEFT JOIN 
          treatments t ON g.treatment_id = t.id
        WHERE 
          g.id = $1 
          AND g.status = 'draft'
      `;
      
      const result = await pool.query(query, [draftId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Database error fetching draft ${draftId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new draft
   */
  async createDraft(draftData: any) {
    try {
      // Extract the fields from the draft data
      const {
        user_id,
        title,
        description,
        gemstone_family_id,
        cut_shape_id,
        color_id,
        color_grade_id,
        cut_grade_id,
        clarity_id,
        treatment_id,
        clarity_characteristics_ids,
        blemish_ids,
        width_mm,
        height_mm,
        depth_mm,
        carat_weight,
        piece_count,
        mining_method_id,
        mining_location_id,
        special_notes,
        image_urls,
        status
      } = draftData;
      
      // Always set status to 'draft'
      const finalStatus = 'draft';
      
      const query = `
        INSERT INTO gemstones (
          user_id,
          title,
          description,
          gemstone_family_id,
          cut_shape_id,
          color_id,
          color_grade_id,
          cut_grade_id,
          clarity_id,
          treatment_id,
          clarity_characteristics_ids,
          blemish_ids,
          width_mm,
          height_mm,
          depth_mm,
          carat_weight,
          piece_count,
          mining_method_id,
          mining_location_id,
          special_notes,
          image_urls,
          status,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
          $21, $22, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id`;
      
      const values = [
        user_id,
        title || null,
        description || null,
        gemstone_family_id || null,
        cut_shape_id || null,
        color_id || null,
        color_grade_id || null,
        cut_grade_id || null,
        clarity_id || null,
        treatment_id || null,
        clarity_characteristics_ids || null,
        blemish_ids || null,
        width_mm || null,
        height_mm || null,
        depth_mm || null,
        carat_weight || null,
        piece_count || 1,
        mining_method_id || null,
        mining_location_id || null,
        special_notes || null,
        image_urls || [],
        finalStatus
      ];
      
      const result = await pool.query(query, values);
      const newDraftId = result.rows[0].id;
      
      // Retrieve the full draft data
      return await this.getDraftById(newDraftId);
    } catch (error) {
      console.error('Database error creating draft:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing draft
   */
  async updateDraft(draftId: number, draftData: any) {
    try {
      // Always set status to 'draft'
      const updatedData = {
        ...draftData,
        status: 'draft',
        updated_at: new Date()
      };
      
      // Build the update query dynamically
      const columns = Object.keys(updatedData)
        .filter(key => updatedData[key] !== undefined && key !== 'id');
      
      const setClause = columns.map((column, index) => 
        `${column} = $${index + 1}`
      ).join(', ');
      
      const values = columns.map(column => updatedData[column]);
      
      // Add the ID as the last parameter
      values.push(draftId);
      
      const query = `
        UPDATE gemstones
        SET ${setClause}
        WHERE id = $${values.length} AND status = 'draft'
        RETURNING id
      `;
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Retrieve the full updated draft
      return await this.getDraftById(draftId);
    } catch (error) {
      console.error(`Database error updating draft ${draftId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a draft
   */
  async deleteDraft(draftId: number) {
    try {
      const query = `
        DELETE FROM gemstones
        WHERE id = $1 AND status = 'draft'
        RETURNING id
      `;
      
      const result = await pool.query(query, [draftId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Database error deleting draft ${draftId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get draft count for a user
   */
  async getDraftCount(userId: number): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM gemstones
        WHERE user_id = $1 AND status = 'draft'
      `;
      
      const result = await pool.query(query, [userId]);
      
      return parseInt(result.rows[0].count) || 0;
    } catch (error) {
      console.error('Database error getting draft count:', error);
      throw error;
    }
  }
}

export default new GemstoneDraftRepository();