import { Pool } from 'pg'
import * as dns from 'dns'

// Force IPv4 resolution for Supabase (Vercel doesn't support IPv6)
dns.setDefaultResultOrder('ipv4first')

let pool: Pool | null = null

/**
 * Get a direct PostgreSQL connection that BYPASSES Row Level Security (RLS).
 *
 * USE CASES:
 * - System/admin operations (crawler, maintenance scripts)
 * - Background jobs with no user session
 * - Heavy data aggregation
 *
 * WARNING: For user-facing routes, prefer Supabase client which enforces RLS.
 */
export function getSystemDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 1, // Limit connections for serverless
      idleTimeoutMillis: 0, // Disable idle timeout
      connectionTimeoutMillis: 10000, // 10 second connection timeout
    })
  }
  return pool
}

/** @deprecated Use getSystemDb() instead - renamed for clarity */
export const getDb = getSystemDb

// Re-export types from generated database types
// Run `npm run types:update` to regenerate after schema changes
import type { Database } from './database.types'

export type Politician = Database['public']['Tables']['politicians']['Row']
export type PoliticianInsert = Database['public']['Tables']['politicians']['Insert']
export type PoliticianUpdate = Database['public']['Tables']['politicians']['Update']

export type Promise = Database['public']['Tables']['promises']['Row']
export type PromiseInsert = Database['public']['Tables']['promises']['Insert']
export type PromiseUpdate = Database['public']['Tables']['promises']['Update']

export type Evidence = Database['public']['Tables']['evidence']['Row']
export type EvidenceInsert = Database['public']['Tables']['evidence']['Insert']
export type EvidenceUpdate = Database['public']['Tables']['evidence']['Update']

export type County = Database['public']['Tables']['counties']['Row']
export type LocalAuthority = Database['public']['Tables']['local_authorities']['Row']
export type Milestone = Database['public']['Tables']['milestones']['Row']
export type StatusHistory = Database['public']['Tables']['status_history']['Row']

export type Party = Database['public']['Tables']['parties']['Row']
export type PartyInsert = Database['public']['Tables']['parties']['Insert']
export type PartyUpdate = Database['public']['Tables']['parties']['Update']

// Re-export the full Database type for advanced usage
export type { Database }
