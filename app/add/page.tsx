'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { createClient } from '@/lib/supabase'

export default function AddPage() {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'politician' | 'promise'>('politician')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [politicians, setPoliticians] = useState<any[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/sign-in')
        return
      }
      setIsAuthenticated(true)
    }

    checkAuth()

    // Fetch politicians for the dropdown in promise form
    fetch('/api/politicians')
      .then(res => res.json())
      .then(data => setPoliticians(data))
      .catch(err => console.error('Failed to load politicians', err))
  }, [router, supabase.auth])

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <>
        <Nav />
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
          <div className="text-xl text-gray-600 dark:text-slate-400">Loading...</div>
        </main>
      </>
    )
  }

  // Don't render form if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  const handlePoliticianSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      party: formData.get('party'),
      constituency: formData.get('constituency'),
      role: formData.get('role'),
    }

    try {
      const res = await fetch('/api/politicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to create politician')

      setSuccess('Politician added successfully!')
      e.currentTarget.reset()
      setTimeout(() => router.push('/'), 1500)
    } catch (err) {
      setError('Failed to add politician. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePromiseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const politicianIdValue = parseInt(formData.get('politician_id') as string, 10)
    if (!Number.isInteger(politicianIdValue) || politicianIdValue <= 0) {
      setError('Please select a valid politician.')
      setLoading(false)
      return
    }

    const data = {
      politician_id: politicianIdValue,
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      promise_date: formData.get('promise_date'),
      target_date: formData.get('target_date'),
    }

    try {
      const res = await fetch('/api/promises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to create promise')

      setSuccess('Promise added successfully!')
      e.currentTarget.reset()
      setTimeout(() => router.push('/'), 1500)
    } catch (err) {
      setError('Failed to add promise. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-slate-50">Add New Entry</h1>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
            <div className="border-b border-gray-200 dark:border-slate-700">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('politician')}
                  className={`py-4 px-6 md:px-8 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'politician'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  Add Politician
                </button>
                <button
                  onClick={() => setActiveTab('promise')}
                  className={`py-4 px-6 md:px-8 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'promise'
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  Add Promise
                </button>
              </nav>
            </div>

            <div className="p-6 md:p-8">
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg">
                  {success}
                </div>
              )}

              {activeTab === 'politician' ? (
                <form onSubmit={handlePoliticianSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="party" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Party
                    </label>
                    <input
                      type="text"
                      id="party"
                      name="party"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="constituency" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Constituency
                    </label>
                    <input
                      type="text"
                      id="constituency"
                      name="constituency"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    {loading ? 'Adding...' : 'Add Politician'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePromiseSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="politician_id" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Politician *
                    </label>
                    <select
                      id="politician_id"
                      name="politician_id"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select a politician</option>
                      {politicians.map(pol => (
                        <option key={pol.id} value={pol.id}>
                          {pol.name} - {pol.party}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Promise Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select a category</option>
                      <option value="Housing">Housing</option>
                      <option value="Health">Health</option>
                      <option value="Childcare">Childcare</option>
                      <option value="Education">Education</option>
                      <option value="Transport">Transport</option>
                      <option value="Climate">Climate</option>
                      <option value="Employment">Employment</option>
                      <option value="Taxation">Taxation</option>
                      <option value="Social Welfare">Social Welfare</option>
                      <option value="Law & Order">Law & Order</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="promise_date" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                        Promise Date
                      </label>
                      <input
                        type="date"
                        id="promise_date"
                        name="promise_date"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="target_date" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                        Target Date
                      </label>
                      <input
                        type="date"
                        id="target_date"
                        name="target_date"
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    {loading ? 'Adding...' : 'Add Promise'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
