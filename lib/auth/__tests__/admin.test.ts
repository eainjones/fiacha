import { getAdminAllowlist, isAdmin, UnauthorizedError, ForbiddenError } from '../admin'

describe('Admin Authorization Helper', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('getAdminAllowlist', () => {
    it('returns empty array when ADMIN_EMAIL_ALLOWLIST is not set', () => {
      delete process.env.ADMIN_EMAIL_ALLOWLIST
      expect(getAdminAllowlist()).toEqual([])
    })

    it('returns empty array when ADMIN_EMAIL_ALLOWLIST is empty', () => {
      process.env.ADMIN_EMAIL_ALLOWLIST = ''
      expect(getAdminAllowlist()).toEqual([])
    })

    it('parses single email correctly', () => {
      process.env.ADMIN_EMAIL_ALLOWLIST = 'admin@example.com'
      expect(getAdminAllowlist()).toEqual(['admin@example.com'])
    })

    it('parses multiple emails correctly', () => {
      process.env.ADMIN_EMAIL_ALLOWLIST = 'admin1@example.com,admin2@example.com'
      expect(getAdminAllowlist()).toEqual(['admin1@example.com', 'admin2@example.com'])
    })

    it('trims whitespace from emails', () => {
      process.env.ADMIN_EMAIL_ALLOWLIST = ' admin1@example.com , admin2@example.com '
      expect(getAdminAllowlist()).toEqual(['admin1@example.com', 'admin2@example.com'])
    })

    it('converts emails to lowercase', () => {
      process.env.ADMIN_EMAIL_ALLOWLIST = 'Admin@Example.COM'
      expect(getAdminAllowlist()).toEqual(['admin@example.com'])
    })

    it('filters out empty entries', () => {
      process.env.ADMIN_EMAIL_ALLOWLIST = 'admin@example.com,,,'
      expect(getAdminAllowlist()).toEqual(['admin@example.com'])
    })
  })

  describe('isAdmin', () => {
    beforeEach(() => {
      process.env.ADMIN_EMAIL_ALLOWLIST = 'admin@example.com,superuser@example.com'
    })

    it('returns false for null email', () => {
      expect(isAdmin(null)).toBe(false)
    })

    it('returns false for undefined email', () => {
      expect(isAdmin(undefined)).toBe(false)
    })

    it('returns false for empty string email', () => {
      expect(isAdmin('')).toBe(false)
    })

    it('returns true for admin email', () => {
      expect(isAdmin('admin@example.com')).toBe(true)
    })

    it('returns true for admin email case-insensitive', () => {
      expect(isAdmin('ADMIN@EXAMPLE.COM')).toBe(true)
      expect(isAdmin('Admin@Example.com')).toBe(true)
    })

    it('returns false for non-admin email', () => {
      expect(isAdmin('user@example.com')).toBe(false)
    })

    it('returns false when allowlist is empty (fail closed)', () => {
      process.env.ADMIN_EMAIL_ALLOWLIST = ''
      expect(isAdmin('admin@example.com')).toBe(false)
    })

    it('returns false when allowlist is not configured (fail closed)', () => {
      delete process.env.ADMIN_EMAIL_ALLOWLIST
      expect(isAdmin('admin@example.com')).toBe(false)
    })
  })

  describe('Error classes', () => {
    it('UnauthorizedError has correct name and message', () => {
      const error = new UnauthorizedError()
      expect(error.name).toBe('UnauthorizedError')
      expect(error.message).toBe('Authentication required')
    })

    it('UnauthorizedError accepts custom message', () => {
      const error = new UnauthorizedError('Custom message')
      expect(error.message).toBe('Custom message')
    })

    it('ForbiddenError has correct name and message', () => {
      const error = new ForbiddenError()
      expect(error.name).toBe('ForbiddenError')
      expect(error.message).toBe('Admin access required')
    })

    it('ForbiddenError accepts custom message', () => {
      const error = new ForbiddenError('Custom forbidden message')
      expect(error.message).toBe('Custom forbidden message')
    })
  })
})
