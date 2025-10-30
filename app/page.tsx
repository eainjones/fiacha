async function getPromises() {
  const res = await fetch('/api/promises', { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

async function getPoliticians() {
  const polRes = await fetch('/api/politicians', { cache: 'no-store' })
  if (!polRes.ok) return []
  return polRes.json()
}

import Nav from '@/components/Nav'
import Link from 'next/link'

export default async function Home() {
  const [promises, politicians] = await Promise.all([getPromises(), getPoliticians()])

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <header className="mb-12">
            <h1 className="text-5xl font-bold mb-3 text-gray-900">Political Accountability</h1>
            <p className="text-xl text-gray-600">Tracking promises, measuring progress</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Promises</h3>
                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-gray-900">{promises.length}</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Politicians</h3>
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-gray-900">{politicians.length}</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">In Progress</h3>
                <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-bold text-gray-900">{promises.filter((p: any) => p.status === 'in_progress').length}</p>
            </div>
          </div>

          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Politicians</h2>
              <Link href="/politicians" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                View all →
              </Link>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              {politicians.length === 0 ? (
                <p className="p-8 text-gray-500 text-center">No politicians yet</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-emerald-50 to-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Party</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Constituency</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {politicians.slice(0, 5).map((pol: any) => (
                      <tr key={pol.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{pol.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{pol.party}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{pol.constituency}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pol.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Recent Promises</h2>
              <Link href="/promises" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {promises.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-md border border-gray-100 text-center">
                  <p className="text-gray-500 text-lg">No promises tracked yet</p>
                </div>
              ) : (
                promises.slice(0, 6).map((promise: any) => (
                  <Link key={promise.id} href={`/promises/${promise.id}`} className="block group">
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{promise.title}</h3>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                          promise.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          promise.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          promise.status === 'kept' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          promise.status === 'broken' ? 'bg-red-100 text-red-800 border border-red-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {promise.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">{promise.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium text-gray-700">{promise.politician_name}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{promise.party}</span>
                        </div>
                        {promise.category && (
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="text-gray-600">{promise.category}</span>
                          </div>
                        )}
                        {promise.target_date && (
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-600">Target: {new Date(promise.target_date).toLocaleDateString()}</span>
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
