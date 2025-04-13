CREATE TABLE treatments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- None, Heat, Oiling, etc.
    description TEXT,
    impact_on_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);