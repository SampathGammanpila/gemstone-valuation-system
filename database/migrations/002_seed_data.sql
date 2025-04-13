-- Insert roles
INSERT INTO roles (name, description) VALUES
('user', 'Regular user with basic permissions'),
('admin', 'Administrator with full access');

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role_id, is_verified)
VALUES ('admin', 'admin@example.com', '$2b$10$rCkt1zQXD1MPLSYJrqZ9d.4vIBTJKUgdQwDKBLXPtmdv1S1UQqFT.', 2, true);

-- Insert sample gemstone families
INSERT INTO gemstone_families (name, category, mineral_group, hardness_min, hardness_max, rarity_level, value_category) 
VALUES 
('Ruby', 'Oxide Minerals', 'Corundum', 9.0, 9.0, 'Rare', 'Precious'),
('Sapphire', 'Oxide Minerals', 'Corundum', 9.0, 9.0, 'Rare', 'Precious'),
('Emerald', 'Silicate Minerals', 'Beryl', 7.5, 8.0, 'Rare', 'Precious'),
('Diamond', 'Native Elements', 'Carbon', 10.0, 10.0, 'Rare', 'Precious'),
('Amethyst', 'Silicate Minerals', 'Quartz', 7.0, 7.0, 'Common', 'Semi-Precious');

-- Insert sample cut shapes
INSERT INTO cut_shapes (name, category, sub_category) 
VALUES 
('Round Brilliant', 'Faceted Cuts', 'Classic Cuts'),
('Emerald Cut', 'Faceted Cuts', 'Step Cuts'),
('Princess Cut', 'Faceted Cuts', 'Mixed Cuts'),
('Oval Cut', 'Faceted Cuts', 'Classic Cuts'),
('Standard Cabochon', 'Non-Faceted Cuts', 'Cabochon');

-- Insert color grades
INSERT INTO color_grades (grade, description, quality_percentage)
VALUES 
('AAA', 'Exceptional color quality', 95),
('AA', 'Excellent color quality', 85),
('A', 'Good color quality', 75),
('B', 'Fair color quality', 65);

-- Insert cut grades
INSERT INTO cut_grades (name, description, quality_percentage)
VALUES 
('Excellent', 'Perfect proportions and finish', 95),
('Very Good', 'Minor deviations from ideal', 85),
('Good', 'Noticeable deviations but still attractive', 75),
('Fair', 'Visible deviations affecting appearance', 65),
('Poor', 'Significant deviations affecting brilliance', 50);

-- Insert clarities
INSERT INTO clarities (name, description, ranking)
VALUES 
('Loupe Clean', 'No inclusions visible under 10x magnification', 1),
('Eye Clean', 'No inclusions visible to the naked eye', 2),
('Slight', 'Minor inclusions visible to the naked eye', 3),
('Moderate', 'Noticeable inclusions visible to the naked eye', 4),
('Heavy', 'Prominent inclusions visible to the naked eye', 5);

-- Insert treatments
INSERT INTO treatments (name, description, impact_on_value)
VALUES 
('None', 'No treatments applied', 'Highest value'),
('Heat Treatment', 'Heat applied to enhance color or clarity', 'Moderate decrease'),
('Oiling', 'Oil or resin used to fill fractures', 'Significant decrease'),
('Irradiation', 'Radiation exposure to alter color', 'Moderate decrease');
