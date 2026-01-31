-- Migration 009: Import all politicians (Island of Ireland)
-- ROI: 949 councillors, 174 TDs, 60 Senators
-- NI: 461 councillors, 93 MLAs
-- Total: 1,737 politicians

-- ============================================
-- PART 1: Add Northern Ireland Counties
-- ============================================

INSERT INTO counties (name, province) VALUES
  ('Antrim', 'Ulster'),
  ('Armagh', 'Ulster'),
  ('Down', 'Ulster'),
  ('Fermanagh', 'Ulster'),
  ('Londonderry', 'Ulster'),
  ('Tyrone', 'Ulster')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PART 2: Add Northern Ireland Local Authorities
-- ============================================

DO $$
DECLARE
  antrim_id INT; armagh_id INT; down_id INT;
  fermanagh_id INT; londonderry_id INT; tyrone_id INT;
BEGIN
  SELECT id INTO antrim_id FROM counties WHERE name = 'Antrim';
  SELECT id INTO armagh_id FROM counties WHERE name = 'Armagh';
  SELECT id INTO down_id FROM counties WHERE name = 'Down';
  SELECT id INTO fermanagh_id FROM counties WHERE name = 'Fermanagh';
  SELECT id INTO londonderry_id FROM counties WHERE name = 'Londonderry';
  SELECT id INTO tyrone_id FROM counties WHERE name = 'Tyrone';

  INSERT INTO local_authorities (county_id, name, authority_type) VALUES
    (antrim_id, 'Belfast City Council', 'City Council'),
    (antrim_id, 'Antrim and Newtownabbey Borough Council', 'Borough Council'),
    (antrim_id, 'Lisburn and Castlereagh City Council', 'City Council'),
    (antrim_id, 'Mid and East Antrim Borough Council', 'Borough Council'),
    (down_id, 'Ards and North Down Borough Council', 'Borough Council'),
    (down_id, 'Newry, Mourne and Down District Council', 'District Council'),
    (armagh_id, 'Armagh City, Banbridge and Craigavon Borough Council', 'Borough Council'),
    (londonderry_id, 'Causeway Coast and Glens Borough Council', 'Borough Council'),
    (londonderry_id, 'Derry City and Strabane District Council', 'District Council'),
    (fermanagh_id, 'Fermanagh and Omagh District Council', 'District Council'),
    (tyrone_id, 'Mid Ulster District Council', 'District Council')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- PART 3: Clear existing politicians
-- ============================================

DELETE FROM status_history WHERE promise_id IN (SELECT id FROM promises);
DELETE FROM milestones WHERE promise_id IN (SELECT id FROM promises);
DELETE FROM evidence WHERE promise_id IN (SELECT id FROM promises);
DELETE FROM promises;
DELETE FROM politicians;

-- ============================================
-- PART 4: Import TDs (174)
-- ============================================

DO $$
DECLARE
  dublin_id INT; cork_id INT; galway_id INT; kerry_id INT;
  limerick_id INT; waterford_id INT; wexford_id INT; wicklow_id INT;
  donegal_id INT; mayo_id INT; clare_id INT; tipperary_id INT;
  kildare_id INT; meath_id INT; louth_id INT; cavan_id INT;
  monaghan_id INT; sligo_id INT; roscommon_id INT; laois_id INT;
  offaly_id INT; westmeath_id INT; longford_id INT; carlow_id INT;
  kilkenny_id INT; leitrim_id INT;
