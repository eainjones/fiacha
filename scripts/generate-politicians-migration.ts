import * as fs from 'fs';
import * as path from 'path';

// County name to slug mapping
const countyMapping: Record<string, string> = {
  'carlow': 'Carlow',
  'cavan': 'Cavan',
  'clare': 'Clare',
  'cork': 'Cork',
  'cork-city': 'Cork',
  'donegal': 'Donegal',
  'dublin': 'Dublin',
  'dun-laoghaire-rathdown': 'Dublin',
  'fingal': 'Dublin',
  'south-dublin': 'Dublin',
  'galway': 'Galway',
  'galway-city': 'Galway',
  'kerry': 'Kerry',
  'kildare': 'Kildare',
  'kilkenny': 'Kilkenny',
  'laois': 'Laois',
  'leitrim': 'Leitrim',
  'limerick': 'Limerick',
  'longford': 'Longford',
  'louth': 'Louth',
  'mayo': 'Mayo',
  'meath': 'Meath',
  'monaghan': 'Monaghan',
  'offaly': 'Offaly',
  'roscommon': 'Roscommon',
  'sligo': 'Sligo',
  'tipperary': 'Tipperary',
  'waterford': 'Waterford',
  'westmeath': 'Westmeath',
  'wexford': 'Wexford',
  'wicklow': 'Wicklow',
  // NI
  'antrim': 'Antrim',
  'armagh': 'Armagh',
  'down': 'Down',
  'fermanagh': 'Fermanagh',
  'londonderry': 'Londonderry',
  'tyrone': 'Tyrone',
};

// NI council to county mapping
const niCouncilToCounty: Record<string, string> = {
  'Belfast': 'Antrim',
  'Antrim and Newtownabbey': 'Antrim',
  'Ards and North Down': 'Down',
  'Armagh City, Banbridge and Craigavon': 'Armagh',
  'Causeway Coast and Glens': 'Londonderry',
  'Derry City and Strabane': 'Londonderry',
  'Fermanagh and Omagh': 'Fermanagh',
  'Lisburn and Castlereagh': 'Antrim',
  'Mid and East Antrim': 'Antrim',
  'Mid Ulster': 'Tyrone',
  'Newry, Mourne and Down': 'Down',
};

// TD constituency to county (first match)
const constituencyToCounty: Record<string, string> = {
  'carlow': 'Carlow', 'cavan': 'Cavan', 'clare': 'Clare', 'cork': 'Cork',
  'donegal': 'Donegal', 'dublin': 'Dublin', 'galway': 'Galway', 'kerry': 'Kerry',
  'kildare': 'Kildare', 'kilkenny': 'Kilkenny', 'laois': 'Laois', 'leitrim': 'Leitrim',
  'limerick': 'Limerick', 'longford': 'Longford', 'louth': 'Louth', 'mayo': 'Mayo',
  'meath': 'Meath', 'monaghan': 'Monaghan', 'offaly': 'Offaly', 'roscommon': 'Roscommon',
  'sligo': 'Sligo', 'tipperary': 'Tipperary', 'waterford': 'Waterford',
  'westmeath': 'Westmeath', 'wexford': 'Wexford', 'wicklow': 'Wicklow',
  'dún laoghaire': 'Dublin', 'fingal': 'Dublin',
};

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''");
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => row[h] = values[i] || '');
    return row;
  });
}

function getCountyFromConstituency(constituency: string): string | null {
  const lower = constituency.toLowerCase();
  for (const [key, county] of Object.entries(constituencyToCounty)) {
    if (lower.includes(key)) return county;
  }
  return null;
}

