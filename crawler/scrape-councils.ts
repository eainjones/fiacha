import 'dotenv/config';
import { createFirecrawlClient } from './src/crawlers/firecrawl-client';
import * as fs from 'fs';
import * as path from 'path';

// Council websites with councillor pages
const COUNCIL_URLS: { county: string; url: string; authority: string }[] = [
  // Dublin authorities
  { county: 'dublin', url: 'https://www.dublincity.ie/council/councillors', authority: 'Dublin City Council' },
  { county: 'dun-laoghaire-rathdown', url: 'https://www.dlrcoco.ie/council/councillors', authority: 'Dún Laoghaire-Rathdown' },
  { county: 'south-dublin', url: 'https://www.sdcc.ie/en/council/councillors/', authority: 'South Dublin' },
  { county: 'fingal', url: 'https://www.fingal.ie/council/councillors', authority: 'Fingal' },

  // Other councils - alphabetical
  { county: 'carlow', url: 'https://www.carlow.ie/council/councillors/', authority: 'Carlow' },
  { county: 'cavan', url: 'https://www.cavancoco.ie/council/councillors/', authority: 'Cavan' },
  { county: 'clare', url: 'https://www.clarecoco.ie/your-council/contact-the-council/councillors/', authority: 'Clare' },
  { county: 'cork', url: 'https://www.corkcoco.ie/en/council/councillors', authority: 'Cork County' },
  { county: 'cork-city', url: 'https://www.corkcity.ie/en/council-services/councillors-and-democracy/councillors/', authority: 'Cork City' },
  { county: 'donegal', url: 'https://www.donegalcoco.ie/your-council/councillors/', authority: 'Donegal' },
  { county: 'galway', url: 'https://www.galway.ie/en/services/your-council/councillors/', authority: 'Galway County' },
  { county: 'galway-city', url: 'https://www.galwaycity.ie/council-members', authority: 'Galway City' },
  { county: 'kerry', url: 'https://www.kerrycoco.ie/councillors/', authority: 'Kerry' },
  { county: 'kildare', url: 'https://kildarecoco.ie/YourCouncil/YourElectedCouncil/CouncillorsDetails/', authority: 'Kildare' },
  { county: 'kilkenny', url: 'https://kilkennycoco.ie/eng/your_council/about-the-council/your_county_councillor/', authority: 'Kilkenny' },
  { county: 'laois', url: 'https://laois.ie/councillors/', authority: 'Laois' },
  { county: 'leitrim', url: 'https://www.leitrim.ie/council/corporate-governance/councillors/county-councillors/', authority: 'Leitrim' },
  { county: 'limerick', url: 'https://www.limerick.ie/council/your-council/councillors', authority: 'Limerick' },
  { county: 'longford', url: 'https://www.longfordcoco.ie/your-council/council-members/', authority: 'Longford' },
  { county: 'louth', url: 'https://www.louthcoco.ie/en/your-council/councillors/', authority: 'Louth' },
  { county: 'mayo', url: 'https://www.mayo.ie/en-ie/your-council/governance-and-democracy/councillors', authority: 'Mayo' },
  { county: 'meath', url: 'https://www.meath.ie/council/your-council/your-elected-council/your-councillors', authority: 'Meath' },
  { county: 'monaghan', url: 'https://monaghan.ie/council/councillors/', authority: 'Monaghan' },
  { county: 'offaly', url: 'https://www.offaly.ie/councillors/', authority: 'Offaly' },
  { county: 'roscommon', url: 'https://www.roscommoncoco.ie/en/Your-Council/Councillors/', authority: 'Roscommon' },
  { county: 'sligo', url: 'https://www.sligococo.ie/YourCouncil/CountyCouncil/CountyCouncilMembers/', authority: 'Sligo' },
  { county: 'tipperary', url: 'https://www.tipperarycoco.ie/your-council/councillors', authority: 'Tipperary' },
  { county: 'waterford', url: 'https://www.waterfordcouncil.ie/council/councillors/', authority: 'Waterford' },
  { county: 'westmeath', url: 'https://www.westmeathcoco.ie/en/ourservices/yourcouncil/councillorsandcommittees/councillors/', authority: 'Westmeath' },
  { county: 'wexford', url: 'https://www.wexfordcoco.ie/council-and-democracy/councillors', authority: 'Wexford' },
  { county: 'wicklow', url: 'https://www.wicklow.ie/Living/Your-Council/Your-Councillors/Elected-Council-Members', authority: 'Wicklow' },
];

