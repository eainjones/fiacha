import { redirect } from 'next/navigation'
import { getDb } from '@/lib/db'
import { createClient } from '@/lib/supabase-server'
import Nav from '@/components/Nav'
import ReviewQueueActions from '@/components/ReviewQueueActions'

type ReviewQueueItem = {
  id: number
  extracted_promise: any
  politician_match: any | null
  status: string
  created_at: string
}

async function getPendingReviews(limit: number) {
  try {
    const db = getDb()
    const result = await db.query(
      `
      SELECT *
      FROM promise_review_queue
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT $1
      `,
      [limit]
    )
    return result.rows as ReviewQueueItem[]
  } catch (error) {
    console.error('Error fetching review queue:', error)
    return []
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ReviewQueuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }

  const items = await getPendingReviews(50)

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <header className="mb-8 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">Review Queue</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-2">
              Pending promises extracted by the crawler for human review.
            </p>
          </header>

          {items.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-10 text-center">
              <p className="text-gray-500 dark:text-slate-400">No pending reviews right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const extracted = item.extracted_promise || {}
                const match = item.politician_match

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-5 md:p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-slate-100">
                          {extracted.promise_title || 'Untitled Promise'}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                          {extracted.politician_name || 'Unknown'} {extracted.party ? `· ${extracted.party}` : ''}
                        </p>
                      </div>
                      {typeof extracted.confidence === 'number' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Confidence {Math.round(extracted.confidence)}%
                        </span>
                      )}
                    </div>

                    {extracted.description && (
                      <p className="text-gray-700 dark:text-slate-300 mt-3 leading-relaxed">
                        {extracted.description}
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="text-gray-600 dark:text-slate-400">
                        <span className="font-semibold text-gray-800 dark:text-slate-200">Source:</span>{' '}
                        {extracted.source_type || 'Unknown'}
                      </div>
                      <div className="text-gray-600 dark:text-slate-400">
                        <span className="font-semibold text-gray-800 dark:text-slate-200">Created:</span>{' '}
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                      {extracted.source_url && (
                        <div className="sm:col-span-2">
                          <a
                            href={extracted.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                          >
                            View source
                          </a>
                        </div>
                      )}
                      {match && (
                        <div className="sm:col-span-2 text-gray-600 dark:text-slate-400">
                          <span className="font-semibold text-gray-800 dark:text-slate-200">Matched:</span>{' '}
                          {match.name} {match.party ? `· ${match.party}` : ''} {match.matchScore ? `(${Math.round(match.matchScore)}%)` : ''}
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <ReviewQueueActions reviewId={item.id} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
