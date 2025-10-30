# Database Audit - 2025-10-10

## Problem Statement
- Production showing 143 total politicians (21 TDs + 122 Councillors)
- Expected: ~143 (110 TDs + 33 Wexford Councillors)
- **Critical Issue**: Only 21 TDs instead of 110

## Root Cause
Production Postgres cluster has TWO databases:
1. **`postgres`** - Default database (likely has the missing 89 TDs)
2. **`fiacha`** - Actual app database (has 21 TDs + 122 Councillors)

When running `flyctl postgres connect -a fiacha-db` without `--database fiacha`, it connects to the wrong database.

## Current State

### Fiacha Database (Correct)
- 21 TDs
- 122 Councillors (89 original + 33 Wexford)
- Total: 143 politicians

### Postgres Database (Wrong - likely has missing data)
- Unknown count of TDs (possibly 89 missing TDs)
- Unknown Councillors

### Staging Database
- 144 politicians (110 + 34 Wexford with George Lawlor)
- Working correctly

## Action Plan

### 1. Audit Both Databases
- [ ] Query `postgres` database for politician counts
- [ ] Query `fiacha` database for politician counts
- [ ] Determine which database has which data

### 2. Consolidate to Single Database
- [ ] Decide: Use `fiacha` as single source of truth
- [ ] Export any missing data from `postgres` database
- [ ] Import missing data to `fiacha` database
- [ ] Verify counts match expected values

### 3. Fix Migration Scripts
- [ ] Update `scripts/apply-migrations-fly.sh` to always use `--database fiacha`
- [ ] Add validation checks to migrations
- [ ] Test on staging first

### 4. Prevent Future Issues
- [ ] Document correct database connection method
- [ ] Add health check endpoint that shows counts
- [ ] Create backup before any migrations

## Expected Final State
- **110 TDs** (from migration 003, 006, 007)
- **122 Councillors** (89 from migration 005 + 33 Wexford from migration 007)
- **18 Promises**
- **26 Counties**
- **31 Local Authorities**
- **Total: 232 politicians**

Wait - if we should have 110 TDs, then total should be 232, not 143!
