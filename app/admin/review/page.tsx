import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getDb } from '@/lib/db'
import { createClient } from '@/lib/supabase-server'
import Nav from '@/components/Nav'
import ReviewQueueActions from '@/components/ReviewQueueActions'

type ReviewQueueItem = {
  id: number
  extracted_promise: any
  politician_match: any | null
  status: string
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
}

type StatusCounts = {
  pending: number
  approved: number
  rejected: number
  total: number
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  rejected: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
}

function buildReviewFilters(status?: string, search?: string) {
  const conditions: string[] = []
  const params: any[] = []

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    params.push(status)
    conditions.push(`status = $${params.length}`)
  }

  if (search) {
    params.push(`%${search}%`)
    conditions.push(
      `(COALESCE(extracted_promise->>'promise_title', '') ILIKE $${params.length}
        OR COALESCE(extracted_promise->>'politician_name', '') ILIKE $${params.length}
        OR COALESCE(extracted_promise->>'description', '') ILIKE $${params.length})`
    )
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  return { whereClause, params }
}

async function getStatusCounts() {
  try {
    const db = getDb()
    const result = await db.query(`
      SELECT status, COUNT(*)::int as count
      FROM promise_review_queue
      GROUP BY status
    `)

    const counts: StatusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    }

    result.rows.forEach((row: any) => {
      if (row.status in counts) {
        counts[row.status as keyof StatusCounts] = row.count
      }
      counts.total += row.count
    })

    return counts
  } catch (error) {
    console.error('Error fetching review counts:', error)
    return { pending: 0, approved: 0, rejected: 0, total: 0 }
  }
}

async function getReviewItems(status: string | undefined, search: string | undefined, limit: number, offset: number) {
  try {
    const db = getDb()
    const { whereClause, params } = buildReviewFilters(status, search)
    const result = await db.query(
      `
      SELECT *
      FROM promise_review_queue
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
      `,
      [...params, limit, offset]
    )
    return result.rows as ReviewQueueItem[]
  } catch (error) {
    console.error('Error fetching review queue:', error)
    return []
  }
}

async function getReviewCount(status: string | undefined, search: string | undefined) {
  try {
    const db = getDb()
    const { whereClause, params } = buildReviewFilters(status, search)
    const result = await db.query(
      `
      SELECT COUNT(*)::int as total
      FROM promise_review_queue
      ${whereClause}
      `,
      params
    )
    return result.rows[0]?.total ?? 0
  } catch (error) {
    console.error('Error fetching review count:', error)
    return 0
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminReviewPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
  const pageParam = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSize = 25
  const offset = (page - 1) * pageSize

  const [counts, items, total] = await Promise.all([
    getStatusCounts(),
    getReviewItems(status, search, pageSize, offset),
    getReviewCount(status, search),
  ])

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const buildLink = (nextStatus?: string, nextPage?: number) => {
    const params = new URLSearchParams()
    if (nextStatus) params.set('status', nextStatus)
    if (search) params.set('search', search)
    if (nextPage && nextPage > 1) params.set('page', String(nextPage))
    const query = params.toString()
    return query ? `/admin/review?${query}` : '/admin/review'
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <header className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">Admin Review Dashboard</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-2">
              Manage extracted promises and track approvals.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{counts.total}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Pending</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{counts.pending}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Approved</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{counts.approved}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Rejected</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{counts.rejected}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildLink()}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                    !status ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                  }`}
                >
                  All
                </Link>
                {['pending', 'approved', 'rejected'].map((item) => (
                  <Link
                    key={item}
                    href={buildLink(item)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                      status === item ? STATUS_STYLES[item] : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                    }`}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Link>
                ))}
              </div>
              <form action="/admin/review" className="flex items-center gap-2">
                {status && <input type="hidden" name="status" value={status} />}
                <input
                  type="text"
                  name="search"
                  defaultValue={search || ''}
                  placeholder="Search promises..."
                  className="w-full md:w-72 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-10 text-center">
              <p className="text-gray-500 dark:text-slate-400">No reviews found for this filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const extracted = item.extracted_promise || {}
                const match = item.politician_match

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-5 md:p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-slate-100">
                          {extracted.promise_title || 'Untitled Promise'}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          {extracted.politician_name || 'Unknown'} {extracted.party ? `· ${extracted.party}` : ''}
                        </p>
                      </div>
                      <span className={`inline-flex self-start px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${STATUS_STYLES[item.status] || STATUS_STYLES.pending}`}>
                        {item.status}
                      </span>
                    </div>

                    {extracted.description && (
                      <p className="text-gray-700 dark:text-slate-300 mt-3 leading-relaxed">
                        {extracted.description}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="text-gray-600 dark:text-slate-400">
                        <span className="font-semibold text-gray-800 dark:text-slate-200">Source:</span>{' '}
                        {extracted.source_type || 'Unknown'}
                      </div>
                      <div className="text-gray-600 dark:text-slate-400">
                        <span className="font-semibold text-gray-800 dark:text-slate-200">Created:</span>{' '}
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                      {item.reviewed_at && (
                        <div className="text-gray-600 dark:text-slate-400">
                          <span className="font-semibold text-gray-800 dark:text-slate-200">Reviewed:</span>{' '}
                          {new Date(item.reviewed_at).toLocaleString()}
                        </div>
                      )}
                      {item.reviewed_by && (
                        <div className="text-gray-600 dark:text-slate-400">
                          <span className="font-semibold text-gray-800 dark:text-slate-200">Reviewer:</span>{' '}
                          {item.reviewed_by}
                        </div>
                      )}
                      {extracted.source_url && (
                        <div className="sm:col-span-2">
                          <a
                            href={extracted.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                          >
                            View source
                          </a>
                        </div>
                      )}
                      {match && (
                        <div className="sm:col-span-2 text-gray-600 dark:text-slate-400">
                          <span className="font-semibold text-gray-800 dark:text-slate-200">Matched:</span>{' '}
                          {match.name} {match.party ? `· ${match.party}` : ''} {match.matchScore ? `(${Math.round(match.matchScore)}%)` : ''}
                        </div>
                      )}
                      {item.rejection_reason && (
                        <div className="sm:col-span-2 text-red-600 dark:text-red-400">
                          <span className="font-semibold">Rejection reason:</span> {item.rejection_reason}
                        </div>
                      )}
                    </div>

                    {item.status === 'pending' && (
                      <div className="mt-4">
                        <ReviewQueueActions reviewId={item.id} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {pageCount > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Page {page} of {pageCount} · {total} total
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href={buildLink(status, Math.max(1, page - 1))}
                  className={`px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 text-sm font-medium ${
                    page <= 1 ? 'opacity-50 pointer-events-none' : 'text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={buildLink(status, Math.min(pageCount, page + 1))}
                  className={`px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 text-sm font-medium ${
                    page >= pageCount ? 'opacity-50 pointer-events-none' : 'text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
