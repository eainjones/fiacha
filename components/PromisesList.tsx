'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

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

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    kept: 'bg-green-100 text-green-800 border-green-200',
    broken: 'bg-red-100 text-red-800 border-red-200',
    compromised: 'bg-orange-100 text-orange-800 border-orange-200',
  }

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
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
              value={politicianFilter}
              onChange={(e) => setPoliticianFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredPromises.length} of {promises.length} promises
        </div>
      </div>

      {/* Promises List */}
      {filteredPromises.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No promises match your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPromises.map((promise) => (
            <Link key={promise.id} href={`/promises/${promise.id}`} className="block">
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold text-gray-900">{promise.title}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        statusColors[promise.status as keyof typeof statusColors] ||
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {promise.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {promise.description && (
                    <p className="text-gray-600 mb-4">{promise.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Politician:</span>
                      <span className="text-gray-600">{promise.politician_name}</span>
                    </div>

                    {promise.party && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Party:</span>
                        <span className="text-gray-600">{promise.party}</span>
                      </div>
                    )}

                    {promise.category && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Category:</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {promise.category}
                        </span>
                      </div>
                    )}

                    {promise.promise_date && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Made:</span>
                        <span className="text-gray-600">
                          {new Date(promise.promise_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {promise.target_date && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Target:</span>
                        <span className="text-gray-600">
                          {new Date(promise.target_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {promise.score !== null && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Score:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold text-xs">
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
