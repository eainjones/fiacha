import Nav from '@/components/Nav'
import Link from 'next/link'
import PromisesList from '@/components/PromisesList'
import PromiseFilters from '@/components/PromiseFilters'
import PromisePagination from '@/components/PromisePagination'
import { getPromises, getPromiseCount, getActivePoliticians, getPromiseCategories } from '@/lib/db/queries'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    getActivePoliticians(),
    getPromiseCategories(),
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
