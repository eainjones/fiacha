-- Migration: Create parties table and migrate party affiliations
-- This normalizes party data into a separate table with proper foreign keys

-- Step 1: Create the parties table
CREATE TABLE parties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  short_name VARCHAR(20),
  color VARCHAR(7),          -- Hex color for UI (e.g., '#16A34A')
  logo_url TEXT,             -- Optional party logo URL
  website TEXT,              -- Official party website
  region VARCHAR(20) DEFAULT 'ROI' CHECK (region IN ('ROI', 'NI', 'Both')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for common lookups
CREATE INDEX idx_parties_name ON parties(name);
CREATE INDEX idx_parties_region ON parties(region);

-- Step 2: Seed party data
-- Republic of Ireland parties
INSERT INTO parties (name, short_name, color, website, region, active) VALUES
  ('Fianna Fáil', 'FF', '#16A34A', 'https://www.fiannafail.ie', 'ROI', true),
  ('Fine Gael', 'FG', '#2563EB', 'https://www.finegael.ie', 'ROI', true),
  ('Labour Party', 'LAB', '#DC2626', 'https://www.labour.ie', 'ROI', true),
  ('Green Party', 'GP', '#65A30D', 'https://www.greenparty.ie', 'Both', true),
  ('Social Democrats', 'SD', '#9333EA', 'https://www.socialdemocrats.ie', 'ROI', true),
  ('Aontú', 'AON', '#D97706', 'https://aontu.ie', 'Both', true),
  ('Independent Ireland', 'II', '#0D9488', 'https://independentireland.ie', 'ROI', true),
  ('100% Redress Party', '100R', '#EA580C', NULL, 'ROI', true),
  ('Workers and Unemployed Action', 'WUA', '#B91C1C', NULL, 'ROI', true),
  ('People Before Profit', 'PBP', '#E11D48', 'https://www.pbp.ie', 'Both', true);

-- Cross-border / Both regions
INSERT INTO parties (name, short_name, color, website, region, active) VALUES
  ('Sinn Féin', 'SF', '#047857', 'https://www.sinnfein.ie', 'Both', true),
  ('Independent', 'IND', '#6B7280', NULL, 'Both', true);

-- Northern Ireland parties
INSERT INTO parties (name, short_name, color, website, region, active) VALUES
  ('Democratic Unionist Party', 'DUP', '#DC2626', 'https://www.mydup.com', 'NI', true),
  ('Ulster Unionist Party', 'UUP', '#2563EB', 'https://uup.org', 'NI', true),
  ('Alliance Party', 'ALL', '#F59E0B', 'https://www.allianceparty.org', 'NI', true),
  ('Social Democratic and Labour Party', 'SDLP', '#16A34A', 'https://www.sdlp.ie', 'NI', true),
  ('Traditional Unionist Voice', 'TUV', '#1E3A8A', 'https://tuv.org.uk', 'NI', true);

-- Special entries (not traditional parties but need tracking)
INSERT INTO parties (name, short_name, color, website, region, active) VALUES
  ('Ceann Comhairle', 'CC', '#475569', NULL, 'ROI', true),
  ('Wexford Independent Alliance', 'WIA', '#6B7280', NULL, 'ROI', true);

-- Aliases for name variations in existing data
INSERT INTO parties (name, short_name, color, website, region, active) VALUES
  ('Labour', 'LAB', '#DC2626', 'https://www.labour.ie', 'ROI', true),
  ('People Before Profit-Solidarity', 'PBP', '#E11D48', 'https://www.pbp.ie', 'ROI', true),
  ('People Before Profit Alliance', 'PBP', '#E11D48', 'https://www.pbp.ie', 'ROI', true);

-- Step 3: Add party_id column to politicians table
ALTER TABLE politicians ADD COLUMN party_id INTEGER REFERENCES parties(id);

-- Create index for foreign key lookups
CREATE INDEX idx_politicians_party_id ON politicians(party_id);

-- Step 4: Migrate existing party text data to party_id
UPDATE politicians
SET party_id = (
  SELECT id FROM parties WHERE parties.name = politicians.party
)
WHERE party IS NOT NULL;

-- Log any unmapped parties for review
DO $$
DECLARE
  unmapped_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmapped_count
  FROM politicians
  WHERE party IS NOT NULL AND party_id IS NULL;

  IF unmapped_count > 0 THEN
    RAISE NOTICE 'Warning: % politicians have party text but no matching party_id', unmapped_count;
  END IF;
END $$;

-- Note: We keep the original 'party' column for backwards compatibility
-- It can be dropped in a future migration after verifying the data migration
