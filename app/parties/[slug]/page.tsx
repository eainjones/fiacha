import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Link from 'next/link'
import { getPartyBySlug, getPoliticiansByPartyId, getPartyMembersByCounty } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PartyDetailPage({ params }: { params: { slug: string } }) {
  const party = await getPartyBySlug(params.slug)

  if (!party) {
    notFound()
  }

  const [members, membersByCounty] = await Promise.all([
    getPoliticiansByPartyId(party.id),
    getPartyMembersByCounty(party.id),
  ])

  // Group members by position type
  const tds = members.filter((m) => m.positionType === 'TD')
  const senators = members.filter((m) => m.positionType === 'Senator')
  const councillors = members.filter((m) => m.positionType === 'Councillor')
  const mlas = members.filter((m) => m.positionType === 'MLA')

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 dark:from-slate-950 dark:via-emerald-950/10 dark:to-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Link
            href="/parties"
            className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium mb-6 md:mb-8 group"
          >
            <svg className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Parties
          </Link>

          {/* Party Header */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 md:p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-slate-50">
                    {party.name}
                  </h1>
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
                {party.politicalPosition && (
                  <p className="text-lg text-gray-600 dark:text-slate-400">{party.politicalPosition}</p>
                )}
              </div>
              {party.website && (
                <a
                  href={party.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 font-medium transition-colors"
                >
                  Visit Website
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            {party.description && (
              <p className="text-gray-700 dark:text-slate-300 mb-6 leading-relaxed">{party.description}</p>
            )}

            {/* Party Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-emerald-50/20 dark:from-slate-800 dark:to-emerald-950/20 rounded-lg border border-gray-200 dark:border-slate-700">
              {party.foundedYear && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Founded</span>
                  <p className="text-base md:text-lg font-bold text-gray-900 dark:text-slate-100 mt-1">{party.foundedYear}</p>
                </div>
              )}
              {party.leader && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Leader</span>
                  <p className="text-base md:text-lg font-bold text-gray-900 dark:text-slate-100 mt-1">{party.leader}</p>
                </div>
              )}
              {party.headquarters && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Headquarters</span>
                  <p className="text-base md:text-lg font-bold text-gray-900 dark:text-slate-100 mt-1">{party.headquarters}</p>
                </div>
              )}
              {party.euParliamentGroup && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">EU Parliament</span>
                  <p className="text-base md:text-lg font-bold text-gray-900 dark:text-slate-100 mt-1">{party.euParliamentGroup}</p>
                </div>
              )}
              {party.euParty && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">EU Party</span>
                  <p className="text-base md:text-lg font-bold text-gray-900 dark:text-slate-100 mt-1">{party.euParty}</p>
                </div>
              )}
            </div>
          </div>

          {/* Ideology & Key Policies */}
          {(party.ideology || party.keyPolicies) && (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 md:p-8 mb-8">
              {party.ideology && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50 mb-3">Ideology</h2>
                  <p className="text-gray-700 dark:text-slate-300">{party.ideology}</p>
                </div>
              )}
              {party.keyPolicies && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-50 mb-3">Key Policies</h2>
                  <ul className="space-y-2">
                    {party.keyPolicies.split(',').map((policy, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-slate-300">
                        <svg className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {policy.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Members Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 md:p-8 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-50 mb-6">
              Members ({members.length})
            </h2>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {tds.length > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{tds.length}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">TDs</p>
                </div>
              )}
              {senators.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{senators.length}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Senators</p>
                </div>
              )}
              {councillors.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{councillors.length}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Councillors</p>
                </div>
              )}
              {mlas.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{mlas.length}</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">MLAs</p>
                </div>
              )}
            </div>

            {/* Members by County */}
            {membersByCounty.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Members by County</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {membersByCounty.map((county) => (
                    <Link
                      key={county.county_id}
                      href={`/politicians?county=${encodeURIComponent(county.county_name)}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/50 transition-colors"
                    >
                      <span className="text-gray-900 dark:text-slate-100 font-medium">{county.county_name}</span>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-sm font-bold">
                        {county.member_count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TDs List */}
          {tds.length > 0 && (
            <MemberSection title="TDs" members={tds} positionColor="emerald" />
          )}

          {/* Senators List */}
          {senators.length > 0 && (
            <MemberSection title="Senators" members={senators} positionColor="blue" />
          )}

          {/* MLAs List */}
          {mlas.length > 0 && (
            <MemberSection title="MLAs" members={mlas} positionColor="amber" />
          )}

          {/* Councillors List */}
          {councillors.length > 0 && (
            <MemberSection title="Councillors" members={councillors} positionColor="purple" />
          )}
        </div>
      </main>
    </>
  )
}

interface MemberSectionProps {
  title: string
  members: Array<{
    id: number
    name: string
    constituency: string | null
    county_name: string | null
    role: string | null
  }>
  positionColor: 'emerald' | 'blue' | 'purple' | 'amber'
}

function MemberSection({ title, members, positionColor }: MemberSectionProps) {
  const colorClasses = {
    emerald: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    blue: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    amber: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 md:p-8 mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-50 mb-6">
        {title} ({members.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className={`p-4 rounded-lg border ${colorClasses[positionColor]}`}
          >
            <p className="font-bold text-gray-900 dark:text-slate-100">{member.name}</p>
            {member.constituency && (
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{member.constituency}</p>
            )}
            {member.county_name && (
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">County {member.county_name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
