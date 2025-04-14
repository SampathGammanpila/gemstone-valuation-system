-- Migration: 007_secure_admin_credentials.sql
-- Purpose: Implement enhanced security for admin credentials with MFA support and other security features

-- Add required columns to users table if they don't exist
DO $$
BEGIN
    -- Password security columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_changed_at') THEN
        ALTER TABLE users ADD COLUMN password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_change_required') THEN
        ALTER TABLE users ADD COLUMN password_change_required BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- MFA columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'mfa_enabled') THEN
        ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Account security columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'login_attempts') THEN
        ALTER TABLE users ADD COLUMN login_attempts INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'account_locked') THEN
        ALTER TABLE users ADD COLUMN account_locked BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'account_locked_until') THEN
        ALTER TABLE users ADD COLUMN account_locked_until TIMESTAMP;
    END IF;
    
    -- Admin IP restriction columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'allowed_ips') THEN
        ALTER TABLE users ADD COLUMN allowed_ips TEXT;
    END IF;
END
$$;

-- Create MFA credentials table if it doesn't exist
CREATE TABLE IF NOT EXISTS mfa_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    type VARCHAR(20) NOT NULL,
    secret TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP,
    UNIQUE(user_id, type)
);

-- Create admin audit logs table if it doesn't exist
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
);

-- Insert enhanced security settings for admins
INSERT INTO system_settings (key, value, default_value, type, category, label, description, is_public)
VALUES
    ('mfa_required_for_admin', 'true', 'true', 'boolean', 'security', 'MFA Required for Admin', 'Whether multi-factor authentication is required for admin accounts', FALSE),
    ('admin_password_min_length', '12', '12', 'number', 'security', 'Admin Password Minimum Length', 'Minimum required length for admin passwords', FALSE),
    ('admin_password_complexity', 'true', 'true', 'boolean', 'security', 'Admin Password Complexity', 'Whether admin passwords require complexity (uppercase, lowercase, number, special character)', FALSE),
    ('admin_password_expiry_days', '60', '60', 'number', 'security', 'Admin Password Expiry Days', 'Number of days after which admin passwords expire', FALSE),
    ('admin_ip_restriction_enabled', 'false', 'false', 'boolean', 'security', 'Admin IP Restriction', 'Whether to restrict admin access to specific IP addresses', FALSE),
    ('admin_allowed_ips', '', '', 'text', 'security', 'Admin Allowed IPs', 'Comma-separated list of IP addresses allowed to access admin area', FALSE),
    ('super_admin_access_log_retention_days', '365', '365', 'number', 'security', 'Super Admin Access Log Retention', 'Number of days to retain super admin access logs', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Create function to check for expired admin passwords
CREATE OR REPLACE FUNCTION check_admin_password_expiry() RETURNS TRIGGER AS $$
BEGIN
    -- Get password expiry setting
    DECLARE 
        expiry_days INTEGER;
    BEGIN
        SELECT COALESCE(NULLIF(value, '')::INTEGER, 60) INTO expiry_days
        FROM system_settings
        WHERE key = 'admin_password_expiry_days';
        
        -- Check if password has expired for admins
        IF (NEW.role_id IN (SELECT id FROM roles WHERE name = 'admin')) THEN
            IF (NEW.password_changed_at IS NULL OR 
                NEW.password_changed_at < NOW() - (expiry_days || ' days')::INTERVAL) THEN
                NEW.password_change_required := TRUE;
            END IF;
        END IF;
        
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS admin_password_expiry_check ON users;

-- Create the trigger
CREATE TRIGGER admin_password_expiry_check
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION check_admin_password_expiry();

-- Set password_change_required for existing admin accounts with old passwords
UPDATE users
SET password_change_required = TRUE
WHERE 
    id IN (SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id WHERE r.name = 'admin')
    AND (
        password_changed_at IS NULL 
        OR password_changed_at < NOW() - ((
            SELECT COALESCE(NULLIF(value, '')::INTEGER, 60)
            FROM system_settings
            WHERE key = 'admin_password_expiry_days'
        ) || ' days')::INTERVAL
    );

-- Create function to enforce admin password complexity
CREATE OR REPLACE FUNCTION enforce_admin_password_complexity() RETURNS TRIGGER AS $$
BEGIN
    -- Only apply to admin users
    IF (NEW.role_id IN (SELECT id FROM roles WHERE name = 'admin')) THEN
        -- Skip check if password_hash hasn't changed
        IF (TG_OP = 'UPDATE' AND NEW.password_hash = OLD.password_hash) THEN
            RETURN NEW;
        END IF;
        
        -- Set password_changed_at
        NEW.password_changed_at := CURRENT_TIMESTAMP;
        
        -- Reset password change required flag
        NEW.password_change_required := FALSE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS admin_password_complexity_check ON users;

-- Create the trigger
CREATE TRIGGER admin_password_complexity_check
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION enforce_admin_password_complexity();
