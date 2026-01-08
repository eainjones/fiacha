-- Migration: Add contact fields to politicians table
-- These fields are expected by the Drizzle schema

ALTER TABLE politicians ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE politicians ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE politicians ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
