'use client'

import { useState, useEffect } from 'react'
import { PoliticalParty } from '@/types/party'
import PartyManagementTable from '@/components/party/PartyManagementTable'
import PartyForm from '@/components/party/PartyForm'

/**
 * Admin page for managing political parties
 *
 * Features:
 * - View all parties (active and inactive)
 * - Create new parties
 * - Edit existing parties
 * - Soft delete (deactivate) parties
 * - Reorder parties via display_order
 * - Upload party icons
 */
export default function AdminPartiesPage() {
  const [parties, setParties] = useState<PoliticalParty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingParty, setEditingParty] = useState<PoliticalParty | null>(null)

  // Fetch all parties (including inactive)
  const fetchParties = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/parties')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch parties')
      }

      setParties(data.parties)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchParties()
  }, [])

  const handleCreate = () => {
    setEditingParty(null)
    setShowForm(true)
  }

  const handleEdit = (party: PoliticalParty) => {
    setEditingParty(party)
    setShowForm(true)
  }

  const handleDelete = async (partyId: number) => {
    if (!confirm('Are you sure you want to deactivate this party?')) {
      return
    }

    try {
      const response = await fetch(`/api/parties/${partyId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete party')
      }

      // Refresh the list
      await fetchParties()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete party')
    }
  }

  const handleFormSubmit = async (partyData: Partial<PoliticalParty>) => {
    try {
      const url = editingParty
        ? `/api/parties/${editingParty.id}`
        : '/api/parties'

      const method = editingParty ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partyData)
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to save party')
      }

      // Close form and refresh list
      setShowForm(false)
      setEditingParty(null)
      await fetchParties()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save party')
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingParty(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Political Parties</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage political parties, colors, icons, and display order
          </p>
        </div>

        {/* Create button */}
        <div className="mb-6">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            + Create New Party
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading parties...</p>
          </div>
        )}

        {/* Parties table */}
        {!loading && !error && (
          <PartyManagementTable
            parties={parties}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Form modal */}
        {showForm && (
          <PartyForm
            party={editingParty}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        )}
      </div>
    </div>
  )
}
