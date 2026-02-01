-- Migration: Create admin_users table for OAuth allowlist
-- Description: Stores authorized admin email addresses for Google OAuth authentication

CREATE TABLE admin_users (
    email TEXT PRIMARY KEY,
    name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed initial admin user
INSERT INTO admin_users (email, name) VALUES ('kevin.menant@gmail.com', 'Kevin Menant');

-- Index for fast email lookups during authentication
CREATE INDEX idx_admin_users_email ON admin_users(email);
