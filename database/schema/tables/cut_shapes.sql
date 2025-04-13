CREATE TABLE cut_shapes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(30) NOT NULL, -- Faceted, Cabochon, Fantasy, etc.
    sub_category VARCHAR(30), -- Classic, Step, Mixed, etc.
    image_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_cut_shapes_category ON cut_shapes(category);