/**
 * Party names and political terms to exclude from names
 */
const PARTY_NAMES = [
  'Fianna Fáil', 'Fine Gael', 'Sinn Féin', 'Labour Party', 'Labour', 'Green Party',
  'Social Democrats', 'Independent Ireland', 'Independent', 'Non-Party', 'Non Party',
  'Kerry Independent Alliance', 'People Before Profit', 'PBP', 'Aontú',
];

/**
 * Words that should never appear in a councillor name
 */
const EXCLUDED_WORDS = [
  // Party-related
  ...PARTY_NAMES,
  // Roles/titles that aren't part of names
  'Cathaoirleach', 'Leas-Cathaoirleach', 'Leas Cathaoirleach', 'Mayor', 'Deputy Mayor',
  // Places/addresses
  'Street', 'Road', 'Drive', 'Avenue', 'Heights', 'Park', 'Grove', 'View', 'Close',
  'East', 'West', 'North', 'South', 'County', 'Co.', 'Kerry', 'Cork', 'Dublin',
  'Killarney', 'Tralee', 'Listowel', 'Kenmare', 'Dingle', 'Ballylongford', 'Castleisland',
  'Wicklow', 'Arklow', 'Bray', 'Greystones', 'Baltinglass',
  // Generic terms
  'Municipal', 'District', 'Electoral', 'Area', 'Council', 'Phone', 'Email', 'Mobile',
  'Tel', 'Download', 'Contact', 'Office', 'Home', 'Party', 'IND',
];

/**
 * Check if name contains any excluded words
 */
