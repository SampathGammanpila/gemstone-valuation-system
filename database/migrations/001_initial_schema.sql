-- Create tables for the gemstone valuation system

-- Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    profile_image_url VARCHAR(255),
    role_id INTEGER REFERENCES roles(id),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100),
    reset_token VARCHAR(100),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Gemstone Families Table
CREATE TABLE gemstone_families (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    mineral_group VARCHAR(100),
    chemical_formula VARCHAR(100),
    hardness_min DECIMAL(3,1),
    hardness_max DECIMAL(3,1),
    rarity_level VARCHAR(20),
    value_category VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cut Shapes Table
CREATE TABLE cut_shapes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(30) NOT NULL,
    sub_category VARCHAR(30),
    image_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Colors Table
CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(30) NOT NULL,
    hex_code VARCHAR(7) NOT NULL,
    rgb_values INTEGER[3] NOT NULL,
    munsell_hue VARCHAR(10),
    munsell_value DECIMAL(3,1),
    munsell_chroma DECIMAL(3,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Color Grades Table
CREATE TABLE color_grades (
    id SERIAL PRIMARY KEY,
    grade VARCHAR(3) NOT NULL,
    description TEXT,
    quality_percentage INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cut Grades Table
CREATE TABLE cut_grades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    description TEXT,
    quality_percentage INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clarities Table
CREATE TABLE clarities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    description TEXT,
    ranking INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Treatments Table
CREATE TABLE treatments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    impact_on_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clarity Characteristics Table
CREATE TABLE clarity_characteristics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blemishes Table
CREATE TABLE blemishes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mining Locations Table
CREATE TABLE mining_locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mining Methods Table
CREATE TABLE mining_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gemstones Table
CREATE TABLE gemstones (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    title VARCHAR(100) NOT NULL,
    gemstone_family_id INTEGER REFERENCES gemstone_families(id) NOT NULL,
    cut_shape_id INTEGER REFERENCES cut_shapes(id) NOT NULL,
    color_id INTEGER REFERENCES colors(id) NOT NULL,
    color_grade_id INTEGER REFERENCES color_grades(id) NOT NULL,
    cut_grade_id INTEGER REFERENCES cut_grades(id) NOT NULL,
    clarity_id INTEGER REFERENCES clarities(id) NOT NULL,
    treatment_id INTEGER REFERENCES treatments(id),
    clarity_characteristics_ids INTEGER[],
    blemish_ids INTEGER[],
    width_mm DECIMAL(10,2),
    height_mm DECIMAL(10,2),
    depth_mm DECIMAL(10,2),
    carat_weight DECIMAL(10,3),
    piece_count INTEGER DEFAULT 1,
    mining_method_id INTEGER REFERENCES mining_methods(id),
    mining_location_id INTEGER REFERENCES mining_locations(id),
    special_notes TEXT,
    image_urls TEXT[],
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'private', 'sold')),
    estimated_value DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INTEGER REFERENCES users(id),
    verification_date TIMESTAMP
);

-- Ownership Transfers Table
CREATE TABLE ownership_transfers (
    id SERIAL PRIMARY KEY,
    gemstone_id INTEGER REFERENCES gemstones(id) NOT NULL,
    from_user_id INTEGER REFERENCES users(id) NOT NULL,
    to_user_id INTEGER REFERENCES users(id) NOT NULL,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price DECIMAL(12,2),
    transaction_id VARCHAR(100),
    transaction_type VARCHAR(20),
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'cancelled', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
