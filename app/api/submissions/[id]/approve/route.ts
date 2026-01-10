import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/auth/admin'
import { approveSubmission, getSubmissionById } from '@/lib/db/queries'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const submissionId = parseInt(id, 10)

  if (isNaN(submissionId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get submission to check politician match
  const submission = await getSubmissionById(submissionId)
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  if (!submission.politicianId) {
    return NextResponse.json({ error: 'No politician match - cannot approve' }, { status: 400 })
  }

  const result = await approveSubmission(submissionId, user.email!, submission.politicianId)

  if (!result.success) {
    return NextResponse.json({ error: 'Failed to approve submission' }, { status: 500 })
  }

  return NextResponse.json({ success: true, promiseId: result.promiseId })
}
