import { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Admin Authorization Helper
 *
 * Provides centralized admin authorization checks using an environment variable allowlist.
 *
 * Environment Variable:
 *   ADMIN_EMAIL_ALLOWLIST="email1@example.com,email2@example.com"
 */

/**
 * Get the list of admin emails from environment variable
 */
export function getAdminAllowlist(): string[] {
  const list = process.env.ADMIN_EMAIL_ALLOWLIST || ''
  return list
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Check if an email is in the admin allowlist
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const allowlist = getAdminAllowlist()

  // If no allowlist configured, deny all (fail closed)
  if (allowlist.length === 0) {
    console.warn('[Admin] No ADMIN_EMAIL_ALLOWLIST configured - denying access')
    return false
  }

  return allowlist.includes(email.toLowerCase())
}

/**
 * Custom error for unauthorized access
 */
export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

/**
 * Custom error for forbidden access (authenticated but not admin)
 */
export class ForbiddenError extends Error {
  constructor(message = 'Admin access required') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

/**
 * Require authenticated admin user
 * Throws UnauthorizedError if not authenticated
 * Throws ForbiddenError if not admin
 * Returns the User if successful
 */
export async function requireAdmin(supabase: SupabaseClient): Promise<User> {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new UnauthorizedError()
  }

  if (!isAdmin(user.email)) {
    throw new ForbiddenError()
  }

  return user
}

/**
 * Check if user is admin without throwing (useful for conditional rendering)
 */
export async function checkIsAdmin(supabase: SupabaseClient): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return isAdmin(user?.email)
  } catch {
    return false
  }
}
