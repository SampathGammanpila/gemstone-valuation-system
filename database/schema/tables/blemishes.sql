CREATE TABLE blemishes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- Abrasion, Nick, Pit, Scratch
    description TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);