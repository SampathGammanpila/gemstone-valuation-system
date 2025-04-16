// packages/backend/src/services/valuation.service.ts
import pool from '../config/database';
import referenceDataRepository from '../db/repositories/referenceData.repository';
import gemstoneRepository from '../db/repositories/gemstone.repository';
import { GemstoneInput, GemstoneValuationResult } from '../types/gemstone.types';

class ValuationService {
  /**
   * Calculate estimated value based on gemstone properties
   */
  async calculateEstimatedValue(gemstoneData: GemstoneInput): Promise<number> {
    try {
      // Get base value from gemstone family
      const gemstoneFamily = await referenceDataRepository.getGemstoneFamilyById(gemstoneData.gemstone_family_id);
      if (!gemstoneFamily) {
        throw new Error('Gemstone family not found');
      }

      // Get relevant quality factors
      const colorGrade = await this.getColorGradeById(gemstoneData.color_grade_id);
      const clarity = await this.getClarityById(gemstoneData.clarity_id);
      const cutGrade = await this.getCutGradeById(gemstoneData.cut_grade_id);

      // Base value adjusted for weight
      let baseValue = 0;
      
      // Determine value category and set base value per carat
      switch (gemstoneFamily.value_category?.toLowerCase()) {
        case 'precious':
          baseValue = 1000; // Base value for precious gemstones
          break;
        case 'semi-precious':
          baseValue = 200; // Base value for semi-precious gemstones
          break;
        case 'ornamental':
          baseValue = 50; // Base value for ornamental gemstones
          break;
        default:
          baseValue = 100; // Default base value
      }

      // Adjust base value based on rarity level
      const rarityMultiplier = this.getRarityMultiplier(gemstoneFamily.rarity_level);
      baseValue *= rarityMultiplier;

      // Value adjusted by gemstone weight
      let value = baseValue * (gemstoneData.carat_weight || 1);

      // Apply quality factor multipliers
      const colorQualityMultiplier = this.getColorQualityMultiplier(colorGrade?.quality_percentage || 80);
      const clarityMultiplier = this.getClarityMultiplier(clarity?.ranking || 3);
      const cutQualityMultiplier = this.getCutQualityMultiplier(cutGrade?.quality_percentage || 80);
      
      value *= colorQualityMultiplier;
      value *= clarityMultiplier;
      value *= cutQualityMultiplier;

      // Adjust value based on treatments (treated gemstones are less valuable)
      if (gemstoneData.treatment_id) {
        const treatment = await this.getTreatmentById(gemstoneData.treatment_id);
        if (treatment && treatment.name.toLowerCase() !== 'none') {
          value *= 0.8; // 20% reduction for treated gemstones
        }
      }

      // Round to 2 decimal places
      return Math.round(value * 100) / 100;
    } catch (error) {
      console.error('Error calculating estimated value:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive valuation results including quality ratings
   */
  async getValuationResults(gemstoneData: GemstoneInput): Promise<GemstoneValuationResult> {
    try {
      // Calculate estimated value
      const estimatedValue = await this.calculateEstimatedValue(gemstoneData);

      // Calculate overall quality grade
      const overallQuality = await this.calculateOverallQuality(gemstoneData);

      // Get investment potential rating
      const investmentPotential = await this.calculateInvestmentPotential(gemstoneData);

      // Get rarity assessment
      const rarityAssessment = await this.calculateRarityAssessment(gemstoneData);

      // Compile valuation results
      const valuationResult: GemstoneValuationResult = {
        gemstone_id: gemstoneData.id,
        estimated_value: estimatedValue,
        currency: 'USD',
        valuation_date: new Date(),
        quality_rating: {
          overall: overallQuality,
          color: this.mapPercentageToRating(gemstoneData.color_grade_id),
          clarity: this.calculateClarityRating(gemstoneData.clarity_id),
          cut: this.mapPercentageToRating(gemstoneData.cut_grade_id)
        },
        investment_potential: investmentPotential,
        rarity_assessment: rarityAssessment,
        valuation_notes: this.generateValuationNotes(gemstoneData, estimatedValue)
      };

      return valuationResult;
    } catch (error) {
      console.error('Error getting valuation results:', error);
      throw error;
    }
  }

  /**
   * Save valuation results to database
   */
  async saveValuationResults(gemstoneId: number, valuationResult: GemstoneValuationResult): Promise<void> {
    try {
      // Check if valuation already exists
      const existingValuation = await this.getValuationByGemstoneId(gemstoneId);

      if (existingValuation) {
        // Update existing valuation
        await pool.query(
          `UPDATE gemstone_valuations 
           SET estimated_value = $1, 
               currency = $2, 
               valuation_date = $3, 
               quality_rating = $4, 
               investment_potential = $5, 
               rarity_assessment = $6, 
               valuation_notes = $7,
               updated_at = CURRENT_TIMESTAMP
           WHERE gemstone_id = $8`,
          [
            valuationResult.estimated_value,
            valuationResult.currency,
            valuationResult.valuation_date,
            JSON.stringify(valuationResult.quality_rating),
            valuationResult.investment_potential,
            valuationResult.rarity_assessment,
            valuationResult.valuation_notes,
            gemstoneId
          ]
        );
      } else {
        // Create new valuation
        await pool.query(
          `INSERT INTO gemstone_valuations (
             gemstone_id, 
             estimated_value, 
             currency, 
             valuation_date, 
             quality_rating, 
             investment_potential, 
             rarity_assessment, 
             valuation_notes
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            gemstoneId,
            valuationResult.estimated_value,
            valuationResult.currency,
            valuationResult.valuation_date,
            JSON.stringify(valuationResult.quality_rating),
            valuationResult.investment_potential,
            valuationResult.rarity_assessment,
            valuationResult.valuation_notes
          ]
        );
      }

      // Update gemstone with estimated value
      await pool.query(
        `UPDATE gemstones SET estimated_value = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [valuationResult.estimated_value, gemstoneId]
      );
    } catch (error) {
      console.error('Error saving valuation results:', error);
      throw error;
    }
  }

  /**
   * Get valuation by gemstone ID
   */
  async getValuationByGemstoneId(gemstoneId: number): Promise<GemstoneValuationResult | null> {
    try {
      const result = await pool.query(
        `SELECT * FROM gemstone_valuations WHERE gemstone_id = $1`,
        [gemstoneId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const valuation = result.rows[0];
      
      return {
        gemstone_id: valuation.gemstone_id,
        estimated_value: valuation.estimated_value,
        currency: valuation.currency,
        valuation_date: valuation.valuation_date,
        quality_rating: valuation.quality_rating,
        investment_potential: valuation.investment_potential,
        rarity_assessment: valuation.rarity_assessment,
        valuation_notes: valuation.valuation_notes
      };
    } catch (error) {
      console.error('Error getting valuation by gemstone ID:', error);
      throw error;
    }
  }

  /**
   * Get market comparison data for similar gemstones
   */
  async getMarketComparisonData(gemstoneData: GemstoneInput): Promise<any[]> {
    try {
      // Query database for similar gemstones based on family, weight, color, etc.
      const result = await pool.query(
        `SELECT g.id, g.title, g.carat_weight, g.estimated_value, g.created_at,
                gf.name as family_name, c.name as color_name
         FROM gemstones g
         JOIN gemstone_families gf ON g.gemstone_family_id = gf.id
         JOIN colors c ON g.color_id = c.id
         WHERE g.gemstone_family_id = $1 
         AND g.status = 'published'
         AND g.is_verified = true
         AND g.id != $2
         AND g.carat_weight BETWEEN $3 * 0.7 AND $3 * 1.3
         LIMIT 5`,
        [
          gemstoneData.gemstone_family_id,
          gemstoneData.id || 0,
          gemstoneData.carat_weight || 1
        ]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting market comparison data:', error);
      throw error;
    }
  }

  // Helper methods

  private async getColorGradeById(id: number) {
    const result = await pool.query('SELECT * FROM color_grades WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  private async getClarityById(id: number) {
    const result = await pool.query('SELECT * FROM clarities WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  private async getCutGradeById(id: number) {
    const result = await pool.query('SELECT * FROM cut_grades WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  private async getTreatmentById(id: number) {
    const result = await pool.query('SELECT * FROM treatments WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  private getRarityMultiplier(rarityLevel: string | null): number {
    switch (rarityLevel?.toLowerCase()) {
      case 'extremely rare':
        return 5.0;
      case 'very rare':
        return 3.0;
      case 'rare':
        return 2.0;
      case 'uncommon':
        return 1.5;
      case 'common':
        return 1.0;
      default:
        return 1.0;
    }
  }

  private getColorQualityMultiplier(qualityPercentage: number): number {
    // Convert percentage to multiplier (80% quality = 0.8 multiplier)
    return qualityPercentage / 100;
  }

  private getClarityMultiplier(clarityRanking: number): number {
    // Lower ranking is better clarity (1 is best, 5 is worst)
    switch (clarityRanking) {
      case 1: // Flawless
        return 2.0;
      case 2: // VVS (Very Very Slightly Included)
        return 1.5;
      case 3: // VS (Very Slightly Included)
        return 1.3;
      case 4: // SI (Slightly Included)
        return 1.0;
      case 5: // I (Included)
        return 0.7;
      default:
        return 1.0;
    }
  }

  private getCutQualityMultiplier(qualityPercentage: number): number {
    // Convert percentage to multiplier (80% quality = 0.8 multiplier)
    return qualityPercentage / 100;
  }

  private async calculateOverallQuality(gemstoneData: GemstoneInput): Promise<number> {
    try {
      // Get quality factors
      const colorGrade = await this.getColorGradeById(gemstoneData.color_grade_id);
      const clarity = await this.getClarityById(gemstoneData.clarity_id);
      const cutGrade = await this.getCutGradeById(gemstoneData.cut_grade_id);

      // Calculate weighted average of quality factors
      const colorQuality = colorGrade?.quality_percentage || 80;
      const clarityQuality = this.mapClarityRankingToPercentage(clarity?.ranking || 3);
      const cutQuality = cutGrade?.quality_percentage || 80;

      // Weights for different factors
      const colorWeight = 0.4;
      const clarityWeight = 0.3;
      const cutWeight = 0.3;

      // Calculate weighted average
      const overallQuality = 
        (colorQuality * colorWeight) +
        (clarityQuality * clarityWeight) +
        (cutQuality * cutWeight);

      return Math.round(overallQuality);
    } catch (error) {
      console.error('Error calculating overall quality:', error);
      throw error;
    }
  }

  private mapClarityRankingToPercentage(ranking: number): number {
    // Convert clarity ranking to percentage (1 is best = 100%, 5 is worst = 60%)
    const maxRanking = 5;
    const minPercentage = 60;
    const maxPercentage = 100;

    return maxPercentage - ((ranking - 1) / (maxRanking - 1)) * (maxPercentage - minPercentage);
  }

  private mapPercentageToRating(gradeId: number): string {
    // Map percentage to rating (A, B, C, D, F)
    // This is just a placeholder implementation
    return 'B+';
  }

  private calculateClarityRating(clarityId: number): string {
    // This is just a placeholder implementation
    return 'VS';
  }

  private async calculateInvestmentPotential(gemstoneData: GemstoneInput): Promise<string> {
    try {
      // Get gemstone family for rarity assessment
      const gemstoneFamily = await referenceDataRepository.getGemstoneFamilyById(gemstoneData.gemstone_family_id);
      
      // Placeholder logic for investment potential
      if (gemstoneFamily?.rarity_level?.toLowerCase() === 'extremely rare' || 
          gemstoneFamily?.rarity_level?.toLowerCase() === 'very rare') {
        return 'High';
      } else if (gemstoneFamily?.rarity_level?.toLowerCase() === 'rare') {
        return 'Medium';
      } else {
        return 'Low';
      }
    } catch (error) {
      console.error('Error calculating investment potential:', error);
      throw error;
    }
  }

  private async calculateRarityAssessment(gemstoneData: GemstoneInput): Promise<string> {
    try {
      // Get gemstone family for rarity assessment
      const gemstoneFamily = await referenceDataRepository.getGemstoneFamilyById(gemstoneData.gemstone_family_id);
      
      return gemstoneFamily?.rarity_level || 'Unknown';
    } catch (error) {
      console.error('Error calculating rarity assessment:', error);
      throw error;
    }
  }

  private generateValuationNotes(gemstoneData: GemstoneInput, estimatedValue: number): string {
    // Placeholder for generating valuation notes
    let notes = `Estimated value: $${estimatedValue.toFixed(2)} USD\n`;
    notes += `Valuation based on gemstone properties including family, weight, color, clarity, and cut quality.\n`;
    
    if (gemstoneData.special_notes) {
      notes += `\nSpecial notes: ${gemstoneData.special_notes}`;
    }
    
    return notes;
  }
}

export default new ValuationService();