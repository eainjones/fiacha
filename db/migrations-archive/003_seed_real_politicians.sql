-- Clear existing test data (delete in correct order due to foreign keys)
DELETE FROM status_history;
DELETE FROM milestones;
DELETE FROM evidence;
DELETE FROM promises;
DELETE FROM politicians;

-- Seed real Irish politicians (January 2025 Government)
-- Get county IDs for reference
DO $$
DECLARE
  cork_id INT; dublin_id INT; wicklow_id INT; meath_id INT;
  mayo_id INT; wexford_id INT; kildare_id INT; kerry_id INT;
  longford_id INT; westmeath_id INT; limerick_id INT;
BEGIN
  -- Get county IDs
  SELECT id INTO cork_id FROM counties WHERE name = 'Cork';
  SELECT id INTO dublin_id FROM counties WHERE name = 'Dublin';
  SELECT id INTO wicklow_id FROM counties WHERE name = 'Wicklow';
  SELECT id INTO meath_id FROM counties WHERE name = 'Meath';
  SELECT id INTO mayo_id FROM counties WHERE name = 'Mayo';
  SELECT id INTO wexford_id FROM counties WHERE name = 'Wexford';
  SELECT id INTO kildare_id FROM counties WHERE name = 'Kildare';
  SELECT id INTO kerry_id FROM counties WHERE name = 'Kerry';
  SELECT id INTO longford_id FROM counties WHERE name = 'Longford';
  SELECT id INTO westmeath_id FROM counties WHERE name = 'Westmeath';
  SELECT id INTO limerick_id FROM counties WHERE name = 'Limerick';

  -- Cabinet Ministers

  -- FIANNA FÁIL MINISTERS (8)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Micheál Martin', 'Fianna Fáil', 'Cork South-Central', 'Taoiseach', cork_id, 'TD', '2025-01-23', true),
    ('Jack Chambers', 'Fianna Fáil', 'Dublin West', 'Minister for Public Expenditure and Reform', dublin_id, 'TD', '2025-01-23', true),
    ('Jim O''Callaghan', 'Fianna Fáil', 'Dublin Bay South', 'Minister for Justice', dublin_id, 'TD', '2025-01-23', true),
    ('Dara Calleary', 'Fianna Fáil', 'Mayo', 'Minister for Social Protection', mayo_id, 'TD', '2025-01-23', true),
    ('James Browne', 'Fianna Fáil', 'Wexford', 'Minister for Housing', wexford_id, 'TD', '2025-01-23', true),
    ('Darragh O''Brien', 'Fianna Fáil', 'Dublin Fingal East', 'Minister for Climate and Transport', dublin_id, 'TD', '2025-01-23', true),
    ('James Lawless', 'Fianna Fáil', 'Kildare North', 'Minister for Further and Higher Education', kildare_id, 'TD', '2025-01-23', true),
    ('Norma Foley', 'Fianna Fáil', 'Kerry', 'Minister for Children and Equality', kerry_id, 'TD', '2025-01-23', true),

  -- FINE GAEL MINISTERS (7)
    ('Simon Harris', 'Fine Gael', 'Wicklow', 'Tánaiste and Minister for Foreign Affairs', wicklow_id, 'TD', '2025-01-23', true),
    ('Paschal Donohoe', 'Fine Gael', 'Dublin Central', 'Minister for Finance', dublin_id, 'TD', '2025-01-23', true),
    ('Helen McEntee', 'Fine Gael', 'Meath East', 'Minister for Education', meath_id, 'TD', '2025-01-23', true),
    ('Peter Burke', 'Fine Gael', 'Longford-Westmeath', 'Minister for Enterprise and Employment', longford_id, 'TD', '2025-01-23', true),
    ('Jennifer Carroll MacNeill', 'Fine Gael', 'Dún Laoghaire', 'Minister for Health', dublin_id, 'TD', '2025-01-23', true),
    ('Martin Heydon', 'Fine Gael', 'Kildare South', 'Minister for Agriculture', kildare_id, 'TD', '2025-01-23', true),
    ('Patrick O''Donovan', 'Fine Gael', 'Limerick County', 'Minister for Arts and Sport', limerick_id, 'TD', '2025-01-23', true),

  -- OPPOSITION LEADERS
    ('Mary Lou McDonald', 'Sinn Féin', 'Dublin Central', 'Leader of the Opposition', dublin_id, 'TD', '2011-03-09', true),
    ('Pearse Doherty', 'Sinn Féin', 'Donegal', 'Finance Spokesperson', (SELECT id FROM counties WHERE name = 'Donegal'), 'TD', '2011-03-09', true),

  -- SUPER JUNIOR MINISTERS
    ('Mary Butler', 'Fianna Fáil', 'Waterford', 'Government Chief Whip', (SELECT id FROM counties WHERE name = 'Waterford'), 'TD', '2025-01-23', true),
    ('Hildegarde Naughton', 'Fine Gael', 'Galway West', 'Minister of State', (SELECT id FROM counties WHERE name = 'Galway'), 'TD', '2025-01-23', true),
    ('Seán Canney', 'Independent', 'Galway East', 'Minister of State', (SELECT id FROM counties WHERE name = 'Galway'), 'TD', '2025-01-23', true),
    ('Noel Grealish', 'Independent', 'Galway West', 'Minister of State', (SELECT id FROM counties WHERE name = 'Galway'), 'TD', '2025-01-23', true);

END $$;
