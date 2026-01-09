import { Pool, PoolClient } from 'pg';
import dns from 'dns';
import { DbPolitician } from '../types';

/**
 * Database client for Fiacha PostgreSQL database
 * Connects to the same Supabase database as main app
 */
export class DatabaseClient {
  private pool: Pool;

  constructor(connectionString?: string) {
    const dbUrl = connectionString || process.env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Set DNS to prefer IPv4 for Supabase (same as main app)
    dns.setDefaultResultOrder('ipv4first');

    this.pool = new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5, // Connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('[Database] Unexpected pool error:', err);
    });
  }

  /**
   * Test database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.pool.query('SELECT NOW()');
      console.log('[Database] ✓ Connection healthy:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('[Database] ✗ Health check failed:', error);
      return false;
    }
  }

  /**
   * Get all active politicians for fuzzy matching
   */
  async getAllPoliticians(): Promise<DbPolitician[]> {
    try {
      const query = `
        SELECT
          id, name, party, constituency, county_id,
          local_authority_id, electoral_area_id, role,
          position_type, active, created_at
        FROM politicians
        WHERE active = true
        ORDER BY name
      `;

      const result = await this.pool.query(query);
      console.log(`[Database] ✓ Loaded ${result.rows.length} politicians`);

      return result.rows as DbPolitician[];
    } catch (error) {
      console.error('[Database] ✗ Failed to load politicians:', error);
      throw error;
    }
  }

  /**
   * Get politician by ID
   */
  async getPoliticianById(id: number): Promise<DbPolitician | null> {
    try {
      const query = 'SELECT * FROM politicians WHERE id = $1';
      const result = await this.pool.query(query, [id]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('[Database] ✗ Failed to get politician:', error);
      throw error;
    }
  }

  /**
   * Check if promise already exists (deduplication)
   * Matches on politician_id and similar title
   */
  async promiseExists(politicianId: number, title: string): Promise<boolean> {
    try {
      const query = `
        SELECT id
        FROM promises
        WHERE politician_id = $1
        AND LOWER(title) = LOWER($2)
        LIMIT 1
      `;

      const result = await this.pool.query(query, [politicianId, title]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('[Database] ✗ Failed to check promise existence:', error);
      throw error;
    }
  }

  /**
   * Get a connection from the pool for transactions
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Get the underlying pool for direct access (e.g., AI budget tracking)
   */
  getPool(): Pool {
    return this.pool;
  }

  /**
   * Execute query with automatic error handling
   */
  async query(sql: string, params?: any[]) {
    try {
      return await this.pool.query(sql, params);
    } catch (error) {
      console.error('[Database] Query error:', error);
      throw error;
    }
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    await this.pool.end();
    console.log('[Database] Connection pool closed');
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    politicians: number;
    promises: number;
    evidence: number;
    pendingPromises: number;
  }> {
    try {
      const query = `
        SELECT
          (SELECT COUNT(*) FROM politicians WHERE active = true) as politicians,
          (SELECT COUNT(*) FROM promises) as promises,
          (SELECT COUNT(*) FROM evidence) as evidence,
          (SELECT COUNT(*) FROM promises WHERE status = 'pending') as pending_promises
      `;

      const result = await this.pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('[Database] ✗ Failed to get stats:', error);
      throw error;
    }
  }
}

/**
 * Factory function to create database client from environment
 */
export function createDatabaseClient(): DatabaseClient {
  return new DatabaseClient();
}
