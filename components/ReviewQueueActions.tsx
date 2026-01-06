'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ReviewQueueActionsProps {
  reviewId: number
}

export default function ReviewQueueActions({ reviewId }: ReviewQueueActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleApprove = async () => {
    if (!confirm('Approve this promise and insert it into the main database?')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/review-queue/${reviewId}/approve`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to approve review')
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to approve review')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    const reason = prompt('Reject this promise. Provide a reason:')
    if (!reason) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/review-queue/${reviewId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to reject review')
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to reject review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-3 py-2 rounded-md text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Approve
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="px-3 py-2 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reject
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
