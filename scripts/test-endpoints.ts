/**
 * API Endpoint Integration Tests
 *
 * Tests API endpoints by making actual HTTP requests to the running dev server.
 * Run with: npx tsx scripts/test-endpoints.ts
 *
 * Prerequisites: Dev server must be running on http://localhost:3000
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') })

interface TestResult {
  test: string
  passed: boolean
  details: string
  data?: any
}

const results: TestResult[] = []
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

async function fetchJSON(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

async function testEndpoints() {
  console.log('\n🧪 Starting API Endpoint Tests...\n')
  console.log(`Testing against: ${BASE_URL}\n`)

  // Test 1: /api/politicians
  try {
    const politicians = await fetchJSON(`${BASE_URL}/api/politicians`)

    results.push({
      test: 'GET /api/politicians - Returns data',
      passed: Array.isArray(politicians) && politicians.length > 0,
      details: `Returned ${politicians.length} politicians`
    })

    const hasRequiredFields = politicians.every((p: any) =>
      p.id && p.name && p.party && p.position_type
    )
    results.push({
      test: 'GET /api/politicians - Has required fields',
      passed: hasRequiredFields,
      details: hasRequiredFields ? 'All politicians have required fields' : 'Missing required fields'
    })

    const tds = politicians.filter((p: any) => p.position_type === 'TD')
    const councillors = politicians.filter((p: any) => p.position_type === 'Councillor')
    results.push({
      test: 'GET /api/politicians - Has both TDs and Councillors',
      passed: tds.length > 0 && councillors.length > 0,
      details: `${tds.length} TDs, ${councillors.length} Councillors`
    })

    const hasCountyInfo = politicians.every((p: any) => p.county_name && p.province)
    results.push({
      test: 'GET /api/politicians - Has county information',
      passed: hasCountyInfo,
      details: hasCountyInfo ? 'All politicians have county info' : 'Missing county info'
    })

    const councillorsHaveAuthority = councillors.every((c: any) => c.local_authority_name)
    results.push({
      test: 'GET /api/politicians - Councillors have local authority',
      passed: councillorsHaveAuthority,
      details: councillorsHaveAuthority ? 'All councillors have local authority' : 'Missing local authority'
    })
  } catch (error) {
    results.push({
      test: 'GET /api/politicians',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Test 2: /api/counties
  try {
    const counties = await fetchJSON(`${BASE_URL}/api/counties`)

    results.push({
      test: 'GET /api/counties - Returns 26 counties',
      passed: counties.length === 26,
      details: `Returned ${counties.length} counties (expected 26)`
    })

    const hasRequiredFields = counties.every((c: any) =>
      c.id && c.name && c.province
    )
    results.push({
      test: 'GET /api/counties - Has required fields',
      passed: hasRequiredFields,
      details: hasRequiredFields ? 'All counties have required fields' : 'Missing required fields'
    })

    const provinces = new Set(counties.map((c: any) => c.province))
    const hasFourProvinces = provinces.size === 4 &&
      provinces.has('Leinster') &&
      provinces.has('Munster') &&
      provinces.has('Connacht') &&
      provinces.has('Ulster')

    results.push({
      test: 'GET /api/counties - Has all four provinces',
      passed: hasFourProvinces,
      details: `Found provinces: ${[...provinces].join(', ')}`
    })

    const hasCountFields = counties.every((c: any) =>
      typeof c.politician_count === 'number' && typeof c.promise_count === 'number'
    )
    results.push({
      test: 'GET /api/counties - Includes aggregated counts',
      passed: hasCountFields,
      details: hasCountFields ? 'All counties include promise and politician counts' : 'Missing aggregated count fields'
    })
  } catch (error) {
    results.push({
      test: 'GET /api/counties',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Test 3: /api/promises
  try {
    const promises = await fetchJSON(`${BASE_URL}/api/promises`)

    results.push({
      test: 'GET /api/promises - Returns data',
      passed: Array.isArray(promises) && promises.length > 0,
      details: `Returned ${promises.length} promises`
    })

    const hasRequiredFields = promises.every((p: any) =>
      p.id && p.politician_id && p.title && p.status && p.politician_name
    )
    results.push({
      test: 'GET /api/promises - Has required fields',
      passed: hasRequiredFields,
      details: hasRequiredFields ? 'All promises have required fields' : 'Missing required fields'
    })

    const statuses = [...new Set(promises.map((p: any) => p.status))]
    const allHaveStatus = promises.every((p: any) => p.status && p.status.length > 0)
    results.push({
      test: 'GET /api/promises - Has status values',
      passed: allHaveStatus,
      details: `Found statuses: ${statuses.join(', ')}`
    })
  } catch (error) {
    results.push({
      test: 'GET /api/promises',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Test 4: Data consistency
  try {
    const politicians = await fetchJSON(`${BASE_URL}/api/politicians`)
    const promises = await fetchJSON(`${BASE_URL}/api/promises`)
    const counties = await fetchJSON(`${BASE_URL}/api/counties`)

    const politicianIds = new Set(politicians.map((p: any) => p.id))
    const promisesPoliticiansExist = promises.every((pr: any) => politicianIds.has(pr.politician_id))
    results.push({
      test: 'Data consistency - Promise politicians exist',
      passed: promisesPoliticiansExist,
      details: promisesPoliticiansExist ? 'All promise politicians exist' : 'Orphaned promise found'
    })

    const countyNames = new Set(counties.map((c: any) => c.name))
    const politicianCountiesExist = politicians
      .filter((p: any) => p.county_name)
      .every((p: any) => countyNames.has(p.county_name))
    results.push({
      test: 'Data consistency - Politician counties exist',
      passed: politicianCountiesExist,
      details: politicianCountiesExist ? 'All politician counties exist' : 'Invalid county reference found'
    })
  } catch (error) {
    results.push({
      test: 'Data consistency check',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Test 5: Filtering scenarios (simulated)
  try {
    const politicians = await fetchJSON(`${BASE_URL}/api/politicians`)

    // Test filtering by position type
    const tds = politicians.filter((p: any) => p.position_type === 'TD')
    const councillors = politicians.filter((p: any) => p.position_type === 'Councillor')
    results.push({
      test: 'Filtering - By position type',
      passed: tds.length > 0 && councillors.length > 0,
      details: `Can filter ${tds.length} TDs and ${councillors.length} Councillors`
    })

    // Test filtering by county
    const wexfordPoliticians = politicians.filter((p: any) => p.county_name === 'Wexford')
    const wexfordCouncillors = wexfordPoliticians.filter((p: any) => p.position_type === 'Councillor')
    results.push({
      test: 'Filtering - Wexford councillors (edge case)',
      passed: true,  // This is informational, not a pass/fail
      details: `Found ${wexfordCouncillors.length} councillors in Wexford (expected 0 with current seed data)`
    })

    // Test filtering by party
    const parties = [...new Set(politicians.map((p: any) => p.party))]
    results.push({
      test: 'Filtering - By party',
      passed: parties.length > 1,
      details: `Can filter by ${parties.length} different parties`
    })
  } catch (error) {
    results.push({
      test: 'Filtering scenarios',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Print results
  console.log('=' .repeat(80))
  console.log('API ENDPOINT TEST RESULTS')
  console.log('='.repeat(80))

  let passCount = 0
  let failCount = 0

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`\n${icon} ${result.test}`)
    console.log(`   ${result.details}`)

    if (result.passed) {
      passCount++
    } else {
      failCount++
    }
  })

  console.log('\n' + '='.repeat(80))
  console.log(`SUMMARY: ${passCount} passed, ${failCount} failed`)
  console.log('='.repeat(80) + '\n')

  if (failCount > 0) {
    console.log('⚠️  Some tests failed. Please review the errors above.\n')
    process.exit(1)
  } else {
    console.log('✨ All tests passed!\n')
  }
}

// Check if server is running
async function checkServer() {
  try {
    await fetch(`${BASE_URL}/api/politicians`)
    return true
  } catch (error) {
    return false
  }
}

async function main() {
  const isServerRunning = await checkServer()

  if (!isServerRunning) {
    console.error('\n❌ Dev server is not running!')
    console.error(`Please start the dev server with "npm run dev" before running these tests.\n`)
    process.exit(1)
  }

  await testEndpoints()
}

main().catch(error => {
  console.error('Test execution failed:', error)
  process.exit(1)
})
