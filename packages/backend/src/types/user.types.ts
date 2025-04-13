// User related types

export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    first_name: string | null;
    last_name: string | null;
    profile_image_url: string | null;
    role_id: number;
    role_name?: string;
    is_verified: boolean;
    verification_token: string | null;
    reset_token: string | null;
    reset_token_expires: Date | null;
    created_at: Date;
    updated_at: Date;
    last_login: Date | null;
  }
  
  export interface CutterProfile {
    id?: number;
    user_id?: number;
    specialty: string | null;
    experienceYears: number | null; // Changed from experience_years
    certification: string[] | null;
    portfolioImages?: string[] | null; // Changed from portfolio_images
    bio: string | null;
    workshopLocation: string | null; // Changed from workshop_location
    availableForCustomWork: boolean; // Changed from available_for_custom_work
    expertiseLevel: 'Beginner' | 'Intermediate' | 'Expert' | 'Master' | null; // Changed from expertise_level
    toolsUsed?: string | null; // Changed from tools_used
    portfolioVerified?: boolean; // Changed from portfolio_verified
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface DealerProfile {
    id?: number;
    user_id?: number;
    companyName: string | null; // Changed from company_name
    businessLicense: string | null; // Changed from business_license
    specialtyTypes: string[] | null; // Changed from specialty_types
    yearsInBusiness: number | null; // Changed from years_in_business
    tradeShowsAttended?: string[] | null; // Changed from trade_shows_attended
    regionsServed?: string[] | null; // Changed from regions_served
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface AppraiserProfile {
    id?: number;
    user_id?: number;
    certification_authority: string | null;
    certification_number: string | null;
    specialization: string[] | null;
    years_experience: number | null;
    appraisal_count: number;
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface CutterPortfolioItem {
    id?: number;
    cutter_profile_id: number;
    title: string;
    description: string | null;
    gemstone_type: string;
    cut_type: string;
    image_urls: string[];
    created_at?: Date;
    updated_at?: Date;
  }
  
  export interface UserCreateInput {
    username: string;
    email: string;
    password: string;
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
    role?: 'user' | 'admin' | 'collector' | 'dealer' | 'cutter' | 'appraiser';
    isVerified?: boolean;
    verificationToken?: string | null;
    cutterProfile?: CutterProfile | null;
    dealerProfile?: DealerProfile | null;
    appraiserProfile?: AppraiserProfile | null;
  }
  
  export interface UserUpdateInput {
    username?: string;
    email?: string;
    password?: string;
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
    role?: 'user' | 'admin' | 'collector' | 'dealer' | 'cutter' | 'appraiser';
    isVerified?: boolean;
    verificationToken?: string | null;
    resetToken?: string | null;
    resetTokenExpires?: Date | null;
    cutterProfile?: CutterProfile | null;
    dealerProfile?: DealerProfile | null;
    appraiserProfile?: AppraiserProfile | null;
  }
  
  export interface LoginCredentials {
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
    cutterProfile?: CutterProfile;
    dealerProfile?: DealerProfile;
    appraiserProfile?: AppraiserProfile;
  }
  
  export interface PasswordResetInput {
    token: string;
    password: string;
  }
  
  export interface EmailVerificationInput {
    token: string;
  }
  
  export interface ForgotPasswordInput {
    email: string;
  }
  
  export interface UserWithProfile extends User {
    cutterProfile?: CutterProfile;
    dealerProfile?: DealerProfile;
    appraiserProfile?: AppraiserProfile;
  }