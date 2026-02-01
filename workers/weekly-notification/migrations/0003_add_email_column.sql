-- Migration: 0003_add_email_column.sql
-- Description: Add email column to convocations table for unique identification
-- Date: 2026-02-01

-- Add email column
ALTER TABLE convocations ADD COLUMN email TEXT;

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_convocations_email ON convocations(email);

-- Create composite unique index for event + email (one response per person per event)
CREATE UNIQUE INDEX IF NOT EXISTS idx_convocations_unique 
ON convocations(event_name, event_date, email);
