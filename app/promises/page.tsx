import Nav from '@/components/Nav'
import Link from 'next/link'
import PromisesList from '@/components/PromisesList'
import { getDb } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPromises() {
  try {
    const db = getDb()
    const result = await db.query(`
      SELECT
        p.*,
        pol.name as politician_name,
        pol.party
      FROM promises p
      LEFT JOIN politicians pol ON p.politician_id = pol.id
      ORDER BY p.created_at DESC
    `)
    return result.rows
  } catch (error) {
    console.error('Error fetching promises:', error);
    return []
  }
}

async function getPoliticians() {
  try {
    const db = getDb()
    const result = await db.query(`
      SELECT
        p.*,
        c.name as county_name,
        c.province,
        la.name as local_authority_name
      FROM politicians p
      LEFT JOIN counties c ON p.county_id = c.id
      LEFT JOIN local_authorities la ON p.local_authority_id = la.id
      WHERE p.active = true
      ORDER BY p.name
    `)
    return result.rows
  } catch (error) {
    console.error('Error fetching politicians:', error);
    return []
  }
}

export default async function PromisesPage() {
  const [promises, politicians] = await Promise.all([getPromises(), getPoliticians()])

  return (
    <>
      <Nav />
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">All Promises</h1>
            <Link
              href="/add"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              Add Promise
            </Link>
          </div>

          {promises.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 mb-4">No promises tracked yet</p>
              <Link
                href="/add"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Add Your First Promise
              </Link>
            </div>
          ) : (
            <PromisesList promises={promises} politicians={politicians} />
          )}
        </div>
      </main>
    </>
  )
}
