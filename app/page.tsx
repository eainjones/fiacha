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
    getPoliticianSummary(5),
    getPromiseStatusCounts(),
  ])

  const politicians = politicianSummary.list

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <header className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 text-gray-900 dark:text-slate-50">
              Political Accountability
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-slate-400">
              Track and measure Irish political promises by county, politician, and category
            </p>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Promises</h3>
                <svg className="h-6 w-6 md:h-8 md:w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">{statusCounts.total}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Politicians</h3>
                <svg className="h-6 w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">{politicianSummary.total.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Kept</h3>
                <span className="text-emerald-600 dark:text-emerald-400 text-lg">✓</span>
              </div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">{statusCounts.kept}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">In Progress</h3>
                <svg className="h-6 w-6 md:h-8 md:w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">{statusCounts.in_progress}</p>
            </div>
          </div>

          {/* Politicians Section */}
          <section className="mb-8 md:mb-12">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-50">Politicians</h2>
              <Link
                href="/politicians"
                className="inline-flex items-center min-h-[44px] px-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-sm focus:outline-none focus:underline"
              >
                View all →
              </Link>
            </div>

            {/* Mobile: Card View */}
            <div className="md:hidden space-y-3">
              {politicians.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 text-center">
                  <p className="text-gray-500 dark:text-slate-400">No politicians yet</p>
                </div>
              ) : (
                politicians.slice(0, 5).map((pol: any) => (
                  <div key={pol.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-gray-900 dark:text-slate-100">{pol.name}</h3>
                        {pol.role && (
                          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{pol.role}</p>
                        )}
                      </div>
                      <PartyBadge party={pol.party} color={pol.party_color} shortName={pol.party_short_name} size="sm" />
                    </div>
                    {pol.constituency && (
                      <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                        <span className="text-gray-400 dark:text-slate-500">Constituency:</span>{' '}
                        {pol.constituency}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop: Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden">
              {politicians.length === 0 ? (
                <p className="p-8 text-gray-500 dark:text-slate-400 text-center">No politicians yet</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gradient-to-r from-emerald-50 to-gray-50 dark:from-emerald-950 dark:to-slate-800">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Party</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Constituency</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {politicians.slice(0, 5).map((pol: any) => (
                      <tr key={pol.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900 dark:text-slate-100">{pol.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PartyBadge party={pol.party} color={pol.party_color} shortName={pol.party_short_name} size="sm" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-slate-300">{pol.constituency}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{pol.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Promises Section */}
          <section>
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-50">Recent Promises</h2>
              <Link
                href="/promises"
                className="inline-flex items-center min-h-[44px] px-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium text-sm focus:outline-none focus:underline"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {promises.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 text-center">
                  <p className="text-gray-500 dark:text-slate-400 text-lg">No promises tracked yet</p>
                  <p className="text-gray-400 dark:text-slate-500 text-sm mt-2">Add promises to start tracking political accountability</p>
                </div>
              ) : (
                promises.slice(0, 6).map((promise: any) => (
                  <Link key={promise.id} href={`/promises/${promise.id}`} className="block group">
                    <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {promise.title}
                        </h3>
                        <StatusBadge status={promise.status} size="sm" />
                      </div>
                      <p className="text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">{promise.description}</p>
                      <div className="flex flex-wrap gap-3 md:gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium text-gray-700 dark:text-slate-300">{promise.politician_name}</span>
                          <span className="text-gray-400 dark:text-slate-600">•</span>
                          <span className="text-gray-600 dark:text-slate-400">{promise.party}</span>
                        </div>
                        {promise.category && (
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="text-gray-600 dark:text-slate-400">{promise.category}</span>
                          </div>
                        )}
                        {promise.target_date && (
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-600 dark:text-slate-400">Target: {new Date(promise.target_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
