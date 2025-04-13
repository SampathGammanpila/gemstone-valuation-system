CREATE TABLE clarity_characteristics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- Included Crystal, Negative Crystal, etc.
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);