import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()
    const result = await db.query(`
      SELECT la.*, c.name as county_name, c.province
      FROM local_authorities la
      LEFT JOIN counties c ON la.county_id = c.id
      ORDER BY c.province, c.name, la.name
    `)

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching local authorities:', error)
    return NextResponse.json({ error: 'Failed to fetch local authorities' }, { status: 500 })
  }
}
