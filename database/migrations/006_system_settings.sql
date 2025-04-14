-- database/migrations/006_system_settings.sql

-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
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

-- Insert default system settings if they don't exist
INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'site_name', 'Gemstone Valuation System', 'Gemstone Valuation System', 'text', 'general', 'Site Name', 'The name of the application', TRUE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'site_name');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'site_description', 'A system for gemstone valuation and management', 'A system for gemstone valuation and management', 'text', 'general', 'Site Description', 'Brief description of the application', TRUE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'site_description');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'items_per_page', '20', '20', 'number', 'general', 'Items Per Page', 'Default number of items to display per page', FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'items_per_page');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'maintenance_mode', 'false', 'false', 'boolean', 'general', 'Maintenance Mode', 'Put the site in maintenance mode', FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'maintenance_mode');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'maintenance_message', 'The system is currently undergoing maintenance. Please check back later.', 'The system is currently undergoing maintenance. Please check back later.', 'text', 'general', 'Maintenance Message', 'Message to display during maintenance mode', FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'maintenance_message');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'email_sender', 'noreply@gemstone-system.com', 'noreply@gemstone-system.com', 'text', 'email', 'Email Sender', 'The email address used to send system emails', FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'email_sender');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'email_sender_name', 'Gemstone System', 'Gemstone System', 'text', 'email', 'Email Sender Name', 'The name displayed as the sender for system emails', FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'email_sender_name');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'email_verification_required', 'true', 'true', 'boolean', 'email', 'Email Verification Required', 'Whether users must verify their email address after registration', FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'email_verification_required');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'min_password_length', '8', '8', 'number', 'security', 'Minimum Password Length', 'Minimum required length for user passwords', FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'min_password_length');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'max_login_attempts', '5', '5', 'number', 'security', 'Maximum Login Attempts', 'Number of failed login attempts before account is locked', FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'max_login_attempts');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'password_expiry_days', '90', '90', 'number', 'security', 'Password Expiry Days', 'Number of days after which passwords expire', FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'password_expiry_days');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'session_timeout_minutes', '120', '120', 'number', 'security', 'Session Timeout', 'Number of minutes after which user sessions expire', FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'session_timeout_minutes');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'require_verification', 'true', 'true', 'boolean', 'gemstones', 'Require Verification', 'Whether gemstones require admin verification before being published', FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'require_verification');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'max_images_per_gemstone', '10', '10', 'number', 'gemstones', 'Maximum Images Per Gemstone', 'Maximum number of images allowed per gemstone', TRUE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'max_images_per_gemstone');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'allowed_image_types', 'jpg,jpeg,png,webp', 'jpg,jpeg,png,webp', 'text', 'gemstones', 'Allowed Image Types', 'Comma-separated list of allowed image file extensions', TRUE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'allowed_image_types');

INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
SELECT 'max_image_size_kb', '5000', '5000', 'number', 'gemstones', 'Maximum Image Size (KB)', 'Maximum allowed file size for gemstone images in kilobytes', TRUE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE key = 'max_image_size_kb');