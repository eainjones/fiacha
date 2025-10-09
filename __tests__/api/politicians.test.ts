/**
 * Politicians API Endpoint Tests
 */

import { GET } from '@/app/api/politicians/route'

describe('/api/politicians', () => {
  describe('GET', () => {
    it('should return an array of politicians', async () => {
      const response = await GET()
      const data = await response.json()

      expect(Array.isArray(data)).toBe(true)
      expect(response.status).toBe(200)
    })

    it('should return politicians with required fields', async () => {
      const response = await GET()
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
        expect(politician).toHaveProperty('position_type')
        expect(politician).toHaveProperty('role')
      }
    })

    it('should return only active politicians', async () => {
      const response = await GET()
      const data = await response.json()

      data.forEach((politician: any) => {
        expect(politician.active).toBe(true)
      })
    })

    it('should order TDs before Councillors', async () => {
      const response = await GET()
      const data = await response.json()

      if (data.length > 1) {
        const firstTDIndex = data.findIndex((p: any) => p.position_type === 'TD')
        const lastCouncillorIndex = data.findLastIndex((p: any) => p.position_type === 'Councillor')

        if (firstTDIndex !== -1 && lastCouncillorIndex !== -1) {
          expect(firstTDIndex).toBeLessThan(lastCouncillorIndex)
        }
      }
    })

    it('should return politicians with county information', async () => {
      const response = await GET()
      const data = await response.json()

      const politiciansWithCounty = data.filter((p: any) => p.county_name)
      expect(politiciansWithCounty.length).toBeGreaterThan(0)

      politiciansWithCounty.forEach((politician: any) => {
        expect(politician.county_name).toBeTruthy()
        expect(politician.province).toBeTruthy()
      })
    })

    it('should return councillors with local authority information', async () => {
      const response = await GET()
      const data = await response.json()

      const councillors = data.filter((p: any) => p.position_type === 'Councillor')

      if (councillors.length > 0) {
        councillors.forEach((councillor: any) => {
          expect(councillor.local_authority_name).toBeTruthy()
        })
      }
    })
  })
})
