-- Restore councillor party data from original seed migration
-- The import migration (20250104100000) overwrote party data with NULL values

UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Declan Flanagan') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('James Geoghegan') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Emma Blain') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Naoise Ó Muirí') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Danny Byrne') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Ray McAdam') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Social Democrats', party_id = (SELECT id FROM parties WHERE name = 'Social Democrats') WHERE LOWER(name) = LOWER('Jesslyn Henry') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Social Democrats', party_id = (SELECT id FROM parties WHERE name = 'Social Democrats') WHERE LOWER(name) = LOWER('Aisling Silke') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Social Democrats', party_id = (SELECT id FROM parties WHERE name = 'Social Democrats') WHERE LOWER(name) = LOWER('Catherine Stocker') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Social Democrats', party_id = (SELECT id FROM parties WHERE name = 'Social Democrats') WHERE LOWER(name) = LOWER('Paddy Monahan') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Social Democrats', party_id = (SELECT id FROM parties WHERE name = 'Social Democrats') WHERE LOWER(name) = LOWER('Cian Farrell') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Daithí Doolan') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Críona Ní Dhalaigh') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Carolyn Moore') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Deirdre Conroy') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Green Party', party_id = (SELECT id FROM parties WHERE name = 'Green Party') WHERE LOWER(name) = LOWER('Hazel Chu') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent', party_id = (SELECT id FROM parties WHERE name = 'Independent') WHERE LOWER(name) = LOWER('Mannix Flynn') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent', party_id = (SELECT id FROM parties WHERE name = 'Independent') WHERE LOWER(name) = LOWER('Nial Ring') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent', party_id = (SELECT id FROM parties WHERE name = 'Independent') WHERE LOWER(name) = LOWER('Anthony Flynn') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Fintan Phelan') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Andrea Dalton') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Fergal Browne') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent Ireland', party_id = (SELECT id FROM parties WHERE name = 'Independent Ireland') WHERE LOWER(name) = LOWER('John Cassin') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Paul Doogue') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Ken Murnane') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'People Before Profit', party_id = (SELECT id FROM parties WHERE name = 'People Before Profit') WHERE LOWER(name) = LOWER('Adrienne Wallace') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Thomas Kinsella') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Labour', party_id = (SELECT id FROM parties WHERE name = 'Labour') WHERE LOWER(name) = LOWER('Willie Quinn') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Andy Gladney') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Daniel Pender') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Michael Doran') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent', party_id = (SELECT id FROM parties WHERE name = 'Independent') WHERE LOWER(name) = LOWER('Charlie Murphy') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('John Pender') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent', party_id = (SELECT id FROM parties WHERE name = 'Independent') WHERE LOWER(name) = LOWER('Will Paton') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Ben Ward') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Jim Deane') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Carmel Brady') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Stiofán Connaty') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Val Smith') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Kelly Clifford') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Niall Smith') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Trevor Smith') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Winston Bennett') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Philip Brady') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Noel Connell') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Áine Smith') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent', party_id = (SELECT id FROM parties WHERE name = 'Independent') WHERE LOWER(name) = LOWER('Brendan Fay') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Damien Brady') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('John Paul Feeley') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Niamh Brady') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Patricia Walsh') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Seamus McGrath') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Gillian Coughlan') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Michael Hegarty') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Susan McCarthy') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Mary Linehan-Foley') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Danielle Twomey') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Cathal Rasmussen') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent Ireland', party_id = (SELECT id FROM parties WHERE name = 'Independent Ireland') WHERE LOWER(name) = LOWER('Joe Carroll') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Labour', party_id = (SELECT id FROM parties WHERE name = 'Labour') WHERE LOWER(name) = LOWER('Audrey Buckley') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Michael Creed') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent Ireland', party_id = (SELECT id FROM parties WHERE name = 'Independent Ireland') WHERE LOWER(name) = LOWER('Danny Collins') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Colm Kelleher') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Tony Fitzgerald') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Fergal Dennehy') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Mick Nugent') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Fiona Ryan') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Green Party', party_id = (SELECT id FROM parties WHERE name = 'Green Party') WHERE LOWER(name) = LOWER('Oliver Moran') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'People Before Profit', party_id = (SELECT id FROM parties WHERE name = 'People Before Profit') WHERE LOWER(name) = LOWER('Lorna Bogue') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent', party_id = (SELECT id FROM parties WHERE name = 'Independent') WHERE LOWER(name) = LOWER('Ted Tynan') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent', party_id = (SELECT id FROM parties WHERE name = 'Independent') WHERE LOWER(name) = LOWER('Kieran McCarthy') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Labour', party_id = (SELECT id FROM parties WHERE name = 'Labour') WHERE LOWER(name) = LOWER('Niall McNelis') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fianna Fáil', party_id = (SELECT id FROM parties WHERE name = 'Fianna Fáil') WHERE LOWER(name) = LOWER('Eddie Hoare') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Fine Gael', party_id = (SELECT id FROM parties WHERE name = 'Fine Gael') WHERE LOWER(name) = LOWER('Alan Cheevers') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Mairéad Farrell') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Sinn Féin', party_id = (SELECT id FROM parties WHERE name = 'Sinn Féin') WHERE LOWER(name) = LOWER('Owen Hanley') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent', party_id = (SELECT id FROM parties WHERE name = 'Independent') WHERE LOWER(name) = LOWER('Mike Cubbard') AND party IS NULL AND position_type = 'Councillor';
UPDATE politicians SET party = 'Independent', party_id = (SELECT id FROM parties WHERE name = 'Independent') WHERE LOWER(name) = LOWER('Clodagh Higgins') AND party IS NULL AND position_type = 'Councillor';

-- Log results
DO $$
DECLARE
  updated_count INTEGER;
  still_null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM politicians 
  WHERE party IS NOT NULL AND position_type = 'Councillor';
  
  SELECT COUNT(*) INTO still_null_count
  FROM politicians 
  WHERE party IS NULL AND position_type = 'Councillor';
  
  RAISE NOTICE 'Councillors with party data: %', updated_count;
  RAISE NOTICE 'Councillors still missing party: %', still_null_count;
END $$;
