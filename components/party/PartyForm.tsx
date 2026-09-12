'use client'

import { useState, useEffect } from 'react'
import { PoliticalParty } from '@/types/party'
import PartyBadge from './PartyBadge'

interface PartyFormProps {
  party: PoliticalParty | null
  onSubmit: (data: Partial<PoliticalParty>) => void
  onCancel: () => void
}

/**
 * PartyForm - Modal form for creating/editing political parties
 *
 * Features:
 * - Create or edit mode
 * - Color picker for party and text colors
 * - Icon URL input
 * - Live preview of badge
 * - Validation for required fields
 */
export default function PartyForm({ party, onSubmit, onCancel }: PartyFormProps) {
  const [formData, setFormData] = useState({
    name: party?.name || '',
    abbreviation: party?.abbreviation || '',
    color: party?.color || '#2196F3',
    text_color: party?.text_color || '#FFFFFF',
    icon_url: party?.icon_url || '',
    description: party?.description || '',
    display_order: party?.display_order || 0,
    active: party?.active ?? true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Create preview party object for badge
  const previewParty: PoliticalParty = {
    id: party?.id || 0,
    name: formData.name || 'Preview',
    abbreviation: formData.abbreviation || 'PRV',
    color: formData.color,
    text_color: formData.text_color,
    icon_url: formData.icon_url || null,
    description: formData.description || null,
    active: formData.active,
    display_order: formData.display_order
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {party ? 'Edit Party' : 'Create New Party'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., Fianna Fáil"
            />
          </div>

          {/* Abbreviation */}
          <div>
            <label htmlFor="abbreviation" className="block text-sm font-medium text-gray-700 mb-1">
              Abbreviation *
            </label>
            <input
              type="text"
              id="abbreviation"
              required
              value={formData.abbreviation}
              onChange={(e) => handleChange('abbreviation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., FF"
              maxLength={10}
            />
          </div>

          {/* Colors row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Background color */}
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Background Color *
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="color"
                  required
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                  placeholder="#2196F3"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>

            {/* Text color */}
            <div>
              <label htmlFor="text_color" className="block text-sm font-medium text-gray-700 mb-1">
                Text Color *
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="text_color"
                  required
                  value={formData.text_color}
                  onChange={(e) => handleChange('text_color', e.target.value)}
                  className="h-10 w-20 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.text_color}
                  onChange={(e) => handleChange('text_color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                  placeholder="#FFFFFF"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>
          </div>

          {/* Icon URL */}
          <div>
            <label htmlFor="icon_url" className="block text-sm font-medium text-gray-700 mb-1">
              Icon URL (optional)
            </label>
            <input
              type="url"
              id="icon_url"
              value={formData.icon_url}
              onChange={(e) => handleChange('icon_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="https://example.com/party-icon.png"
            />
            <p className="mt-1 text-xs text-gray-500">
              Recommended: 64x64px transparent PNG
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Brief description of the party"
            />
          </div>

          {/* Display order */}
          <div>
            <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              id="display_order"
              value={formData.display_order}
              onChange={(e) => handleChange('display_order', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              min={0}
            />
            <p className="mt-1 text-xs text-gray-500">
              Lower numbers appear first in lists
            </p>
          </div>

          {/* Active toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleChange('active', e.target.checked)}
              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Active (visible to users)
            </label>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-2">Preview:</p>
            <div className="flex gap-4 items-center">
              <PartyBadge party={previewParty} showIcon={!!formData.icon_url} size="sm" />
              <PartyBadge party={previewParty} showIcon={!!formData.icon_url} size="md" />
              <PartyBadge party={previewParty} showIcon={!!formData.icon_url} size="lg" />
            </div>
            <div className="mt-3 flex gap-4 items-center">
              <PartyBadge party={previewParty} showIcon={!!formData.icon_url} showFullName size="md" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {party ? 'Update Party' : 'Create Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
