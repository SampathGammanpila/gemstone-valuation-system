CREATE TABLE cut_grades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL, -- Excellent, Very Good, Good, etc.
    description TEXT,
    quality_percentage INTEGER, -- 90-100%, 80-89%, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);