function containsExcludedWord(name: string): boolean {
  const upperName = name.toUpperCase();
  for (const word of EXCLUDED_WORDS) {
    if (upperName.includes(word.toUpperCase())) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a string looks like a valid person name
 * Valid names: 2-4 words, each starting with capital, reasonable length
 */
function isValidName(name: string): boolean {
  const cleaned = name.trim();

  // Must be reasonable length
  if (cleaned.length < 5 || cleaned.length > 40) return false;

  // Must contain at least one space (first + last name)
  if (!cleaned.includes(' ') && !cleaned.includes('-')) return false;

  // Should not contain excluded words (party names, places, etc.)
  if (containsExcludedWord(cleaned)) return false;

  // Should not contain numbers, brackets, or certain punctuation
  if (/[\d\[\]{}@#$%^&*+=<>:;]/.test(cleaned)) return false;

  // Should not be an email or URL
  if (cleaned.includes('@') || cleaned.includes('://') || cleaned.includes('.ie')) return false;

  // Should not have more than 4 name parts (to avoid grabbing too much)
  const parts = cleaned.split(/[\s-]+/);
  if (parts.length > 5) return false;

  // Each part should start with a capital letter (except Irish prefixes)
  for (const part of parts) {
    // Skip short Irish prefixes
    if (['O', 'Mc', 'Mac', 'Ní', 'Nic', 'Ui', 'Ó'].includes(part)) continue;
    // Check first char is uppercase
    if (part.length > 0 && !/^[A-ZÁÉÍÓÚÜ]/.test(part)) return false;
  }

  return true;
}

/**
 * Normalize a name - clean up and standardize format
 */
function normalizeName(name: string): string {
  let cleaned = name.trim();

  // Remove trailing parenthetical content (titles like "(Cathaoirleach)")
  cleaned = cleaned.replace(/\s*\([^)]*\)\s*/g, ' ').trim();

  // Remove markdown formatting
  cleaned = cleaned.replace(/[*_]+/g, '').trim();

  // Remove leading "- " or "* " from list items
  cleaned = cleaned.replace(/^[-*]\s+/, '').trim();

  // Normalize curly apostrophes to straight ones
  cleaned = cleaned.replace(/[\u2018\u2019]/g, "'");

  // Normalize spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Extract a simple name from text (2-4 name parts)
 * Stops at newlines, party names, or other non-name content
 * Handles both straight (') and curly (\u2019) apostrophes in O' names
 */
function extractSimpleName(text: string): string | null {
  // Match 2-4 name parts, each starting with capital, handling Irish prefixes
  // Note: O' can have straight (') or curly (\u2019) apostrophe
  const match = text.match(/^((?:O[''\u2019]|Ó |Mc|Mac|Ní |Nic )?[A-ZÁÉÍÓÚ][a-záéíóú]+(?:[ -]+(?:O[''\u2019]|Ó |Mc|Mac|Ní |Nic )?[A-ZÁÉÍÓÚ][a-záéíóú]+){1,3})/);
  if (match) {
    // Normalize curly apostrophes to straight ones
    return match[1].trim().replace(/[\u2018\u2019]/g, "'");
  }
  return null;
}

/**
 * Extract councillor names from markdown content
 */
function extractCouncillors(markdown: string, authority: string): string[] {
  const names: Set<string> = new Set();

  // Pattern 1: "Name: FirstName LastName" format (Wicklow style)
  // Process line by line to avoid cross-line matching
  const lines = markdown.split('\n');
  for (const line of lines) {
    // Check for "Name: ..." pattern
    const nameColonMatch = line.match(/Name:\s*([A-ZÁÉÍÓÚ][^-\n]*)/i);
    if (nameColonMatch) {
      const extracted = extractSimpleName(nameColonMatch[1].trim());
      if (extracted) {
        const normalized = normalizeName(extracted);
        if (isValidName(normalized)) {
          names.add(normalized);
        }
      }
    }

    // Pattern 2: "## Cllr. Name" format (Cork style - on single line)
    // Note: Handles both straight (') and curly (\u2019) apostrophes
    const cllrMatch = line.match(/(?:Cllr\.?|Councillor)\s+([A-ZÁÉÍÓÚ][a-záéíóúÁÉÍÓÚ''\u2019 -]+?)(?:\s*$|\s*\n)/i);
    if (cllrMatch) {
      const extracted = extractSimpleName(cllrMatch[1].trim());
      if (extracted) {
        const normalized = normalizeName(extracted);
        if (isValidName(normalized)) {
          names.add(normalized);
        }
      }
    }

    // Pattern 3: "#### Last, First" format (Kerry style)
    // Handles: "Foley, Michael", "O'Sullivan Casey, Teddy", "Nolan (Speedy), Liam"
    // Also handles no-comma format: "Kennelly Aoife" (which is "Last First")
    const kerryHeadingMatch = line.match(/^#{2,4}\s+(.+)$/);
    if (kerryHeadingMatch) {
      const headingContent = kerryHeadingMatch[1].trim();

      // Skip non-name headings
      if (/^(Councillors|Cathaoirleach|Municipal|Kenmare|Killarney|Tralee|Listowel|Castleisland|Corca)/i.test(headingContent)) {
        continue;
      }

      // Try "Last, First" format (with possible parenthetical content)
      // Handles: O'Brien, Mc/Mac names, hyphenated names, compound last names
      // Note: O' can have straight (') or curly (\u2019) apostrophe
      const lastFirstMatch = headingContent.match(/^((?:O[''\u2019]|Mc|Mac)?[A-ZÁÉÍÓÚ][a-záéíóú]+(?:[ -]+(?:O[''\u2019]|Mc|Mac)?[A-ZÁÉÍÓÚ][a-záéíóú]+)*)(?:\s*\([^)]+\))?,\s+([A-ZÁÉÍÓÚ][a-záéíóú]+)/);
      if (lastFirstMatch) {
        // Normalize curly apostrophes to straight ones
        const lastName = lastFirstMatch[1].trim().replace(/[\u2018\u2019]/g, "'");
        const firstName = lastFirstMatch[2].trim();
        const fullName = `${firstName} ${lastName}`;
        const normalized = normalizeName(fullName);
        if (isValidName(normalized)) {
          names.add(normalized);
        }
        continue;
      }

      // Try no-comma format: "LastName FirstName" (Kerry sometimes uses this)
      // e.g., "Kennelly Aoife" should become "Aoife Kennelly"
      const noCommaMatch = headingContent.match(/^([A-ZÁÉÍÓÚ][a-záéíóú]+)\s+([A-ZÁÉÍÓÚ][a-záéíóú]+)/);
      if (noCommaMatch) {
        // For Kerry-style headings, assume "Last First" order
        const lastName = noCommaMatch[1];
        const firstName = noCommaMatch[2];
        const fullName = `${firstName} ${lastName}`;
        const normalized = normalizeName(fullName);
        if (isValidName(normalized)) {
          names.add(normalized);
        }
      }
    }
  }

  // Pattern 4: Names in markdown tables "| Name |"
  // Note: Handles both straight (') and curly (\u2019) apostrophes
  const tableMatches = markdown.matchAll(/\|\s*(?:Cllr\.?\s+)?([A-ZÁÉÍÓÚ][a-záéíóú]+(?:[ -]+(?:O[''\u2019]|Mc|Mac)?[A-ZÁÉÍÓÚ][a-záéíóú]+){1,3})\s*\|/gi);
  for (const match of tableMatches) {
    const normalized = normalizeName(match[1]);
    if (isValidName(normalized)) {
      names.add(normalized);
    }
  }

  // Pattern 5: Bold names "**Name**" (common in lists)
  // Note: Handles both straight (') and curly (\u2019) apostrophes
  const boldMatches = markdown.matchAll(/\*\*([A-ZÁÉÍÓÚ][a-záéíóú]+(?:[ -]+(?:O[''\u2019]|Mc|Mac)?[A-ZÁÉÍÓÚ][a-záéíóú]+){1,3})\*\*/g);
  for (const match of boldMatches) {
    const normalized = normalizeName(match[1]);
    if (isValidName(normalized)) {
      names.add(normalized);
    }
  }

  return Array.from(names).sort();
}

/**
 * Save councillors to CSV file
 */
function saveToCSV(county: string, councillors: string[]): void {
  const dirPath = path.join(__dirname, '..', 'data', county, 'structured');
  fs.mkdirSync(dirPath, { recursive: true });

  const csvPath = path.join(dirPath, 'councillors_canonical.csv');
  const content = 'councillor_name\n' + councillors.join('\n') + '\n';

  fs.writeFileSync(csvPath, content);
  console.log(`  Saved ${councillors.length} councillors to ${csvPath}`);
}

async function main() {
  console.log('=== Council Councillor Scraper ===\n');

  const client = createFirecrawlClient();

  // Test connection
  console.log('Testing Firecrawl connection...');
  const healthy = await client.healthCheck();
  if (!healthy) {
    console.error('Firecrawl health check failed. Check your API key.');
    process.exit(1);
  }
  console.log('Firecrawl connection OK\n');

  const results: { county: string; count: number; error?: string }[] = [];

  for (const council of COUNCIL_URLS) {
    console.log(`\nScraping ${council.authority}...`);

    try {
      const result = await client.scrapeUrl(council.url);
      const councillors = extractCouncillors(result.markdown, council.authority);

      if (councillors.length > 0) {
        saveToCSV(council.county, councillors);
        results.push({ county: council.county, count: councillors.length });
      } else {
        console.log(`  No councillors found in content`);
        results.push({ county: council.county, count: 0, error: 'No names extracted' });
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`  Error: ${(error as Error).message}`);
      results.push({ county: council.county, count: 0, error: (error as Error).message });
    }
  }

  // Summary
  console.log('\n=== Summary ===');
  let total = 0;
  for (const r of results) {
    if (r.error) {
      console.log(`${r.county}: ERROR - ${r.error}`);
    } else {
      console.log(`${r.county}: ${r.count} councillors`);
      total += r.count;
    }
  }
  console.log(`\nTotal: ${total} councillors scraped`);
}

main().catch(console.error);
