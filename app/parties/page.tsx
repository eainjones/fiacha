import Nav from '@/components/Nav'
import Link from 'next/link'
import { getPartiesWithStats } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PartiesPage() {
  const parties = await getPartiesWithStats()

  // Separate ROI and NI parties
  const roiParties = parties.filter(
    (p) => !['Democratic Unionist Party', 'Ulster Unionist Party', 'Alliance Party', 'Social Democratic and Labour Party', 'Traditional Unionist Voice'].includes(p.name)
  )
  const niParties = parties.filter((p) =>
    ['Democratic Unionist Party', 'Ulster Unionist Party', 'Alliance Party', 'Social Democratic and Labour Party', 'Traditional Unionist Voice', 'Sinn Féin'].includes(p.name)
  )

  // Stats
  const totalTDs = parties.reduce((sum, p) => sum + (p.td_count || 0), 0)
  const totalCouncillors = parties.reduce((sum, p) => sum + (p.councillor_count || 0), 0)
  const totalMLAs = parties.reduce((sum, p) => sum + (p.mla_count || 0), 0)

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <header className="mb-8 md:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">Political Parties</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-2">
              Explore political parties across Ireland and Northern Ireland
            </p>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 md:p-6">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Parties</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{parties.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 md:p-6">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">TDs</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalTDs}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 md:p-6">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Councillors</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalCouncillors}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 md:p-6">
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">MLAs</p>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{totalMLAs}</p>
            </div>
          </div>

          {/* Republic of Ireland Parties */}
          <section className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-50 mb-6">Republic of Ireland</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roiParties.map((party) => (
                <PartyCard key={party.id} party={party} />
              ))}
            </div>
          </section>

          {/* Northern Ireland Parties */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-50 mb-6">Northern Ireland</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {niParties.map((party) => (
                <PartyCard key={party.id} party={party} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

interface PartyCardProps {
  party: {
    id: number
    name: string
    shortName: string | null
    slug: string | null
    color: string | null
    ideology: string | null
    politicalPosition: string | null
    td_count: number
    councillor_count: number
    mla_count: number
    promise_count: number
  }
}

function PartyCard({ party }: PartyCardProps) {
  const totalMembers = (party.td_count || 0) + (party.councillor_count || 0) + (party.mla_count || 0)

  return (
    <Link
      href={party.slug ? `/parties/${party.slug}` : '#'}
      className="block group"
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-all h-full">
        <div className="p-5 md:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {party.name}
              </h3>
              {party.politicalPosition && (
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                  {party.politicalPosition}
                </p>
              )}
            </div>
            {party.shortName && (
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
                style={{
                  backgroundColor: party.color ? `${party.color}20` : '#e5e7eb',
                  color: party.color || '#374151',
                }}
              >
                {party.shortName}
              </span>
            )}
          </div>

          {/* Ideology */}
          {party.ideology && (
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">
              {party.ideology}
            </p>
          )}

          {/* Stats */}
          <div className="border-t border-gray-100 dark:border-slate-700 pt-4 mt-4">
            <div className="flex flex-wrap gap-3 text-sm">
              {party.td_count > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="font-semibold">{party.td_count}</span> TDs
                </span>
              )}
              {party.councillor_count > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  <span className="font-semibold">{party.councillor_count}</span> Cllrs
                </span>
              )}
              {party.mla_count > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <span className="font-semibold">{party.mla_count}</span> MLAs
                </span>
              )}
            </div>
            {party.promise_count > 0 && (
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-3">
                {party.promise_count} promise{party.promise_count !== 1 ? 's' : ''} tracked
              </p>
            )}
          </div>

          {/* View link */}
          <div className="mt-4 flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
            View party details
            <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
