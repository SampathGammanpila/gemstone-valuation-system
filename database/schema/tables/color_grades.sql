CREATE TABLE color_grades (
    id SERIAL PRIMARY KEY,
    grade VARCHAR(3) NOT NULL, -- AAA, AA, A, etc.
    description TEXT,
    quality_percentage INTEGER, -- 90-100%, 80-89%, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);