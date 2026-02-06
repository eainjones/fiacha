import { redirect } from 'next/navigation'
import { getSystemDb } from '@/lib/db'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/auth/admin'
import Nav from '@/components/Nav'

type CrawlRun = {
  id: number
  pipeline: string | null
  status: string
  promises_found: number | null
  promises_matched: number | null
  promises_queued: number | null
  errors: string[] | null
  error_count: number | null
  started_at: string
  finished_at: string | null
  duration_ms: number | null
}

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  error: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  running: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
}

function formatDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return '-'
  return `${(ms / 1000).toFixed(1)}s`
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then

  if (diffMs < 0) return 'just now'

  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`

  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

async function getCrawlRuns(): Promise<CrawlRun[]> {
  try {
    const db = getSystemDb()
    const result = await db.query(`
      SELECT *
      FROM crawl_runs
      ORDER BY started_at DESC
      LIMIT 20
    `)
    return result.rows as CrawlRun[]
  } catch (error: any) {
    // Table may not exist yet
    if (error?.code === '42P01') {
      return []
    }
    console.error('Error fetching crawl runs:', error)
    return []
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminCrawlsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }
  if (!isAdmin(user.email)) {
    redirect('/')
  }

  const runs = await getCrawlRuns()

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <header className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">Crawl Runs</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-2">
              Monitor crawler pipeline executions and results.
            </p>
          </header>

          {runs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-10 text-center">
              <p className="text-gray-500 dark:text-slate-400">No crawl runs recorded yet.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-slate-300">Pipeline</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-slate-300">Status</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-slate-300">Promises</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-slate-300">Matched</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-slate-300">Queued</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-slate-300">Duration</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-slate-300">Errors</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-slate-300">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                    {runs.map((run) => (
                      <tr key={run.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 text-gray-900 dark:text-slate-100 font-medium">
                          {run.pipeline || 'unknown'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${STATUS_STYLES[run.status] || STATUS_STYLES.running}`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-slate-300 tabular-nums">
                          {run.promises_found ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-slate-300 tabular-nums">
                          {run.promises_matched ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-slate-300 tabular-nums">
                          {run.promises_queued ?? '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-slate-300 tabular-nums">
                          {formatDuration(run.duration_ms)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {(run.error_count ?? 0) > 0 ? (
                            <span className="text-red-600 dark:text-red-400 font-semibold">{run.error_count}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-slate-500">0</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 dark:text-slate-400" title={new Date(run.started_at).toLocaleString()}>
                          {formatRelativeTime(run.started_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
