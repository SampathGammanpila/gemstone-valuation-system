// packages/backend/src/admin/controllers/reference-data.controller.ts
import { Request, Response } from 'express';
import pool from '../../config/database';
import adminConfig from '../../config/admin.config';

class ReferenceDataController {
  /**
   * Get all gemstone families
   */
  async getGemstoneFamilies(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || adminConfig.pagination.defaultLimit;
      const offset = (page - 1) * limit;
      
      // Optional filters
      const categoryFilter = req.query.category ? ` WHERE category = '${req.query.category}'` : '';
      const searchQuery = req.query.search 
        ? ` WHERE name ILIKE '%${req.query.search}%' OR category ILIKE '%${req.query.search}%'` 
        : '';
      
      // Combine filters
      const whereClause = categoryFilter && searchQuery 
        ? `${categoryFilter} AND ${searchQuery.replace('WHERE', '')}`
        : categoryFilter || searchQuery;
      
      // Get gemstone families with pagination
      const familiesQuery = `
        SELECT *
        FROM gemstone_families
        ${whereClause}
        ORDER BY name ASC
        LIMIT $1 OFFSET $2
      `;
      
      const families = await pool.query(familiesQuery, [limit, offset]);
      
      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) AS total
        FROM gemstone_families
        ${whereClause}
      `;
      
      const countResult = await pool.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalCount / limit);
      
      // Get categories for filter dropdown
      const categoriesQuery = `SELECT DISTINCT category FROM gemstone_families ORDER BY category`;
      const categories = await pool.query(categoriesQuery);
      
      res.render('reference-data/gemstone-families', {
        title: 'Gemstone Families',
        families: families.rows,
        categories: categories.rows,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages
        },
        filters: {
          category: req.query.category || 'all',
          search: req.query.search || ''
        }
      });
    } catch (error) {
      console.error('Get gemstone families error:', error);
      req.flash('error', 'Failed to load gemstone families');
      res.redirect('/admin/dashboard');
    }
  }
  
  /**
   * Get create family form
   */
  async getCreateFamilyForm(req: Request, res: Response) {
    try {
      // Get distinct categories for dropdown
      const categoriesQuery = `SELECT DISTINCT category FROM gemstone_families ORDER BY category`;
      const categories = await pool.query(categoriesQuery);
      
      res.render('reference-data/gemstone-family-form', {
        title: 'Create Gemstone Family',
        categories: categories.rows,
        family: null,
        action: 'create'
      });
    } catch (error) {
      console.error('Get create family form error:', error);
      req.flash('error', 'Failed to load create family form');
      res.redirect('/admin/reference-data/gemstone-families');
    }
  }
  
  /**
   * Create a new gemstone family
   */
  async createGemstoneFamily(req: Request, res: Response) {
    try {
      const {
        name,
        category,
        mineral_group,
        chemical_formula,
        hardness_min,
        hardness_max,
        rarity_level,
        value_category,
        description
      } = req.body;
      
      const query = `
        INSERT INTO gemstone_families 
        (name, category, mineral_group, chemical_formula, hardness_min, hardness_max, rarity_level, value_category, description, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      
      const values = [
        name,
        category,
        mineral_group || null,
        chemical_formula || null,
        hardness_min || null,
        hardness_max || null,
        rarity_level || null,
        value_category || null,
        description || null
      ];
      
      await pool.query(query, values);
      
      req.flash('success', 'Gemstone family created successfully');
      res.redirect('/admin/reference-data/gemstone-families');
    } catch (error) {
      console.error('Create gemstone family error:', error);
      req.flash('error', 'Failed to create gemstone family');
      res.redirect('/admin/reference-data/gemstone-families/create');
    }
  }
  
  /**
   * Get edit family form
   */
  async getEditFamilyForm(req: Request, res: Response) {
    try {
      const familyId = parseInt(req.params.id);
      
      // Get family details
      const familyQuery = `SELECT * FROM gemstone_families WHERE id = $1`;
      const familyResult = await pool.query(familyQuery, [familyId]);
      
      if (familyResult.rows.length === 0) {
        req.flash('error', 'Gemstone family not found');
        return res.redirect('/admin/reference-data/gemstone-families');
      }
      
      // Get distinct categories for dropdown
      const categoriesQuery = `SELECT DISTINCT category FROM gemstone_families ORDER BY category`;
      const categories = await pool.query(categoriesQuery);
      
      res.render('reference-data/gemstone-family-form', {
        title: 'Edit Gemstone Family',
        family: familyResult.rows[0],
        categories: categories.rows,
        action: 'edit'
      });
    } catch (error) {
      console.error('Get edit family form error:', error);
      req.flash('error', 'Failed to load edit family form');
      res.redirect('/admin/reference-data/gemstone-families');
    }
  }
  
  /**
   * Update a gemstone family
   */
  async updateGemstoneFamily(req: Request, res: Response) {
    try {
      const familyId = parseInt(req.params.id);
      const {
        name,
        category,
        mineral_group,
        chemical_formula,
        hardness_min,
        hardness_max,
        rarity_level,
        value_category,
        description
      } = req.body;
      
      const query = `
        UPDATE gemstone_families
        SET name = $1,
            category = $2,
            mineral_group = $3,
            chemical_formula = $4,
            hardness_min = $5,
            hardness_max = $6,
            rarity_level = $7,
            value_category = $8,
            description = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `;
      
      const values = [
        name,
        category,
        mineral_group || null,
        chemical_formula || null,
        hardness_min || null,
        hardness_max || null,
        rarity_level || null,
        value_category || null,
        description || null,
        familyId
      ];
      
      await pool.query(query, values);
      
      req.flash('success', 'Gemstone family updated successfully');
      res.redirect('/admin/reference-data/gemstone-families');
    } catch (error) {
      console.error('Update gemstone family error:', error);
      req.flash('error', 'Failed to update gemstone family');
      res.redirect(`/admin/reference-data/gemstone-families/${req.params.id}/edit`);
    }
  }
  
  /**
   * Delete a gemstone family
   */
  async deleteGemstoneFamily(req: Request, res: Response) {
    try {
      const familyId = parseInt(req.params.id);
      
      // Check if gemstone family is in use
      const gemstonesCheck = await pool.query(`
        SELECT COUNT(*) as gemstone_count 
        FROM gemstones 
        WHERE gemstone_family_id = $1
      `, [familyId]);
      
      if (parseInt(gemstonesCheck.rows[0].gemstone_count) > 0) {
        req.flash('error', 'Cannot delete gemstone family that is in use');
        return res.redirect('/admin/reference-data/gemstone-families');
      }
      
      // Delete gemstone family
      await pool.query('DELETE FROM gemstone_families WHERE id = $1', [familyId]);
      
      req.flash('success', 'Gemstone family deleted successfully');
      res.redirect('/admin/reference-data/gemstone-families');
    } catch (error) {
      console.error('Delete gemstone family error:', error);
      req.flash('error', 'Failed to delete gemstone family');
      res.redirect('/admin/reference-data/gemstone-families');
    }
  }
  
  /**
   * Get all cut shapes
   */
  async getCutShapes(req: Request, res: Response) {
    try {
      const cutShapesQuery = `
        SELECT *
        FROM cut_shapes
        ORDER BY category, name
      `;
      
      const cutShapes = await pool.query(cutShapesQuery);
      
      // Group cut shapes by category
      const shapesGrouped = cutShapes.rows.reduce((acc, shape) => {
        if (!acc[shape.category]) {
          acc[shape.category] = [];
        }
        acc[shape.category].push(shape);
        return acc;
      }, {});
      
      res.render('reference-data/cut-shapes', {
        title: 'Cut Shapes',
        shapesGrouped
      });
    } catch (error) {
      console.error('Get cut shapes error:', error);
      req.flash('error', 'Failed to load cut shapes');
      res.redirect('/admin/dashboard');
    }
  }
  
  /**
   * Get all colors
   */
  async getColors(req: Request, res: Response) {
    try {
      const colorsQuery = `
        SELECT *
        FROM colors
        ORDER BY category, name
      `;
      
      const colorGradesQuery = `
        SELECT *
        FROM color_grades
        ORDER BY grade
      `;
      
      const colors = await pool.query(colorsQuery);
      const colorGrades = await pool.query(colorGradesQuery);
      
      // Group colors by category
      const colorsGrouped = colors.rows.reduce((acc, color) => {
        if (!acc[color.category]) {
          acc[color.category] = [];
        }
        acc[color.category].push(color);
        return acc;
      }, {});
      
      res.render('reference-data/colors', {
        title: 'Colors and Grades',
        colorsGrouped,
        colorGrades: colorGrades.rows
      });
    } catch (error) {
      console.error('Get colors error:', error);
      req.flash('error', 'Failed to load colors');
      res.redirect('/admin/dashboard');
    }
  }
  
  /**
   * Get quality standards
   */
  async getQualityStandards(req: Request, res: Response) {
    try {
      const claritiesQuery = `
        SELECT *
        FROM clarities
        ORDER BY ranking
      `;
      
      const cutGradesQuery = `
        SELECT *
        FROM cut_grades
        ORDER BY quality_percentage DESC
      `;
      
      const treatmentsQuery = `
        SELECT *
        FROM treatments
        ORDER BY name
      `;
      
      const clarities = await pool.query(claritiesQuery);
      const cutGrades = await pool.query(cutGradesQuery);
      const treatments = await pool.query(treatmentsQuery);
      
      res.render('reference-data/quality-standards', {
        title: 'Quality Standards',
        clarities: clarities.rows,
        cutGrades: cutGrades.rows,
        treatments: treatments.rows
      });
    } catch (error) {
      console.error('Get quality standards error:', error);
      req.flash('error', 'Failed to load quality standards');
      res.redirect('/admin/dashboard');
    }
  }
  
  /**
   * Get mining locations
   */
  async getMiningLocations(req: Request, res: Response) {
    try {
      const locationsQuery = `
        SELECT *
        FROM mining_locations
        ORDER BY country, name
      `;
      
      const locations = await pool.query(locationsQuery);
      
      // Group locations by country
      const locationsGrouped = locations.rows.reduce((acc, location) => {
        if (!acc[location.country]) {
          acc[location.country] = [];
        }
        acc[location.country].push(location);
        return acc;
      }, {});
      
      res.render('reference-data/mining-locations', {
        title: 'Mining Locations',
        locationsGrouped
      });
    } catch (error) {
      console.error('Get mining locations error:', error);
      req.flash('error', 'Failed to load mining locations');
      res.redirect('/admin/dashboard');
    }
  }
}

export default new ReferenceDataController();