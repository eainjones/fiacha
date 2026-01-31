-- Add remaining TDs from 34th Dáil (November 2024 Election)
-- This migration adds the 153 TDs not included in migration 003
-- Total TDs in 34th Dáil: 174

DO $$
DECLARE
  -- County IDs
  carlow_id INT; cavan_id INT; clare_id INT; cork_id INT; donegal_id INT;
  dublin_id INT; galway_id INT; kerry_id INT; kildare_id INT; kilkenny_id INT;
  laois_id INT; leitrim_id INT; limerick_id INT; longford_id INT; louth_id INT;
  mayo_id INT; meath_id INT; monaghan_id INT; offaly_id INT; roscommon_id INT;
  sligo_id INT; tipperary_id INT; waterford_id INT; westmeath_id INT; wexford_id INT;
  wicklow_id INT;
BEGIN
  -- Get county IDs
  SELECT id INTO carlow_id FROM counties WHERE name = 'Carlow';
  SELECT id INTO cavan_id FROM counties WHERE name = 'Cavan';
  SELECT id INTO clare_id FROM counties WHERE name = 'Clare';
  SELECT id INTO cork_id FROM counties WHERE name = 'Cork';
  SELECT id INTO donegal_id FROM counties WHERE name = 'Donegal';
  SELECT id INTO dublin_id FROM counties WHERE name = 'Dublin';
  SELECT id INTO galway_id FROM counties WHERE name = 'Galway';
  SELECT id INTO kerry_id FROM counties WHERE name = 'Kerry';
  SELECT id INTO kildare_id FROM counties WHERE name = 'Kildare';
  SELECT id INTO kilkenny_id FROM counties WHERE name = 'Kilkenny';
  SELECT id INTO laois_id FROM counties WHERE name = 'Laois';
  SELECT id INTO leitrim_id FROM counties WHERE name = 'Leitrim';
  SELECT id INTO limerick_id FROM counties WHERE name = 'Limerick';
  SELECT id INTO longford_id FROM counties WHERE name = 'Longford';
  SELECT id INTO louth_id FROM counties WHERE name = 'Louth';
  SELECT id INTO mayo_id FROM counties WHERE name = 'Mayo';
  SELECT id INTO meath_id FROM counties WHERE name = 'Meath';
  SELECT id INTO monaghan_id FROM counties WHERE name = 'Monaghan';
  SELECT id INTO offaly_id FROM counties WHERE name = 'Offaly';
  SELECT id INTO roscommon_id FROM counties WHERE name = 'Roscommon';
  SELECT id INTO sligo_id FROM counties WHERE name = 'Sligo';
  SELECT id INTO tipperary_id FROM counties WHERE name = 'Tipperary';
  SELECT id INTO waterford_id FROM counties WHERE name = 'Waterford';
  SELECT id INTO westmeath_id FROM counties WHERE name = 'Westmeath';
  SELECT id INTO wexford_id FROM counties WHERE name = 'Wexford';
  SELECT id INTO wicklow_id FROM counties WHERE name = 'Wicklow';

  -- CARLOW-KILKENNY (5 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Peter "Chap" Cleere', 'Fianna Fáil', 'Carlow-Kilkenny', 'TD', carlow_id, 'TD', '2024-12-18', true),
    ('Catherine Callaghan', 'Fine Gael', 'Carlow-Kilkenny', 'TD', kilkenny_id, 'TD', '2024-12-18', true),
    ('John McGuinness', 'Fianna Fáil', 'Carlow-Kilkenny', 'TD', kilkenny_id, 'TD', '2024-12-18', true),
    ('Jennifer Murnane O''Connor', 'Fianna Fáil', 'Carlow-Kilkenny', 'TD', carlow_id, 'TD', '2024-12-18', true),
    ('Natasha Newsome Drennan', 'Sinn Féin', 'Carlow-Kilkenny', 'TD', kilkenny_id, 'TD', '2024-12-18', true);

  -- CAVAN-MONAGHAN (5 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Cathy Bennett', 'Sinn Féin', 'Cavan-Monaghan', 'TD', cavan_id, 'TD', '2024-12-18', true),
    ('Matt Carthy', 'Sinn Féin', 'Cavan-Monaghan', 'TD', monaghan_id, 'TD', '2024-12-18', true),
    ('David Maxwell', 'Fine Gael', 'Cavan-Monaghan', 'TD', cavan_id, 'TD', '2024-12-18', true),
    ('Brendan Smith', 'Fianna Fáil', 'Cavan-Monaghan', 'TD', cavan_id, 'TD', '2024-12-18', true),
    ('Niamh Smyth', 'Fianna Fáil', 'Cavan-Monaghan', 'TD', cavan_id, 'TD', '2024-12-18', true);

  -- CLARE (4 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Joe Cooney', 'Fine Gael', 'Clare', 'TD', clare_id, 'TD', '2024-12-18', true),
    ('Cathal Crowe', 'Fianna Fáil', 'Clare', 'TD', clare_id, 'TD', '2024-12-18', true),
    ('Timmy Dooley', 'Fianna Fáil', 'Clare', 'TD', clare_id, 'TD', '2024-12-18', true),
    ('Donna McGettigan', 'Sinn Féin', 'Clare', 'TD', clare_id, 'TD', '2024-12-18', true);

  -- CORK EAST (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Pat Buckley', 'Sinn Féin', 'Cork East', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('Noel McCarthy', 'Fine Gael', 'Cork East', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('James O''Connor', 'Fianna Fáil', 'Cork East', 'TD', cork_id, 'TD', '2024-12-18', true);

  -- CORK NORTH-CENTRAL (5 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Colm Burke', 'Fine Gael', 'Cork North-Central', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('Thomas Gould', 'Sinn Féin', 'Cork North-Central', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('Eoghan Kenny', 'Labour', 'Cork North-Central', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('Ken O''Flynn', 'Independent Ireland', 'Cork North-Central', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('Pádraig O''Sullivan', 'Fianna Fáil', 'Cork North-Central', 'TD', cork_id, 'TD', '2024-12-18', true);

  -- CORK NORTH-WEST (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Aindrias Moynihan', 'Fianna Fáil', 'Cork North-West', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('Michael Moynihan', 'Fianna Fáil', 'Cork North-West', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('John Paul O''Shea', 'Fine Gael', 'Cork North-West', 'TD', cork_id, 'TD', '2024-12-18', true);

  -- CORK SOUTH-CENTRAL (4 seats - Micheál Martin already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Jerry Buttimer', 'Fine Gael', 'Cork South-Central', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('Séamus McGrath', 'Fianna Fáil', 'Cork South-Central', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('Donnchadh Ó Laoghaire', 'Sinn Féin', 'Cork South-Central', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('Pádraig Rice', 'Social Democrats', 'Cork South-Central', 'TD', cork_id, 'TD', '2024-12-18', true);

  -- CORK SOUTH-WEST (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Holly Cairns', 'Social Democrats', 'Cork South-West', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('Michael Collins', 'Independent Ireland', 'Cork South-West', 'TD', cork_id, 'TD', '2024-12-18', true),
    ('Christopher O''Sullivan', 'Fianna Fáil', 'Cork South-West', 'TD', cork_id, 'TD', '2024-12-18', true);

  -- DONEGAL (3 seats - Pearse Doherty already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Pat "the Cope" Gallagher', 'Fianna Fáil', 'Donegal', 'TD', donegal_id, 'TD', '2024-12-18', true),
    ('Pádraig Mac Lochlainn', 'Sinn Féin', 'Donegal', 'TD', donegal_id, 'TD', '2024-12-18', true),
    ('Charlie McConalogue', 'Fianna Fáil', 'Donegal', 'TD', donegal_id, 'TD', '2024-12-18', true),
    ('Charles Ward', '100% Redress Party', 'Donegal', 'TD', donegal_id, 'TD', '2024-12-18', true);

  -- DUBLIN BAY NORTH (5 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Tom Brabazon', 'Fianna Fáil', 'Dublin Bay North', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Barry Heneghan', 'Independent', 'Dublin Bay North', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Denise Mitchell', 'Sinn Féin', 'Dublin Bay North', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Cian O''Callaghan', 'Social Democrats', 'Dublin Bay North', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Naoise Ó Muirí', 'Fine Gael', 'Dublin Bay North', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- DUBLIN BAY SOUTH (2 seats - Jim O'Callaghan already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Ivana Bacik', 'Labour', 'Dublin Bay South', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('James Geoghegan', 'Fine Gael', 'Dublin Bay South', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Eoin Hayes', 'Social Democrats', 'Dublin Bay South', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- DUBLIN CENTRAL (2 seats - Paschal Donohoe and Mary Lou McDonald already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Gary Gannon', 'Social Democrats', 'Dublin Central', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Marie Sherlock', 'Labour', 'Dublin Central', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- DUBLIN FINGAL EAST (2 seats - Darragh O'Brien already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Ann Graves', 'Sinn Féin', 'Dublin Fingal East', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Duncan Smith', 'Labour', 'Dublin Fingal East', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- DUBLIN FINGAL WEST (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Grace Boland', 'Fine Gael', 'Dublin Fingal West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Robert O''Donoghue', 'Fine Gael', 'Dublin Fingal West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Louise O''Reilly', 'Sinn Féin', 'Dublin Fingal West', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- DUBLIN MID-WEST (4 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Emer Higgins', 'Fine Gael', 'Dublin Mid-West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Shane Moynihan', 'Fianna Fáil', 'Dublin Mid-West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Eoin Ó Broin', 'Sinn Féin', 'Dublin Mid-West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Mark Ward', 'Sinn Féin', 'Dublin Mid-West', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- DUBLIN NORTH-WEST (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Dessie Ellis', 'Sinn Féin', 'Dublin North-West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Rory Hearne', 'Social Democrats', 'Dublin North-West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Paul McAuliffe', 'Fianna Fáil', 'Dublin North-West', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- DUBLIN RATHDOWN (4 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Shay Brennan', 'Fianna Fáil', 'Dublin Rathdown', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Sinéad Gibney', 'Social Democrats', 'Dublin Rathdown', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Maeve O''Connell', 'Fine Gael', 'Dublin Rathdown', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Neale Richmond', 'Fine Gael', 'Dublin Rathdown', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- DUBLIN SOUTH-CENTRAL (4 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Catherine Ardagh', 'Fianna Fáil', 'Dublin South-Central', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Jen Cummins', 'Fine Gael', 'Dublin South-Central', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Máire Devine', 'Sinn Féin', 'Dublin South-Central', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Aengus Ó Snodaigh', 'Sinn Féin', 'Dublin South-Central', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- DUBLIN SOUTH-WEST (5 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Ciarán Ahern', 'Labour', 'Dublin South-West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Colm Brophy', 'Fine Gael', 'Dublin South-West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Seán Crowe', 'Sinn Féin', 'Dublin South-West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('John Lahart', 'Fianna Fáil', 'Dublin South-West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Paul Murphy', 'People Before Profit-Solidarity', 'Dublin South-West', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- DUBLIN WEST (2 seats - Jack Chambers already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Emer Currie', 'Fine Gael', 'Dublin West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Paul Donnelly', 'Sinn Féin', 'Dublin West', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Roderic O''Gorman', 'Green Party', 'Dublin West', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- DÚN LAOGHAIRE (3 seats - Jennifer Carroll MacNeill already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Richard Boyd Barrett', 'People Before Profit-Solidarity', 'Dún Laoghaire', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Cormac Devlin', 'Fianna Fáil', 'Dún Laoghaire', 'TD', dublin_id, 'TD', '2024-12-18', true),
    ('Barry Ward', 'Fine Gael', 'Dún Laoghaire', 'TD', dublin_id, 'TD', '2024-12-18', true);

  -- GALWAY EAST (3 seats - Seán Canney already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Albert Dolan', 'Fianna Fáil', 'Galway East', 'TD', galway_id, 'TD', '2024-12-18', true),
    ('Louis O''Hara', 'Sinn Féin', 'Galway East', 'TD', galway_id, 'TD', '2024-12-18', true),
    ('Peter Roche', 'Fine Gael', 'Galway East', 'TD', galway_id, 'TD', '2024-12-18', true);

  -- GALWAY WEST (3 seats - Hildegarde Naughton and Noel Grealish already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Catherine Connolly', 'Independent', 'Galway West', 'TD', galway_id, 'TD', '2024-12-18', true),
    ('John Connolly', 'Fianna Fáil', 'Galway West', 'TD', galway_id, 'TD', '2024-12-18', true),
    ('Mairéad Farrell', 'Sinn Féin', 'Galway West', 'TD', galway_id, 'TD', '2024-12-18', true);

  -- KERRY (3 seats - Norma Foley already in DB, plus 2 Healy-Raes)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Michael Cahill', 'Fianna Fáil', 'Kerry', 'TD', kerry_id, 'TD', '2024-12-18', true),
    ('Pa Daly', 'Sinn Féin', 'Kerry', 'TD', kerry_id, 'TD', '2024-12-18', true),
    ('Danny Healy-Rae', 'Independent', 'Kerry', 'TD', kerry_id, 'TD', '2024-12-18', true),
    ('Michael Healy-Rae', 'Independent', 'Kerry', 'TD', kerry_id, 'TD', '2024-12-18', true);

  -- KILDARE NORTH (3 seats - James Lawless already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Réada Cronin', 'Sinn Féin', 'Kildare North', 'TD', kildare_id, 'TD', '2024-12-18', true),
    ('Bernard Durkan', 'Fine Gael', 'Kildare North', 'TD', kildare_id, 'TD', '2024-12-18', true),
    ('Joe Neville', 'Fine Gael', 'Kildare North', 'TD', kildare_id, 'TD', '2024-12-18', true),
    ('Naoise Ó Cearúil', 'Fianna Fáil', 'Kildare North', 'TD', kildare_id, 'TD', '2024-12-18', true);

  -- KILDARE SOUTH (3 seats - Martin Heydon already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Shónagh Ní Raghallaigh', 'Fianna Fáil', 'Kildare South', 'TD', kildare_id, 'TD', '2024-12-18', true),
    ('Seán Ó Fearghaíl', 'Ceann Comhairle', 'Kildare South', 'Ceann Comhairle', kildare_id, 'TD', '2024-12-18', true),
    ('Mark Wall', 'Labour', 'Kildare South', 'TD', kildare_id, 'TD', '2024-12-18', true);

  -- LAOIS (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('William Aird', 'Fine Gael', 'Laois', 'TD', laois_id, 'TD', '2024-12-18', true),
    ('Seán Fleming', 'Fianna Fáil', 'Laois', 'TD', laois_id, 'TD', '2024-12-18', true),
    ('Brian Stanley', 'Independent', 'Laois', 'TD', laois_id, 'TD', '2024-12-18', true);

  -- LIMERICK CITY (4 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Willie O''Dea', 'Fianna Fáil', 'Limerick City', 'TD', limerick_id, 'TD', '2024-12-18', true),
    ('Kieran O''Donnell', 'Fine Gael', 'Limerick City', 'TD', limerick_id, 'TD', '2024-12-18', true),
    ('Maurice Quinlivan', 'Sinn Féin', 'Limerick City', 'TD', limerick_id, 'TD', '2024-12-18', true),
    ('Conor Sheehan', 'Social Democrats', 'Limerick City', 'TD', limerick_id, 'TD', '2024-12-18', true);

  -- LIMERICK COUNTY (2 seats - Patrick O'Donovan already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Niall Collins', 'Fianna Fáil', 'Limerick County', 'TD', limerick_id, 'TD', '2024-12-18', true),
    ('Richard O''Donoghue', 'Independent Ireland', 'Limerick County', 'TD', limerick_id, 'TD', '2024-12-18', true);

  -- LONGFORD-WESTMEATH (3 seats - Peter Burke already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Micheál Carrigy', 'Fine Gael', 'Longford-Westmeath', 'TD', longford_id, 'TD', '2024-12-18', true),
    ('Sorca Clarke', 'Sinn Féin', 'Longford-Westmeath', 'TD', westmeath_id, 'TD', '2024-12-18', true),
    ('Robert Troy', 'Fianna Fáil', 'Longford-Westmeath', 'TD', westmeath_id, 'TD', '2024-12-18', true);

  -- LOUTH (5 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Paula Butterly', 'Fine Gael', 'Louth', 'TD', louth_id, 'TD', '2024-12-18', true),
    ('Joanna Byrne', 'Sinn Féin', 'Louth', 'TD', louth_id, 'TD', '2024-12-18', true),
    ('Erin McGreehan', 'Fianna Fáil', 'Louth', 'TD', louth_id, 'TD', '2024-12-18', true),
    ('Ged Nash', 'Labour', 'Louth', 'TD', louth_id, 'TD', '2024-12-18', true),
    ('Ruairí Ó Murchú', 'Sinn Féin', 'Louth', 'TD', louth_id, 'TD', '2024-12-18', true);

  -- MAYO (4 seats - Dara Calleary already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Rose Conway-Walsh', 'Sinn Féin', 'Mayo', 'TD', mayo_id, 'TD', '2024-12-18', true),
    ('Alan Dillon', 'Fine Gael', 'Mayo', 'TD', mayo_id, 'TD', '2024-12-18', true),
    ('Keira Keogh', 'Fine Gael', 'Mayo', 'TD', mayo_id, 'TD', '2024-12-18', true),
    ('Paul Lawless', 'Aontú', 'Mayo', 'TD', mayo_id, 'TD', '2024-12-18', true);

  -- MEATH EAST (2 seats - Helen McEntee already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Thomas Byrne', 'Fianna Fáil', 'Meath East', 'TD', meath_id, 'TD', '2024-12-18', true),
    ('Darren O''Rourke', 'Sinn Féin', 'Meath East', 'TD', meath_id, 'TD', '2024-12-18', true);

  -- MEATH WEST (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Aisling Dempsey', 'Fianna Fáil', 'Meath West', 'TD', meath_id, 'TD', '2024-12-18', true),
    ('Johnny Guirke', 'Sinn Féin', 'Meath West', 'TD', meath_id, 'TD', '2024-12-18', true),
    ('Peadar Tóibín', 'Aontú', 'Meath West', 'TD', meath_id, 'TD', '2024-12-18', true);

  -- OFFALY (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('John Clendennen', 'Fine Gael', 'Offaly', 'TD', offaly_id, 'TD', '2024-12-18', true),
    ('Tony McCormack', 'Fianna Fáil', 'Offaly', 'TD', offaly_id, 'TD', '2024-12-18', true),
    ('Carol Nolan', 'Independent', 'Offaly', 'TD', offaly_id, 'TD', '2024-12-18', true);

  -- ROSCOMMON-GALWAY (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Martin Daly', 'Fianna Fáil', 'Roscommon-Galway', 'TD', roscommon_id, 'TD', '2024-12-18', true),
    ('Michael Fitzmaurice', 'Independent Ireland', 'Roscommon-Galway', 'TD', roscommon_id, 'TD', '2024-12-18', true),
    ('Claire Kerrane', 'Sinn Féin', 'Roscommon-Galway', 'TD', roscommon_id, 'TD', '2024-12-18', true);

  -- SLIGO-LEITRIM (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Frank Feighan', 'Fine Gael', 'Sligo-Leitrim', 'TD', sligo_id, 'TD', '2024-12-18', true),
    ('Marian Harkin', 'Independent', 'Sligo-Leitrim', 'TD', sligo_id, 'TD', '2024-12-18', true),
    ('Martin Kenny', 'Sinn Féin', 'Sligo-Leitrim', 'TD', sligo_id, 'TD', '2024-12-18', true);

  -- TIPPERARY NORTH (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Alan Kelly', 'Labour', 'Tipperary North', 'TD', tipperary_id, 'TD', '2024-12-18', true),
    ('Michael Lowry', 'Independent', 'Tipperary North', 'TD', tipperary_id, 'TD', '2024-12-18', true),
    ('Ryan O''Meara', 'Fianna Fáil', 'Tipperary North', 'TD', tipperary_id, 'TD', '2024-12-18', true);

  -- TIPPERARY SOUTH (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Séamus Healy', 'Workers and Unemployed Action', 'Tipperary South', 'TD', tipperary_id, 'TD', '2024-12-18', true),
    ('Mattie McGrath', 'Independent', 'Tipperary South', 'TD', tipperary_id, 'TD', '2024-12-18', true),
    ('Michael Murphy', 'Fine Gael', 'Tipperary South', 'TD', tipperary_id, 'TD', '2024-12-18', true);

  -- WATERFORD (3 seats - Mary Butler already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('John Cummins', 'Fine Gael', 'Waterford', 'TD', waterford_id, 'TD', '2024-12-18', true),
    ('David Cullinane', 'Sinn Féin', 'Waterford', 'TD', waterford_id, 'TD', '2024-12-18', true),
    ('Conor D. McGuinness', 'Sinn Féin', 'Waterford', 'TD', waterford_id, 'TD', '2024-12-18', true);

  -- WEXFORD (3 seats - James Browne already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('George Lawlor', 'Fine Gael', 'Wexford', 'TD', wexford_id, 'TD', '2024-12-18', true),
    ('Verona Murphy', 'Independent', 'Wexford', 'TD', wexford_id, 'TD', '2024-12-18', true),
    ('Johnny Mythen', 'Sinn Féin', 'Wexford', 'TD', wexford_id, 'TD', '2024-12-18', true);

  -- WICKLOW (3 seats - Simon Harris already in DB)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('John Brady', 'Sinn Féin', 'Wicklow', 'TD', wicklow_id, 'TD', '2024-12-18', true),
    ('Edward Timmins', 'Fine Gael', 'Wicklow', 'TD', wicklow_id, 'TD', '2024-12-18', true),
    ('Jennifer Whitmore', 'Social Democrats', 'Wicklow', 'TD', wicklow_id, 'TD', '2024-12-18', true);

  -- WICKLOW-WEXFORD (3 seats)
  INSERT INTO politicians (name, party, constituency, role, county_id, position_type, term_start, active) VALUES
    ('Brian Brennan', 'Fine Gael', 'Wicklow-Wexford', 'TD', wicklow_id, 'TD', '2024-12-18', true),
    ('Malcolm Byrne', 'Fianna Fáil', 'Wicklow-Wexford', 'TD', wexford_id, 'TD', '2024-12-18', true),
    ('Fionntán Ó Súilleabháin', 'Sinn Féin', 'Wicklow-Wexford', 'TD', wexford_id, 'TD', '2024-12-18', true);

END $$;
