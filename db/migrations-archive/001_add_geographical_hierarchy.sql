-- Geographical Hierarchy for Ireland

-- Counties table (26 counties in Republic of Ireland)
CREATE TABLE IF NOT EXISTS counties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  province VARCHAR(50), -- Leinster, Munster, Connacht, Ulster
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Local authorities (County Councils, City Councils, City and County Councils)
CREATE TABLE IF NOT EXISTS local_authorities (
  id SERIAL PRIMARY KEY,
  county_id INTEGER REFERENCES counties(id),
  name VARCHAR(150) NOT NULL,
  authority_type VARCHAR(50), -- County Council, City Council, City and County Council
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Electoral areas within local authorities
CREATE TABLE IF NOT EXISTS electoral_areas (
  id SERIAL PRIMARY KEY,
  local_authority_id INTEGER REFERENCES local_authorities(id),
  name VARCHAR(150) NOT NULL,
  area_type VARCHAR(50), -- Local Electoral Area, Municipal District
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add geographical references to politicians table
ALTER TABLE politicians
  ADD COLUMN IF NOT EXISTS county_id INTEGER REFERENCES counties(id),
  ADD COLUMN IF NOT EXISTS local_authority_id INTEGER REFERENCES local_authorities(id),
  ADD COLUMN IF NOT EXISTS electoral_area_id INTEGER REFERENCES electoral_areas(id),
  ADD COLUMN IF NOT EXISTS position_type VARCHAR(50), -- TD, Councillor, Senator, MEP
  ADD COLUMN IF NOT EXISTS term_start DATE,
  ADD COLUMN IF NOT EXISTS term_end DATE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_local_authorities_county ON local_authorities(county_id);
CREATE INDEX IF NOT EXISTS idx_electoral_areas_authority ON electoral_areas(local_authority_id);
CREATE INDEX IF NOT EXISTS idx_politicians_county ON politicians(county_id);
CREATE INDEX IF NOT EXISTS idx_politicians_local_authority ON politicians(local_authority_id);
CREATE INDEX IF NOT EXISTS idx_politicians_electoral_area ON politicians(electoral_area_id);

-- Insert the 26 counties of the Republic of Ireland
INSERT INTO counties (name, province) VALUES
  -- Leinster
  ('Carlow', 'Leinster'),
  ('Dublin', 'Leinster'),
  ('Kildare', 'Leinster'),
  ('Kilkenny', 'Leinster'),
  ('Laois', 'Leinster'),
  ('Longford', 'Leinster'),
  ('Louth', 'Leinster'),
  ('Meath', 'Leinster'),
  ('Offaly', 'Leinster'),
  ('Westmeath', 'Leinster'),
  ('Wexford', 'Leinster'),
  ('Wicklow', 'Leinster'),
  -- Munster
  ('Clare', 'Munster'),
  ('Cork', 'Munster'),
  ('Kerry', 'Munster'),
  ('Limerick', 'Munster'),
  ('Tipperary', 'Munster'),
  ('Waterford', 'Munster'),
  -- Connacht
  ('Galway', 'Connacht'),
  ('Leitrim', 'Connacht'),
  ('Mayo', 'Connacht'),
  ('Roscommon', 'Connacht'),
  ('Sligo', 'Connacht'),
  -- Ulster (Republic only)
  ('Cavan', 'Ulster'),
  ('Donegal', 'Ulster'),
  ('Monaghan', 'Ulster')
ON CONFLICT (name) DO NOTHING;
