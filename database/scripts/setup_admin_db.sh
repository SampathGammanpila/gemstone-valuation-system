#!/bin/bash

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-vikum5723}
DB_NAME=${DB_NAME:-gemstone_valuation}

# Create database if it doesn't exist
echo "Creating database $DB_NAME if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME"

# Apply core schema migrations
echo "Applying core schema migrations..."
for migration in ../migrations/00*.sql; do
    echo "Applying migration: $migration"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migration
done

# Create admin-specific tables
echo "Creating admin-specific tables..."

# Create system_settings table if it doesn't exist
echo "Creating system_settings table..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    default_value TEXT,
    type VARCHAR(50) NOT NULL, 
    category VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    description TEXT,
    options TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# Create or update audit_logs table
echo "Creating audit_logs table..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# Create backup directory if it doesn't exist
echo "Creating backup directory..."
mkdir -p ../backups

# Insert default system settings
echo "Inserting default system settings..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
-- General settings
INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
VALUES 
('site_name', 'Gemstone Valuation System', 'Gemstone Valuation System', 'text', 'general', 'Site Name', 'The name of the application', TRUE),
('site_description', 'A system for gemstone valuation and management', 'A system for gemstone valuation and management', 'text', 'general', 'Site Description', 'Brief description of the application', TRUE),
('items_per_page', '20', '20', 'number', 'general', 'Items Per Page', 'Default number of items to display per page', FALSE),
('maintenance_mode', 'false', 'false', 'boolean', 'general', 'Maintenance Mode', 'Put the site in maintenance mode', FALSE),
('maintenance_message', 'The system is currently undergoing maintenance. Please check back later.', 'The system is currently undergoing maintenance. Please check back later.', 'text', 'general', 'Maintenance Message', 'Message to display during maintenance mode', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Email settings
INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
VALUES
('email_sender', 'noreply@gemstone-system.com', 'noreply@gemstone-system.com', 'text', 'email', 'Email Sender', 'The email address used to send system emails', FALSE),
('email_sender_name', 'Gemstone System', 'Gemstone System', 'text', 'email', 'Email Sender Name', 'The name displayed as the sender for system emails', FALSE),
('email_verification_required', 'true', 'true', 'boolean', 'email', 'Email Verification Required', 'Whether users must verify their email address after registration', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Security settings
INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
VALUES
('min_password_length', '8', '8', 'number', 'security', 'Minimum Password Length', 'Minimum required length for user passwords', FALSE),
('max_login_attempts', '5', '5', 'number', 'security', 'Maximum Login Attempts', 'Number of failed login attempts before account is locked', FALSE),
('password_expiry_days', '90', '90', 'number', 'security', 'Password Expiry Days', 'Number of days after which passwords expire', FALSE),
('session_timeout_minutes', '120', '120', 'number', 'security', 'Session Timeout', 'Number of minutes after which user sessions expire', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Enhanced admin security settings
INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
VALUES
('mfa_required_for_admin', 'true', 'true', 'boolean', 'security', 'MFA Required for Admin', 'Whether multi-factor authentication is required for admin accounts', FALSE),
('admin_password_min_length', '12', '12', 'number', 'security', 'Admin Password Minimum Length', 'Minimum required length for admin passwords', FALSE),
('admin_password_complexity', 'true', 'true', 'boolean', 'security', 'Admin Password Complexity', 'Whether admin passwords require complexity (uppercase, lowercase, number, special character)', FALSE),
('admin_password_expiry_days', '60', '60', 'number', 'security', 'Admin Password Expiry Days', 'Number of days after which admin passwords expire', FALSE),
('admin_ip_restriction_enabled', 'false', 'false', 'boolean', 'security', 'Admin IP Restriction', 'Whether to restrict admin access to specific IP addresses', FALSE),
('admin_allowed_ips', '', '', 'text', 'security', 'Admin Allowed IPs', 'Comma-separated list of IP addresses allowed to access admin area', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Gemstone settings
INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
VALUES
('require_verification', 'true', 'true', 'boolean', 'gemstones', 'Require Verification', 'Whether gemstones require admin verification before being published', FALSE),
('max_images_per_gemstone', '10', '10', 'number', 'gemstones', 'Maximum Images Per Gemstone', 'Maximum number of images allowed per gemstone', TRUE),
('allowed_image_types', 'jpg,jpeg,png,webp', 'jpg,jpeg,png,webp', 'text', 'gemstones', 'Allowed Image Types', 'Comma-separated list of allowed image file extensions', TRUE),
('max_image_size_kb', '5000', '5000', 'number', 'gemstones', 'Maximum Image Size (KB)', 'Maximum allowed file size for gemstone images in kilobytes', TRUE)
ON CONFLICT (key) DO NOTHING;
"

# Ensure there's at least one admin user
echo "Ensuring at least one admin user exists..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE r.name = 'admin'
    ) THEN
        -- Make sure the admin role exists
        INSERT INTO roles (name, description)
        SELECT 'admin', 'Administrator with full access'
        WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin');
        
        -- Add the required columns for enhanced security if they don't exist
        BEGIN
            ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS password_change_required BOOLEAN DEFAULT FALSE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT FALSE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors, as columns might already exist
            NULL;
        END;
        
        -- Create default admin (password: Admin123!)
        INSERT INTO users (
            username, 
            email, 
            password_hash, 
            first_name, 
            last_name, 
            role_id, 
            is_verified,
            password_change_required
        )
        VALUES (
            'admin', 
            'admin@gemstone-system.com',
            '\$2b\$10\$rCkt1zQXD1MPLSYJrqZ9d.4vIBTJKUgdQwDKBLXPtmdv1S1UQqFT.',
            'System', 
            'Administrator',
            (SELECT id FROM roles WHERE name = 'admin'), 
            true,
            true
        );
        
        RAISE NOTICE 'Default admin user created!';
    ELSE
        RAISE NOTICE 'Admin user already exists.';
    END IF;
END
\$\$;
"

# Create the MFA credentials table
echo "Creating MFA credentials table if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
CREATE TABLE IF NOT EXISTS mfa_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    type VARCHAR(20) NOT NULL,
    secret TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP,
    UNIQUE(user_id, type)
);"

# Create the admin audit logs table
echo "Creating admin audit logs table if it doesn't exist..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);"

# Create necessary directories for the admin panel
echo "Creating directories for admin panel..."
mkdir -p ../../packages/backend/public/admin/css
mkdir -p ../../packages/backend/public/admin/js
mkdir -p ../../packages/backend/public/admin/images
mkdir -p ../../packages/backend/public/uploads/gemstones
mkdir -p ../../packages/backend/public/uploads/users
mkdir -p ../../packages/backend/public/uploads/temp

# Apply remaining migrations
echo "Applying remaining migrations..."
for migration in ../migrations/[1-9]*.sql; do
    if [ -f "$migration" ]; then
        echo "Applying migration: $migration"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migration
    fi
done

# Apply the secure admin credentials migration specifically
if [ -f "../migrations/007_secure_admin_credentials.sql" ]; then
    echo "Applying secure admin credentials migration..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ../migrations/007_secure_admin_credentials.sql
fi

echo "Database setup complete!"
echo "Default admin credentials: username: admin, password: Admin123!"
echo "IMPORTANT: Please change the default admin password immediately after first login."
echo "You will be required to set up MFA for enhanced security."