import Nav from '@/components/Nav'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-8 md:p-12">
            <div className="mb-6">
              <span className="text-6xl font-bold text-emerald-600 dark:text-emerald-400">404</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-2">
              Page not found
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mb-8">
              The page you are looking for does not exist or has been moved.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Go home
              </Link>
              <Link
                href="/politicians"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Browse politicians
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
