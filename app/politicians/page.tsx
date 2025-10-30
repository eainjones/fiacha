import Nav from '@/components/Nav'
import Link from 'next/link'
import PoliticiansList from '@/components/PoliticiansList'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getPoliticians() {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/politicians`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function PoliticiansPage() {
  const politicians = await getPoliticians()

  const tdCount = politicians.filter((p: any) => p.position_type === 'TD').length
  const councillorCount = politicians.filter((p: any) => p.position_type === 'Councillor').length

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Politicians</h1>
              <p className="text-gray-600">
                {tdCount} TDs · {councillorCount} Councillors · {politicians.length} Total
              </p>
            </div>
            <Link
              href="/add"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 font-semibold shadow-sm"
            >
              + Add Politician
            </Link>
          </div>

          {politicians.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 mb-4">No politicians tracked yet</p>
              <Link
                href="/add"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Add Your First Politician
              </Link>
            </div>
          ) : (
            <PoliticiansList politicians={politicians} />
          )}
        </div>
      </main>
    </>
  )
}
