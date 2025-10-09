'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'

export default function AddPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'politician' | 'promise'>('politician')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [politicians, setPoliticians] = useState<any[]>([])

  useEffect(() => {
    // Fetch politicians for the dropdown in promise form
    fetch('/api/politicians')
      .then(res => res.json())
      .then(data => setPoliticians(data))
      .catch(err => console.error('Failed to load politicians', err))
  }, [])

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
    const data = {
      politician_id: parseInt(formData.get('politician_id') as string),
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
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Add New Entry</h1>

          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('politician')}
                  className={`py-4 px-8 font-medium text-sm border-b-2 ${
                    activeTab === 'politician'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Add Politician
                </button>
                <button
                  onClick={() => setActiveTab('promise')}
                  className={`py-4 px-8 font-medium text-sm border-b-2 ${
                    activeTab === 'promise'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Add Promise
                </button>
              </nav>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                  {success}
                </div>
              )}

              {activeTab === 'politician' ? (
                <form onSubmit={handlePoliticianSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="party" className="block text-sm font-medium text-gray-700 mb-2">
                      Party
                    </label>
                    <input
                      type="text"
                      id="party"
                      name="party"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="constituency" className="block text-sm font-medium text-gray-700 mb-2">
                      Constituency
                    </label>
                    <input
                      type="text"
                      id="constituency"
                      name="constituency"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Adding...' : 'Add Politician'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePromiseSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="politician_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Politician *
                    </label>
                    <select
                      id="politician_id"
                      name="politician_id"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Promise Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="promise_date" className="block text-sm font-medium text-gray-700 mb-2">
                        Promise Date
                      </label>
                      <input
                        type="date"
                        id="promise_date"
                        name="promise_date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="target_date" className="block text-sm font-medium text-gray-700 mb-2">
                        Target Date
                      </label>
                      <input
                        type="date"
                        id="target_date"
                        name="target_date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
