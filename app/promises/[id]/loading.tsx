import Nav from '@/components/Nav'

export default function PromiseDetailLoading() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back link placeholder */}
          <div className="mb-6 md:mb-8 animate-pulse">
            <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-40"></div>
          </div>

          {/* Main card */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 mb-6 md:mb-8 animate-pulse">
            {/* Title + status badge row */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div className="h-8 md:h-10 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-full w-24 flex-shrink-0"></div>
            </div>

            {/* Description skeleton */}
            <div className="space-y-3 mb-6 md:mb-8">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-emerald-50/20 dark:from-slate-800 dark:to-emerald-950/20 rounded-lg border border-gray-200 dark:border-slate-700">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-28"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones section skeleton */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 mb-6 md:mb-8 animate-pulse">
            <div className="h-7 md:h-8 bg-gray-200 dark:bg-slate-700 rounded w-36 mb-4 md:mb-6"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border-l-4 border-gray-200 dark:border-slate-700 pl-4 md:pl-6 py-3">
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence section skeleton */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 mb-6 md:mb-8 animate-pulse">
            <div className="h-7 md:h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-4 md:mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 md:p-5">
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-56 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-4/5 mb-3"></div>
                  <div className="flex gap-3">
                    <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-full w-20"></div>
                    <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-28"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status history section skeleton */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 animate-pulse">
            <div className="h-7 md:h-8 bg-gray-200 dark:bg-slate-700 rounded w-40 mb-4 md:mb-6"></div>
            <div className="space-y-4 md:space-y-5">
              {[1, 2].map((i) => (
                <div key={i} className="border-l-4 border-gray-200 dark:border-slate-700 pl-4 md:pl-6 py-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-full w-24"></div>
                    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
