/**
 * Data Validation Script
 *
 * Runs checks on the database to ensure data integrity and completeness.
 * Run with: npx tsx scripts/validate-data.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') })

import { getDb } from '../lib/db'

interface ValidationResult {
  check: string
  passed: boolean
  details: string
  count?: number
  expected?: number
}

const results: ValidationResult[] = []

async function validateData() {
  const db = getDb()

  console.log('\n🔍 Starting Data Validation...\n')

  // Check 1: All counties exist
  try {
    const counties = await db.query('SELECT COUNT(*) FROM counties')
    const count = parseInt(counties.rows[0].count)
    results.push({
      check: 'Counties table',
      passed: count === 26,
      details: `Found ${count} counties (expected 26)`,
      count,
      expected: 26
    })
  } catch (error) {
    results.push({
      check: 'Counties table',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Check 2: All local authorities exist
  try {
    const authorities = await db.query('SELECT COUNT(*) FROM local_authorities')
    const count = parseInt(authorities.rows[0].count)
    results.push({
      check: 'Local authorities table',
      passed: count === 31,
      details: `Found ${count} local authorities (expected 31)`,
      count,
      expected: 31
    })
  } catch (error) {
    results.push({
      check: 'Local authorities table',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Check 3: Politicians exist
  try {
    const politicians = await db.query('SELECT COUNT(*) FROM politicians WHERE active = true')
    const count = parseInt(politicians.rows[0].count)
    results.push({
      check: 'Active politicians',
      passed: count > 0,
      details: `Found ${count} active politicians`,
      count
    })
  } catch (error) {
    results.push({
      check: 'Active politicians',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Check 4: TDs exist
  try {
    const tds = await db.query("SELECT COUNT(*) FROM politicians WHERE position_type = 'TD' AND active = true")
    const count = parseInt(tds.rows[0].count)
    results.push({
      check: 'TDs',
      passed: count > 0,
      details: `Found ${count} TDs`,
      count
    })
  } catch (error) {
    results.push({
      check: 'TDs',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Check 5: Councillors exist
  try {
    const councillors = await db.query("SELECT COUNT(*) FROM politicians WHERE position_type = 'Councillor' AND active = true")
    const count = parseInt(councillors.rows[0].count)
    results.push({
      check: 'Councillors',
      passed: count > 0,
      details: `Found ${count} councillors`,
      count
    })
  } catch (error) {
    results.push({
      check: 'Councillors',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Check 6: All politicians have counties
  try {
    const noCounty = await db.query('SELECT COUNT(*) FROM politicians WHERE county_id IS NULL AND active = true')
    const count = parseInt(noCounty.rows[0].count)
    results.push({
      check: 'Politicians have counties',
      passed: count === 0,
      details: count === 0 ? 'All politicians have counties' : `${count} politicians missing county`,
      count
    })
  } catch (error) {
    results.push({
      check: 'Politicians have counties',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Check 7: Councillors have local authorities
  try {
    const noAuthority = await db.query("SELECT COUNT(*) FROM politicians WHERE position_type = 'Councillor' AND local_authority_id IS NULL AND active = true")
    const count = parseInt(noAuthority.rows[0].count)
    results.push({
      check: 'Councillors have local authorities',
      passed: count === 0,
      details: count === 0 ? 'All councillors have local authorities' : `${count} councillors missing local authority`,
      count
    })
  } catch (error) {
    results.push({
      check: 'Councillors have local authorities',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Check 8: Promises exist
  try {
    const promises = await db.query('SELECT COUNT(*) FROM promises')
    const count = parseInt(promises.rows[0].count)
    results.push({
      check: 'Promises',
      passed: count > 0,
      details: `Found ${count} promises`,
      count
    })
  } catch (error) {
    results.push({
      check: 'Promises',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Check 9: All promises have politicians
  try {
    const noPolitician = await db.query('SELECT COUNT(*) FROM promises WHERE politician_id IS NULL')
    const count = parseInt(noPolitician.rows[0].count)
    results.push({
      check: 'Promises have politicians',
      passed: count === 0,
      details: count === 0 ? 'All promises have politicians' : `${count} promises missing politician`,
      count
    })
  } catch (error) {
    results.push({
      check: 'Promises have politicians',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Check 10: County coverage for councillors
  try {
    const coverage = await db.query(`
      SELECT COUNT(DISTINCT c.id) as counties_with_councillors
      FROM counties c
      INNER JOIN politicians p ON c.id = p.county_id
      WHERE p.position_type = 'Councillor' AND p.active = true
    `)
    const count = parseInt(coverage.rows[0].counties_with_councillors)
    results.push({
      check: 'County coverage (councillors)',
      passed: true, // This is informational, not a pass/fail
      details: `${count} out of 26 counties have councillors`,
      count,
      expected: 26
    })
  } catch (error) {
    results.push({
      check: 'County coverage (councillors)',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Check 11: Local authority coverage
  try {
    const coverage = await db.query(`
      SELECT COUNT(DISTINCT la.id) as authorities_with_councillors
      FROM local_authorities la
      INNER JOIN politicians p ON la.id = p.local_authority_id
      WHERE p.position_type = 'Councillor' AND p.active = true
    `)
    const count = parseInt(coverage.rows[0].authorities_with_councillors)
    results.push({
      check: 'Local authority coverage',
      passed: true, // This is informational
      details: `${count} out of 31 local authorities have councillors`,
      count,
      expected: 31
    })
  } catch (error) {
    results.push({
      check: 'Local authority coverage',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Check 12: Foreign key integrity
  try {
    const orphanPoliticians = await db.query(`
      SELECT COUNT(*) FROM politicians p
      WHERE p.county_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM counties c WHERE c.id = p.county_id)
    `)
    const count = parseInt(orphanPoliticians.rows[0].count)
    results.push({
      check: 'Foreign key integrity (counties)',
      passed: count === 0,
      details: count === 0 ? 'All county references are valid' : `${count} invalid county references`,
      count
    })
  } catch (error) {
    results.push({
      check: 'Foreign key integrity (counties)',
      passed: false,
      details: `Error: ${error}`
    })
  }

  // Print results
  console.log('=' .repeat(80))
  console.log('VALIDATION RESULTS')
  console.log('='.repeat(80))

  let passCount = 0
  let failCount = 0
  let warningCount = 0

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`\n${icon} ${result.check}`)
    console.log(`   ${result.details}`)

    if (result.passed) {
      if (result.expected && result.count !== result.expected) {
        warningCount++
        console.log(`   ⚠️  Warning: Expected ${result.expected}, got ${result.count}`)
      } else {
        passCount++
      }
    } else {
      failCount++
    }
  })

  console.log('\n' + '='.repeat(80))
  console.log(`SUMMARY: ${passCount} passed, ${failCount} failed, ${warningCount} warnings`)
  console.log('='.repeat(80) + '\n')

  if (failCount > 0) {
    process.exit(1)
  }
}

validateData().catch(error => {
  console.error('Validation failed:', error)
  process.exit(1)
})
