const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const dns = require('dns');

// Load environment variables from .env.local file (contains production Supabase credentials)
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Set DNS to prefer IPv4 for Supabase
dns.setDefaultResultOrder('ipv4first');

// Configure database connection (same as lib/db.ts)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 1,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 10000,
});

async function importCountyData() {
  // Verify database connection
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  console.log('✓ Database URL configured\n');

  const docsDir = path.join(__dirname, '..', 'docs');
  const jsonFiles = fs.readdirSync(docsDir).filter(f => f.endsWith('.json'));

  console.log(`Found ${jsonFiles.length} county JSON files to import\n`);

  let totalAdded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const file of jsonFiles) {
    const countyName = path.basename(file, '.json');
    const capitalizedCounty = countyName.charAt(0).toUpperCase() + countyName.slice(1);

    console.log(`\n📍 Processing ${capitalizedCounty}...`);

    try {
      const filePath = path.join(docsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      let added = 0;
      let skipped = 0;

      for (const politician of data) {
        try {
          // Check if politician already exists
          const checkQuery = `
            SELECT id FROM politicians
            WHERE LOWER(name) = LOWER($1)
            AND LOWER(party) = LOWER($2)
            LIMIT 1
          `;
          const existing = await pool.query(checkQuery, [politician.name, politician.party]);

          if (existing.rows.length > 0) {
            skipped++;
            continue;
          }

          // Get county_id
          const countyQuery = `SELECT id FROM counties WHERE LOWER(name) = LOWER($1) LIMIT 1`;
          const countyResult = await pool.query(countyQuery, [politician.county]);

          if (countyResult.rows.length === 0) {
            console.log(`  ⚠️  County not found: ${politician.county} for ${politician.name}`);
            totalErrors++;
            continue;
          }

          const county_id = countyResult.rows[0].id;

          // Get or create local authority if applicable
          let local_authority_id = null;
          if (politician.local_authority) {
            const laQuery = `SELECT id FROM local_authorities WHERE name = $1 LIMIT 1`;
            const laResult = await pool.query(laQuery, [politician.local_authority]);

            if (laResult.rows.length > 0) {
              local_authority_id = laResult.rows[0].id;
            } else {
              // Create local authority if it doesn't exist
              const createLaQuery = `
                INSERT INTO local_authorities (name, county_id, created_at)
                VALUES ($1, $2, NOW())
                RETURNING id
              `;
              const newLa = await pool.query(createLaQuery, [politician.local_authority, county_id]);
              local_authority_id = newLa.rows[0].id;
              console.log(`  ➕ Created local authority: ${politician.local_authority}`);
            }
          }

          // Determine position_type
          const position_type = politician.role === 'TD' ? 'TD' : 'Councillor';

          // Get or create electoral area if applicable
          let electoral_area_id = null;
          if (politician.electoral_area && local_authority_id) {
            const eaQuery = `SELECT id FROM electoral_areas WHERE name = $1 AND local_authority_id = $2 LIMIT 1`;
            const eaResult = await pool.query(eaQuery, [politician.electoral_area, local_authority_id]);

            if (eaResult.rows.length > 0) {
              electoral_area_id = eaResult.rows[0].id;
            } else {
              // Create electoral area if it doesn't exist
              const createEaQuery = `
                INSERT INTO electoral_areas (name, local_authority_id, created_at)
                VALUES ($1, $2, NOW())
                RETURNING id
              `;
              const newEa = await pool.query(createEaQuery, [politician.electoral_area, local_authority_id]);
              electoral_area_id = newEa.rows[0].id;
            }
          }

          // Insert politician
          const insertQuery = `
            INSERT INTO politicians (
              name,
              party,
              constituency,
              county_id,
              local_authority_id,
              electoral_area_id,
              role,
              position_type,
              active,
              created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW())
            RETURNING id, name
          `;

          const values = [
            politician.name,
            politician.party,
            politician.constituency || politician.electoral_area || null,
            county_id,
            local_authority_id,
            electoral_area_id,
            politician.role,
            position_type
          ];

          await pool.query(insertQuery, values);
          added++;

        } catch (err) {
          console.log(`  ❌ Error adding ${politician.name}:`, err);
          totalErrors++;
        }
      }

      console.log(`  ✅ Added: ${added}, Skipped (duplicates): ${skipped}`);
      totalAdded += added;
      totalSkipped += skipped;

    } catch (err) {
      console.log(`  ❌ Error processing file ${file}:`, err);
      totalErrors++;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Import Summary:`);
  console.log(`   Total Added: ${totalAdded}`);
  console.log(`   Total Skipped: ${totalSkipped}`);
  console.log(`   Total Errors: ${totalErrors}`);
  console.log(`${'='.repeat(50)}\n`);
}

// Run the import
importCountyData()
  .then(() => {
    console.log('✅ Import completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Import failed:', err);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
