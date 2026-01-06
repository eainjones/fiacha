'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface PromisePaginationProps {
  total: number
  page: number
  pageSize: number
  basePath?: string
}

export default function PromisePagination({ total, page, pageSize, basePath = '/promises' }: PromisePaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(nextPage))
    router.push(`${basePath}?${params.toString()}`)
  }

  if (pageCount <= 1) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
      <p className="text-sm text-gray-600 dark:text-slate-400">
        Page {page} of {pageCount} · {total} total
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1}
          className="px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 text-sm font-medium text-gray-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800"
        >
          Previous
        </button>
        <button
          onClick={() => goToPage(page + 1)}
          disabled={page >= pageCount}
          className="px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 text-sm font-medium text-gray-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-800"
        >
          Next
        </button>
      </div>
    </div>
  )
}
