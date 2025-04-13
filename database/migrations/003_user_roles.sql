-- Add additional roles for the system
INSERT INTO roles (name, description) 
VALUES 
('collector', 'End users who collect gemstones'),
('dealer', 'Professional gemstone dealers'),
('cutter', 'Professional gemstone cutters with specialized skills'),
('appraiser', 'Professionals who can verify and officially appraise gemstones');

-- Create cutter_profiles table for storing specific cutter information
CREATE TABLE cutter_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    specialty VARCHAR(100), -- What types of gemstones or cuts they specialize in
    experience_years INTEGER,
    certification TEXT[],
    portfolio_images TEXT[],
    bio TEXT,
    workshop_location VARCHAR(255),
    available_for_custom_work BOOLEAN DEFAULT TRUE,
    expertise_level VARCHAR(50), -- Beginner, Intermediate, Expert, Master
    tools_used TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create dealer_profiles table for storing specific dealer information
CREATE TABLE dealer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    company_name VARCHAR(100),
    business_license VARCHAR(100),
    specialty_types TEXT[],
    years_in_business INTEGER,
    trade_shows_attended TEXT[],
    regions_served TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appraiser_profiles table
CREATE TABLE appraiser_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    certification_authority VARCHAR(100),
    certification_number VARCHAR(100),
    specialization TEXT[],
    years_experience INTEGER,
    appraisal_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add skills table for cutter profiles
CREATE TABLE cutting_skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for cutter skills
CREATE TABLE cutter_skills (
    cutter_profile_id INTEGER REFERENCES cutter_profiles(id),
    skill_id INTEGER REFERENCES cutting_skills(id),
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    PRIMARY KEY (cutter_profile_id, skill_id)
);

-- Table for cutter portfolio items
CREATE TABLE cutter_portfolio_items (
    id SERIAL PRIMARY KEY,
    cutter_profile_id INTEGER REFERENCES cutter_profiles(id),
    title VARCHAR(100),
    description TEXT,
    gemstone_type VARCHAR(100),
    cut_type VARCHAR(100),
    image_urls TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add portfolio_verified field to cutter_profiles
ALTER TABLE cutter_profiles 
ADD COLUMN portfolio_verified BOOLEAN DEFAULT FALSE;

-- Insert some basic cutting skills
INSERT INTO cutting_skills (name, description) VALUES
('Faceting', 'The art of cutting flat faces on a gemstone'),
('Cabochon Cutting', 'Creating smooth, rounded surfaces without facets'),
('Fantasy Cutting', 'Creating unique, artistic cuts with unusual shapes'),
('Carving', 'Hand-carving intricate designs into gemstones'),
('Concave Faceting', 'Creating concave instead of flat facets'),
('Brilliant Cutting', 'Creating cuts that maximize light return and brilliance'),
('Step Cutting', 'Creating rectangular facets arranged in steps');