'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import PartyBadge from './PartyBadge'

interface Politician {
  id: number
  name: string
  party: string | null
  party_color: string | null
  party_short_name: string | null
  constituency: string | null
  county_name: string | null
  province: string | null
  role: string | null
  positionType: string | null
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
    if (positionFilter !== 'all' && pol.positionType !== positionFilter) return false
    if (partyFilter !== 'all' && pol.party !== partyFilter) return false
    if (countyFilter !== 'all' && pol.county_name !== countyFilter) return false
    return true
  })

  // Count by position type
  const tdCount = politicians.filter(p => p.positionType === 'TD').length
  const councillorCount = politicians.filter(p => p.positionType === 'Councillor').length
  const senatorCount = politicians.filter(p => p.positionType === 'Senator').length
  const mlaCount = politicians.filter(p => p.positionType === 'MLA').length

  return (
    <>
      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="position-filter" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
              Position Type
            </label>
            <select
              id="position-filter"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Positions ({politicians.length})</option>
              <option value="TD">TDs ({tdCount})</option>
              <option value="Senator">Senators ({senatorCount})</option>
              <option value="Councillor">Councillors ({councillorCount})</option>
              <option value="MLA">MLAs ({mlaCount})</option>
            </select>
          </div>

          <div>
            <label htmlFor="party-filter" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
              Party
            </label>
            <select
              id="party-filter"
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Parties</option>
              {parties.filter((p): p is string => p !== null).map(party => (
                <option key={party} value={party}>{party}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="county-filter" className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
              County
            </label>
            <select
              id="county-filter"
              value={countyFilter}
              onChange={(e) => setCountyFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Counties</option>
              {counties.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-slate-400">
          Showing <span className="font-bold text-emerald-600 dark:text-emerald-400">{filteredPoliticians.length}</span> of {politicians.length} politicians
        </div>
      </div>

      {/* Politicians List */}
      {filteredPoliticians.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 dark:text-slate-400">No politicians match your filters</p>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {filteredPoliticians.map((pol: Politician) => (
              <div
                key={pol.id}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 min-h-[44px]"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-gray-900 dark:text-slate-100 leading-tight">{pol.name}</h3>
                    {pol.role && (
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 truncate">{pol.role}</p>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 ${
                    pol.positionType === 'TD'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : pol.positionType === 'Senator'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : pol.positionType === 'MLA'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                  }`}>
                    {pol.positionType}
                  </span>
                </div>

                <div className="mb-3">
                  <PartyBadge party={pol.party ?? ''} color={pol.party_color} shortName={pol.party_short_name} size="sm" />
                </div>

                <div className="border-t border-gray-100 dark:border-slate-700/50 pt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wide">Constituency</span>
                    <p className="text-gray-800 dark:text-slate-200 mt-0.5 leading-snug">{pol.constituency || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 dark:text-slate-500 text-xs font-medium uppercase tracking-wide">County</span>
                    <p className="text-gray-800 dark:text-slate-200 mt-0.5 leading-snug">{pol.county_name || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gradient-to-r from-emerald-50 to-gray-50 dark:from-emerald-950 dark:to-slate-800">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                      Party
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                      Constituency/LEA
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                      County
                    </th>
                    <th scope="col" className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                      Authority
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredPoliticians.map((pol: Politician) => (
                    <tr key={pol.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{pol.name}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{pol.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PartyBadge party={pol.party ?? ''} color={pol.party_color} shortName={pol.party_short_name} size="sm" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-slate-200">{pol.constituency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-slate-300 font-medium">{pol.county_name || 'N/A'}</div>
                        {pol.province && <div className="text-xs text-gray-500 dark:text-slate-500">{pol.province}</div>}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4">
                        <div className="text-sm text-gray-700 dark:text-slate-300">{pol.local_authority_name || 'National'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          pol.positionType === 'TD'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : pol.positionType === 'Senator'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : pol.positionType === 'MLA'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {pol.positionType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}
