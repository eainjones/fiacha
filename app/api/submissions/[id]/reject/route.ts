import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/auth/admin'
import { rejectSubmission } from '@/lib/db/queries'

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

  // Get rejection reason from body if provided
  let rejectionReason: string | undefined
  try {
    const body = await request.json()
    rejectionReason = body.reason
  } catch {
    // No body provided, that's fine
  }

  const success = await rejectSubmission(submissionId, user.email!, rejectionReason)

  if (!success) {
    return NextResponse.json({ error: 'Failed to reject submission' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
