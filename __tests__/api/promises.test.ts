/**
 * Promises API Endpoint Tests
 */

import { GET } from '@/app/api/promises/route'
import { NextRequest } from 'next/server'

describe('/api/promises', () => {
  describe('GET', () => {
    it('should return an array of promises', async () => {
      const request = new NextRequest('http://localhost/api/promises')
      const response = await GET(request)
      const data = await response.json()

      expect(Array.isArray(data)).toBe(true)
      expect(response.status).toBe(200)
    })

    it('should return promises with required fields', async () => {
      const request = new NextRequest('http://localhost/api/promises')
      const response = await GET(request)
      const data = await response.json()

      if (data.length > 0) {
        const promise = data[0]
        expect(promise).toHaveProperty('id')
        expect(promise).toHaveProperty('politician_id')
        expect(promise).toHaveProperty('title')
        expect(promise).toHaveProperty('description')
        expect(promise).toHaveProperty('status')
        expect(promise).toHaveProperty('category')
        expect(promise).toHaveProperty('politician_name')
      }
    })

    it('should return promises with valid status values', async () => {
      const request = new NextRequest('http://localhost/api/promises')
      const response = await GET(request)
      const data = await response.json()

      const validStatuses = ['pending', 'in_progress', 'kept', 'broken', 'compromised']

      data.forEach((promise: any) => {
        expect(validStatuses).toContain(promise.status)
      })
    })

    it('should return promises sorted by created_at desc', async () => {
      const request = new NextRequest('http://localhost/api/promises')
      const response = await GET(request)
      const data = await response.json()

      if (data.length > 1) {
        for (let i = 0; i < data.length - 1; i++) {
          const current = new Date(data[i].created_at)
          const next = new Date(data[i + 1].created_at)
          expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime())
        }
      }
    })

    it('should return promises with politician names', async () => {
      const request = new NextRequest('http://localhost/api/promises')
      const response = await GET(request)
      const data = await response.json()

      if (data.length > 0) {
        data.forEach((promise: any) => {
          expect(promise.politician_name).toBeTruthy()
        })
      }
    })

    it('should return promises with politician_id set', async () => {
      const request = new NextRequest('http://localhost/api/promises')
      const response = await GET(request)
      const data = await response.json()

      expect(data.every((p: any) => p.politician_id)).toBe(true)
    })
  })
})
