-- Seed Wexford County Council Councillors (2024 Local Elections)
-- 34 councillors across 6 electoral areas

DO $$
DECLARE
  wexford_county_id INT;
  wexford_la_id INT;

  -- Electoral Areas
  enniscorthy_ea_id INT;
  gorey_ea_id INT;
  kilmuckridge_ea_id INT;
  newross_ea_id INT;
  rosslare_ea_id INT;
  wexford_town_ea_id INT;
BEGIN
  -- Get Wexford County and Local Authority IDs
  SELECT id INTO wexford_county_id FROM counties WHERE name = 'Wexford';
  SELECT id INTO wexford_la_id FROM local_authorities WHERE name = 'Wexford County Council';

  -- Validate that we found both
  IF wexford_county_id IS NULL THEN
    RAISE EXCEPTION 'County "Wexford" not found';
  END IF;
  IF wexford_la_id IS NULL THEN
    RAISE EXCEPTION 'Local Authority "Wexford County Council" not found';
  END IF;

  -- Create Electoral Areas if they don't exist
  INSERT INTO electoral_areas (local_authority_id, name, area_type) VALUES
    (wexford_la_id, 'Enniscorthy', 'Local Electoral Area'),
    (wexford_la_id, 'Gorey', 'Local Electoral Area'),
    (wexford_la_id, 'Kilmuckridge', 'Local Electoral Area'),
    (wexford_la_id, 'New Ross', 'Local Electoral Area'),
    (wexford_la_id, 'Rosslare', 'Local Electoral Area'),
    (wexford_la_id, 'Wexford', 'Local Electoral Area')
  ON CONFLICT DO NOTHING;

  -- Get Electoral Area IDs
  SELECT id INTO enniscorthy_ea_id FROM electoral_areas WHERE name = 'Enniscorthy' AND local_authority_id = wexford_la_id;
  SELECT id INTO gorey_ea_id FROM electoral_areas WHERE name = 'Gorey' AND local_authority_id = wexford_la_id;
  SELECT id INTO kilmuckridge_ea_id FROM electoral_areas WHERE name = 'Kilmuckridge' AND local_authority_id = wexford_la_id;
  SELECT id INTO newross_ea_id FROM electoral_areas WHERE name = 'New Ross' AND local_authority_id = wexford_la_id;
  SELECT id INTO rosslare_ea_id FROM electoral_areas WHERE name = 'Rosslare' AND local_authority_id = wexford_la_id;
  SELECT id INTO wexford_town_ea_id FROM electoral_areas WHERE name = 'Wexford' AND local_authority_id = wexford_la_id;

  -- Validate electoral areas were found
  IF enniscorthy_ea_id IS NULL THEN RAISE EXCEPTION 'Electoral area Enniscorthy not found'; END IF;
  IF gorey_ea_id IS NULL THEN RAISE EXCEPTION 'Electoral area Gorey not found'; END IF;
  IF kilmuckridge_ea_id IS NULL THEN RAISE EXCEPTION 'Electoral area Kilmuckridge not found'; END IF;
  IF newross_ea_id IS NULL THEN RAISE EXCEPTION 'Electoral area New Ross not found'; END IF;
  IF rosslare_ea_id IS NULL THEN RAISE EXCEPTION 'Electoral area Rosslare not found'; END IF;
  IF wexford_town_ea_id IS NULL THEN RAISE EXCEPTION 'Electoral area Wexford not found'; END IF;

  -- Insert Councillors
  -- Enniscorthy (6 seats)
  INSERT INTO politicians (name, party, constituency, county_id, local_authority_id, electoral_area_id, position_type, term_start, active) VALUES
    ('Cathal Byrne', 'Fine Gael', 'Enniscorthy', wexford_county_id, wexford_la_id, enniscorthy_ea_id, 'Councillor', '2024-06-07', true),
    ('Aidan Browne', 'Fianna Fáil', 'Enniscorthy', wexford_county_id, wexford_la_id, enniscorthy_ea_id, 'Councillor', '2024-06-07', true),
    ('Barbara-Anne Murphy', 'Fianna Fáil', 'Enniscorthy', wexford_county_id, wexford_la_id, enniscorthy_ea_id, 'Councillor', '2024-06-07', true),
    ('John O''Rourke', 'Independent', 'Enniscorthy', wexford_county_id, wexford_la_id, enniscorthy_ea_id, 'Councillor', '2024-06-07', true),
    ('Jackser Owens', 'Independent', 'Enniscorthy', wexford_county_id, wexford_la_id, enniscorthy_ea_id, 'Councillor', '2024-06-07', true),
    ('Patrick Kehoe', 'Fine Gael', 'Enniscorthy', wexford_county_id, wexford_la_id, enniscorthy_ea_id, 'Councillor', '2024-06-07', true),

  -- Gorey (6 seats)
    ('Donal Kenny', 'Fianna Fáil', 'Gorey', wexford_county_id, wexford_la_id, gorey_ea_id, 'Councillor', '2024-06-07', true),
    ('Nicky Boland', 'Wexford Independent Alliance', 'Gorey', wexford_county_id, wexford_la_id, gorey_ea_id, 'Councillor', '2024-06-07', true),
    ('Joe Sullivan', 'Fianna Fáil', 'Gorey', wexford_county_id, wexford_la_id, gorey_ea_id, 'Councillor', '2024-06-07', true),
    ('Anthony Donohoe', 'Fine Gael', 'Gorey', wexford_county_id, wexford_la_id, gorey_ea_id, 'Councillor', '2024-06-07', true),
    ('Darragh McDonald', 'Fine Gael', 'Gorey', wexford_county_id, wexford_la_id, gorey_ea_id, 'Councillor', '2024-06-07', true),
    ('Fionntán Ó Súilleabháin', 'Sinn Féin', 'Gorey', wexford_county_id, wexford_la_id, gorey_ea_id, 'Councillor', '2024-06-07', true),

  -- Kilmuckridge (4 seats)
    ('Mary Farrell', 'Independent', 'Kilmuckridge', wexford_county_id, wexford_la_id, kilmuckridge_ea_id, 'Councillor', '2024-06-07', true),
    ('Pip Breen', 'Fianna Fáil', 'Kilmuckridge', wexford_county_id, wexford_la_id, kilmuckridge_ea_id, 'Councillor', '2024-06-07', true),
    ('Oliver Walsh', 'Fine Gael', 'Kilmuckridge', wexford_county_id, wexford_la_id, kilmuckridge_ea_id, 'Councillor', '2024-06-07', true),
    ('Paddy Kavanagh', 'Wexford Independent Alliance', 'Kilmuckridge', wexford_county_id, wexford_la_id, kilmuckridge_ea_id, 'Councillor', '2024-06-07', true),

  -- New Ross (6 seats)
    ('Pat Barden', 'Wexford Independent Alliance', 'New Ross', wexford_county_id, wexford_la_id, newross_ea_id, 'Councillor', '2024-06-07', true),
    ('John Fleming', 'Fianna Fáil', 'New Ross', wexford_county_id, wexford_la_id, newross_ea_id, 'Councillor', '2024-06-07', true),
    ('Marty Murphy', 'Wexford Independent Alliance', 'New Ross', wexford_county_id, wexford_la_id, newross_ea_id, 'Councillor', '2024-06-07', true),
    ('Michael Sheehan', 'Fianna Fáil', 'New Ross', wexford_county_id, wexford_la_id, newross_ea_id, 'Councillor', '2024-06-07', true),
    ('Bridín Murphy', 'Fine Gael', 'New Ross', wexford_county_id, wexford_la_id, newross_ea_id, 'Councillor', '2024-06-07', true),
    ('John Dwyer', 'Independent', 'New Ross', wexford_county_id, wexford_la_id, newross_ea_id, 'Councillor', '2024-06-07', true),

  -- Rosslare (5 seats)
    ('Jim Codd', 'Aontú', 'Rosslare', wexford_county_id, wexford_la_id, rosslare_ea_id, 'Councillor', '2024-06-07', true),
    ('Ger Carthy', 'Independent', 'Rosslare', wexford_county_id, wexford_la_id, rosslare_ea_id, 'Councillor', '2024-06-07', true),
    ('Frank Staples', 'Fine Gael', 'Rosslare', wexford_county_id, wexford_la_id, rosslare_ea_id, 'Councillor', '2024-06-07', true),
    ('Lisa McDonald', 'Fianna Fáil', 'Rosslare', wexford_county_id, wexford_la_id, rosslare_ea_id, 'Councillor', '2024-06-07', true),
    ('Aoife Rose O''Brien', 'Sinn Féin', 'Rosslare', wexford_county_id, wexford_la_id, rosslare_ea_id, 'Councillor', '2024-06-07', true),

  -- Wexford (6 seats - George Lawlor became TD in Nov 2024, resigned council seat)
    ('Robbie Staples', 'Fine Gael', 'Wexford', wexford_county_id, wexford_la_id, wexford_town_ea_id, 'Councillor', '2024-06-07', true),
    ('Garry Laffan', 'Fianna Fáil', 'Wexford', wexford_county_id, wexford_la_id, wexford_town_ea_id, 'Councillor', '2024-06-07', true),
    ('Tom Forde', 'Sinn Féin', 'Wexford', wexford_county_id, wexford_la_id, wexford_town_ea_id, 'Councillor', '2024-06-07', true),
    ('Catherine Walsh', 'Labour', 'Wexford', wexford_county_id, wexford_la_id, wexford_town_ea_id, 'Councillor', '2024-06-07', true),
    ('Raymond Shannon', 'Wexford Independent Alliance', 'Wexford', wexford_county_id, wexford_la_id, wexford_town_ea_id, 'Councillor', '2024-06-07', true),
    ('Vicky Barron', 'Independent', 'Wexford', wexford_county_id, wexford_la_id, wexford_town_ea_id, 'Councillor', '2024-06-07', true);

END $$;
