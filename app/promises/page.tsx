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
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">All Promises</h1>
              <p className="text-gray-600 dark:text-slate-400 mt-1">{promises.length} promises tracked</p>
            </div>
            <Link
              href="/add"
              className="inline-flex items-center justify-center bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-semibold shadow-sm transition-colors"
            >
              + Add Promise
            </Link>
          </div>

          {promises.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-12 text-center">
              <p className="text-gray-500 dark:text-slate-400 mb-4">No promises tracked yet</p>
              <Link
                href="/add"
                className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-semibold transition-colors"
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
