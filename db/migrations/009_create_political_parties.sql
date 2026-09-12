-- Migration: Create political_parties table and update politicians table
-- This migration adds proper party management with icons, colors, and metadata

-- Create political_parties table
CREATE TABLE IF NOT EXISTS political_parties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  abbreviation VARCHAR(20) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#9E9E9E',      -- Hex color #RRGGBB
  text_color VARCHAR(7) NOT NULL DEFAULT '#FFFFFF', -- Contrast text color
  icon_url VARCHAR(500),                            -- Path to icon file
  description TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add party_id column to politicians table
ALTER TABLE politicians
  ADD COLUMN IF NOT EXISTS party_id INTEGER REFERENCES political_parties(id);

-- Create index for party lookups
CREATE INDEX IF NOT EXISTS idx_politicians_party_id ON politicians(party_id);

-- Seed Irish political parties with their traditional colors
INSERT INTO political_parties (name, abbreviation, color, text_color, display_order) VALUES
  ('Fianna Fáil', 'FF', '#66BB6A', '#FFFFFF', 1),
  ('Fine Gael', 'FG', '#2196F3', '#FFFFFF', 2),
  ('Sinn Féin', 'SF', '#326634', '#FFFFFF', 3),
  ('Labour Party', 'LAB', '#E53935', '#FFFFFF', 4),
  ('Social Democrats', 'SD', '#8E24AA', '#FFFFFF', 5),
  ('People Before Profit-Solidarity', 'PBP-S', '#FF6F00', '#FFFFFF', 6),
  ('Green Party', 'GP', '#4CAF50', '#FFFFFF', 7),
  ('Aontú', 'AON', '#FFA726', '#000000', 8),
  ('Independent Ireland', 'II', '#5C6BC0', '#FFFFFF', 9),
  ('Independent', 'IND', '#9E9E9E', '#000000', 10)
ON CONFLICT (name) DO NOTHING;

-- Migrate existing party data from politicians.party to party_id
-- This maps the text party names to the new political_parties table
UPDATE politicians p
SET party_id = pp.id
FROM political_parties pp
WHERE p.party IS NOT NULL
  AND (
    p.party = pp.name
    OR p.party = pp.abbreviation
    OR p.party ILIKE pp.name || '%'
  );

-- Handle some common variations in party names
UPDATE politicians p
SET party_id = (SELECT id FROM political_parties WHERE name = 'Labour Party')
WHERE p.party_id IS NULL AND p.party ILIKE '%labour%';

UPDATE politicians p
SET party_id = (SELECT id FROM political_parties WHERE name = 'Green Party')
WHERE p.party_id IS NULL AND p.party ILIKE '%green%';

UPDATE politicians p
SET party_id = (SELECT id FROM political_parties WHERE name = 'People Before Profit-Solidarity')
WHERE p.party_id IS NULL AND (p.party ILIKE '%people before profit%' OR p.party ILIKE '%pbp%');

UPDATE politicians p
SET party_id = (SELECT id FROM political_parties WHERE name = 'Independent')
WHERE p.party_id IS NULL AND (p.party ILIKE '%independent%' OR p.party ILIKE '%ind%' OR p.party ILIKE '%non-party%');

-- Set any remaining null party_ids to Independent
UPDATE politicians
SET party_id = (SELECT id FROM political_parties WHERE name = 'Independent')
WHERE party_id IS NULL AND party IS NOT NULL;

-- Note: We keep the old 'party' VARCHAR column for now as a backup
-- It can be dropped in a future migration once the system is stable
-- ALTER TABLE politicians DROP COLUMN party;
