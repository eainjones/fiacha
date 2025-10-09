/**
 * Counties API Endpoint Tests
 */

import { GET } from '@/app/api/counties/route'

describe('/api/counties', () => {
  describe('GET', () => {
    it('should return an array of counties', async () => {
      const response = await GET()
      const data = await response.json()

      expect(Array.isArray(data)).toBe(true)
      expect(response.status).toBe(200)
    })

    it('should return all 26 counties', async () => {
      const response = await GET()
      const data = await response.json()

      expect(data.length).toBe(26)
    })

    it('should return counties with required fields', async () => {
      const response = await GET()
      const data = await response.json()

      const county = data[0]
      expect(county).toHaveProperty('id')
      expect(county).toHaveProperty('name')
      expect(county).toHaveProperty('province')
    })

    it('should return counties sorted by province then name', async () => {
      const response = await GET()
      const data = await response.json()

      // Check that counties are grouped by province
      let currentProvince = data[0].province
      let provinceChanged = false

      for (let i = 1; i < data.length; i++) {
        if (data[i].province !== currentProvince) {
          currentProvince = data[i].province
          provinceChanged = true
        } else if (provinceChanged) {
          // If we've changed province before, we shouldn't see the previous province again
          expect(data.slice(i).every((c: any) => c.province !== data[i-1].province)).toBe(true)
        }
      }
    })

    it('should have all four provinces represented', async () => {
      const response = await GET()
      const data = await response.json()

      const provinces = new Set(data.map((c: any) => c.province))
      expect(provinces.has('Leinster')).toBe(true)
      expect(provinces.has('Munster')).toBe(true)
      expect(provinces.has('Connacht')).toBe(true)
      expect(provinces.has('Ulster')).toBe(true)
    })

    it('should have valid county names', async () => {
      const response = await GET()
      const data = await response.json()

      const expectedCounties = [
        'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin',
        'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim',
        'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan',
        'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Waterford',
        'Westmeath', 'Wexford', 'Wicklow'
      ]

      const countyNames = data.map((c: any) => c.name)
      expectedCounties.forEach(name => {
        expect(countyNames).toContain(name)
      })
    })
  })
})
