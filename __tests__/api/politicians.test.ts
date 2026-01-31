/**
 * Politicians API Endpoint Tests
 */

import { GET } from '@/app/api/politicians/route'
import { NextRequest } from 'next/server'

function makeRequest(url = 'http://localhost:3000/api/politicians') {
  return new NextRequest(url)
}

describe('/api/politicians', () => {
  describe('GET', () => {
    it('should return a flat array of politicians when no pagination params', async () => {
      const response = await GET(makeRequest())
      const data = await response.json()

      expect(Array.isArray(data)).toBe(true)
      expect(response.status).toBe(200)
    })

    it('should return paginated envelope when limit is provided', async () => {
      const response = await GET(makeRequest('http://localhost:3000/api/politicians?limit=10'))
      const body = await response.json()

      expect(body).toHaveProperty('data')
      expect(body).toHaveProperty('total')
      expect(body).toHaveProperty('limit', 10)
      expect(body).toHaveProperty('offset', 0)
      expect(Array.isArray(body.data)).toBe(true)
      expect(typeof body.total).toBe('number')
    })

    it('should return paginated envelope when offset is provided', async () => {
      const response = await GET(makeRequest('http://localhost:3000/api/politicians?offset=5'))
      const body = await response.json()

      expect(body).toHaveProperty('data')
      expect(body).toHaveProperty('total')
      expect(body).toHaveProperty('limit', 100)
      expect(body).toHaveProperty('offset', 5)
    })

    it('should cap limit at 200', async () => {
      const response = await GET(makeRequest('http://localhost:3000/api/politicians?limit=500'))
      const body = await response.json()

      expect(body.limit).toBe(200)
    })

    it('should return politicians with required fields', async () => {
      const response = await GET(makeRequest())
      const data = await response.json()

      if (data.length > 0) {
        const politician = data[0]
        expect(politician).toHaveProperty('id')
        expect(politician).toHaveProperty('name')
        expect(politician).toHaveProperty('party')
        expect(politician).toHaveProperty('constituency')
        expect(politician).toHaveProperty('county_name')
        expect(politician).toHaveProperty('province')
        expect(politician).toHaveProperty('local_authority_name')
        expect(politician).toHaveProperty('positionType')
        expect(politician).toHaveProperty('role')
      }
    })

    it('should return only active politicians', async () => {
      const response = await GET(makeRequest())
      const data = await response.json()

      data.forEach((politician: any) => {
        expect(politician.active).toBe(true)
      })
    })

    it('should return politicians with county information', async () => {
      const response = await GET(makeRequest())
      const data = await response.json()

      const politiciansWithCounty = data.filter((p: any) => p.county_name)
      expect(politiciansWithCounty.length).toBeGreaterThan(0)

      politiciansWithCounty.forEach((politician: any) => {
        expect(politician.county_name).toBeTruthy()
        expect(politician.province).toBeTruthy()
      })
    })

    it('should return councillors with local authority information', async () => {
      const response = await GET(makeRequest())
      const data = await response.json()

      const councillors = data.filter((p: any) => p.positionType === 'Councillor')

      if (councillors.length > 0) {
        councillors.forEach((councillor: any) => {
          expect(councillor.local_authority_name).toBeTruthy()
        })
      }
    })
  })
})
