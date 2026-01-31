import Nav from '@/components/Nav'

export default function PromisesLoading() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 animate-pulse">
            <div>
              <div className="h-9 md:h-10 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-2"></div>
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-40"></div>
            </div>
            <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded-lg w-40"></div>
          </div>

          {/* Filter bar skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-6 mb-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Promise cards skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 animate-pulse"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                  <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-64 max-w-full"></div>
                  <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-24 flex-shrink-0"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="flex flex-wrap gap-4">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-36"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="mt-8 flex justify-center animate-pulse">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
