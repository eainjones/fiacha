#!/usr/bin/env node
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigration() {
  console.log('🗄️  Applying database migration...\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'db', 'migration-001-review-queue.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('🔗 Connecting to database...');

    // Execute migration
    await pool.query(sql);

    console.log('✅ Migration applied successfully!\n');
    console.log('Created table: promise_review_queue');
    console.log('  • Stores extracted promises for human review');
    console.log('  • Includes audit trail (created_at, reviewed_at, etc.)');
    console.log('  • Ready to queue promises!\n');

    // Verify table exists
    const result = await pool.query(`
      SELECT COUNT(*) FROM information_schema.tables
      WHERE table_name = 'promise_review_queue'
    `);

    if (result.rows[0].count === '1') {
      console.log('✅ Verification: Table exists in database\n');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);

    if (error.message.includes('already exists')) {
      console.log('\n💡 Table already exists! Migration was previously applied.');
      console.log('   You can proceed with testing.\n');
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

applyMigration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
