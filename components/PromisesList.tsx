import Link from 'next/link'
import StatusBadge from './StatusBadge'

interface Promise {
  id: number
  title: string
  description: string
  status: string
  politician_name: string
  party: string
  category: string
  promise_date: string
  target_date: string
  score: number | null
}

interface PromisesListProps {
  promises: Promise[]
}

export default function PromisesList({ promises }: PromisesListProps) {
  return (
    <>
      {/* Promises List */}
      {promises.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-12 text-center">
          <p className="text-gray-500 dark:text-slate-400">No promises match your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {promises.map((promise) => (
            <Link key={promise.id} href={`/promises/${promise.id}`} className="block group">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{promise.title}</h2>
                    <StatusBadge status={promise.status} size="sm" />
                  </div>

                  {promise.description && (
                    <p className="text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">{promise.description}</p>
                  )}

                  <div className="flex flex-wrap gap-3 md:gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium text-gray-700 dark:text-slate-300">{promise.politician_name}</span>
                      {promise.party && (
                        <>
                          <span className="text-gray-400 dark:text-slate-600">•</span>
                          <span className="text-gray-600 dark:text-slate-400">{promise.party}</span>
                        </>
                      )}
                    </div>

                    {promise.category && (
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-gray-600 dark:text-slate-400">{promise.category}</span>
                      </div>
                    )}

                    {promise.promise_date && (
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600 dark:text-slate-400">
                          Made: {new Date(promise.promise_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {promise.target_date && (
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-600 dark:text-slate-400">
                          Target: {new Date(promise.target_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {promise.score !== null && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-semibold text-xs">
                          {promise.score}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
