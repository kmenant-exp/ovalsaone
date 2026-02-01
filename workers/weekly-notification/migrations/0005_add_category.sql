-- Migration: Add category column to convocations table
-- This stores the team/category from the tournament selection (e.g., U6, U8, U10, etc.)

ALTER TABLE convocations ADD COLUMN category TEXT;
