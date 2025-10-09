import Nav from '@/components/Nav'
import Link from 'next/link'
import PromisesList from '@/components/PromisesList'

async function getPromises() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/promises`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

async function getPoliticians() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/politicians`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export default async function PromisesPage() {
  const [promises, politicians] = await Promise.all([getPromises(), getPoliticians()])

  return (
    <>
      <Nav />
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">All Promises</h1>
            <Link
              href="/add"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              Add Promise
            </Link>
          </div>

          {promises.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500 mb-4">No promises tracked yet</p>
              <Link
                href="/add"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Add Your First Promise
              </Link>
            </div>
          ) : (
            <PromisesList promises={promises} politicians={politicians} />
          )}
        </div>
      </main>
    </>
  )
}
