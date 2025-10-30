import { Pool } from 'pg'

let pool: Pool | null = null

export function getDb() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Force IPv4 to avoid ENETUNREACH errors on Vercel
      host: process.env.DATABASE_URL?.match(/@([^:]+):/)?.[1],
      ssl: {
        rejectUnauthorized: false,
      },
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
