import Nav from '@/components/Nav'

export default function PartyDetailLoading() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back link placeholder */}
          <div className="mb-6 md:mb-8 animate-pulse">
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-36"></div>
          </div>

          {/* Party Header card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 md:p-8 mb-8 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 md:h-10 bg-gray-200 dark:bg-slate-700 rounded w-64"></div>
                  <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-full w-16"></div>
                </div>
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
              </div>
              <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-lg w-36"></div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-6">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-4/5"></div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-emerald-50/20 dark:from-slate-800 dark:to-emerald-950/20 rounded-lg border border-gray-200 dark:border-slate-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-28"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Ideology & Key Policies skeleton */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 md:p-8 mb-8 animate-pulse">
            <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded w-28 mb-3"></div>
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-full mb-6"></div>
            <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-gray-200 dark:bg-slate-700 rounded flex-shrink-0"></div>
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-48"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Members overview card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 md:p-8 mb-8 animate-pulse">
            <div className="h-7 md:h-8 bg-gray-200 dark:bg-slate-700 rounded w-40 mb-6"></div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 text-center">
                  <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-10 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>

            {/* Members by county grid */}
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-44 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Member section skeletons */}
          {[1, 2].map((section) => (
            <div key={section} className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 md:p-8 mb-8 animate-pulse">
              <div className="h-7 md:h-8 bg-gray-200 dark:bg-slate-700 rounded w-28 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-36 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-28 mb-1"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
