import pool from '../../config/database';
import {
  GemstoneFamily,
  CutShape,
  Color,
  ColorGrade,
  CutGrade,
  Clarity,
  Treatment,
  ClarityCharacteristic,
  Blemish,
  MiningLocation,
  MiningMethod,
  ReferenceDataFilter
} from '../../types/reference-data.types';

// Reference data repository class for handling database operations
export class ReferenceDataRepository {
  // ================ GEMSTONE FAMILIES ================
  
  // Get all gemstone families with optional filtering and pagination
  async getAllGemstoneFamilies(filters?: ReferenceDataFilter) {
    try {
      const { page = 1, limit = 20, search, category } = filters || {};
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM gemstone_families WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Add search filter if provided
      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR category ILIKE $${paramIndex} OR mineral_group ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }
      
      // Add category filter if provided
      if (category) {
        query += ` AND category = $${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
      }
      
      // Add order by, limit and offset
      query += ' ORDER BY name LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
      queryParams.push(limit, offset);
      
      // Execute query
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM gemstone_families WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;
      
      if (search) {
        countQuery += ` AND (name ILIKE $${countParamIndex} OR category ILIKE $${countParamIndex} OR mineral_group ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
        countParamIndex++;
      }
      
      if (category) {
        countQuery += ` AND category = $${countParamIndex}`;
        countParams.push(category);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching gemstone families:', error);
      throw error;
    }
  }

  // Get distinct gemstone family categories
  async getGemstoneFamilyCategories() {
    try {
      const query = 'SELECT DISTINCT category FROM gemstone_families ORDER BY category';
      const result = await pool.query(query);
      return result.rows.map(row => row.category);
    } catch (error) {
      console.error('Error fetching gemstone family categories:', error);
      throw error;
    }
  }

  // Get a specific gemstone family by ID
  async getGemstoneFamilyById(id: number): Promise<GemstoneFamily | null> {
    try {
      const query = 'SELECT * FROM gemstone_families WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching gemstone family with ID ${id}:`, error);
      throw error;
    }
  }

  // Create a new gemstone family
  async createGemstoneFamily(familyData: Partial<GemstoneFamily>): Promise<GemstoneFamily> {
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
      } = familyData;

      const query = `
        INSERT INTO gemstone_families 
        (name, category, mineral_group, chemical_formula, hardness_min, hardness_max, rarity_level, value_category, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      
      const values = [
        name,
        category,
        mineral_group,
        chemical_formula,
        hardness_min,
        hardness_max,
        rarity_level,
        value_category,
        description
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating gemstone family:', error);
      throw error;
    }
  }

  // Update an existing gemstone family
  async updateGemstoneFamily(id: number, familyData: Partial<GemstoneFamily>): Promise<GemstoneFamily | null> {
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
      } = familyData;

      const query = `
        UPDATE gemstone_families 
        SET name = $1, category = $2, mineral_group = $3, chemical_formula = $4, 
            hardness_min = $5, hardness_max = $6, rarity_level = $7, value_category = $8, 
            description = $9, updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
      `;
      
      const values = [
        name,
        category,
        mineral_group,
        chemical_formula,
        hardness_min,
        hardness_max,
        rarity_level,
        value_category,
        description,
        id
      ];

      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating gemstone family with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a gemstone family
  async deleteGemstoneFamily(id: number): Promise<GemstoneFamily | null> {
    try {
      const query = 'DELETE FROM gemstone_families WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting gemstone family with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ CUT SHAPES ================

  // Get all cut shapes with optional filtering and pagination
  async getAllCutShapes(filters?: ReferenceDataFilter) {
    try {
      const { page = 1, limit = 20, search, category } = filters || {};
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM cut_shapes WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Add search filter if provided
      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR category ILIKE $${paramIndex} OR sub_category ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }
      
      // Add category filter if provided
      if (category) {
        query += ` AND category = $${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
      }
      
      // Add order by, limit and offset
      query += ' ORDER BY category, name LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
      queryParams.push(limit, offset);
      
      // Execute query
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM cut_shapes WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;
      
      if (search) {
        countQuery += ` AND (name ILIKE $${countParamIndex} OR category ILIKE $${countParamIndex} OR sub_category ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
        countParamIndex++;
      }
      
      if (category) {
        countQuery += ` AND category = $${countParamIndex}`;
        countParams.push(category);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching cut shapes:', error);
      throw error;
    }
  }

  // Get distinct cut shape categories
  async getCutShapeCategories() {
    try {
      const query = 'SELECT DISTINCT category FROM cut_shapes ORDER BY category';
      const result = await pool.query(query);
      return result.rows.map(row => row.category);
    } catch (error) {
      console.error('Error fetching cut shape categories:', error);
      throw error;
    }
  }

  // Get a specific cut shape by ID
  async getCutShapeById(id: number): Promise<CutShape | null> {
    try {
      const query = 'SELECT * FROM cut_shapes WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching cut shape with ID ${id}:`, error);
      throw error;
    }
  }

  // Create a new cut shape
  async createCutShape(cutShapeData: Partial<CutShape>): Promise<CutShape> {
    try {
      const {
        name,
        category,
        sub_category,
        image_url,
        description
      } = cutShapeData;

      const query = `
        INSERT INTO cut_shapes 
        (name, category, sub_category, image_url, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [
        name,
        category,
        sub_category,
        image_url,
        description
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating cut shape:', error);
      throw error;
    }
  }

  // Update an existing cut shape
  async updateCutShape(id: number, cutShapeData: Partial<CutShape>): Promise<CutShape | null> {
    try {
      const {
        name,
        category,
        sub_category,
        image_url,
        description
      } = cutShapeData;

      const query = `
        UPDATE cut_shapes 
        SET name = $1, category = $2, sub_category = $3, image_url = $4, 
            description = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;
      
      const values = [
        name,
        category,
        sub_category,
        image_url,
        description,
        id
      ];

      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating cut shape with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a cut shape
  async deleteCutShape(id: number): Promise<CutShape | null> {
    try {
      const query = 'DELETE FROM cut_shapes WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting cut shape with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ COLORS ================

  // Get all colors with optional filtering and pagination
  async getAllColors(filters?: ReferenceDataFilter) {
    try {
      const { page = 1, limit = 20, search, category } = filters || {};
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM colors WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Add search filter if provided
      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }
      
      // Add category filter if provided
      if (category) {
        query += ` AND category = $${paramIndex}`;
        queryParams.push(category);
        paramIndex++;
      }
      
      // Add order by, limit and offset
      query += ' ORDER BY category, name LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
      queryParams.push(limit, offset);
      
      // Execute query
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM colors WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;
      
      if (search) {
        countQuery += ` AND (name ILIKE $${countParamIndex} OR category ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
        countParamIndex++;
      }
      
      if (category) {
        countQuery += ` AND category = $${countParamIndex}`;
        countParams.push(category);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching colors:', error);
      throw error;
    }
  }

  // Get distinct color categories
  async getColorCategories() {
    try {
      const query = 'SELECT DISTINCT category FROM colors ORDER BY category';
      const result = await pool.query(query);
      return result.rows.map(row => row.category);
    } catch (error) {
      console.error('Error fetching color categories:', error);
      throw error;
    }
  }

  // Get a specific color by ID
  async getColorById(id: number): Promise<Color | null> {
    try {
      const query = 'SELECT * FROM colors WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching color with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ COLOR GRADES ================

  // Get all color grades with optional filtering and pagination
  async getAllColorGrades(filters?: ReferenceDataFilter) {
    try {
      const { page = 1, limit = 20, search } = filters || {};
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM color_grades WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Add search filter if provided
      if (search) {
        query += ` AND (grade ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }
      
      // Add order by, limit and offset
      query += ' ORDER BY quality_percentage DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
      queryParams.push(limit, offset);
      
      // Execute query
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM color_grades WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;
      
      if (search) {
        countQuery += ` AND (grade ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching color grades:', error);
      throw error;
    }
  }

  // Get a specific color grade by ID
  async getColorGradeById(id: number): Promise<ColorGrade | null> {
    try {
      const query = 'SELECT * FROM color_grades WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching color grade with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ CUT GRADES ================

  // Get all cut grades with optional filtering and pagination
  async getAllCutGrades(filters?: ReferenceDataFilter) {
    try {
      const { page = 1, limit = 20, search } = filters || {};
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM cut_grades WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Add search filter if provided
      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }
      
      // Add order by, limit and offset
      query += ' ORDER BY quality_percentage DESC LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
      queryParams.push(limit, offset);
      
      // Execute query
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM cut_grades WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;
      
      if (search) {
        countQuery += ` AND (name ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching cut grades:', error);
      throw error;
    }
  }

  // Get a specific cut grade by ID
  async getCutGradeById(id: number): Promise<CutGrade | null> {
    try {
      const query = 'SELECT * FROM cut_grades WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching cut grade with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ CLARITIES ================

  // Get all clarities with optional filtering and pagination
  async getAllClarities(filters?: ReferenceDataFilter) {
    try {
      const { page = 1, limit = 20, search } = filters || {};
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM clarities WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Add search filter if provided
      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }
      
      // Add order by, limit and offset
      query += ' ORDER BY ranking LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
      queryParams.push(limit, offset);
      
      // Execute query
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM clarities WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;
      
      if (search) {
        countQuery += ` AND (name ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching clarities:', error);
      throw error;
    }
  }

  // Get a specific clarity by ID
  async getClarityById(id: number): Promise<Clarity | null> {
    try {
      const query = 'SELECT * FROM clarities WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching clarity with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ TREATMENTS ================

  // Get all treatments with optional filtering and pagination
  async getAllTreatments(filters?: ReferenceDataFilter) {
    try {
      const { page = 1, limit = 20, search } = filters || {};
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM treatments WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Add search filter if provided
      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }
      
      // Add order by, limit and offset
      query += ' ORDER BY name LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
      queryParams.push(limit, offset);
      
      // Execute query
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM treatments WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;
      
      if (search) {
        countQuery += ` AND (name ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching treatments:', error);
      throw error;
    }
  }

  // Get a specific treatment by ID
  async getTreatmentById(id: number): Promise<Treatment | null> {
    try {
      const query = 'SELECT * FROM treatments WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching treatment with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ MINING LOCATIONS ================

  // Get all mining locations with optional filtering and pagination
  async getAllMiningLocations(filters?: ReferenceDataFilter) {
    try {
      const { page = 1, limit = 20, search, country } = filters || {};
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM mining_locations WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Add search filter if provided
      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR country ILIKE $${paramIndex} OR region ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }
      
      // Add country filter if provided
      if (country) {
        query += ` AND country = $${paramIndex}`;
        queryParams.push(country);
        paramIndex++;
      }
      
      // Add order by, limit and offset
      query += ' ORDER BY country, name LIMIT $' + paramIndex + ' OFFSET $' + (paramIndex + 1);
      queryParams.push(limit, offset);
      
      // Execute query
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM mining_locations WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;
      
      if (search) {
        countQuery += ` AND (name ILIKE $${countParamIndex} OR country ILIKE $${countParamIndex} OR region ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
        countParamIndex++;
      }
      
      if (country) {
        countQuery += ` AND country = ${countParamIndex}`;
        countParams.push(country);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching mining locations:', error);
      throw error;
    }
  }

  // Get distinct mining location countries
  async getMiningLocationCountries() {
    try {
      const query = 'SELECT DISTINCT country FROM mining_locations ORDER BY country';
      const result = await pool.query(query);
      return result.rows.map(row => row.country);
    } catch (error) {
      console.error('Error fetching mining location countries:', error);
      throw error;
    }
  }

  // Get a specific mining location by ID
  async getMiningLocationById(id: number): Promise<MiningLocation | null> {
    try {
      const query = 'SELECT * FROM mining_locations WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching mining location with ID ${id}:`, error);
      throw error;
    }
  }

  // ================ MINING METHODS ================

  // Get all mining methods with optional filtering and pagination
  async getAllMiningMethods(filters?: ReferenceDataFilter) {
    try {
      const { page = 1, limit = 20, search } = filters || {};
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM mining_methods WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      // Add search filter if provided
      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
        queryParams.push(`%${search}%`);
        paramIndex++;
      }
      
      // Add order by, limit and offset
      query += ` ORDER BY name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(limit, offset);
      
      // Execute query
      const result = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM mining_methods WHERE 1=1';
      const countParams: any[] = [];
      let countParamIndex = 1;
      
      if (search) {
        countQuery += ` AND (name ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);
      
      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching mining methods:', error);
      throw error;
    }
  }

  // Get a specific mining method by ID
  async getMiningMethodById(id: number): Promise<MiningMethod | null> {
    try {
      const query = 'SELECT * FROM mining_methods WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching mining method with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new ReferenceDataRepository();