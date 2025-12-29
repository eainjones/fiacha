const { Pool } = require('pg');
require('dotenv').config();

async function checkTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Checking for promise_review_queue table...\n');

  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'promise_review_queue';
    `);

    if (result.rows.length > 0) {
      console.log('✓ Table EXISTS');

      // Get count
      const count = await pool.query('SELECT COUNT(*) FROM promise_review_queue');
      console.log(`  Rows: ${count.rows[0].count}`);
    } else {
      console.log('✗ Table DOES NOT EXIST');
      console.log('\nCreating table now...');

      const sql = `
        CREATE TABLE promise_review_queue (
          id SERIAL PRIMARY KEY,
          extracted_promise JSONB NOT NULL,
          politician_match JSONB,
          status VARCHAR(20) NOT NULL DEFAULT 'pending'
            CHECK (status IN ('pending', 'approved', 'rejected')),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          reviewed_at TIMESTAMP WITH TIME ZONE,
          reviewed_by VARCHAR(100),
          rejection_reason TEXT
        );

        CREATE INDEX idx_promise_review_queue_status ON promise_review_queue(status);
        CREATE INDEX idx_promise_review_queue_created_at ON promise_review_queue(created_at DESC);
      `;

      await pool.query(sql);
      console.log('✓ Table created successfully!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTable();
