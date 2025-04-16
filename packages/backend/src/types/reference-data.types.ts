// Type definitions for reference data

export interface GemstoneFamily {
    id: number;
    name: string;
    category: string;
    mineral_group: string | null;
    chemical_formula: string | null;
    hardness_min: number | null;
    hardness_max: number | null;
    rarity_level: string | null;
    value_category: string | null;
    description: string | null;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface CutShape {
    id: number;
    name: string;
    category: string; // Faceted, Cabochon, Fantasy, etc.
    sub_category: string | null; // Classic, Step, Mixed, etc.
    image_url: string | null;
    description: string | null;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface Color {
    id: number;
    name: string;
    category: string; // Red, Blue, Green, etc.
    hex_code: string;
    rgb_values: number[]; // [R, G, B]
    munsell_hue: string | null;
    munsell_value: number | null;
    munsell_chroma: number | null;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface ColorGrade {
    id: number;
    grade: string; // AAA, AA, A, etc.
    description: string | null;
    quality_percentage: number | null;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface CutGrade {
    id: number;
    name: string; // Excellent, Very Good, Good, etc.
    description: string | null;
    quality_percentage: number | null;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface Clarity {
    id: number;
    name: string; // Loupe Clean, Eye Clean, Slightly Included, etc.
    description: string | null;
    ranking: number; // For sorting
    created_at: Date;
    updated_at: Date;
  }
  
  export interface Treatment {
    id: number;
    name: string; // None, Heat, Oiling, etc.
    description: string | null;
    impact_on_value: string | null;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface ClarityCharacteristic {
    id: number;
    name: string; // Included Crystal, Negative Crystal, etc.
    description: string | null;
    image_url: string | null;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface Blemish {
    id: number;
    name: string; // Abrasion, Nick, Pit, Scratch
    description: string | null;
    image_url: string | null;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface MiningLocation {
    id: number;
    name: string;
    country: string;
    region: string | null;
    coordinates: [number, number] | null; // [longitude, latitude]
    description: string | null;
    created_at: Date;
    updated_at: Date;
  }
  
  export interface MiningMethod {
    id: number;
    name: string;
    description: string | null;
    environmental_impact: string | null;
    created_at: Date;
    updated_at: Date;
  }
  
  // Repository function parameter types
  export interface ReferenceDataFilter {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    country?: string; // For mining locations
    ranking?: number; // For clarity grades
  }
  
  // API response types
  export interface ReferenceDataResponse<T> {
    success: boolean;
    data: T;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }