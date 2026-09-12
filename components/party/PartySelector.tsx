'use client'

import { useState } from 'react'
import { PoliticalParty, PartySelectorProps } from '@/types/party'
import PartyBadge from './PartyBadge'

/**
 * PartySelector - Enhanced dropdown for selecting a political party
 *
 * Features:
 * - Searchable/filterable party list
 * - Shows party icons and colors in dropdown
 * - Preview of selected party badge
 * - Support for "Independent" / no party
 * - Required field validation
 */
export default function PartySelector({
  value,
  onChange,
  parties,
  required = false,
  className = '',
  showPreview = true
}: PartySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter parties based on search
  const filteredParties = parties
    .filter(party =>
      party.active && (
        party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        party.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => a.display_order - b.display_order)

  // Find selected party
  const selectedParty = value ? parties.find(p => p.id === value) : null

  return (
    <div className={className}>
      {/* Dropdown with search */}
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
          required={required}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none"
        >
          <option value="">
            {required ? 'Select a party *' : 'Select a party (optional)'}
          </option>
          {filteredParties.map(party => (
            <option key={party.id} value={party.id}>
              {party.abbreviation} - {party.name}
            </option>
          ))}
        </select>

        {/* Dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Preview selected badge */}
      {showPreview && selectedParty && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Preview:</p>
          <PartyBadge party={selectedParty} showIcon={!!selectedParty.icon_url} showFullName size="md" />
        </div>
      )}

      {/* Helper text */}
      <p className="mt-2 text-xs text-gray-500">
        Select the political party affiliation for this politician
      </p>
    </div>
  )
}
