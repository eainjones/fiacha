import { Pool } from 'pg'
import * as dns from 'dns'

// Force IPv4 resolution for Supabase (Vercel doesn't support IPv6)
dns.setDefaultResultOrder('ipv4first')

let pool: Pool | null = null

export function getDb() {
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

export type Politician = {
  id: number
  name: string
  party: string | null
  constituency: string | null
  role: string | null
  active: boolean
  created_at: Date
  updated_at: Date
}

export type Promise = {
  id: number
  politician_id: number
  title: string
  description: string | null
  category: string | null
  promise_date: Date | null
  target_date: Date | null
  status: string
  score: number | null
  created_at: Date
  updated_at: Date
}

export type Evidence = {
  id: number
  promise_id: number
  source_type: string | null
  source_url: string | null
  title: string | null
  description: string | null
  published_date: Date | null
  created_at: Date
}
