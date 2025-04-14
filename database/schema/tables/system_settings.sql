-- database/schema/tables/system_settings.sql
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    default_value TEXT,
    type VARCHAR(50) NOT NULL, -- text, number, boolean, select
    category VARCHAR(50) NOT NULL, -- general, security, email, etc.
    label VARCHAR(100) NOT NULL,
    description TEXT,
    options TEXT, -- For select type, JSON array of options
    is_public BOOLEAN DEFAULT FALSE, -- Whether the setting is accessible in the public API
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system settings
INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
VALUES
-- General settings
('site_name', 'Gemstone Valuation System', 'Gemstone Valuation System', 'text', 'general', 'Site Name', 'The name of the application', TRUE),
('site_description', 'A system for gemstone valuation and management', 'A system for gemstone valuation and management', 'text', 'general', 'Site Description', 'Brief description of the application', TRUE),
('items_per_page', '20', '20', 'number', 'general', 'Items Per Page', 'Default number of items to display per page', FALSE),
('maintenance_mode', 'false', 'false', 'boolean', 'general', 'Maintenance Mode', 'Put the site in maintenance mode', FALSE),
('maintenance_message', 'The system is currently undergoing maintenance. Please check back later.', 'The system is currently undergoing maintenance. Please check back later.', 'text', 'general', 'Maintenance Message', 'Message to display during maintenance mode', FALSE),

-- Email settings
('email_sender', 'noreply@gemstone-system.com', 'noreply@gemstone-system.com', 'text', 'email', 'Email Sender', 'The email address used to send system emails', FALSE),
('email_sender_name', 'Gemstone System', 'Gemstone System', 'text', 'email', 'Email Sender Name', 'The name displayed as the sender for system emails', FALSE),
('email_verification_required', 'true', 'true', 'boolean', 'email', 'Email Verification Required', 'Whether users must verify their email address after registration', FALSE),

-- Security settings
('min_password_length', '8', '8', 'number', 'security', 'Minimum Password Length', 'Minimum required length for user passwords', FALSE),
('max_login_attempts', '5', '5', 'number', 'security', 'Maximum Login Attempts', 'Number of failed login attempts before account is locked', FALSE),
('password_expiry_days', '90', '90', 'number', 'security', 'Password Expiry Days', 'Number of days after which passwords expire', FALSE),
('session_timeout_minutes', '120', '120', 'number', 'security', 'Session Timeout', 'Number of minutes after which user sessions expire', FALSE),

-- Gemstone settings
('require_verification', 'true', 'true', 'boolean', 'gemstones', 'Require Verification', 'Whether gemstones require admin verification before being published', FALSE),
('max_images_per_gemstone', '10', '10', 'number', 'gemstones', 'Maximum Images Per Gemstone', 'Maximum number of images allowed per gemstone', TRUE),
('allowed_image_types', 'jpg,jpeg,png,webp', 'jpg,jpeg,png,webp', 'text', 'gemstones', 'Allowed Image Types', 'Comma-separated list of allowed image file extensions', TRUE),
('max_image_size_kb', '5000', '5000', 'number', 'gemstones', 'Maximum Image Size (KB)', 'Maximum allowed file size for gemstone images in kilobytes', TRUE);