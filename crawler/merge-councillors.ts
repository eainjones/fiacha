import * as fs from 'fs';
import * as path from 'path';

interface CouncillorEntry {
  name: string;
  county: string;
  normalizedName: string;
}

/**
 * Normalize a name for deduplication
 * - Lowercase
 * - Remove accents (fadas)
 * - Normalize apostrophes
 * - Normalize spacing
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[''`]/g, "'") // Normalize apostrophes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Read councillors from a CSV file
 */
function readCouncillorsCSV(filePath: string, county: string): CouncillorEntry[] {
  const councillors: CouncillorEntry[] = [];

  if (!fs.existsSync(filePath)) {
    return councillors;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const name = lines[i].trim();
    if (name && name.length > 0) {
      councillors.push({
        name,
        county,
        normalizedName: normalizeName(name),
      });
    }
  }

  return councillors;
}

/**
 * Main merge function
 */
async function merge() {
  const dataDir = path.join(__dirname, '..', 'data');
  const allCouncillors: CouncillorEntry[] = [];
  const countsByCounty: Record<string, number> = {};

  console.log('=== Merging Councillor Data ===\n');

  // Read all county directories
  const counties = fs.readdirSync(dataDir).filter(dir => {
    const fullPath = path.join(dataDir, dir);
    return fs.statSync(fullPath).isDirectory();
  });

  for (const county of counties) {
    const csvPath = path.join(dataDir, county, 'structured', 'councillors_canonical.csv');
    const councillors = readCouncillorsCSV(csvPath, county);

    if (councillors.length > 0) {
      countsByCounty[county] = councillors.length;
      allCouncillors.push(...councillors);
    }
  }

  console.log('Councillors by county:');
  Object.entries(countsByCounty)
    .sort((a, b) => b[1] - a[1])
    .forEach(([county, count]) => {
      console.log(`  ${county}: ${count}`);
    });

  console.log(`\nTotal raw councillors: ${allCouncillors.length}`);

  // Deduplicate by normalized name
  const seen = new Map<string, CouncillorEntry>();
  const duplicates: { name: string; county: string; existingCounty: string }[] = [];

  for (const councillor of allCouncillors) {
    const existing = seen.get(councillor.normalizedName);
    if (existing) {
      duplicates.push({
        name: councillor.name,
        county: councillor.county,
        existingCounty: existing.county,
      });
    } else {
      seen.set(councillor.normalizedName, councillor);
    }
  }

  console.log(`\nDuplicates found: ${duplicates.length}`);
  if (duplicates.length > 0 && duplicates.length <= 20) {
    duplicates.forEach(d => {
      console.log(`  "${d.name}" in ${d.county} (already in ${d.existingCounty})`);
    });
  }

  // Get unique councillors
  const uniqueCouncillors = Array.from(seen.values());
  console.log(`\nUnique councillors: ${uniqueCouncillors.length}`);

  // Write merged output
  const outputPath = path.join(dataDir, 'all_councillors_merged.csv');
  const csvContent = [
    'name,county,normalized_name',
    ...uniqueCouncillors
      .sort((a, b) => a.county.localeCompare(b.county) || a.name.localeCompare(b.name))
      .map(c => `"${c.name}","${c.county}","${c.normalizedName}"`)
  ].join('\n');

  fs.writeFileSync(outputPath, csvContent);
  console.log(`\nMerged data written to: ${outputPath}`);

  // Summary statistics
  console.log('\n=== Summary ===');
  console.log(`Counties processed: ${Object.keys(countsByCounty).length}`);
  console.log(`Total councillors (raw): ${allCouncillors.length}`);
  console.log(`Duplicates removed: ${duplicates.length}`);
  console.log(`Unique councillors: ${uniqueCouncillors.length}`);
  console.log(`Expected total (Ireland): ~949`);
  console.log(`Coverage: ${((uniqueCouncillors.length / 949) * 100).toFixed(1)}%`);
}

merge().catch(console.error);
