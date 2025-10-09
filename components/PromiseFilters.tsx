'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

interface PromiseFiltersProps {
  politicians: any[]
  categories: string[]
}

export default function PromiseFilters({ politicians, categories }: PromiseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [politicianId, setPoliticianId] = useState(searchParams.get('politician_id') || '')
  const [search, setSearch] = useState(searchParams.get('search') || '')

  useEffect(() => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (category) params.set('category', category)
    if (politicianId) params.set('politician_id', politicianId)
    if (search) params.set('search', search)

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/')
  }, [status, category, politicianId, search, router])

  const handleReset = () => {
    setStatus('')
    setCategory('')
    setPoliticianId('')
    setSearch('')
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:underline"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            id="search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promises..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label htmlFor="politician" className="block text-sm font-medium text-gray-700 mb-2">
            Politician
          </label>
          <select
            id="politician"
            value={politicianId}
            onChange={(e) => setPoliticianId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