BEGIN
  SELECT id INTO dublin_id FROM counties WHERE name = 'Dublin';
  SELECT id INTO cork_id FROM counties WHERE name = 'Cork';
  SELECT id INTO galway_id FROM counties WHERE name = 'Galway';
  SELECT id INTO kerry_id FROM counties WHERE name = 'Kerry';
  SELECT id INTO limerick_id FROM counties WHERE name = 'Limerick';
  SELECT id INTO waterford_id FROM counties WHERE name = 'Waterford';
  SELECT id INTO wexford_id FROM counties WHERE name = 'Wexford';
  SELECT id INTO wicklow_id FROM counties WHERE name = 'Wicklow';
  SELECT id INTO donegal_id FROM counties WHERE name = 'Donegal';
  SELECT id INTO mayo_id FROM counties WHERE name = 'Mayo';
  SELECT id INTO clare_id FROM counties WHERE name = 'Clare';
  SELECT id INTO tipperary_id FROM counties WHERE name = 'Tipperary';
  SELECT id INTO kildare_id FROM counties WHERE name = 'Kildare';
  SELECT id INTO meath_id FROM counties WHERE name = 'Meath';
  SELECT id INTO louth_id FROM counties WHERE name = 'Louth';
  SELECT id INTO cavan_id FROM counties WHERE name = 'Cavan';
  SELECT id INTO monaghan_id FROM counties WHERE name = 'Monaghan';
  SELECT id INTO sligo_id FROM counties WHERE name = 'Sligo';
  SELECT id INTO roscommon_id FROM counties WHERE name = 'Roscommon';
  SELECT id INTO laois_id FROM counties WHERE name = 'Laois';
  SELECT id INTO offaly_id FROM counties WHERE name = 'Offaly';
  SELECT id INTO westmeath_id FROM counties WHERE name = 'Westmeath';
  SELECT id INTO longford_id FROM counties WHERE name = 'Longford';
  SELECT id INTO carlow_id FROM counties WHERE name = 'Carlow';
  SELECT id INTO kilkenny_id FROM counties WHERE name = 'Kilkenny';
  SELECT id INTO leitrim_id FROM counties WHERE name = 'Leitrim';

  INSERT INTO politicians (name, party, constituency, county_id, position_type, role, term_start, active) VALUES
    ('Eoin Ó Broin', 'Sinn Féin', 'Dublin Mid-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Naoise Ó Cearúil', 'Fianna Fáil', 'Kildare North', kildare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Seán Ó Fearghaíl', 'Fianna Fáil', 'Kildare South', kildare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Donnchadh Ó Laoghaire', 'Sinn Féin', 'Cork South-Central', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Naoise Ó Muirí', 'Fine Gael', 'Dublin Bay North', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Ruairí Ó Murchú', 'Sinn Féin', 'Louth', louth_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Fionntán Ó Súilleabháin', 'Sinn Féin', 'Wicklow-Wexford', wicklow_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Aengus Ó Snodaigh', 'Sinn Féin', 'Dublin South-Central', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Ciarán Ahern', 'Labour Party', 'Dublin South-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('William Aird', 'Fine Gael', 'Laois', laois_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Catherine Ardagh', 'Fianna Fáil', 'Dublin South-Central', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Ivana Bacik', 'Labour Party', 'Dublin Bay South', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Cathy Bennett', 'Sinn Féin', 'Cavan-Monaghan', cavan_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Grace Boland', 'Fine Gael', 'Dublin Fingal West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Richard Boyd Barrett', 'People Before Profit-Solidarity', 'Dún Laoghaire', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Tom Brabazon', 'Fianna Fáil', 'Dublin Bay North', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('John Brady', 'Sinn Féin', 'Wicklow', wicklow_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Brian Brennan', 'Fine Gael', 'Wicklow-Wexford', wicklow_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Shay Brennan', 'Fianna Fáil', 'Dublin Rathdown', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Colm Brophy', 'Fine Gael', 'Dublin South-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('James Browne', 'Fianna Fáil', 'Wexford', wexford_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Pat Buckley', 'Sinn Féin', 'Cork East', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Colm Burke', 'Fine Gael', 'Cork North-Central', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Peter Burke', 'Fine Gael', 'Longford-Westmeath', longford_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Mary Butler', 'Fianna Fáil', 'Waterford', waterford_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Paula Butterly', 'Fine Gael', 'Louth', louth_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Jerry Buttimer', 'Fine Gael', 'Cork South-Central', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Joanna Byrne', 'Sinn Féin', 'Louth', louth_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Malcolm Byrne', 'Fianna Fáil', 'Wicklow-Wexford', wexford_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Thomas Byrne', 'Fianna Fáil', 'Meath East', meath_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Michael Cahill', 'Fianna Fáil', 'Kerry', kerry_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Holly Cairns', 'Social Democrats', 'Cork South-West', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Catherine Callaghan', 'Fine Gael', 'Carlow-Kilkenny', carlow_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Dara Calleary', 'Fianna Fáil', 'Mayo', mayo_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Seán Canney', 'Independent', 'Galway East', galway_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Micheál Carrigy', 'Fine Gael', 'Longford-Westmeath', longford_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Jennifer Carroll MacNeill', 'Fine Gael', 'Dún Laoghaire', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Matt Carthy', 'Sinn Féin', 'Cavan-Monaghan', cavan_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Jack Chambers', 'Fianna Fáil', 'Dublin West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Sorca Clarke', 'Sinn Féin', 'Longford-Westmeath', westmeath_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Peter Cleere', 'Fianna Fáil', 'Carlow-Kilkenny', kilkenny_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('John Clendennen', 'Fine Gael', 'Offaly', offaly_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Michael Collins', 'Independent Ireland', 'Cork South-West', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Niall Collins', 'Fianna Fáil', 'Limerick County', limerick_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Catherine Connolly', 'Independent', 'Galway West', galway_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('John Connolly', 'Fianna Fáil', 'Galway West', galway_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Rose Conway-Walsh', 'Sinn Féin', 'Mayo', mayo_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Joe Cooney', 'Fine Gael', 'Clare', clare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Ruth Coppinger', 'Solidarity', 'Dublin West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Réada Cronin', 'Sinn Féin', 'Kildare North', kildare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Cathal Crowe', 'Fianna Fáil', 'Clare', clare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Seán Crowe', 'Sinn Féin', 'Dublin South-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('David Cullinane', 'Sinn Féin', 'Waterford', waterford_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Jen Cummins', 'Social Democrats', 'Dublin South-Central', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('John Cummins', 'Fine Gael', 'Waterford', waterford_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Emer Currie', 'Fine Gael', 'Dublin West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Martin Daly', 'Fianna Fáil', 'Roscommon-Galway', roscommon_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Pa Daly', 'Sinn Féin', 'Kerry', kerry_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Aisling Dempsey', 'Fianna Fáil', 'Meath West', meath_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Máire Devine', 'Sinn Féin', 'Dublin South-Central', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Cormac Devlin', 'Fianna Fáil', 'Dún Laoghaire', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Alan Dillon', 'Fine Gael', 'Mayo', mayo_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Paschal Donohoe', 'Fine Gael', 'Dublin Central', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Pearse Doherty', 'Sinn Féin', 'Donegal', donegal_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Albert Dolan', 'Fianna Fáil', 'Galway East', galway_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Paul Donnelly', 'Sinn Féin', 'Dublin West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Timmy Dooley', 'Fianna Fáil', 'Clare', clare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Dessie Ellis', 'Sinn Féin', 'Dublin North-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Mairéad Farrell', 'Sinn Féin', 'Galway West', galway_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Aidan Farrelly', 'Social Democrats', 'Kildare North', kildare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Frank Feighan', 'Fine Gael', 'Sligo-Leitrim', sligo_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Michael Fitzmaurice', 'Independent', 'Roscommon-Galway', roscommon_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Seán Fleming', 'Fianna Fáil', 'Laois', laois_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Norma Foley', 'Fianna Fáil', 'Kerry', kerry_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Pat Gallagher', 'Fianna Fáil', 'Donegal', donegal_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Gary Gannon', 'Social Democrats', 'Dublin Central', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('James Geoghegan', 'Fine Gael', 'Dublin Bay South', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Sinéad Gibney', 'Social Democrats', 'Dublin Rathdown', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Paul Gogarty', 'Independent', 'Dublin Mid-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Thomas Gould', 'Sinn Féin', 'Cork North-Central', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Ann Graves', 'Sinn Féin', 'Dublin Fingal East', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Noel Grealish', 'Independent', 'Galway West', galway_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Johnny Guirke', 'Sinn Féin', 'Meath West', meath_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Marian Harkin', 'Independent', 'Sligo-Leitrim', sligo_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Simon Harris', 'Fine Gael', 'Wicklow', wicklow_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Eoin Hayes', 'Social Democrats', 'Dublin Bay South', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Séamus Healy', 'Independent', 'Tipperary South', tipperary_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Danny Healy-Rae', 'Independent', 'Kerry', kerry_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Michael Healy-Rae', 'Independent', 'Kerry', kerry_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Rory Hearne', 'Social Democrats', 'Dublin North-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Barry Heneghan', 'Independent', 'Dublin Bay North', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Martin Heydon', 'Fine Gael', 'Kildare South', kildare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Emer Higgins', 'Fine Gael', 'Dublin Mid-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Alan Kelly', 'Labour Party', 'Tipperary North', tipperary_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Eoghan Kenny', 'Labour Party', 'Cork North-Central', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Martin Kenny', 'Sinn Féin', 'Sligo-Leitrim', sligo_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Keira Keogh', 'Fine Gael', 'Mayo', mayo_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Claire Kerrane', 'Sinn Féin', 'Roscommon-Galway', roscommon_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('John Lahart', 'Fianna Fáil', 'Dublin South-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('James Lawless', 'Fianna Fáil', 'Kildare North', kildare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Paul Lawless', 'Aontú', 'Mayo', mayo_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('George Lawlor', 'Labour Party', 'Wexford', wexford_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Michael Lowry', 'Independent', 'Tipperary North', tipperary_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Pádraig Mac Lochlainn', 'Sinn Féin', 'Donegal', donegal_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Micheál Martin', 'Fianna Fáil', 'Cork South-Central', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('David Maxwell', 'Fine Gael', 'Cavan-Monaghan', cavan_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Paul McAuliffe', 'Fianna Fáil', 'Dublin North-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Noel McCarthy', 'Fine Gael', 'Cork East', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Charlie McConalogue', 'Fianna Fáil', 'Donegal', donegal_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Tony McCormack', 'Fianna Fáil', 'Offaly', offaly_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Mary Lou McDonald', 'Sinn Féin', 'Dublin Central', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Helen McEntee', 'Fine Gael', 'Meath East', meath_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Donna McGettigan', 'Sinn Féin', 'Clare', clare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Mattie McGrath', 'Independent', 'Tipperary South', tipperary_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Séamus McGrath', 'Fianna Fáil', 'Cork South-Central', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Erin McGreehan', 'Fianna Fáil', 'Louth', louth_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Conor McGuinness', 'Sinn Féin', 'Waterford', waterford_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('John McGuinness', 'Fianna Fáil', 'Carlow-Kilkenny', kilkenny_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Denise Mitchell', 'Sinn Féin', 'Dublin Bay North', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Kevin Moran', 'Independent', 'Longford-Westmeath', westmeath_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Aindrias Moynihan', 'Fianna Fáil', 'Cork North-West', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Michael Moynihan', 'Fianna Fáil', 'Cork North-West', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Shane Moynihan', 'Fianna Fáil', 'Dublin Mid-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Jennifer Murnane O''Connor', 'Fianna Fáil', 'Carlow-Kilkenny', carlow_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Michael Murphy', 'Fine Gael', 'Tipperary South', tipperary_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Paul Murphy', 'Solidarity', 'Dublin South-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Verona Murphy', 'Independent', 'Wexford', wexford_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Johnny Mythen', 'Sinn Féin', 'Wexford', wexford_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Shónagh Ní Raghallaigh', 'Sinn Féin', 'Kildare South', kildare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Gerald Nash', 'Labour Party', 'Louth', louth_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Hildegarde Naughton', 'Fine Gael', 'Galway West', galway_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Joe Neville', 'Fine Gael', 'Kildare North', kildare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Natasha Newsome Drennan', 'Sinn Féin', 'Carlow-Kilkenny', kilkenny_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Carol Nolan', 'Independent', 'Offaly', offaly_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Darragh O''Brien', 'Fianna Fáil', 'Dublin Fingal East', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Cian O''Callaghan', 'Social Democrats', 'Dublin Bay North', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Jim O''Callaghan', 'Fianna Fáil', 'Dublin Bay South', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Maeve O''Connell', 'Fine Gael', 'Dublin Rathdown', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('James O''Connor', 'Fianna Fáil', 'Cork East', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Willie O''Dea', 'Fianna Fáil', 'Limerick City', limerick_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Kieran O''Donnell', 'Fine Gael', 'Limerick City', limerick_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Richard O''Donoghue', 'Independent Ireland', 'Limerick County', limerick_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Robert O''Donoghue', 'Labour Party', 'Dublin Fingal West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Patrick O''Donovan', 'Fine Gael', 'Limerick County', limerick_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Ken O''Flynn', 'Independent Ireland', 'Cork North-Central', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Roderic O''Gorman', 'Green Party', 'Dublin West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Louis O''Hara', 'Sinn Féin', 'Galway East', galway_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Ryan O''Meara', 'Fianna Fáil', 'Tipperary North', tipperary_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Louise O''Reilly', 'Sinn Féin', 'Dublin Fingal West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Darren O''Rourke', 'Sinn Féin', 'Meath East', meath_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('John Paul O''Shea', 'Fine Gael', 'Cork North-West', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Christopher O''Sullivan', 'Fianna Fáil', 'Cork South-West', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Pádraig O''Sullivan', 'Fianna Fáil', 'Cork North-Central', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Liam Quaide', 'Social Democrats', 'Cork East', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Maurice Quinlivan', 'Sinn Féin', 'Limerick City', limerick_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Pádraig Rice', 'Social Democrats', 'Cork South-Central', cork_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Neale Richmond', 'Fine Gael', 'Dublin Rathdown', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Peter Roche', 'Fine Gael', 'Galway East', galway_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Eamon Scanlon', 'Fianna Fáil', 'Sligo-Leitrim', sligo_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Conor Sheehan', 'Labour Party', 'Limerick City', limerick_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Marie Sherlock', 'Labour Party', 'Dublin Central', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Brendan Smith', 'Fianna Fáil', 'Cavan-Monaghan', cavan_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Duncan Smith', 'Labour Party', 'Dublin Fingal East', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Niamh Smyth', 'Fianna Fáil', 'Cavan-Monaghan', monaghan_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Brian Stanley', 'Independent', 'Laois', laois_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Peadar Tóibín', 'Aontú', 'Meath West', meath_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Edward Timmins', 'Fine Gael', 'Wicklow', wicklow_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Gillian Toole', 'Independent', 'Meath East', meath_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Robert Troy', 'Fianna Fáil', 'Longford-Westmeath', westmeath_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Mark Wall', 'Labour Party', 'Kildare South', kildare_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Barry Ward', 'Fine Gael', 'Dún Laoghaire', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Charles Ward', '100% Redress Party', 'Donegal', donegal_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Mark Ward', 'Sinn Féin', 'Dublin Mid-West', dublin_id, 'TD', 'Teachta Dála', '2024-11-29', true),
    ('Jennifer Whitmore', 'Social Democrats', 'Wicklow', wicklow_id, 'TD', 'Teachta Dála', '2024-11-29', true);
END $$;

-- ============================================
-- PART 5: Import Senators (60)
-- ============================================

INSERT INTO politicians (name, party, constituency, position_type, role, term_start, active) VALUES
  ('Garret Ahearn', 'Fine Gael', 'Administrative Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Chris Andrews', 'Sinn Féin', 'Labour Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Barry Andrews', 'Fianna Fáil', 'Labour Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Frances Black', 'Independent', 'Industrial and Commercial Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Niall Blaney', 'Fianna Fáil', 'Agricultural Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Victor Boyhan', 'Independent', 'Agricultural Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Manus Boyle', 'Fine Gael', 'Taoiseach Nominee', 'Senator', 'Senator', '2025-01-15', true),
  ('Nikki Bradley', 'Fine Gael', 'Taoiseach Nominee', 'Senator', 'Senator', '2025-01-15', true),
  ('Paraic Brady', 'Fine Gael', 'Agricultural Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Cathal Byrne', 'Fine Gael', 'Cultural and Educational Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Maria Byrne', 'Fine Gael', 'Agricultural Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Pat Casey', 'Fianna Fáil', 'Labour Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Lorraine Clifford-Lee', 'Fianna Fáil', 'Taoiseach Nominee', 'Senator', 'Senator', '2025-01-15', true),
  ('Tom Clonan', 'Independent', 'University of Dublin', 'Senator', 'Senator', '2025-01-15', true),
  ('Joanne Collins', 'Sinn Féin', 'Agricultural Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Alison Comyn', 'Fianna Fáil', 'Taoiseach Nominee', 'Senator', 'Senator', '2025-01-15', true),
  ('Joe Conway', 'Independent', 'Cultural and Educational Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Martin Conway', 'Fine Gael', 'Administrative Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Nessa Cosgrove', 'Labour Party', 'Labour Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Teresa Costello', 'Fianna Fáil', 'Agricultural Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Gerard Craughwell', 'Independent', 'Labour Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Ollie Crowe', 'Fianna Fáil', 'Industrial and Commercial Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Shane Curley', 'Fianna Fáil', 'Cultural and Educational Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Mark Daly', 'Fianna Fáil', 'Administrative Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Paul Daly', 'Fianna Fáil', 'Agricultural Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Aidan Davitt', 'Fianna Fáil', 'Industrial and Commercial Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Mark Duffy', 'Fine Gael', 'Labour Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Mary Fitzpatrick', 'Fianna Fáil', 'Taoiseach Nominee', 'Senator', 'Senator', '2025-01-15', true),
  ('Joe Flaherty', 'Fianna Fáil', 'Taoiseach Nominee', 'Senator', 'Senator', '2025-01-15', true),
  ('Eileen Flynn', 'Independent', 'Taoiseach Nominee', 'Senator', 'Senator', '2025-01-15', true),
  ('Robbie Gallagher', 'Fianna Fáil', 'Labour Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Imelda Goldsboro', 'Fianna Fáil', 'Taoiseach Nominee', 'Senator', 'Senator', '2025-01-15', true),
  ('Laura Harmon', 'Labour Party', 'Industrial and Commercial Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Alice-Mary Higgins', 'Independent', 'National University of Ireland', 'Senator', 'Senator', '2025-01-15', true),
  ('Garret Kelleher', 'Fine Gael', 'Industrial and Commercial Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Mike Kennelly', 'Fine Gael', 'Labour Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Sharon Keogan', 'Independent', 'Industrial and Commercial Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Seán Kyne', 'Fine Gael', 'Cultural and Educational Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Eileen Lynch', 'Fine Gael', 'Agricultural Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Aubrey McCarthy', 'Independent', 'University of Dublin', 'Senator', 'Senator', '2025-01-15', true),
  ('Maria McCormack', 'Sinn Féin', 'Labour Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Michael McDowell', 'Independent', 'National University of Ireland', 'Senator', 'Senator', '2025-01-15', true),
  ('Rónán Mullen', 'Independent', 'National University of Ireland', 'Senator', 'Senator', '2025-01-15', true),
  ('Conor Murphy', 'Sinn Féin', 'Industrial and Commercial Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Margaret Murphy O''Mahony', 'Fianna Fáil', 'Labour Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Evanne Ní Chuilinn', 'Fine Gael', 'Taoiseach Nominee', 'Senator', 'Senator', '2025-01-15', true),
  ('Linda Nelson Murray', 'Fine Gael', 'Industrial and Commercial Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Malcolm Noonan', 'Green Party', 'Agricultural Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Noel O''Donovan', 'Fine Gael', 'Taoiseach Nominee', 'Senator', 'Senator', '2025-01-15', true),
  ('Fiona O''Loughlin', 'Fianna Fáil', 'Administrative Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Joe O''Reilly', 'Fine Gael', 'Labour Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Sarah O''Reilly', 'Aontú', 'Agricultural Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Anne Rabbitte', 'Fianna Fáil', 'Administrative Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Lynn Ruane', 'Independent', 'University of Dublin', 'Senator', 'Senator', '2025-01-15', true),
  ('Dee Ryan', 'Fianna Fáil', 'Taoiseach Nominee', 'Senator', 'Senator', '2025-01-15', true),
  ('Nicole Ryan', 'Sinn Féin', 'Administrative Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Gareth Scahill', 'Fine Gael', 'Taoiseach Nominee', 'Senator', 'Senator', '2025-01-15', true),
  ('Patricia Stephenson', 'Social Democrats', 'Labour Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Pauline Tully', 'Sinn Féin', 'Cultural and Educational Panel', 'Senator', 'Senator', '2025-01-15', true),
  ('Diarmuid Wilson', 'Fianna Fáil', 'Administrative Panel', 'Senator', 'Senator', '2025-01-15', true);

-- Continued in Part 2...
