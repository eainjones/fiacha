'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ReviewQueueActionsProps {
  reviewId: number
}

export default function ReviewQueueActions({ reviewId }: ReviewQueueActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async () => {
    setLoading(true)

    try {
      const res = await fetch(`/api/review-queue/${reviewId}/approve`, {
        method: 'POST',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to approve review')
      }
      setApproveOpen(false)
      toast.success('Promise approved successfully')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve review')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/review-queue/${reviewId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to reject review')
      }
      setRejectOpen(false)
      setRejectReason('')
      toast.success('Promise rejected')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex gap-2">
        {/* Approve Dialog */}
        <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
          <DialogTrigger asChild>
            <button
              disabled={loading}
              className="px-3 py-2 rounded-md text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve
            </button>
          </DialogTrigger>
          <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="dark:text-slate-50">Approve Promise</DialogTitle>
              <DialogDescription className="dark:text-slate-400">
                Are you sure you want to approve this promise and insert it into the main database?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setApproveOpen(false)}
                disabled={loading}
                className="dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-4 py-2 rounded-md text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Approving...' : 'Approve'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectOpen} onOpenChange={(open) => {
          setRejectOpen(open)
          if (!open) setRejectReason('')
        }}>
          <DialogTrigger asChild>
            <button
              disabled={loading}
              className="px-3 py-2 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
          </DialogTrigger>
          <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="dark:text-slate-50">Reject Promise</DialogTitle>
              <DialogDescription className="dark:text-slate-400">
                Please provide a reason for rejecting this promise.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectOpen(false)
                  setRejectReason('')
                }}
                disabled={loading}
                className="dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="px-4 py-2 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Rejecting...' : 'Reject'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
