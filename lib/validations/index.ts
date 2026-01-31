/**
 * Validation module - centralized Zod schemas for API request validation
 *
 * Usage:
 *   import { createPromiseSchema, parseBody } from '@/lib/validations'
 *
 *   const result = await parseBody(request, createPromiseSchema)
 *   if (!result.success) {
 *     return NextResponse.json({ error: result.error }, { status: result.status })
 *   }
 *   const { politician_id, title, ...rest } = result.data
 */

export {
  // Promise schemas
  createPromiseSchema,
  type CreatePromiseInput,
  promisesQuerySchema,
  type PromisesQueryParams,

  // Politician schemas
  createPoliticianSchema,
  type CreatePoliticianInput,
  politiciansQuerySchema,
  type PoliticiansQueryParams,
  positionTypes,
  type PositionType,

  // Review queue schemas
  reviewIdParamSchema,
  type ReviewIdParam,
  rejectReviewSchema,
  type RejectReviewInput,
  approveReviewSchema,
  type ApproveReviewInput,

  // Helper functions
  parseBody,
  parseSearchParams,
} from './schemas'
