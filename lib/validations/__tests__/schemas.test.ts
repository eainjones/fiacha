import {
  createPromiseSchema,
  createPoliticianSchema,
  rejectReviewSchema,
  reviewIdParamSchema,
  promisesQuerySchema,
  parseBody,
  parseSearchParams,
} from '../schemas'

describe('Validation Schemas', () => {
  describe('createPromiseSchema', () => {
    it('validates a valid promise', () => {
      const result = createPromiseSchema.safeParse({
        politician_id: 1,
        title: 'Build new hospital',
        description: 'A new hospital for the county',
        category: 'Healthcare',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.politician_id).toBe(1)
        expect(result.data.title).toBe('Build new hospital')
      }
    })

    it('trims whitespace from title', () => {
      const result = createPromiseSchema.safeParse({
        politician_id: 1,
        title: '  Build new hospital  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.title).toBe('Build new hospital')
      }
    })

    it('rejects missing politician_id', () => {
      const result = createPromiseSchema.safeParse({
        title: 'Build new hospital',
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-positive politician_id', () => {
      const result = createPromiseSchema.safeParse({
        politician_id: 0,
        title: 'Build new hospital',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive')
      }
    })

    it('rejects negative politician_id', () => {
      const result = createPromiseSchema.safeParse({
        politician_id: -1,
        title: 'Build new hospital',
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty title', () => {
      const result = createPromiseSchema.safeParse({
        politician_id: 1,
        title: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('empty')
      }
    })

    it('rejects whitespace-only title', () => {
      const result = createPromiseSchema.safeParse({
        politician_id: 1,
        title: '   ',
      })
      expect(result.success).toBe(false)
    })

    it('allows optional fields to be null', () => {
      const result = createPromiseSchema.safeParse({
        politician_id: 1,
        title: 'Build new hospital',
        description: null,
        category: null,
        promise_date: null,
        target_date: null,
      })
      expect(result.success).toBe(true)
    })

    it('accepts YYYY-MM-DD date format', () => {
      const result = createPromiseSchema.safeParse({
        politician_id: 1,
        title: 'Build new hospital',
        promise_date: '2024-01-15',
      })
      expect(result.success).toBe(true)
    })

    it('accepts ISO datetime format', () => {
      const result = createPromiseSchema.safeParse({
        politician_id: 1,
        title: 'Build new hospital',
        promise_date: '2024-01-15T10:30:00Z',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('createPoliticianSchema', () => {
    it('validates a valid politician', () => {
      const result = createPoliticianSchema.safeParse({
        name: 'John Smith',
        party: 'Fine Gael',
        constituency: 'Dublin Central',
        role: 'TD',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('John Smith')
      }
    })

    it('trims whitespace from name', () => {
      const result = createPoliticianSchema.safeParse({
        name: '  John Smith  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('John Smith')
      }
    })

    it('rejects missing name', () => {
      const result = createPoliticianSchema.safeParse({
        party: 'Fine Gael',
      })
      expect(result.success).toBe(false)
    })

    it('rejects empty name', () => {
      const result = createPoliticianSchema.safeParse({
        name: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('empty')
      }
    })

    it('validates position_type enum', () => {
      const result = createPoliticianSchema.safeParse({
        name: 'John Smith',
        position_type: 'TD',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid position_type', () => {
      const result = createPoliticianSchema.safeParse({
        name: 'John Smith',
        position_type: 'InvalidType',
      })
      expect(result.success).toBe(false)
    })

    it('accepts all valid position types', () => {
      const positionTypes = ['TD', 'Councillor', 'Senator', 'MEP', 'MLA']
      for (const positionType of positionTypes) {
        const result = createPoliticianSchema.safeParse({
          name: 'John Smith',
          position_type: positionType,
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('reviewIdParamSchema', () => {
    it('parses valid numeric string', () => {
      const result = reviewIdParamSchema.safeParse({ id: '123' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(123)
      }
    })

    it('rejects non-numeric string', () => {
      const result = reviewIdParamSchema.safeParse({ id: 'abc' })
      expect(result.success).toBe(false)
    })

    it('rejects zero', () => {
      const result = reviewIdParamSchema.safeParse({ id: '0' })
      expect(result.success).toBe(false)
    })

    it('rejects negative numbers', () => {
      const result = reviewIdParamSchema.safeParse({ id: '-1' })
      expect(result.success).toBe(false)
    })

    it('rejects float strings', () => {
      const result = reviewIdParamSchema.safeParse({ id: '1.5' })
      expect(result.success).toBe(false)
    })
  })

  describe('rejectReviewSchema', () => {
    it('validates valid rejection reason', () => {
      const result = rejectReviewSchema.safeParse({
        reason: 'Duplicate entry',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.reason).toBe('Duplicate entry')
      }
    })

    it('trims whitespace from reason', () => {
      const result = rejectReviewSchema.safeParse({
        reason: '  Duplicate entry  ',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.reason).toBe('Duplicate entry')
      }
    })

    it('rejects missing reason', () => {
      const result = rejectReviewSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('rejects empty reason', () => {
      const result = rejectReviewSchema.safeParse({
        reason: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required')
      }
    })

    it('rejects whitespace-only reason', () => {
      const result = rejectReviewSchema.safeParse({
        reason: '   ',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('promisesQuerySchema', () => {
    it('parses valid query params', () => {
      const result = promisesQuerySchema.safeParse({
        status: 'pending',
        politician_id: '5',
        limit: '50',
        offset: '10',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('pending')
        expect(result.data.politician_id).toBe(5)
        expect(result.data.limit).toBe(50)
        expect(result.data.offset).toBe(10)
      }
    })

    it('uses defaults for missing params', () => {
      const result = promisesQuerySchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(100)
        expect(result.data.offset).toBe(0)
      }
    })

    it('caps limit at 100', () => {
      const result = promisesQuerySchema.safeParse({
        limit: '500',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(100)
      }
    })

    it('rejects invalid status', () => {
      const result = promisesQuerySchema.safeParse({
        status: 'invalid_status',
      })
      expect(result.success).toBe(false)
    })

    it('accepts all valid status values', () => {
      const statuses = ['pending', 'in_progress', 'completed', 'broken', 'modified']
      for (const status of statuses) {
        const result = promisesQuerySchema.safeParse({ status })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('parseBody helper', () => {
    it('parses valid JSON body', async () => {
      const mockRequest = {
        json: async () => ({ politician_id: 1, title: 'Test' }),
      } as Request

      const result = await parseBody(mockRequest, createPromiseSchema)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.politician_id).toBe(1)
      }
    })

    it('returns error for invalid body', async () => {
      const mockRequest = {
        json: async () => ({ title: 'Test' }), // missing politician_id
      } as Request

      const result = await parseBody(mockRequest, createPromiseSchema)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.status).toBe(400)
      }
    })

    it('handles JSON parse errors', async () => {
      const mockRequest = {
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as unknown as Request

      const result = await parseBody(mockRequest, createPromiseSchema)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBe('Invalid JSON in request body')
        expect(result.status).toBe(400)
      }
    })
  })

  describe('parseSearchParams helper', () => {
    it('parses valid search params', () => {
      const searchParams = new URLSearchParams('status=pending&limit=50')
      const result = parseSearchParams(searchParams, promisesQuerySchema)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe('pending')
        expect(result.data.limit).toBe(50)
      }
    })

    it('returns error for invalid params', () => {
      const searchParams = new URLSearchParams('status=invalid')
      const result = parseSearchParams(searchParams, promisesQuerySchema)
      expect(result.success).toBe(false)
    })
  })
})
