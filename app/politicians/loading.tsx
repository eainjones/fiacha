import Nav from '@/components/Nav'

export default function PoliticiansLoading() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8 animate-pulse">
            <div>
              <div className="h-9 md:h-10 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-2"></div>
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-72"></div>
            </div>
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-lg w-40"></div>
          </div>

          {/* Filter skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-6 mb-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile cards skeleton */}
          <div className="md:hidden space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-36 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-14"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table skeleton */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-emerald-50 to-gray-50 dark:from-emerald-950 dark:to-slate-800">
                <tr>
                  {['Name', 'Party', 'Constituency', 'County', 'Position'].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-28"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
