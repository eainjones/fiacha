/**
 * Import Politicians Script
 *
 * Imports all politician data from CSV files into the database:
 * - 949 Republic of Ireland councillors
 * - 174 TDs
 * - 60 Senators
 * - 461 Northern Ireland councillors
 * - 93 Northern Ireland MLAs
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dns from 'dns';

// Force IPv4 for Supabase
dns.setDefaultResultOrder('ipv4first');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// CSV parsing helper
function parseCSV(content: string): Array<Record<string, string>> {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length === headers.length && values[0]) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx]; });
      rows.push(row);
    }
  }
  return rows;
}

// Mapping from directory name to local authority name
const localAuthorityMapping: Record<string, string> = {
  'carlow': 'Carlow County Council',
  'cavan': 'Cavan County Council',
  'clare': 'Clare County Council',
  'cork': 'Cork County Council',
  'cork-city': 'Cork City Council',
  'donegal': 'Donegal County Council',
  'dublin': 'Dublin City Council',
  'dun-laoghaire-rathdown': 'Dún Laoghaire-Rathdown County Council',
  'fingal': 'Fingal County Council',
  'galway': 'Galway County Council',
  'galway-city': 'Galway City Council',
  'kerry': 'Kerry County Council',
  'kildare': 'Kildare County Council',
  'kilkenny': 'Kilkenny County Council',
  'laois': 'Laois County Council',
  'leitrim': 'Leitrim County Council',
  'limerick': 'Limerick City and County Council',
  'longford': 'Longford County Council',
  'louth': 'Louth County Council',
  'mayo': 'Mayo County Council',
  'meath': 'Meath County Council',
  'monaghan': 'Monaghan County Council',
  'offaly': 'Offaly County Council',
  'roscommon': 'Roscommon County Council',
  'sligo': 'Sligo County Council',
  'south-dublin': 'South Dublin County Council',
  'tipperary': 'Tipperary County Council',
  'waterford': 'Waterford City and County Council',
  'westmeath': 'Westmeath County Council',
  'wexford': 'Wexford County Council',
  'wicklow': 'Wicklow County Council',
};

// Mapping from directory name to county name
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
  'south-dublin': 'Dublin',
  'tipperary': 'Tipperary',
  'waterford': 'Waterford',
  'westmeath': 'Westmeath',
  'wexford': 'Wexford',
  'wicklow': 'Wicklow',
};

// NI Council to County mapping
const niCouncilToCounty: Record<string, string> = {
  'Belfast': 'Antrim',
  'Antrim and Newtownabbey': 'Antrim',
  'Ards and North Down': 'Down',
  'Armagh City Banbridge and Craigavon': 'Armagh',
  'Causeway Coast and Glens': 'Londonderry',
  'Derry City and Strabane': 'Londonderry',
  'Fermanagh and Omagh': 'Fermanagh',
  'Lisburn and Castlereagh': 'Antrim',
  'Mid and East Antrim': 'Antrim',
  'Mid Ulster': 'Tyrone',
  'Newry Mourne and Down': 'Down',
};

async function setupNorthernIreland() {
  console.log('Setting up Northern Ireland counties and local authorities...');

  // Add NI counties
  const niCounties = [
    { name: 'Antrim', province: 'Ulster' },
    { name: 'Armagh', province: 'Ulster' },
    { name: 'Down', province: 'Ulster' },
    { name: 'Fermanagh', province: 'Ulster' },
    { name: 'Londonderry', province: 'Ulster' },
    { name: 'Tyrone', province: 'Ulster' },
  ];

  for (const county of niCounties) {
    await pool.query(
      `INSERT INTO counties (name, province) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
      [county.name, county.province]
    );
  }

  // Add NI local authorities
  const niAuthorities = [
    { council: 'Belfast City Council', county: 'Antrim', type: 'City Council' },
    { council: 'Antrim and Newtownabbey Borough Council', county: 'Antrim', type: 'Borough Council' },
    { council: 'Ards and North Down Borough Council', county: 'Down', type: 'Borough Council' },
    { council: 'Armagh City, Banbridge and Craigavon Borough Council', county: 'Armagh', type: 'Borough Council' },
    { council: 'Causeway Coast and Glens Borough Council', county: 'Londonderry', type: 'Borough Council' },
    { council: 'Derry City and Strabane District Council', county: 'Londonderry', type: 'District Council' },
    { council: 'Fermanagh and Omagh District Council', county: 'Fermanagh', type: 'District Council' },
    { council: 'Lisburn and Castlereagh City Council', county: 'Antrim', type: 'City Council' },
    { council: 'Mid and East Antrim Borough Council', county: 'Antrim', type: 'Borough Council' },
    { council: 'Mid Ulster District Council', county: 'Tyrone', type: 'District Council' },
    { council: 'Newry, Mourne and Down District Council', county: 'Down', type: 'District Council' },
  ];

  for (const auth of niAuthorities) {
    const countyResult = await pool.query('SELECT id FROM counties WHERE name = $1', [auth.county]);
    if (countyResult.rows.length > 0) {
      await pool.query(
        `INSERT INTO local_authorities (county_id, name, authority_type)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [countyResult.rows[0].id, auth.council, auth.type]
      );
    }
  }

  console.log('Northern Ireland setup complete');
}

async function clearExistingPoliticians() {
  console.log('Clearing existing politicians...');
  // Delete promises first (foreign key constraint), then politicians
  await pool.query('DELETE FROM status_history WHERE promise_id IN (SELECT id FROM promises)');
  await pool.query('DELETE FROM milestones WHERE promise_id IN (SELECT id FROM promises)');
  await pool.query('DELETE FROM evidence WHERE promise_id IN (SELECT id FROM promises)');
  await pool.query('DELETE FROM promises');
  await pool.query('DELETE FROM politicians');
  console.log('Cleared existing data');
}

async function importROICouncillors(dataDir: string) {
  console.log('\nImporting Republic of Ireland councillors...');
  let total = 0;

  // Get local authority and county lookups
  const laResult = await pool.query('SELECT id, name FROM local_authorities');
  const countyResult = await pool.query('SELECT id, name FROM counties');

  const laLookup: Record<string, number> = {};
  laResult.rows.forEach(row => { laLookup[row.name] = row.id; });

  const countyLookup: Record<string, number> = {};
  countyResult.rows.forEach(row => { countyLookup[row.name] = row.id; });

  // Process each county directory
  for (const [dirName, laName] of Object.entries(localAuthorityMapping)) {
    const csvPath = path.join(dataDir, dirName, 'structured', 'councillors_canonical.csv');

    if (!fs.existsSync(csvPath)) {
      console.log(`  Skipping ${dirName} - no CSV found`);
      continue;
    }

    const content = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(content);

    const laId = laLookup[laName];
    const countyId = countyLookup[countyMapping[dirName]];

    if (!laId || !countyId) {
      console.log(`  Skipping ${dirName} - LA or county not found (LA: ${laName})`);
      continue;
    }

    for (const row of rows) {
      const name = row.councillor_name || row.name;
      if (!name) continue;

      await pool.query(
        `INSERT INTO politicians (name, party, constituency, county_id, local_authority_id, position_type, role, term_start, active)
         VALUES ($1, $2, $3, $4, $5, 'Councillor', 'County Councillor', '2024-06-07', true)`,
        [name, null, null, countyId, laId]
      );
      total++;
    }
    console.log(`  ${dirName}: ${rows.length} councillors`);
  }

  console.log(`Total ROI councillors imported: ${total}`);
  return total;
}

async function importTDs(dataDir: string) {
  console.log('\nImporting TDs...');

  const csvPath = path.join(dataDir, 'national', 'tds.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('  TDs CSV not found');
    return 0;
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  // Get county lookup for constituency mapping
  const countyResult = await pool.query('SELECT id, name FROM counties');
  const countyLookup: Record<string, number> = {};
  countyResult.rows.forEach(row => { countyLookup[row.name] = row.id; });

  let total = 0;
  for (const row of rows) {
    const { name, party, constituency } = row;
    if (!name) continue;

    // Try to match constituency to county
    let countyId = null;
    for (const [countyName, id] of Object.entries(countyLookup)) {
      if (constituency?.toLowerCase().includes(countyName.toLowerCase())) {
        countyId = id;
        break;
      }
    }

    await pool.query(
      `INSERT INTO politicians (name, party, constituency, county_id, position_type, role, term_start, active)
       VALUES ($1, $2, $3, $4, 'TD', 'Teachta Dála', '2024-11-29', true)`,
      [name, party, constituency, countyId]
    );
    total++;
  }

  console.log(`Total TDs imported: ${total}`);
  return total;
}

async function importSenators(dataDir: string) {
  console.log('\nImporting Senators...');

  const csvPath = path.join(dataDir, 'national', 'senators.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('  Senators CSV not found');
    return 0;
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  let total = 0;
  for (const row of rows) {
    const { name, party, panel } = row;
    if (!name) continue;

    await pool.query(
      `INSERT INTO politicians (name, party, constituency, position_type, role, term_start, active)
       VALUES ($1, $2, $3, 'Senator', 'Senator', '2025-01-15', true)`,
      [name, party, panel]
    );
    total++;
  }

  console.log(`Total Senators imported: ${total}`);
  return total;
}

async function importNICouncillors(dataDir: string) {
  console.log('\nImporting Northern Ireland councillors...');

  const csvPath = path.join(dataDir, 'northern-ireland', 'councillors.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('  NI councillors CSV not found');
    return 0;
  }

  // Get lookups
  const laResult = await pool.query('SELECT id, name FROM local_authorities');
  const countyResult = await pool.query('SELECT id, name FROM counties');

  const laLookup: Record<string, number> = {};
  laResult.rows.forEach(row => { laLookup[row.name] = row.id; });

  const countyLookup: Record<string, number> = {};
  countyResult.rows.forEach(row => { countyLookup[row.name] = row.id; });

  // Map CSV council names to database LA names
  const councilToLA: Record<string, string> = {
    'Belfast': 'Belfast City Council',
    'Antrim and Newtownabbey': 'Antrim and Newtownabbey Borough Council',
    'Ards and North Down': 'Ards and North Down Borough Council',
    'Armagh City Banbridge and Craigavon': 'Armagh City, Banbridge and Craigavon Borough Council',
    'Causeway Coast and Glens': 'Causeway Coast and Glens Borough Council',
    'Derry City and Strabane': 'Derry City and Strabane District Council',
    'Fermanagh and Omagh': 'Fermanagh and Omagh District Council',
    'Lisburn and Castlereagh': 'Lisburn and Castlereagh City Council',
    'Mid and East Antrim': 'Mid and East Antrim Borough Council',
    'Mid Ulster': 'Mid Ulster District Council',
    'Newry Mourne and Down': 'Newry, Mourne and Down District Council',
  };

  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  let total = 0;
  for (const row of rows) {
    const { name, party, council } = row;
    if (!name) continue;

    const laName = councilToLA[council];
    const laId = laName ? laLookup[laName] : null;
    const countyName = niCouncilToCounty[council];
    const countyId = countyName ? countyLookup[countyName] : null;

    await pool.query(
      `INSERT INTO politicians (name, party, constituency, county_id, local_authority_id, position_type, role, term_start, active)
       VALUES ($1, $2, $3, $4, $5, 'Councillor', 'District Councillor', '2023-05-18', true)`,
      [name, party, council, countyId, laId]
    );
    total++;
  }

  console.log(`Total NI councillors imported: ${total}`);
  return total;
}

async function importNIMLAs(dataDir: string) {
  console.log('\nImporting Northern Ireland MLAs...');

  const csvPath = path.join(dataDir, 'northern-ireland', 'mlas.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('  NI MLAs CSV not found');
    return 0;
  }

  const countyResult = await pool.query('SELECT id, name FROM counties');
  const countyLookup: Record<string, number> = {};
  countyResult.rows.forEach(row => { countyLookup[row.name] = row.id; });

  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);

  let total = 0;
  for (const row of rows) {
    const { name, party, constituency } = row;
    if (!name) continue;

    // Try to match constituency to NI county
    let countyId = null;
    const constituencyLower = constituency?.toLowerCase() || '';
    if (constituencyLower.includes('antrim') || constituencyLower.includes('belfast')) {
      countyId = countyLookup['Antrim'];
    } else if (constituencyLower.includes('down') || constituencyLower.includes('strangford')) {
      countyId = countyLookup['Down'];
    } else if (constituencyLower.includes('armagh')) {
      countyId = countyLookup['Armagh'];
    } else if (constituencyLower.includes('londonderry') || constituencyLower.includes('foyle')) {
      countyId = countyLookup['Londonderry'];
    } else if (constituencyLower.includes('tyrone') || constituencyLower.includes('ulster')) {
      countyId = countyLookup['Tyrone'];
    } else if (constituencyLower.includes('fermanagh')) {
      countyId = countyLookup['Fermanagh'];
    }

    await pool.query(
      `INSERT INTO politicians (name, party, constituency, county_id, position_type, role, term_start, active)
       VALUES ($1, $2, $3, $4, 'MLA', 'Member of the Legislative Assembly', '2022-05-05', true)`,
      [name, party, constituency, countyId]
    );
    total++;
  }

  console.log(`Total NI MLAs imported: ${total}`);
  return total;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Fiacha Politician Import Script');
  console.log('='.repeat(60));

  const dataDir = path.join(__dirname, '..', 'data');

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully\n');

    // Setup NI geography
    await setupNorthernIreland();

    // Clear existing data
    await clearExistingPoliticians();

    // Import all politicians
    const roiCouncillors = await importROICouncillors(dataDir);
    const tds = await importTDs(dataDir);
    const senators = await importSenators(dataDir);
    const niCouncillors = await importNICouncillors(dataDir);
    const niMLAs = await importNIMLAs(dataDir);

    console.log('\n' + '='.repeat(60));
    console.log('IMPORT COMPLETE');
    console.log('='.repeat(60));
    console.log(`ROI Councillors: ${roiCouncillors}`);
    console.log(`TDs:             ${tds}`);
    console.log(`Senators:        ${senators}`);
    console.log(`NI Councillors:  ${niCouncillors}`);
    console.log(`NI MLAs:         ${niMLAs}`);
    console.log(`TOTAL:           ${roiCouncillors + tds + senators + niCouncillors + niMLAs}`);

    // Verify counts
    const result = await pool.query(`
      SELECT position_type, COUNT(*) as count
      FROM politicians
      GROUP BY position_type
      ORDER BY position_type
    `);
    console.log('\nDatabase verification:');
    result.rows.forEach(row => {
      console.log(`  ${row.position_type}: ${row.count}`);
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
