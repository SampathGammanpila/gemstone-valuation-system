import pool from '../../config/database';

// Reference data repository class for handling database operations
export class ReferenceDataRepository {
  // Get all gemstone families
  async getAllGemstoneFamilies() {
    try {
      const query = 'SELECT * FROM gemstone_families ORDER BY name';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching gemstone families:', error);
      throw error;
    }
  }

  // Get a specific gemstone family by ID
  async getGemstoneFamilyById(id: number) {
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
  async createGemstoneFamily(familyData: any) {
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
  async updateGemstoneFamily(id: number, familyData: any) {
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
  async deleteGemstoneFamily(id: number) {
    try {
      const query = 'DELETE FROM gemstone_families WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error deleting gemstone family with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new ReferenceDataRepository();