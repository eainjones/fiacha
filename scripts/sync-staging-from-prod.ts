#!/usr/bin/env npx tsx
/**
 * Sync staging database from production
 *
 * Usage: npx tsx scripts/sync-staging-from-prod.ts
 *
 * This script copies all data from production to staging while preserving
 * referential integrity. Run this whenever you need staging to reflect
 * production data.
 */

import { Pool } from 'pg';
import * as dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const PROD_URL = process.env.PROD_DATABASE_URL || 'postgres://postgres:7%2Ahenwid%21jJ@db.hgjefllkbbwevpyiazhx.supabase.co:5432/postgres';
const STAGING_URL = process.env.STAGING_DATABASE_URL || 'postgres://postgres.qsknxvethxnapioxsuqr:9b%404FWQekBh%40cYu@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

const prod = new Pool({
  connectionString: PROD_URL,
  ssl: { rejectUnauthorized: false }
});

const staging = new Pool({
  connectionString: STAGING_URL,
  ssl: { rejectUnauthorized: false }
});

// Tables in order of dependencies (parents before children)
const TABLES_TO_SYNC = [
  { name: 'counties', columns: ['id', 'name', 'province', 'created_at'] },
  { name: 'local_authorities', columns: ['id', 'name', 'county_id', 'type', 'created_at'] },
  { name: 'electoral_areas', columns: ['id', 'name', 'local_authority_id'] },
  { name: 'parties', columns: ['id', 'name', 'short_name', 'color', 'slug', 'founded_year', 'leader', 'headquarters', 'ideology', 'political_position', 'key_policies', 'eu_parliament_group', 'eu_party', 'description', 'website', 'logo_url', 'region', 'active', 'created_at', 'updated_at'] },
  { name: 'politicians', columns: ['id', 'name', 'party', 'party_id', 'constituency', 'role', 'active', 'county_id', 'local_authority_id', 'electoral_area_id', 'position_type', 'term_start', 'term_end', 'website', 'email', 'phone', 'created_at', 'updated_at'] },
  { name: 'promises', columns: ['id', 'politician_id', 'title', 'description', 'category', 'promise_date', 'target_date', 'status', 'score', 'created_at', 'updated_at'] },
  { name: 'evidence', columns: ['id', 'promise_id', 'type', 'url', 'description', 'date', 'created_at'] },
  { name: 'milestones', columns: ['id', 'promise_id', 'title', 'description', 'date', 'created_at'] },
  { name: 'status_history', columns: ['id', 'promise_id', 'old_status', 'new_status', 'reason', 'created_at'] },
];

async function syncTable(tableName: string, columns: string[]) {
  try {
    // Get data from production
    const { rows } = await prod.query(`SELECT ${columns.join(', ')} FROM ${tableName}`);

    if (rows.length === 0) {
      console.log(`  ${tableName}: 0 rows (empty)`);
      return;
    }

    // Build upsert query
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const updateSet = columns
      .filter(c => c !== 'id')
      .map(c => `${c} = EXCLUDED.${c}`)
      .join(', ');

    let synced = 0;
    let errors = 0;

    for (const row of rows) {
      try {
        const values = columns.map(c => row[c]);
        await staging.query(
          `INSERT INTO ${tableName} (${columns.join(', ')})
           VALUES (${placeholders})
           ON CONFLICT (id) DO UPDATE SET ${updateSet}`,
          values
        );
        synced++;
      } catch (err: any) {
        // Skip columns that don't exist in staging
        if (err.code === '42703') {
          // Try with fewer columns
          const basicColumns = columns.filter(c =>
            !['updated_at', 'created_at', 'website', 'email', 'phone', 'logo_url'].includes(c) || c === 'id'
          );
          const basicPlaceholders = basicColumns.map((_, i) => `$${i + 1}`).join(', ');
          const basicUpdateSet = basicColumns.filter(c => c !== 'id').map(c => `${c} = EXCLUDED.${c}`).join(', ');
          const basicValues = basicColumns.map(c => row[c]);

          try {
            await staging.query(
              `INSERT INTO ${tableName} (${basicColumns.join(', ')})
               VALUES (${basicPlaceholders})
               ON CONFLICT (id) DO UPDATE SET ${basicUpdateSet}`,
              basicValues
            );
            synced++;
          } catch (e) {
            errors++;
          }
        } else {
          errors++;
        }
      }
    }

    console.log(`  ${tableName}: ${synced} synced${errors > 0 ? `, ${errors} errors` : ''}`);
  } catch (err: any) {
    console.log(`  ${tableName}: ERROR - ${err.message}`);
  }
}

async function main() {
  console.log('🔄 Syncing staging from production...\n');

  // Get counts before
  console.log('Before sync:');
  for (const { name } of TABLES_TO_SYNC) {
    try {
      const { rows } = await staging.query(`SELECT COUNT(*) as count FROM ${name}`);
      console.log(`  ${name}: ${rows[0].count}`);
    } catch {
      console.log(`  ${name}: N/A`);
    }
  }

  console.log('\nSyncing tables:');
  for (const { name, columns } of TABLES_TO_SYNC) {
    await syncTable(name, columns);
  }

  // Get counts after
  console.log('\nAfter sync:');
  for (const { name } of TABLES_TO_SYNC) {
    try {
      const { rows } = await staging.query(`SELECT COUNT(*) as count FROM ${name}`);
      console.log(`  ${name}: ${rows[0].count}`);
    } catch {
      console.log(`  ${name}: N/A`);
    }
  }

  await prod.end();
  await staging.end();

  console.log('\n✅ Sync complete!');
}

main().catch(console.error);
