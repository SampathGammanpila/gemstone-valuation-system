CREATE TABLE colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(30) NOT NULL, -- Red, Blue, Green, etc.
    hex_code VARCHAR(7) NOT NULL,
    rgb_values INTEGER[3] NOT NULL, -- [R, G, B]
    munsell_hue VARCHAR(10),
    munsell_value DECIMAL(3,1),
    munsell_chroma DECIMAL(3,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_colors_category ON colors(category);
CREATE INDEX idx_colors_munsell_hue ON colors(munsell_hue);