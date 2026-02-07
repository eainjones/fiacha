import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/auth/admin'
import Nav from '@/components/Nav'
import { getSubmissions, getSubmissionCounts, getSubmissionCount } from '@/lib/db/queries'
import SubmissionReviewCard from '@/components/SubmissionReviewCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const STATUS_MAP: Record<string, string> = {
  pending: 'pending_review',
  approved: 'approved',
  rejected: 'rejected',
}

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }
  if (!isAdmin(user.email)) {
    redirect('/')
  }

  const statusFilter = typeof searchParams.status === 'string' ? searchParams.status : undefined
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined
  const pageParam = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const pageSize = 25
  const offset = (page - 1) * pageSize

  const dbStatus = statusFilter ? STATUS_MAP[statusFilter] || statusFilter : undefined
  const filters = { status: dbStatus, search }

  const [submissions, counts, total] = await Promise.all([
    getSubmissions(filters, pageSize, offset),
    getSubmissionCounts(),
    getSubmissionCount(filters),
  ])

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const buildLink = (nextStatus?: string, nextPage?: number) => {
    const params = new URLSearchParams()
    if (nextStatus) params.set('status', nextStatus)
    if (search) params.set('search', search)
    if (nextPage && nextPage > 1) params.set('page', String(nextPage))
    const query = params.toString()
    return query ? `/review-queue?${query}` : '/review-queue'
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <header className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">
              Review Queue
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-2">
              AI-extracted promises pending human review
            </p>
          </header>

          {/* Status counts */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
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

          {/* Filters and search */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 md:p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildLink()}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                    !statusFilter
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                      : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  All
                </Link>
                {[
                  { key: 'pending', label: 'Pending', style: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' },
                  { key: 'approved', label: 'Approved', style: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' },
                  { key: 'rejected', label: 'Rejected', style: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800' },
                ].map(({ key, label, style }) => (
                  <Link
                    key={key}
                    href={buildLink(key)}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                      statusFilter === key
                        ? style
                        : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <form action="/review-queue" className="flex items-center gap-2">
                {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
                <input
                  type="text"
                  name="search"
                  defaultValue={search || ''}
                  placeholder="Search promises or politicians..."
                  className="w-full md:w-72 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 dark:placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Results */}
          {submissions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-10 text-center">
              <p className="text-gray-500 dark:text-slate-400">
                {search ? 'No submissions match your search.' : 'No submissions found.'}
              </p>
              {!search && !statusFilter && (
                <p className="text-gray-400 dark:text-slate-500 text-sm mt-2">
                  Run the crawler to extract more promises.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <SubmissionReviewCard key={submission.id} submission={submission} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Page {page} of {pageCount} ({total} total)
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href={buildLink(statusFilter, Math.max(1, page - 1))}
                  className={`inline-flex items-center px-5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-sm font-medium transition-colors ${
                    page <= 1
                      ? 'opacity-50 pointer-events-none'
                      : 'text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={buildLink(statusFilter, Math.min(pageCount, page + 1))}
                  className={`inline-flex items-center px-5 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 text-sm font-medium transition-colors ${
                    page >= pageCount
                      ? 'opacity-50 pointer-events-none'
                      : 'text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'
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
