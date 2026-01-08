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

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1, // Limit connections for serverless
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 10000,
})

// Export the Drizzle client with schema for type safety
export const db = drizzle(pool, { schema })

// Re-export schema for convenience
export { schema }

// Re-export queries for convenience
export * from './queries'
