'use client'

interface PromiseItem {
  id: number
  title: string
  description: string | null
  status: string | null
  politician_name: string | null
  party: string | null
  category: string | null
  promiseDate: string | null
  targetDate: string | null
  score: number | null
}

interface ExportCsvButtonProps {
  promises: PromiseItem[]
}

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export default function ExportCsvButton({ promises }: ExportCsvButtonProps) {
  const handleExport = () => {
    const headers = ['Title', 'Status', 'Politician', 'Category', 'Date Created']
    const rows = promises.map((p) => [
      escapeCsv(p.title),
      escapeCsv((p.status ?? 'pending').replace('_', ' ')),
      escapeCsv(p.politician_name),
      escapeCsv(p.category),
      escapeCsv(p.promiseDate ? new Date(p.promiseDate).toLocaleDateString() : ''),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'fiacha-promises.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-sm"
      aria-label="Export promises as CSV"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export CSV
    </button>
  )
}
