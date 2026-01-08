'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

interface PromiseFiltersProps {
  politicians: Array<{ id: number; name: string }>
  categories: string[]
  basePath?: string
}

export default function PromiseFilters({ politicians, categories, basePath = '/promises' }: PromiseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [politicianId, setPoliticianId] = useState(searchParams.get('politician_id') || '')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const isInitial = useRef(true)

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false
      return
    }

    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (category) params.set('category', category)
    if (politicianId) params.set('politician_id', politicianId)
    if (search) params.set('search', search)
    params.set('page', '1')

    const queryString = params.toString()
    router.push(queryString ? `${basePath}?${queryString}` : basePath)
  }, [status, category, politicianId, search, router, basePath])

  const handleReset = () => {
    setStatus('')
    setCategory('')
    setPoliticianId('')
    setSearch('')
  }

  const removeFilter = (filterName: 'status' | 'category' | 'politician' | 'search') => {
    switch (filterName) {
      case 'status':
        setStatus('')
        break
      case 'category':
        setCategory('')
        break
      case 'politician':
        setPoliticianId('')
        break
      case 'search':
        setSearch('')
        break
    }
  }

  const hasActiveFilters = Boolean(status || category || politicianId || search)
  const selectedPolitician = politicians.find((p) => String(p.id) === politicianId)

  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    kept: 'Kept',
    broken: 'Broken',
    compromised: 'Compromised',
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 md:p-6 mb-6">
      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-slate-700">
          <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Active filters:</span>

          {status && (
            <FilterChip
              label={`Status: ${statusLabels[status] || status}`}
              onRemove={() => removeFilter('status')}
            />
          )}

          {category && (
            <FilterChip
              label={`Category: ${category}`}
              onRemove={() => removeFilter('category')}
            />
          )}

          {selectedPolitician && (
            <FilterChip
              label={`Politician: ${selectedPolitician.name}`}
              onRemove={() => removeFilter('politician')}
            />
          )}

          {search && (
            <FilterChip
              label={`Search: "${search}"`}
              onRemove={() => removeFilter('search')}
            />
          )}

          <button
            onClick={handleReset}
            className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
            Search
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search promises..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Status Select */}
        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
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

        {/* Category Select */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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

        {/* Politician Select */}
        <div>
          <label htmlFor="politician" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
            Politician
          </label>
          <select
            id="politician"
            value={politicianId}
            onChange={(e) => setPoliticianId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Politicians</option>
            {politicians.map((pol) => (
              <option key={pol.id} value={pol.id}>
                {pol.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

interface FilterChipProps {
  label: string
  onRemove: () => void
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-sm font-medium">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-900 rounded-full transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  )
}
