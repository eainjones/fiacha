-- Add councillors from June 2024 local elections
-- 949 councillors were elected across 31 local authorities

-- Dublin City Council (63 councillors total - adding sample of 20)
DO $$
DECLARE
  dublin_county_id INT;
  dublin_city_authority_id INT;
BEGIN
  SELECT id INTO dublin_county_id FROM counties WHERE name = 'Dublin';
  SELECT id INTO dublin_city_authority_id FROM local_authorities WHERE name = 'Dublin City Council';

  INSERT INTO politicians (name, party, constituency, county_id, local_authority_id, position_type, role, term_start, active) VALUES
    ('Declan Flanagan', 'Fine Gael', 'Artane-Whitehall', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('James Geoghegan', 'Fine Gael', 'Pembroke', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Emma Blain', 'Fine Gael', 'Pembroke', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Naoise Ó Muirí', 'Fine Gael', 'Clontarf', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Danny Byrne', 'Fine Gael', 'South East Inner City', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Ray McAdam', 'Fine Gael', 'North Inner City', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Jesslyn Henry', 'Social Democrats', 'Artane-Whitehall', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Aisling Silke', 'Social Democrats', 'Artane-Whitehall', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Catherine Stocker', 'Social Democrats', 'Clontarf', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Paddy Monahan', 'Social Democrats', 'Donaghmede', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Cian Farrell', 'Social Democrats', 'South East Inner City', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Daithí Doolan', 'Sinn Féin', 'South West Inner City', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Críona Ní Dhalaigh', 'Sinn Féin', 'Pembroke', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Carolyn Moore', 'Fianna Fáil', 'Artane-Whitehall', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Deirdre Conroy', 'Fianna Fáil', 'Clontarf', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('James O''Connell', 'Green Party', 'Pembroke', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Hazel Chu', 'Green Party', 'Pembroke', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Mannix Flynn', 'Independent', 'South East Inner City', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Nial Ring', 'Independent', 'North Inner City', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Anthony Flynn', 'Independent', 'North Inner City', dublin_county_id, dublin_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true);
END $$;

-- Carlow County Council (18 councillors)
DO $$
DECLARE
  carlow_county_id INT;
  carlow_authority_id INT;
BEGIN
  SELECT id INTO carlow_county_id FROM counties WHERE name = 'Carlow';
  SELECT id INTO carlow_authority_id FROM local_authorities WHERE name = 'Carlow County Council';

  INSERT INTO politicians (name, party, constituency, county_id, local_authority_id, position_type, role, term_start, active) VALUES
    ('Fintan Phelan', 'Fianna Fáil', 'Carlow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Andrea Dalton', 'Fianna Fáil', 'Carlow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Fergal Browne', 'Fine Gael', 'Carlow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('John Cassin', 'Independent Ireland', 'Carlow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Paul Doogue', 'Fine Gael', 'Carlow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Ken Murnane', 'Fianna Fáil', 'Carlow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Adrienne Wallace', 'People Before Profit', 'Carlow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Thomas Kinsella', 'Fine Gael', 'Muinebeag', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Willie Quinn', 'Labour', 'Muinebeag', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Andy Gladney', 'Sinn Féin', 'Muinebeag', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Daniel Pender', 'Fianna Fáil', 'Muinebeag', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Michael Doran', 'Fine Gael', 'Muinebeag', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Charlie Murphy', 'Independent', 'Tullow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('John Pender', 'Fianna Fáil', 'Tullow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Will Paton', 'Independent', 'Tullow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Ben Ward', 'Fine Gael', 'Tullow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Jim Deane', 'Sinn Féin', 'Tullow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Brian O''Donoghue', 'Fine Gael', 'Tullow', carlow_county_id, carlow_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true);
END $$;

-- Cavan County Council (18 councillors)
DO $$
DECLARE
  cavan_county_id INT;
  cavan_authority_id INT;
BEGIN
  SELECT id INTO cavan_county_id FROM counties WHERE name = 'Cavan';
  SELECT id INTO cavan_authority_id FROM local_authorities WHERE name = 'Cavan County Council';

  INSERT INTO politicians (name, party, constituency, county_id, local_authority_id, position_type, role, term_start, active) VALUES
    ('Sarah O''Reilly', 'Aontú', 'Bailieborough-Cootehill', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Carmel Brady', 'Fine Gael', 'Bailieborough-Cootehill', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Stiofán Connaty', 'Sinn Féin', 'Bailieborough-Cootehill', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Val Smith', 'Fine Gael', 'Bailieborough-Cootehill', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Kelly Clifford', 'Fianna Fáil', 'Bailieborough-Cootehill', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Niall Smith', 'Fianna Fáil', 'Bailieborough-Cootehill', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Shane P O''Reilly', 'Independent', 'Ballyjamesduff', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Trevor Smith', 'Fine Gael', 'Ballyjamesduff', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Winston Bennett', 'Fine Gael', 'Ballyjamesduff', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Philip Brady', 'Fianna Fáil', 'Ballyjamesduff', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('TP O''Reilly', 'Fine Gael', 'Ballyjamesduff', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Noel Connell', 'Sinn Féin', 'Ballyjamesduff', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Áine Smith', 'Fianna Fáil', 'Cavan-Belturbet', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Brendan Fay', 'Independent', 'Cavan-Belturbet', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Damien Brady', 'Sinn Féin', 'Cavan-Belturbet', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('John Paul Feeley', 'Fianna Fáil', 'Cavan-Belturbet', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Niamh Brady', 'Fine Gael', 'Cavan-Belturbet', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Patricia Walsh', 'Fianna Fáil', 'Cavan-Belturbet', cavan_county_id, cavan_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true);
END $$;

-- Cork County Council (55 councillors - adding sample of 15)
DO $$
DECLARE
  cork_county_id INT;
  cork_county_authority_id INT;
BEGIN
  SELECT id INTO cork_county_id FROM counties WHERE name = 'Cork';
  SELECT id INTO cork_county_authority_id FROM local_authorities WHERE name = 'Cork County Council';

  INSERT INTO politicians (name, party, constituency, county_id, local_authority_id, position_type, role, term_start, active) VALUES
    ('Seamus McGrath', 'Fianna Fáil', 'Bandon-Kinsale', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Gillian Coughlan', 'Fianna Fáil', 'East Cork', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Michael Hegarty', 'Fianna Fáil', 'Fermoy', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('John Paul O''Shea', 'Fine Gael', 'Bandon-Kinsale', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Susan McCarthy', 'Fine Gael', 'Bantry-West Cork', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Mary Linehan-Foley', 'Fine Gael', 'Carrigaline', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Danielle Twomey', 'Sinn Féin', 'Cobh', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Cathal Rasmussen', 'Sinn Féin', 'Fermoy', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Alan O''Connor', 'Independent', 'Macroom', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Joe Carroll', 'Independent Ireland', 'Kanturk', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Audrey Buckley', 'Labour', 'Cobh', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Marcia D''Alton', 'Green Party', 'Carrigaline', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Michael Creed', 'Fine Gael', 'Macroom', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Danny Collins', 'Independent Ireland', 'Bandon-Kinsale', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true),
    ('Deirdre O''Brien', 'Fianna Fáil', 'Kanturk', cork_county_id, cork_county_authority_id, 'Councillor', 'County Councillor', '2024-06-07', true);
END $$;

-- Cork City Council (31 councillors - adding sample of 10)
DO $$
DECLARE
  cork_county_id INT;
  cork_city_authority_id INT;
BEGIN
  SELECT id INTO cork_county_id FROM counties WHERE name = 'Cork';
  SELECT id INTO cork_city_authority_id FROM local_authorities WHERE name = 'Cork City Council';

  INSERT INTO politicians (name, party, constituency, county_id, local_authority_id, position_type, role, term_start, active) VALUES
    ('Colm Kelleher', 'Fianna Fáil', 'Cork City North East', cork_county_id, cork_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Tony Fitzgerald', 'Fianna Fáil', 'Cork City South East', cork_county_id, cork_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Fergal Dennehy', 'Fine Gael', 'Cork City North West', cork_county_id, cork_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Shane O''Callaghan', 'Fine Gael', 'Cork City South Central', cork_county_id, cork_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Mick Nugent', 'Sinn Féin', 'Cork City North Central', cork_county_id, cork_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Fiona Ryan', 'Sinn Féin', 'Cork City South West', cork_county_id, cork_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Oliver Moran', 'Green Party', 'Cork City South East', cork_county_id, cork_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Lorna Bogue', 'People Before Profit', 'Cork City South Central', cork_county_id, cork_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Ted Tynan', 'Independent', 'Cork City North West', cork_county_id, cork_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Kieran McCarthy', 'Independent', 'Cork City South East', cork_county_id, cork_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true);
END $$;

-- Galway City Council (18 councillors - adding sample of 8)
DO $$
DECLARE
  galway_county_id INT;
  galway_city_authority_id INT;
BEGIN
  SELECT id INTO galway_county_id FROM counties WHERE name = 'Galway';
  SELECT id INTO galway_city_authority_id FROM local_authorities WHERE name = 'Galway City Council';

  INSERT INTO politicians (name, party, constituency, county_id, local_authority_id, position_type, role, term_start, active) VALUES
    ('Niall McNelis', 'Labour', 'Galway City Central', galway_county_id, galway_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Eddie Hoare', 'Fianna Fáil', 'Galway City West', galway_county_id, galway_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Alan Cheevers', 'Fine Gael', 'Galway City Central', galway_county_id, galway_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Mairéad Farrell', 'Sinn Féin', 'Galway City West', galway_county_id, galway_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Owen Hanley', 'Sinn Féin', 'Galway City East', galway_county_id, galway_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Pauline O''Reilly', 'Green Party', 'Galway City Central', galway_county_id, galway_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Mike Cubbard', 'Independent', 'Galway City West', galway_county_id, galway_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true),
    ('Clodagh Higgins', 'Independent', 'Galway City Central', galway_county_id, galway_city_authority_id, 'Councillor', 'City Councillor', '2024-06-07', true);
END $$;
