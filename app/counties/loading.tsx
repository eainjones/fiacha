import Nav from '@/components/Nav'

export default function CountiesLoading() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header skeleton */}
          <header className="mb-8 md:mb-12 animate-pulse">
            <div className="h-10 md:h-14 bg-gray-200 dark:bg-slate-700 rounded w-72 mb-3"></div>
            <div className="h-6 md:h-7 bg-gray-200 dark:bg-slate-700 rounded w-96 max-w-full"></div>
          </header>

          {/* Summary Cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 animate-pulse"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                  <div className="h-6 w-6 md:h-8 md:w-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="h-8 md:h-10 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Province sections skeleton */}
          {['Leinster', 'Munster', 'Connacht', 'Ulster'].map((province) => (
            <section key={province} className="mb-8 md:mb-12">
              <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6 animate-pulse">
                <div className="h-8 md:h-9 bg-gray-200 dark:bg-slate-700 rounded w-36"></div>
                <div className="h-7 bg-emerald-100 dark:bg-emerald-950 rounded-full w-24"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 md:p-6 animate-pulse"
                  >
                    {/* County header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-28 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
                      </div>
                      <div className="h-6 w-6 md:h-8 md:w-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-8"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
                        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-8"></div>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="mt-4 flex gap-3">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  )
}
