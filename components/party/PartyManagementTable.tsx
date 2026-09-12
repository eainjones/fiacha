'use client'

import { PoliticalParty } from '@/types/party'
import PartyBadge from './PartyBadge'
import Image from 'next/image'

interface PartyManagementTableProps {
  parties: PoliticalParty[]
  onEdit: (party: PoliticalParty) => void
  onDelete: (partyId: number) => void
}

/**
 * PartyManagementTable - Display parties in a table with edit/delete actions
 *
 * Features:
 * - Shows all party details in columns
 * - Color preview badges
 * - Icon preview
 * - Active/inactive status indicators
 * - Edit and delete actions
 */
export default function PartyManagementTable({
  parties,
  onEdit,
  onDelete
}: PartyManagementTableProps) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Abbreviation
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Preview
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Icon
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {parties.map((party) => (
            <tr key={party.id} className={!party.active ? 'bg-gray-50 opacity-60' : ''}>
              {/* Display order */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {party.display_order}
              </td>

              {/* Name */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{party.name}</div>
                {party.description && (
                  <div className="text-xs text-gray-500 truncate max-w-xs">
                    {party.description}
                  </div>
                )}
              </td>

              {/* Abbreviation */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {party.abbreviation}
              </td>

              {/* Badge preview */}
              <td className="px-6 py-4 whitespace-nowrap">
                <PartyBadge
                  party={party}
                  showIcon={!!party.icon_url}
                  size="md"
                />
              </td>

              {/* Icon preview */}
              <td className="px-6 py-4 whitespace-nowrap">
                {party.icon_url ? (
                  <Image
                    src={party.icon_url}
                    alt={`${party.name} icon`}
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No icon</span>
                )}
              </td>

              {/* Active status */}
              <td className="px-6 py-4 whitespace-nowrap">
                {party.active ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  onClick={() => onEdit(party)}
                  className="text-emerald-600 hover:text-emerald-900"
                >
                  Edit
                </button>
                {party.active && (
                  <button
                    onClick={() => onDelete(party.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty state */}
      {parties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No parties found</p>
        </div>
      )}
    </div>
  )
}
