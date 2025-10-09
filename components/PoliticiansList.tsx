'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Politician {
  id: number
  name: string
  party: string
  constituency: string
  county_name: string | null
  province: string | null
  role: string
  position_type: string
  local_authority_name: string | null
}

export default function PoliticiansList({ politicians }: { politicians: Politician[] }) {
  const searchParams = useSearchParams()
  const [positionFilter, setPositionFilter] = useState<string>('all')
  const [partyFilter, setPartyFilter] = useState<string>('all')
  const [countyFilter, setCountyFilter] = useState<string>('all')

  // Initialize filters from URL params
  useEffect(() => {
    const countyParam = searchParams.get('county')
    const positionParam = searchParams.get('position')

    if (countyParam) {
      // Find county name by ID or name
      const county = politicians.find(p =>
        p.county_name?.toLowerCase() === countyParam.toLowerCase()
      )
      if (county?.county_name) {
        setCountyFilter(county.county_name)
      }
    }

    if (positionParam) {
      setPositionFilter(positionParam)
    }
  }, [searchParams, politicians])

  // Get unique values for filters
  const parties = Array.from(new Set(politicians.map(p => p.party))).sort()
  const counties = Array.from(new Set(politicians.map(p => p.county_name).filter((c): c is string => Boolean(c)))).sort()

  // Apply filters
  const filteredPoliticians = politicians.filter(pol => {
    if (positionFilter !== 'all' && pol.position_type !== positionFilter) return false
    if (partyFilter !== 'all' && pol.party !== partyFilter) return false
    if (countyFilter !== 'all' && pol.county_name !== countyFilter) return false
    return true
  })

  // Count by position type
  const tdCount = politicians.filter(p => p.position_type === 'TD').length
  const councillorCount = politicians.filter(p => p.position_type === 'Councillor').length

  return (
    <>
      {/* Filter Controls */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Position Type</label>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Positions ({politicians.length})</option>
              <option value="TD">TDs ({tdCount})</option>
              <option value="Councillor">Councillors ({councillorCount})</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Party</label>
            <select
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Parties</option>
              {parties.map(party => (
                <option key={party} value={party}>{party}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">County</label>
            <select
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Counties</option>
              {counties.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-bold text-emerald-600">{filteredPoliticians.length}</span> of {politicians.length} politicians
        </div>
      </div>

      {/* Politicians Table */}
      {filteredPoliticians.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No politicians match your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-emerald-50 to-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Party
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Constituency/LEA
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  County
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Authority
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Position
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredPoliticians.map((pol: Politician) => (
                <tr key={pol.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{pol.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {pol.party}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{pol.constituency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700 font-medium">{pol.county_name || 'N/A'}</div>
                    {pol.province && <div className="text-xs text-gray-500">{pol.province}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{pol.local_authority_name || 'National'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{pol.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      pol.position_type === 'TD'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {pol.position_type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
