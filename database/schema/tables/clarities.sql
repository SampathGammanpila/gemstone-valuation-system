CREATE TABLE clarities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL, -- Loupe Clean, Eye Clean, Slightly Included, etc.
    description TEXT,
    ranking INTEGER, -- Numerical ranking for sorting
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);