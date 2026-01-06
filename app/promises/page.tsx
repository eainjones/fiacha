import Nav from '@/components/Nav'
import Link from 'next/link'
import PromisesList from '@/components/PromisesList'
import PromiseFilters from '@/components/PromiseFilters'
import PromisePagination from '@/components/PromisePagination'
import { getSystemDb } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

type PromiseFiltersInput = {
  status?: string
  category?: string
  politicianId?: number
  search?: string
}

function buildPromiseFilters(filters: PromiseFiltersInput) {
  const conditions: string[] = []
  const params: any[] = []

  if (filters.status) {
    params.push(filters.status)
    conditions.push(`p.status = $${params.length}`)
  }
  if (filters.category) {
    params.push(filters.category)
    conditions.push(`p.category = $${params.length}`)
  }
  if (filters.politicianId) {
    params.push(filters.politicianId)
    conditions.push(`p.politician_id = $${params.length}`)
  }
  if (filters.search) {
    params.push(`%${filters.search}%`)
    conditions.push(`(p.title ILIKE $${params.length} OR p.description ILIKE $${params.length} OR pol.name ILIKE $${params.length})`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  return { whereClause, params }
}

async function getPromises(filters: PromiseFiltersInput, limit: number, offset: number) {
  try {
    const db = getSystemDb()
    const { whereClause, params } = buildPromiseFilters(filters)
    const result = await db.query(`
      SELECT
        p.*,
        pol.name as politician_name,
        pol.party
      FROM promises p
      LEFT JOIN politicians pol ON p.politician_id = pol.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `, [...params, limit, offset])
    return result.rows
  } catch (error) {
    console.error('Error fetching promises:', error);
    return []
  }
}

async function getPromiseCount(filters: PromiseFiltersInput) {
  try {
    const db = getSystemDb()
    const { whereClause, params } = buildPromiseFilters(filters)
    const result = await db.query(`
      SELECT COUNT(*)::int as total
      FROM promises p
      LEFT JOIN politicians pol ON p.politician_id = pol.id
      ${whereClause}
    `, params)
    return result.rows[0]?.total ?? 0
  } catch (error) {
    console.error('Error fetching promise count:', error);
    return 0
  }
}

async function getPoliticians() {
  try {
    const db = getSystemDb()
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

async function getCategories() {
  try {
    const db = getSystemDb()
    const result = await db.query(`
      SELECT DISTINCT category
      FROM promises
      WHERE category IS NOT NULL
      ORDER BY category
    `)
    return result.rows.map((row: any) => row.category)
  } catch (error) {
    console.error('Error fetching categories:', error);
    return []
  }
}

export default async function PromisesPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
  const politicianIdValue = typeof searchParams.politician_id === 'string' ? Number(searchParams.politician_id) : undefined
  const politicianId = typeof politicianIdValue === 'number' && Number.isInteger(politicianIdValue) && politicianIdValue > 0 ? politicianIdValue : undefined

  const pageParam = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSize = 20
  const offset = (page - 1) * pageSize

  const filters = { status, category, politicianId, search }
  const hasFilters = Boolean(status || category || politicianId || search)

  const [promises, total, politicians, categories] = await Promise.all([
    getPromises(filters, pageSize, offset),
    getPromiseCount(filters),
    getPoliticians(),
    getCategories(),
  ])

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">All Promises</h1>
              <p className="text-gray-600 dark:text-slate-400 mt-1">{total} promises tracked</p>
            </div>
            <Link
              href="/add"
              className="inline-flex items-center justify-center bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-semibold shadow-sm transition-colors"
            >
              + Add Promise
            </Link>
          </div>

          <PromiseFilters politicians={politicians} categories={categories} />

          {promises.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-12 text-center">
              <p className="text-gray-500 dark:text-slate-400 mb-4">
                {hasFilters ? 'No promises match your filters' : 'No promises tracked yet'}
              </p>
              <Link
                href="/add"
                className="inline-block bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-semibold transition-colors"
              >
                Add Your First Promise
              </Link>
            </div>
          ) : (
            <>
              <PromisesList promises={promises} />
              <PromisePagination total={total} page={page} pageSize={pageSize} />
            </>
          )}
        </div>
      </main>
    </>
  )
}
