import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()
    const result = await db.query(`
      SELECT
        c.*,
        COALESCE(pol_counts.politician_count, 0) as politician_count,
        COALESCE(pol_counts.td_count, 0) as td_count,
        COALESCE(pol_counts.councillor_count, 0) as councillor_count,
        COALESCE(promise_counts.promise_count, 0) as promise_count
      FROM counties c
      LEFT JOIN (
        SELECT
          county_id,
          COUNT(*) FILTER (WHERE active) as politician_count,
          COUNT(*) FILTER (WHERE active AND position_type = 'TD') as td_count,
          COUNT(*) FILTER (WHERE active AND position_type = 'Councillor') as councillor_count
        FROM politicians
        GROUP BY county_id
      ) pol_counts ON pol_counts.county_id = c.id
      LEFT JOIN (
        SELECT
          pol.county_id,
          COUNT(pr.*) as promise_count
        FROM promises pr
        JOIN politicians pol ON pol.id = pr.politician_id
        GROUP BY pol.county_id
      ) promise_counts ON promise_counts.county_id = c.id
      ORDER BY c.province, c.name
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching counties:', error)
    return NextResponse.json({ error: 'Failed to fetch counties' }, { status: 500 })
  }
}
