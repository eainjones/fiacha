-- Seed Local Authorities (31 total in Ireland)

-- Get county IDs for reference
DO $$
DECLARE
  carlow_id INT; dublin_id INT; kildare_id INT; kilkenny_id INT;
  laois_id INT; longford_id INT; louth_id INT; meath_id INT;
  offaly_id INT; westmeath_id INT; wexford_id INT; wicklow_id INT;
  clare_id INT; cork_id INT; kerry_id INT; limerick_id INT;
  tipperary_id INT; waterford_id INT; galway_id INT; leitrim_id INT;
  mayo_id INT; roscommon_id INT; sligo_id INT; cavan_id INT;
  donegal_id INT; monaghan_id INT;
BEGIN
  -- Get all county IDs
  SELECT id INTO carlow_id FROM counties WHERE name = 'Carlow';
  SELECT id INTO dublin_id FROM counties WHERE name = 'Dublin';
  SELECT id INTO kildare_id FROM counties WHERE name = 'Kildare';
  SELECT id INTO kilkenny_id FROM counties WHERE name = 'Kilkenny';
  SELECT id INTO laois_id FROM counties WHERE name = 'Laois';
  SELECT id INTO longford_id FROM counties WHERE name = 'Longford';
  SELECT id INTO louth_id FROM counties WHERE name = 'Louth';
  SELECT id INTO meath_id FROM counties WHERE name = 'Meath';
  SELECT id INTO offaly_id FROM counties WHERE name = 'Offaly';
  SELECT id INTO westmeath_id FROM counties WHERE name = 'Westmeath';
  SELECT id INTO wexford_id FROM counties WHERE name = 'Wexford';
  SELECT id INTO wicklow_id FROM counties WHERE name = 'Wicklow';
  SELECT id INTO clare_id FROM counties WHERE name = 'Clare';
  SELECT id INTO cork_id FROM counties WHERE name = 'Cork';
  SELECT id INTO kerry_id FROM counties WHERE name = 'Kerry';
  SELECT id INTO limerick_id FROM counties WHERE name = 'Limerick';
  SELECT id INTO tipperary_id FROM counties WHERE name = 'Tipperary';
  SELECT id INTO waterford_id FROM counties WHERE name = 'Waterford';
  SELECT id INTO galway_id FROM counties WHERE name = 'Galway';
  SELECT id INTO leitrim_id FROM counties WHERE name = 'Leitrim';
  SELECT id INTO mayo_id FROM counties WHERE name = 'Mayo';
  SELECT id INTO roscommon_id FROM counties WHERE name = 'Roscommon';
  SELECT id INTO sligo_id FROM counties WHERE name = 'Sligo';
  SELECT id INTO cavan_id FROM counties WHERE name = 'Cavan';
  SELECT id INTO donegal_id FROM counties WHERE name = 'Donegal';
  SELECT id INTO monaghan_id FROM counties WHERE name = 'Monaghan';

  -- Insert Local Authorities
  -- County Councils
  INSERT INTO local_authorities (county_id, name, authority_type) VALUES
    (carlow_id, 'Carlow County Council', 'County Council'),
    (kildare_id, 'Kildare County Council', 'County Council'),
    (kilkenny_id, 'Kilkenny County Council', 'County Council'),
    (laois_id, 'Laois County Council', 'County Council'),
    (longford_id, 'Longford County Council', 'County Council'),
    (louth_id, 'Louth County Council', 'County Council'),
    (meath_id, 'Meath County Council', 'County Council'),
    (offaly_id, 'Offaly County Council', 'County Council'),
    (westmeath_id, 'Westmeath County Council', 'County Council'),
    (wexford_id, 'Wexford County Council', 'County Council'),
    (wicklow_id, 'Wicklow County Council', 'County Council'),
    (clare_id, 'Clare County Council', 'County Council'),
    (cork_id, 'Cork County Council', 'County Council'),
    (kerry_id, 'Kerry County Council', 'County Council'),
    (tipperary_id, 'Tipperary County Council', 'County Council'),
    (leitrim_id, 'Leitrim County Council', 'County Council'),
    (mayo_id, 'Mayo County Council', 'County Council'),
    (roscommon_id, 'Roscommon County Council', 'County Council'),
    (sligo_id, 'Sligo County Council', 'County Council'),
    (cavan_id, 'Cavan County Council', 'County Council'),
    (donegal_id, 'Donegal County Council', 'County Council'),
    (monaghan_id, 'Monaghan County Council', 'County Council'),

    -- Dublin County Councils (3)
    (dublin_id, 'Fingal County Council', 'County Council'),
    (dublin_id, 'Dún Laoghaire-Rathdown County Council', 'County Council'),
    (dublin_id, 'South Dublin County Council', 'County Council'),

    -- City Councils (3)
    (dublin_id, 'Dublin City Council', 'City Council'),
    (cork_id, 'Cork City Council', 'City Council'),
    (galway_id, 'Galway City Council', 'City Council'),

    -- City and County Councils (2)
    (limerick_id, 'Limerick City and County Council', 'City and County Council'),
    (waterford_id, 'Waterford City and County Council', 'City and County Council');

END $$;
