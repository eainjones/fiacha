'use client'

import { useState, useMemo } from 'react'
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
  politicians: any[]
}

export default function PromisesList({ promises, politicians }: PromisesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [politicianFilter, setPoliticianFilter] = useState('')

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(promises.map(p => p.category).filter(Boolean))
    return Array.from(cats).sort()
  }, [promises])

  // Filter promises
  const filteredPromises = useMemo(() => {
    return promises.filter(promise => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesSearch =
          promise.title.toLowerCase().includes(search) ||
          promise.description?.toLowerCase().includes(search) ||
          promise.politician_name.toLowerCase().includes(search)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter && promise.status !== statusFilter) return false

      // Category filter
      if (categoryFilter && promise.category !== categoryFilter) return false

      // Politician filter
      if (politicianFilter && promise.politician_name !== politicianFilter) return false

      return true
    })
  }, [promises, searchTerm, statusFilter, categoryFilter, politicianFilter])

  const handleReset = () => {
    setSearchTerm('')
    setStatusFilter('')
    setCategoryFilter('')
    setPoliticianFilter('')
  }

  return (
    <>
      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Filters</h3>
          <button
            onClick={handleReset}
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search promises..."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-gray-400 dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="kept">Kept</option>
              <option value="broken">Broken</option>
              <option value="compromised">Compromised</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
              Category
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="politician" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
              Politician
            </label>
            <select
              id="politician"
              value={politicianFilter}
              onChange={(e) => setPoliticianFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Politicians</option>
              {politicians.map((pol) => (
                <option key={pol.id} value={pol.name}>
                  {pol.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-slate-400">
          Showing <span className="font-bold text-emerald-600 dark:text-emerald-400">{filteredPromises.length}</span> of {promises.length} promises
        </div>
      </div>

      {/* Promises List */}
      {filteredPromises.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-12 text-center">
          <p className="text-gray-500 dark:text-slate-400">No promises match your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPromises.map((promise) => (
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
