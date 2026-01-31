-- Migration: 0001_initial.sql
-- Description: Create convocations table for weekly notifications
-- Date: 2026-01-31

-- Table for storing convocation responses
CREATE TABLE IF NOT EXISTS convocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    event_date TEXT NOT NULL,  -- ISO format: YYYY-MM-DD
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    response TEXT NOT NULL DEFAULT 'pending',  -- 'présent', 'present', 'absent', 'pending'
    needs_carpool INTEGER NOT NULL DEFAULT 0,  -- 0 = false, 1 = true
    carpool_seats INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for efficient date range queries (next 7 days)
CREATE INDEX IF NOT EXISTS idx_convocations_date ON convocations(event_date);

-- Index for event grouping
CREATE INDEX IF NOT EXISTS idx_convocations_event ON convocations(event_name, event_date);
