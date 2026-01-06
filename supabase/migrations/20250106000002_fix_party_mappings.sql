-- Fix missing party mappings

-- Add missing parties
INSERT INTO parties (name, short_name, color, website, region, active) VALUES
  ('Solidarity', 'SOL', '#B91C1C', NULL, 'ROI', true),
  ('Progressive Unionist Party', 'PUP', '#2563EB', NULL, 'NI', true)
ON CONFLICT (name) DO NOTHING;

-- Re-run party_id mapping for any politicians that were missed
UPDATE politicians
SET party_id = (
  SELECT id FROM parties WHERE parties.name = politicians.party
)
WHERE party IS NOT NULL AND party_id IS NULL;

-- Log unmapped count
DO $$
DECLARE
  null_party_count INTEGER;
  unmapped_count INTEGER;
  r RECORD;
BEGIN
  SELECT COUNT(*) INTO null_party_count
  FROM politicians
  WHERE party IS NULL;

  SELECT COUNT(*) INTO unmapped_count
  FROM politicians
  WHERE party IS NOT NULL AND party_id IS NULL;

  RAISE NOTICE 'Politicians with NULL party (no data available): %', null_party_count;
  RAISE NOTICE 'Politicians with party text but no matching party_id: %', unmapped_count;

  -- List any unmapped party names
  IF unmapped_count > 0 THEN
    RAISE NOTICE 'Unmapped party names:';
    FOR r IN SELECT DISTINCT party FROM politicians WHERE party IS NOT NULL AND party_id IS NULL
    LOOP
      RAISE NOTICE '  - %', r.party;
    END LOOP;
  END IF;
END $$;
