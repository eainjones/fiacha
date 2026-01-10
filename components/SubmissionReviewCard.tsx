'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PromiseSubmissionWithPolitician } from '@/lib/db/queries'

interface Props {
  submission: PromiseSubmissionWithPolitician
}

export default function SubmissionReviewCard({ submission }: Props) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    if (!submission.politicianId) {
      setError('Cannot approve: No politician match found')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/submissions/${submission.id}/approve`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to approve')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/submissions/${submission.id}/reject`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to reject')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject')
    } finally {
      setIsLoading(false)
    }
  }

  const confidenceColor = submission.confidenceScore
    ? submission.confidenceScore >= 90
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : submission.confidenceScore >= 70
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-slate-100">
            {submission.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            {submission.politicianName}
            {submission.party && ` · ${submission.party}`}
          </p>
        </div>
        <div className="flex gap-2">
          {submission.confidenceScore && (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${confidenceColor}`}>
              {submission.confidenceScore}% confidence
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {submission.sourceType}
          </span>
        </div>
      </div>

      {submission.description && (
        <p className="text-gray-700 dark:text-slate-300 mt-3 leading-relaxed">
          {submission.description}
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {submission.category && (
          <div className="text-gray-600 dark:text-slate-400">
            <span className="font-semibold text-gray-800 dark:text-slate-200">Category:</span>{' '}
            {submission.category}
          </div>
        )}
        {submission.targetDate && (
          <div className="text-gray-600 dark:text-slate-400">
            <span className="font-semibold text-gray-800 dark:text-slate-200">Target:</span>{' '}
            {new Date(submission.targetDate).toLocaleDateString()}
          </div>
        )}
        {submission.sourceTitle && (
          <div className="text-gray-600 dark:text-slate-400">
            <span className="font-semibold text-gray-800 dark:text-slate-200">Source:</span>{' '}
            {submission.sourceTitle}
          </div>
        )}
        <div className="text-gray-600 dark:text-slate-400">
          <span className="font-semibold text-gray-800 dark:text-slate-200">Extracted:</span>{' '}
          {submission.createdAt ? new Date(submission.createdAt).toLocaleString() : 'Unknown'}
        </div>
        {submission.sourceUrl && (
          <div className="sm:col-span-2">
            <a
              href={submission.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
            >
              View source →
            </a>
          </div>
        )}
        {submission.politicianId && (
          <div className="sm:col-span-2 text-gray-600 dark:text-slate-400">
            <span className="font-semibold text-gray-800 dark:text-slate-200">Matched to:</span>{' '}
            {submission.matched_politician_name}
            {submission.matched_politician_party && ` · ${submission.matched_politician_party}`}
            <span className="text-green-600 dark:text-green-400 ml-2">✓</span>
          </div>
        )}
        {!submission.politicianId && (
          <div className="sm:col-span-2 text-amber-600 dark:text-amber-400">
            <span className="font-semibold">⚠ No politician match found</span> - cannot approve until matched
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleApprove}
          disabled={isLoading || !submission.politicianId}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : 'Approve'}
        </button>
        <button
          onClick={handleReject}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing...' : 'Reject'}
        </button>
      </div>
    </div>
  )
}
