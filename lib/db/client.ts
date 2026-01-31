/**
 * Drizzle ORM Client
 *
 * Provides a typed database client using Drizzle ORM.
 * This should be used for new queries going forward.
 *
 * For system operations that need to bypass RLS, use getSystemDb() from lib/db.ts
 */

import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as dns from 'dns'
import * as schema from './schema'

// Force IPv4 resolution for Supabase (Vercel doesn't support IPv6)
dns.setDefaultResultOrder('ipv4first')

const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1')

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: isLocal ? 5 : 1, // More connections locally, limited for serverless
  idleTimeoutMillis: isLocal ? 30000 : 0,
  connectionTimeoutMillis: 10000,
})

// Export the Drizzle client with schema for type safety
export const db = drizzle(pool, { schema })

// Export the raw pool for shared use (e.g., getSystemDb)
export { pool }

// Re-export schema for convenience
export { schema }

// Re-export queries for convenience
export * from './queries'
