import { z } from 'zod'

/**
 * Shared Zod validation schemas for API endpoints
 *
 * Per TECH-IMPLEMENTATION.md, all POST endpoints must validate payloads.
 * These schemas provide consistent validation and type inference.
 */

// ============================================================================
// PROMISE SCHEMAS
// ============================================================================

/**
 * Schema for creating a new promise via POST /api/promises
 */
export const createPromiseSchema = z.object({
  politician_id: z
    .number({ invalid_type_error: 'politician_id must be a number', required_error: 'politician_id is required' })
    .int({ message: 'politician_id must be an integer' })
    .positive({ message: 'politician_id must be a positive integer' }),
  title: z
    .string({ required_error: 'title is required' })
    .max(500, { message: 'title cannot exceed 500 characters' })
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, { message: 'title cannot be empty' }),
  description: z
    .string()
    .max(5000, { message: 'description cannot exceed 5000 characters' })
    .optional()
    .nullable(),
  category: z
    .string()
    .max(100, { message: 'category cannot exceed 100 characters' })
    .optional()
    .nullable(),
  promise_date: z
    .string()
    .datetime({ message: 'promise_date must be a valid ISO date' })
    .optional()
    .nullable()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'promise_date must be YYYY-MM-DD format' }).optional().nullable()),
  target_date: z
    .string()
    .datetime({ message: 'target_date must be a valid ISO date' })
    .optional()
    .nullable()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'target_date must be YYYY-MM-DD format' }).optional().nullable()),
})

export type CreatePromiseInput = z.infer<typeof createPromiseSchema>

// ============================================================================
// POLITICIAN SCHEMAS
// ============================================================================

/**
 * Valid position types for politicians
 */
export const positionTypes = ['TD', 'Councillor', 'Senator', 'MEP', 'MLA'] as const
export type PositionType = (typeof positionTypes)[number]

/**
 * Schema for creating a new politician via POST /api/politicians
 */
export const createPoliticianSchema = z.object({
  name: z
    .string({ required_error: 'name is required' })
    .max(255, { message: 'name cannot exceed 255 characters' })
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, { message: 'name cannot be empty' }),
  party: z
    .string()
    .max(100, { message: 'party cannot exceed 100 characters' })
    .optional()
    .nullable(),
  constituency: z
    .string()
    .max(100, { message: 'constituency cannot exceed 100 characters' })
    .optional()
    .nullable(),
  role: z
    .string()
    .max(100, { message: 'role cannot exceed 100 characters' })
    .optional()
    .nullable(),
  position_type: z.enum(positionTypes).optional().nullable(),
  county_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  local_authority_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
  electoral_area_id: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
})

export type CreatePoliticianInput = z.infer<typeof createPoliticianSchema>

// ============================================================================
// REVIEW QUEUE SCHEMAS
// ============================================================================

/**
 * Schema for review queue path parameters
 */
export const reviewIdParamSchema = z.object({
  id: z
    .string()
    .transform((s) => Number(s))
    .pipe(
      z
        .number({ invalid_type_error: 'Invalid review id' })
        .int({ message: 'Review id must be an integer' })
        .positive({ message: 'Review id must be positive' })
    ),
})

export type ReviewIdParam = z.infer<typeof reviewIdParamSchema>

/**
 * Schema for rejecting a review via POST /api/review-queue/[id]/reject
 */
export const rejectReviewSchema = z.object({
  reason: z
    .string({ required_error: 'reason is required' })
    .max(2000, { message: 'Rejection reason cannot exceed 2000 characters' })
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, { message: 'Rejection reason is required' }),
})

export type RejectReviewInput = z.infer<typeof rejectReviewSchema>

/**
 * Approve endpoint doesn't require a body, but we define an empty schema
 * for consistency and potential future fields
 */
export const approveReviewSchema = z.object({
  // Optional fields that could be added for approval notes
  notes: z
    .string()
    .max(2000, { message: 'Notes cannot exceed 2000 characters' })
    .optional()
    .nullable(),
})

export type ApproveReviewInput = z.infer<typeof approveReviewSchema>

// ============================================================================
// QUERY PARAMETER SCHEMAS
// ============================================================================

/**
 * Schema for politicians list query parameters
 */
export const politiciansQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((s) => (s !== undefined ? Math.min(Math.max(Number(s) || 100, 1), 200) : undefined)),
  offset: z
    .string()
    .optional()
    .transform((s) => (s !== undefined ? Math.max(Number(s) || 0, 0) : undefined)),
})

export type PoliticiansQueryParams = z.infer<typeof politiciansQuerySchema>

/**
 * Schema for promises list query parameters
 */
export const promisesQuerySchema = z.object({
  status: z.enum(['pending', 'in_progress', 'kept', 'broken', 'compromised']).optional(),
  category: z.string().max(100).optional(),
  politician_id: z
    .string()
    .transform((s) => Number(s))
    .pipe(z.number().int().positive())
    .optional(),
  limit: z
    .string()
    .optional()
    .transform((s) => Math.min(Number(s) || 100, 100)),
  offset: z
    .string()
    .optional()
    .transform((s) => Math.max(Number(s) || 0, 0)),
})

export type PromisesQueryParams = z.infer<typeof promisesQuerySchema>

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse and validate request body with a Zod schema
 * Returns either the validated data or an error response
 */
export async function parseBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: string; status: number }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const firstError = result.error.issues[0]
      return {
        success: false,
        error: firstError?.message || 'Invalid request body',
        status: 400,
      }
    }

    return { success: true, data: result.data }
  } catch {
    return {
      success: false,
      error: 'Invalid JSON in request body',
      status: 400,
    }
  }
}

/**
 * Parse and validate URL search params with a Zod schema
 */
export function parseSearchParams<T extends z.ZodSchema>(
  searchParams: URLSearchParams,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })

  const result = schema.safeParse(params)

  if (!result.success) {
    const firstError = result.error.issues[0]
    return {
      success: false,
      error: firstError?.message || 'Invalid query parameters',
    }
  }

  return { success: true, data: result.data }
}
