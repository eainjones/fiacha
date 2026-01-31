import Nav from '@/components/Nav'

export default function HomeLoading() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header skeleton */}
          <header className="mb-8 md:mb-12 animate-pulse">
            <div className="h-10 md:h-14 bg-gray-200 dark:bg-slate-700 rounded w-80 mb-3"></div>
            <div className="h-6 md:h-7 bg-gray-200 dark:bg-slate-700 rounded w-96 max-w-full"></div>
          </header>

          {/* Stats Grid skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 animate-pulse"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                  <div className="h-6 w-6 md:h-8 md:w-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="h-8 md:h-10 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Politicians Section skeleton */}
          <section className="mb-8 md:mb-12">
            <div className="flex justify-between items-center mb-4 md:mb-6 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-40"></div>
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {[1, 2, 3].map((i) => (
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

            {/* Desktop table */}
            <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gradient-to-r from-emerald-50 to-gray-50 dark:from-emerald-950 dark:to-slate-800">
                  <tr>
                    {['Name', 'Party', 'Constituency', 'Role'].map((col) => (
                      <th
                        key={col}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {[1, 2, 3, 4, 5].map((i) => (
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
                        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Recent Promises Section skeleton */}
          <section>
            <div className="flex justify-between items-center mb-4 md:mb-6 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48"></div>
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 animate-pulse"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-64"></div>
                    <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
