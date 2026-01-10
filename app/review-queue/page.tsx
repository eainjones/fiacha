import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/auth/admin'
import Nav from '@/components/Nav'
import { getPendingSubmissions, getSubmissionCounts } from '@/lib/db/queries'
import SubmissionReviewCard from '@/components/SubmissionReviewCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ReviewQueuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in')
  }
  if (!isAdmin(user.email)) {
    redirect('/')
  }

  const [submissions, counts] = await Promise.all([
    getPendingSubmissions(50),
    getSubmissionCounts(),
  ])

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <header className="mb-8 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">
              AI Review Queue
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-2">
              AI-extracted promises pending human review
            </p>
            <div className="flex gap-4 mt-4 text-sm">
              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                {counts.pending} pending
              </span>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                {counts.approved} approved
              </span>
              <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                {counts.rejected} rejected
              </span>
            </div>
          </header>

          {submissions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-10 text-center">
              <p className="text-gray-500 dark:text-slate-400">No pending submissions to review.</p>
              <p className="text-gray-400 dark:text-slate-500 text-sm mt-2">
                Run the crawler to extract more promises.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <SubmissionReviewCard key={submission.id} submission={submission} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
