import Nav from '@/components/Nav'
import Link from 'next/link'
import PartyBadge from '@/components/PartyBadge'
import StatusBadge from '@/components/StatusBadge'
import { getRecentPromises, getPoliticianSummary, getPromiseStatusCounts } from '@/lib/db/queries'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const [promises, politicianSummary, statusCounts] = await Promise.all([
    getRecentPromises(6),
    getPoliticianSummary(6),
    getPromiseStatusCounts(),
  ])

  const politicians = politicianSummary.list
  const keptRate = statusCounts.total > 0
    ? Math.round((statusCounts.kept / statusCounts.total) * 100)
    : 0

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-white dark:bg-slate-950">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-gray-100 dark:border-slate-800">
          {/* Decorative gradient mesh */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-emerald-950/30 dark:via-slate-950 dark:to-blue-950/30"
          />
          <div
            aria-hidden="true"
            className="absolute -top-32 -right-32 -z-10 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/10"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-500/10"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-emerald-700 backdrop-blur-sm dark:border-emerald-900 dark:bg-slate-900/70 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Tracking {politicianSummary.total.toLocaleString()} politicians across Ireland
              </div>

              <h1 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-slate-50">
                Political promises,{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-300">
                  held to account.
                </span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Fiacha tracks and measures Irish political commitments — by county, politician, and
                category — so voters can separate words from action.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/promises"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-slate-950"
                >
                  Explore promises
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/politicians"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/80 px-6 py-3 text-sm font-semibold text-gray-900 backdrop-blur-sm transition-all hover:bg-white hover:border-gray-400 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-900 dark:hover:border-slate-600"
                >
                  Browse politicians
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Stats Grid */}
          <section className="mb-16 md:mb-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Total Promises */}
              <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/50">
                    <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50 tabular-nums">
                  {statusCounts.total.toLocaleString()}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">
                  Total promises tracked
                </p>
              </div>

              {/* Politicians */}
              <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-xl bg-blue-50 p-2.5 dark:bg-blue-950/50">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50 tabular-nums">
                  {politicianSummary.total.toLocaleString()}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">
                  Politicians tracked
                </p>
              </div>

              {/* Kept */}
              <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-950/50">
                    <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {keptRate}%
                  </span>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50 tabular-nums">
                  {statusCounts.kept.toLocaleString()}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">
                  Promises kept
                </p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                    style={{ width: `${keptRate}%` }}
                  />
                </div>
              </div>

              {/* In Progress */}
              <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-amber-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-900">
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-xl bg-amber-50 p-2.5 dark:bg-amber-950/50">
                    <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50 tabular-nums">
                  {statusCounts.in_progress.toLocaleString()}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">
                  In progress
                </p>
              </div>
            </div>
          </section>

          {/* Politicians Section */}
          <section className="mb-16 md:mb-20">
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Representatives
                </p>
                <h2 className="mt-1 text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">
                  Featured politicians
                </h2>
              </div>
              <Link
                href="/politicians"
                className="group inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 focus:outline-none focus:underline"
              >
                View all
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {politicians.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-gray-500 dark:text-slate-400">No politicians yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {politicians.slice(0, 6).map((pol: any) => (
                  <Link
                    key={pol.id}
                    href={`/politicians/${pol.id}`}
                    className="group relative rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-lg font-bold text-emerald-700 dark:from-emerald-900 dark:to-emerald-800 dark:text-emerald-200">
                        {pol.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-gray-900 group-hover:text-emerald-700 transition-colors dark:text-slate-100 dark:group-hover:text-emerald-400">
                          {pol.name}
                        </h3>
                        {pol.role && (
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                            {pol.role}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <PartyBadge
                            party={pol.party}
                            color={pol.party_color}
                            shortName={pol.party_short_name}
                            size="sm"
                          />
                        </div>
                        {pol.constituency && (
                          <p className="mt-2 truncate text-xs text-gray-500 dark:text-slate-500">
                            <svg className="mr-1 inline-block h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {pol.constituency}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Promises Section */}
          <section>
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Latest activity
                </p>
                <h2 className="mt-1 text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">
                  Recent promises
                </h2>
              </div>
              <Link
                href="/promises"
                className="group inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 focus:outline-none focus:underline"
              >
                View all
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {promises.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-lg text-gray-500 dark:text-slate-400">No promises tracked yet</p>
                <p className="mt-2 text-sm text-gray-400 dark:text-slate-500">
                  Add promises to start tracking political accountability
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                {promises.slice(0, 6).map((promise: any) => (
                  <Link key={promise.id} href={`/promises/${promise.id}`} className="group block">
                    <article className="relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <StatusBadge status={promise.status} size="sm" />
                        {promise.category && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-slate-800 dark:text-slate-300">
                            {promise.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold leading-snug text-gray-900 group-hover:text-emerald-700 transition-colors dark:text-slate-100 dark:group-hover:text-emerald-400">
                        {promise.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-slate-400">
                        {promise.description}
                      </p>
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                            {promise.politician_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-gray-900 dark:text-slate-100">
                              {promise.politician_name}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-slate-500">
                              {promise.party}
                            </p>
                          </div>
                        </div>
                        {promise.target_date && (
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-gray-400 dark:text-slate-500">Target</p>
                            <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                              {new Date(promise.target_date).toLocaleDateString('en-IE', {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  )
}
