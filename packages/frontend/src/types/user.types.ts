// Frontend user types

export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
    role: string;
    isVerified: boolean;
    createdAt: string;
    lastLogin: string | null;
  }
  
  export interface CutterProfileType {
    id?: number;
    user_id?: number;
    specialty: string | null;
    experience_years: number | null;
    certification: string[] | null;
    portfolio_images?: string[] | null;
    bio: string | null;
    workshop_location: string | null;
    available_for_custom_work: boolean;
    expertise_level: 'Beginner' | 'Intermediate' | 'Expert' | 'Master' | null;
    tools_used?: string | null;
    portfolio_verified?: boolean;
    skills?: CutterSkill[];
    portfolioItems?: PortfolioItem[];
  }
  
  export interface DealerProfileType {
    id?: number;
    user_id?: number;
    company_name: string | null;
    business_license: string | null;
    specialty_types: string[] | null;
    years_in_business: number | null;
    trade_shows_attended?: string[] | null;
    regions_served?: string[] | null;
  }
  
  export interface AppraiserProfileType {
    id?: number;
    user_id?: number;
    certification_authority: string | null;
    certification_number: string | null;
    specialization: string[] | null;
    years_experience: number | null;
    appraisal_count: number;
  }
  
  export interface CutterSkill {
    skill_id: number;
    name: string;
    description: string | null;
    proficiency_level: number;
  }
  
  export interface PortfolioItem {
    id?: number;
    cutter_profile_id?: number;
    title: string;
    description: string | null;
    gemstone_type: string;
    cut_type: string;
    image_urls: string[];
    created_at?: string;
    updated_at?: string;
  }
  
  export interface SkillType {
    id: number;
    name: string;
    description: string | null;
  }
  
  export interface ProfileUpdateInput {
    firstName?: string | null;
    lastName?: string | null;
    profileImage?: string | null;
    cutterProfile?: Partial<CutterProfileType>;
    dealerProfile?: Partial<DealerProfileType>;
    appraiserProfile?: Partial<AppraiserProfileType>;
  }
  
  export interface PasswordChangeInput {
    currentPassword: string;
    newPassword: string;
  }
  
  export interface LoginInput {
    email: string;
    password: string;
  }
  
  export interface RegisterInput {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: 'collector' | 'dealer' | 'cutter' | 'appraiser';
    cutterProfile?: Partial<CutterProfileType>;
    dealerProfile?: Partial<DealerProfileType>;
    appraiserProfile?: Partial<AppraiserProfileType>;
  }
  
  export interface PasswordResetRequestInput {
    email: string;
  }
  
  export interface PasswordResetInput {
    token: string;
    password: string;
  }
  
  export interface EmailVerificationInput {
    token: string;
  }
  
  export interface UserProfileResponse {
    user: User;
    profile: CutterProfileType | DealerProfileType | AppraiserProfileType | null;
  }
  
  export interface CutterListItem {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
    specialty: string | null;
    experienceYears: number | null;
    expertise: string | null;
    workshopLocation: string | null;
    availableForCustomWork: boolean;
    portfolioVerified: boolean;
  }
  
  export interface CutterDetailResponse {
    id: number;
    username: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
    profile: {
      specialty: string | null;
      experienceYears: number | null;
      certifications: string[] | null;
      bio: string | null;
      workshopLocation: string | null;
      expertiseLevel: string | null;
      availableForCustomWork: boolean;
      portfolioVerified: boolean;
      toolsUsed: string | null;
    };
    skills: CutterSkill[];
    portfolio: PortfolioItem[];
  }