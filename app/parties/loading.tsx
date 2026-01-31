import Nav from '@/components/Nav'

export default function PartiesLoading() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header skeleton */}
          <header className="mb-8 md:mb-10 animate-pulse">
            <div className="h-9 md:h-10 bg-gray-200 dark:bg-slate-700 rounded w-56 mb-2"></div>
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-80 max-w-full"></div>
          </header>

          {/* Stats Cards skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 md:p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-12"></div>
              </div>
            ))}
          </div>

          {/* Party sections skeleton */}
          {['Republic of Ireland', 'All-Island', 'Northern Ireland'].map((section) => (
            <section key={section} className="mb-10">
              <div className="animate-pulse mb-6">
                <div className="h-7 md:h-8 bg-gray-200 dark:bg-slate-700 rounded w-48"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 animate-pulse"
                  >
                    <div className="p-5 md:p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-40 mb-2"></div>
                          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                        </div>
                        <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-full w-14"></div>
                      </div>

                      {/* Ideology */}
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-4"></div>

                      {/* Stats */}
                      <div className="border-t border-gray-100 dark:border-slate-700 pt-4 mt-4">
                        <div className="flex gap-3">
                          <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                          <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                        </div>
                      </div>

                      {/* View link */}
                      <div className="mt-4">
                        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-36"></div>
                      </div>
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
