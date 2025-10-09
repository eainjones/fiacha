import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import Nav from '@/components/Nav'
import Link from 'next/link'

async function getPromiseDetails(id: string) {
  const db = getDb()

  const promiseResult = await db.query(
    `SELECT p.*, pol.name as politician_name, pol.party, pol.constituency
     FROM promises p
     LEFT JOIN politicians pol ON p.politician_id = pol.id
     WHERE p.id = $1`,
    [id]
  )

  if (promiseResult.rows.length === 0) {
    return null
  }

  const evidence = await db.query(
    'SELECT * FROM evidence WHERE promise_id = $1 ORDER BY published_date DESC',
    [id]
  )

  const milestones = await db.query(
    'SELECT * FROM milestones WHERE promise_id = $1 ORDER BY milestone_date DESC',
    [id]
  )

  const statusHistory = await db.query(
    'SELECT * FROM status_history WHERE promise_id = $1 ORDER BY created_at DESC',
    [id]
  )

  return {
    promise: promiseResult.rows[0],
    evidence: evidence.rows,
    milestones: milestones.rows,
    statusHistory: statusHistory.rows,
  }
}

export default async function PromiseDetailPage({ params }: { params: { id: string } }) {
  const data = await getPromiseDetails(params.id)

  if (!data) {
    notFound()
  }

  const { promise, evidence, milestones, statusHistory } = data

  const statusColors = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    kept: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    broken: 'bg-red-100 text-red-800 border-red-200',
    compromised: 'bg-orange-100 text-orange-800 border-orange-200',
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-8 group">
            <svg className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>

          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">{promise.title}</h1>
              <span className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide border ${statusColors[promise.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {promise.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-gray-700 text-lg mb-8 leading-relaxed">{promise.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-gray-50 to-emerald-50/20 rounded-lg border border-gray-200">
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Politician</span>
                <p className="text-lg font-bold text-gray-900 mt-1">{promise.politician_name}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Party</span>
                <p className="text-lg font-bold text-gray-900 mt-1">{promise.party}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Constituency</span>
                <p className="text-lg font-bold text-gray-900 mt-1">{promise.constituency}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</span>
                <p className="text-lg font-bold text-gray-900 mt-1">{promise.category}</p>
              </div>
              {promise.promise_date && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Promise Date</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{new Date(promise.promise_date).toLocaleDateString()}</p>
                </div>
              )}
              {promise.target_date && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Target Date</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{new Date(promise.target_date).toLocaleDateString()}</p>
                </div>
              )}
              {promise.score !== null && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Accountability Score</span>
                  <p className="text-lg font-bold text-emerald-600 mt-1">{promise.score}/100</p>
                </div>
              )}
            </div>
          </div>

          {milestones.length > 0 && (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Milestones</h2>
              <div className="space-y-4">
                {milestones.map((milestone: any) => (
                  <div key={milestone.id} className="border-l-4 border-emerald-500 pl-6 py-3 hover:bg-emerald-50/30 transition-colors rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{milestone.title}</h3>
                        {milestone.description && (
                          <p className="text-gray-600 mt-2 leading-relaxed">{milestone.description}</p>
                        )}
                        {milestone.milestone_date && (
                          <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(milestone.milestone_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {milestone.achieved && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Achieved
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {evidence.length > 0 && (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Evidence & Sources</h2>
              <div className="space-y-4">
                {evidence.map((item: any) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-5 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.title || 'Untitled Source'}</h3>
                        {item.description && (
                          <p className="text-gray-600 mt-2">{item.description}</p>
                        )}
                        <div className="flex gap-4 mt-3 text-sm">
                          {item.source_type && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium capitalize">
                              {item.source_type}
                            </span>
                          )}
                          {item.published_date && (
                            <span className="inline-flex items-center gap-1 text-gray-500">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(item.published_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold text-sm ml-4"
                        >
                          View Source
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statusHistory.length > 0 && (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Status History</h2>
              <div className="space-y-5">
                {statusHistory.map((history: any) => (
                  <div key={history.id} className="border-l-4 border-gray-300 pl-6 py-3 hover:bg-gray-50 transition-colors rounded-r-lg">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${statusColors[history.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {history.status.replace('_', ' ')}
                      </span>
                      {history.score !== null && (
                        <span className="text-emerald-600 font-bold">Score: {history.score}/100</span>
                      )}
                    </div>
                    {history.rationale && (
                      <p className="text-gray-700 mb-3 leading-relaxed">{history.rationale}</p>
                    )}
                    <div className="flex justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(history.created_at).toLocaleDateString()}
                      </span>
                      {history.changed_by && (
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {history.changed_by}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
