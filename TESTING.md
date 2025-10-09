# Testing Guide for Fiacha

This document describes the testing infrastructure for the Fiacha Irish political accountability tracker.

## Overview

Fiacha has a comprehensive testing setup that ensures data integrity and validates that the application is functioning correctly:

1. **Database Validation** - Checks database integrity and data completeness
2. **API Endpoint Tests** - Validates API responses and data consistency
3. **Integration Tests** - Tests filtering, data relationships, and edge cases

## Quick Start

### Prerequisites

- Postgres database running (`docker compose up -d` or `docker run`)
- Dev server running (`npm run dev`)

### Running Tests

```bash
# Run all tests (database validation + API tests)
npm run test:all

# Run only database validation
npm run validate

# Run only API endpoint tests
npm test
# or
npm run test:api
```

## Test Scripts

### 1. Database Validation (`npm run validate`)

**Location**: `scripts/validate-data.ts`

**What it checks**:
- ✅ All 26 counties exist in the database
- ✅ All 31 local authorities exist
- ✅ Politicians have required county relationships
- ✅ Councillors have local authority relationships
- ✅ Promises have valid politician relationships
- ✅ Foreign key integrity
- ⚠️ Data coverage warnings (e.g., which counties/authorities have councillors)

**Output**:
```
🔍 Starting Data Validation...

================================================================================
VALIDATION RESULTS
================================================================================

✅ Counties table
   Found 26 counties (expected 26)

✅ Local authorities table
   Found 31 local authorities (expected 31)

...

✅ County coverage (councillors)
   5 out of 26 counties have councillors
   ⚠️  Warning: Expected 26, got 5
```

**Exit codes**:
- `0` - All checks passed (warnings are OK)
- `1` - One or more checks failed

### 2. API Endpoint Tests (`npm run test:api`)

**Location**: `scripts/test-endpoints.ts`

**Prerequisites**: Dev server must be running on `http://localhost:3000`

**What it tests**:

#### GET /api/politicians
- Returns array of politicians
- Has required fields (id, name, party, position_type, etc.)
- Returns both TDs and Councillors
- All politicians have county information
- All councillors have local authority information

#### GET /api/counties
- Returns exactly 26 counties
- Has required fields (id, name, province)
- Contains all four provinces (Leinster, Munster, Connacht, Ulster)
- Counties are properly sorted

#### GET /api/promises
- Returns array of promises
- Has required fields (id, politician_id, title, status, politician_name)
- All promises have non-empty status values
- Sorted correctly by created_at

#### Data Consistency
- All promise politician IDs reference existing politicians
- All politician county names reference existing counties
- Can filter politicians by position type, party, and county

#### Edge Cases
- Wexford county (no councillors scenario)

**Output**:
```
🧪 Starting API Endpoint Tests...

Testing against: http://localhost:3000

================================================================================
API ENDPOINT TEST RESULTS
================================================================================

✅ GET /api/politicians - Returns data
   Returned 110 politicians

✅ GET /api/politicians - Has both TDs and Councillors
   21 TDs, 89 Councillors

...

✅ Filtering - Wexford councillors (edge case)
   Found 0 councillors in Wexford (expected 0 with current seed data)

================================================================================
SUMMARY: 16 passed, 0 failed
================================================================================

✨ All tests passed!
```

**Exit codes**:
- `0` - All tests passed
- `1` - One or more tests failed or dev server not running

## Current Test Coverage

### Database (as of latest seed)
- **Counties**: 26/26 ✅
- **Local Authorities**: 31/31 ✅
- **Politicians**: 110 total
  - TDs: 21
  - Councillors: 89
- **Promises**: 18
- **Counties with Councillors**: 5/26 (Dublin, Cork, Carlow, Cavan, Galway)
- **Authorities with Councillors**: 6/31

### API Endpoints
- ✅ `/api/politicians` - Fully tested
- ✅ `/api/counties` - Fully tested
- ✅ `/api/promises` - Fully tested

## Known Issues / Expected Behavior

### Wexford County Has No Councillors

**Status**: Expected behavior (not a bug)

**Reason**: The current database seed only includes councillors for 6 local authorities:
- Dublin City Council (20 councillors)
- Carlow County Council (18 councillors)
- Cavan County Council (18 councillors)
- Cork County Council (15 councillors)
- Cork City Council (10 councillors)
- Galway City Council (8 councillors)

**Impact**: When filtering for councillors in Wexford (or other counties without seeded data), the page correctly displays "No politicians match your filters".

**Test Coverage**: This edge case is specifically tested in the API tests:
```
✅ Filtering - Wexford councillors (edge case)
   Found 0 councillors in Wexford (expected 0 with current seed data)
```

**To resolve**: Seed councillor data for additional local authorities, including Wexford County Council.

## Adding New Tests

### Database Validation

Edit `scripts/validate-data.ts` and add new checks to the `validateData()` function:

```typescript
// Check X: Your new check
try {
  const result = await db.query('YOUR SQL')
  const count = parseInt(result.rows[0].count)
  results.push({
    check: 'Your check name',
    passed: count === expectedValue,
    details: `Found ${count} (expected ${expectedValue})`,
    count,
    expected: expectedValue
  })
} catch (error) {
  results.push({
    check: 'Your check name',
    passed: false,
    details: `Error: ${error}`
  })
}
```

### API Endpoint Tests

Edit `scripts/test-endpoints.ts` and add new test cases:

```typescript
// Test X: Your new endpoint test
try {
  const data = await fetchJSON(`${BASE_URL}/api/your-endpoint`)

  results.push({
    test: 'GET /api/your-endpoint - Description',
    passed: yourCondition,
    details: 'Your details'
  })
} catch (error) {
  results.push({
    test: 'GET /api/your-endpoint',
    passed: false,
    details: `Error: ${error}`
  })
}
```

## CI/CD Integration

These tests can be integrated into a CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Start database
  run: docker compose up -d

- name: Wait for database
  run: sleep 5

- name: Apply migrations
  run: ./scripts/apply-migrations.sh

- name: Start dev server
  run: npm run dev &

- name: Wait for server
  run: npx wait-on http://localhost:3000

- name: Run tests
  run: npm run test:all
```

## Troubleshooting

### "Dev server is not running"
Make sure you have `npm run dev` running before executing `npm run test:api`.

### "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"
The validation script couldn't connect to the database. Check:
- Database is running (`docker ps`)
- `.env` file exists with correct `DATABASE_URL`
- Database container is accessible

### "Request is not defined" (Jest tests)
This is expected - the Jest tests in `__tests__/` were an initial attempt but don't work with Next.js API routes. Use the HTTP-based tests in `scripts/test-endpoints.ts` instead.

## Future Improvements

- [ ] Add tests for promise detail pages
- [ ] Add tests for form submissions
- [ ] Add visual regression testing
- [ ] Add performance benchmarks
- [ ] Add load testing for API endpoints
- [ ] Expand councillor data coverage to all 31 local authorities
- [ ] Add E2E tests with Playwright or Cypress
