-- Add 6 missing TDs from 34th Dáil and fix incorrect party affiliation
-- This brings the total from 168 to 174 TDs

DO $$
DECLARE
  cork_id INT; dublin_id INT; longford_id INT; meath_id INT; sligo_id INT;
BEGIN
  -- Get county IDs
  SELECT id INTO cork_id FROM counties WHERE name = 'Cork';
  SELECT id INTO dublin_id FROM counties WHERE name = 'Dublin';
  SELECT id INTO longford_id FROM counties WHERE name = 'Longford';
  SELECT id INTO meath_id FROM counties WHERE name = 'Meath';
  SELECT id INTO sligo_id FROM counties WHERE name = 'Sligo';

  -- Fix incorrect party affiliation for Conor Sheehan (Limerick City)
  UPDATE politicians
  SET party = 'Labour'
  WHERE name = 'Conor Sheehan' AND constituency = 'Limerick City';

  -- Add 6 missing TDs

  -- 1. Cork East (4th seat - was missing from migration 006)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Liam Quaide', 'Social Democrats', 'Cork East', 'TD', cork_id, 'TD', '2024-12-18', true);

  -- 2. Dublin West (5th seat - was missing from migration 006)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Ruth Coppinger', 'People Before Profit-Solidarity', 'Dublin West', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- 3. Dublin Mid-West (5th seat - was missing from migration 006)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Paul Gogarty', 'Independent', 'Dublin Mid-West', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- 4. Longford-Westmeath (5th seat - was missing from migration 006)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Kevin ''Boxer'' Moran', 'Independent', 'Longford-Westmeath', 'TD', longford_id, 'TD', '2024-12-18', true);

  -- 5. Meath East (4th seat - was missing from migration 006)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Gillian Toole', 'Independent', 'Meath East', 'TD', meath_id, 'TD', '2024-12-18', true);

  -- 6. Sligo-Leitrim (4th seat - was missing from migration 006)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Eamon Scanlon', 'Fianna Fáil', 'Sligo-Leitrim', 'TD', sligo_id, 'TD', '2024-12-18', true);

END $$;
