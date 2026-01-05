import Nav from '@/components/Nav'
import Link from 'next/link'
import { getDb } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getCounties() {
  try {
    const db = getDb()
    const result = await db.query(`
      SELECT
        c.*,
        COALESCE(pol_counts.politician_count, 0) as politician_count,
        COALESCE(promise_counts.promise_count, 0) as promise_count
      FROM counties c
      LEFT JOIN (
        SELECT
          county_id,
          COUNT(*) FILTER (WHERE active) as politician_count
        FROM politicians
        GROUP BY county_id
      ) pol_counts ON pol_counts.county_id = c.id
      LEFT JOIN (
        SELECT
          pol.county_id,
          COUNT(pr.id) as promise_count
        FROM promises pr
        JOIN politicians pol ON pol.id = pr.politician_id
        GROUP BY pol.county_id
      ) promise_counts ON promise_counts.county_id = c.id
      ORDER BY c.province, c.name
    `)
    return result.rows
  } catch (error) {
    console.error('Error fetching counties:', error);
    return []
  }
}

export default async function CountiesPage() {
  const counties = await getCounties()

  // Group by province
  const provinces = counties.reduce((acc: any, county: any) => {
    const province = county.province || 'Other'
    if (!acc[province]) acc[province] = []
    acc[province].push(county)
    return acc
  }, {})

  const provinceOrder = ['Leinster', 'Munster', 'Connacht', 'Ulster']

  const totalPoliticians = counties.reduce((sum: number, c: any) => sum + Number(c.politician_count), 0)
  const totalPromises = counties.reduce((sum: number, c: any) => sum + Number(c.promise_count), 0)

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <header className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 text-gray-900 dark:text-slate-50">Counties of Ireland</h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-slate-400">Geographical breakdown of political accountability</p>
          </header>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Total Counties</h3>
                <svg className="h-6 w-6 md:h-8 md:w-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">{counties.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Politicians</h3>
                <svg className="h-6 w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">{totalPoliticians}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs md:text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">Total Promises</h3>
                <svg className="h-6 w-6 md:h-8 md:w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">{totalPromises}</p>
            </div>
          </div>

          {/* Provinces */}
          {provinceOrder.map(provinceName => {
            const provinceCounties = provinces[provinceName] || []
            if (provinceCounties.length === 0) return null

            return (
              <section key={provinceName} className="mb-8 md:mb-12">
                <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-50">{provinceName}</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {provinceCounties.length} {provinceCounties.length === 1 ? 'County' : 'Counties'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {provinceCounties.map((county: any) => (
                    <div
                      key={county.id}
                      className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-all p-4 md:p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">{county.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400">{county.province}</p>
                        </div>
                        <svg className="h-6 w-6 md:h-8 md:w-8 text-emerald-600 dark:text-emerald-400 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Politicians
                          </span>
                          <span className="text-lg font-bold text-gray-900 dark:text-slate-100">{Number(county.politician_count)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Promises
                          </span>
                          <span className="text-lg font-bold text-gray-900 dark:text-slate-100">{Number(county.promise_count)}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {county.politician_count > 0 && (
                          <Link
                            href={`/politicians?county=${encodeURIComponent(county.name)}`}
                            className="inline-flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                          >
                            View All
                            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        )}
                        {county.politician_count > 0 && (
                          <Link
                            href={`/politicians?county=${encodeURIComponent(county.name)}&position=Councillor`}
                            className="inline-flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                          >
                            Councillors
                            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </>
  )
}