async function main() {
  const dataDir = path.join(__dirname, '..', 'data');

  let sql = `-- Migration: Import all politicians with proper county links (SAFE UPSERT)
-- Generated: ${new Date().toISOString()}
-- This migration uses INSERT ... ON CONFLICT to safely update existing records
-- WITHOUT deleting any data. Existing promises/evidence are preserved.

-- Add unique constraint for upsert support (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'politicians_name_position_type_constituency_key'
  ) THEN
    ALTER TABLE politicians ADD CONSTRAINT politicians_name_position_type_constituency_key
      UNIQUE (name, position_type, constituency);
  END IF;
END $$;

`;

  // TDs
  const tdsContent = fs.readFileSync(path.join(dataDir, 'national', 'tds.csv'), 'utf8');
  const tds = parseCSV(tdsContent);

  sql += `-- TDs (${tds.length})\n`;
  for (const td of tds) {
    const county = getCountyFromConstituency(td.constituency);
    const countyLookup = county ? `(SELECT id FROM counties WHERE name = '${escapeSQL(county)}')` : 'NULL';
    sql += `INSERT INTO politicians (name, party, constituency, role, position_type, county_id, term_start, active)
  VALUES ('${escapeSQL(td.name)}', '${escapeSQL(td.party)}', '${escapeSQL(td.constituency)}', 'Teachta Dála', 'TD', ${countyLookup}, '2024-11-29', true)
  ON CONFLICT (name, position_type, constituency) DO UPDATE SET party = EXCLUDED.party, role = EXCLUDED.role, county_id = EXCLUDED.county_id, term_start = EXCLUDED.term_start, active = EXCLUDED.active, updated_at = CURRENT_TIMESTAMP;\n`;
  }

  // Senators
  const senatorsContent = fs.readFileSync(path.join(dataDir, 'national', 'senators.csv'), 'utf8');
  const senators = parseCSV(senatorsContent);

  sql += `\n-- Senators (${senators.length})\n`;
  for (const senator of senators) {
    sql += `INSERT INTO politicians (name, party, constituency, role, position_type, term_start, active)
  VALUES ('${escapeSQL(senator.name)}', '${escapeSQL(senator.party)}', '${escapeSQL(senator.panel)}', 'Senator', 'Senator', '2024-11-29', true)
  ON CONFLICT (name, position_type, constituency) DO UPDATE SET party = EXCLUDED.party, role = EXCLUDED.role, term_start = EXCLUDED.term_start, active = EXCLUDED.active, updated_at = CURRENT_TIMESTAMP;\n`;
  }

  // ROI Councillors
  const councillorsContent = fs.readFileSync(path.join(dataDir, 'all_councillors_merged.csv'), 'utf8');
  const councillors = parseCSV(councillorsContent);

  sql += `\n-- ROI Councillors (${councillors.length})\n`;
  for (const c of councillors) {
    const countyName = countyMapping[c.county.toLowerCase()] || c.county;
    sql += `INSERT INTO politicians (name, party, constituency, role, position_type, county_id, local_authority_id, term_start, active)
  VALUES ('${escapeSQL(c.name)}', NULL, '${escapeSQL(c.county)}', 'County Councillor', 'Councillor', (SELECT id FROM counties WHERE name = '${escapeSQL(countyName)}'), (SELECT id FROM local_authorities WHERE LOWER(name) LIKE '%${escapeSQL(c.county.toLowerCase().replace('-', ' '))}%' LIMIT 1), '2024-06-07', true)
  ON CONFLICT (name, position_type, constituency) DO UPDATE SET role = EXCLUDED.role, county_id = EXCLUDED.county_id, local_authority_id = EXCLUDED.local_authority_id, term_start = EXCLUDED.term_start, active = EXCLUDED.active, updated_at = CURRENT_TIMESTAMP;\n`;
  }

  // NI MLAs
  const mlasContent = fs.readFileSync(path.join(dataDir, 'northern-ireland', 'mlas.csv'), 'utf8');
  const mlas = parseCSV(mlasContent);

  sql += `\n-- NI MLAs (${mlas.length})\n`;
  for (const mla of mlas) {
    sql += `INSERT INTO politicians (name, party, constituency, role, position_type, term_start, active)
  VALUES ('${escapeSQL(mla.name)}', '${escapeSQL(mla.party)}', '${escapeSQL(mla.constituency)}', 'Member of Legislative Assembly', 'MLA', '2022-05-05', true)
  ON CONFLICT (name, position_type, constituency) DO UPDATE SET party = EXCLUDED.party, role = EXCLUDED.role, term_start = EXCLUDED.term_start, active = EXCLUDED.active, updated_at = CURRENT_TIMESTAMP;\n`;
  }

  // NI Councillors
  const niCouncillorsContent = fs.readFileSync(path.join(dataDir, 'northern-ireland', 'councillors.csv'), 'utf8');
  const niCouncillors = parseCSV(niCouncillorsContent);

  sql += `\n-- NI Councillors (${niCouncillors.length})\n`;
  for (const c of niCouncillors) {
    const county = niCouncilToCounty[c.council] || 'Antrim';
    sql += `INSERT INTO politicians (name, party, constituency, role, position_type, county_id, term_start, active)
  VALUES ('${escapeSQL(c.name)}', '${escapeSQL(c.party)}', '${escapeSQL(c.council)}', 'District Councillor', 'Councillor', (SELECT id FROM counties WHERE name = '${escapeSQL(county)}'), '2023-05-18', true)
  ON CONFLICT (name, position_type, constituency) DO UPDATE SET party = EXCLUDED.party, role = EXCLUDED.role, county_id = EXCLUDED.county_id, term_start = EXCLUDED.term_start, active = EXCLUDED.active, updated_at = CURRENT_TIMESTAMP;\n`;
  }

  // Summary
  const total = tds.length + senators.length + councillors.length + mlas.length + niCouncillors.length;
  sql += `\n-- Total: ${total} politicians\n`;

  // Write migration
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250104100000_import_all_politicians_v2.sql');
  fs.writeFileSync(migrationPath, sql);
  console.log(`Generated migration: ${migrationPath}`);
  console.log(`Total politicians: ${total}`);
  console.log(`  TDs: ${tds.length}`);
  console.log(`  Senators: ${senators.length}`);
  console.log(`  ROI Councillors: ${councillors.length}`);
  console.log(`  NI MLAs: ${mlas.length}`);
  console.log(`  NI Councillors: ${niCouncillors.length}`);
}

main().catch(console.error);
