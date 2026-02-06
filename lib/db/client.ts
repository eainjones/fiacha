/**
 * Drizzle ORM Client
 *
 * Provides a typed database client using Drizzle ORM.
 * This should be used for new queries going forward.
 *
 * For system operations that need to bypass RLS, use getSystemDb() from lib/db.ts
 *
 * IMPORTANT: Uses globalThis caching to prevent connection pool leaks during
 * Next.js HMR (hot module replacement) in development. Without this, each
 * hot reload creates a new Pool instance, eventually exhausting PostgreSQL
 * connection limits and causing the dev server to hang.
 */

import { Pool } from 'pg'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as dns from 'dns'
import * as schema from './schema'

// Force IPv4 resolution for Supabase (Vercel doesn't support IPv6)
dns.setDefaultResultOrder('ipv4first')

const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1')

// Singleton pattern: cache pool and drizzle client on globalThis to survive HMR
const globalForDb = globalThis as unknown as {
  pgPool: Pool | undefined
  drizzleClient: NodePgDatabase<typeof schema> | undefined
}

function createPool(): Pool {
  const p = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: isLocal ? 5 : 3, // More connections locally, limited for serverless
    idleTimeoutMillis: isLocal ? 30000 : 0,
    connectionTimeoutMillis: 10000,
  })

  p.on('error', (err) => {
    console.error('[db/client] Unexpected pool error:', err.message)
  })

  return p
}

const pool = globalForDb.pgPool ?? createPool()
const db = globalForDb.drizzleClient ?? drizzle(pool, { schema })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgPool = pool
  globalForDb.drizzleClient = db
}

// Graceful shutdown: close pool on process exit to prevent leaked connections
if (process.env.NODE_ENV !== 'production') {
  const shutdown = () => {
    pool.end().catch(() => {})
    process.exit(0)
  }
  // Only register once (guard against HMR re-registration)
  if (!(globalThis as any).__dbShutdownRegistered) {
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
    ;(globalThis as any).__dbShutdownRegistered = true
  }
}

// Export the Drizzle client with schema for type safety
export { db }

// Export the raw pool for shared use (e.g., getSystemDb)
export { pool }

// Re-export schema for convenience
export { schema }

// Re-export queries for convenience
export * from './queries'
