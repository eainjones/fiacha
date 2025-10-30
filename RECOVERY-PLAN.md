# Database Recovery Plan

## Current State (2025-10-10)

### Staging (CORRECT - Source of Truth)
- **174 TDs**
- **123 Councillors** (90 + 33 Wexford)
- **297 Total Politicians**
- 18 Promises
- 26 Counties
- Working correctly at https://fiacha-staging.fly.dev

### Production (BROKEN)
- **21 TDs** ❌ (Missing 153 TDs!)
- **122 Councillors** ✓
- **143 Total Politicians** ❌
- Broken at https://fiacha.fly.dev

## Root Cause
1. Production has TWO databases: `postgres` (default) and `fiacha` (app)
2. Early migrations went to wrong `postgres` database
3. Recent migrations to `fiacha` database only added partial data
4. App connects to `fiacha` database but most TDs are missing

## Recovery Options

### Option 1: Export from Staging, Import to Production (RECOMMENDED)
**Pros:**
- Staging is known good state
- Clean, verified data
- Fast and reliable

**Steps:**
1. Backup production database
2. Drop and recreate politicians table in production `fiacha` database
3. Export politicians from staging
4. Import to production
5. Verify counts match

### Option 2: Re-run All Migrations on Production
**Pros:**
- Uses existing migration files
- Reproducible

**Cons:**
- Multiple migration files to coordinate
- Risk of same errors
- Slower

### Option 3: Manual SQL to Copy Missing TDs
**Cons:**
- Complex
- Error-prone
- Not recommended

## Recommended Approach: Option 1

### Step-by-Step Recovery

#### 1. Create Backup Script
```bash
#!/bin/bash
# Backup production database
pg_dump connection_string > backup-$(date +%Y%m%d-%H%M%S).sql
```

#### 2. Export Staging Data
```sql
-- Export from staging
COPY (SELECT * FROM politicians ORDER BY id) TO '/tmp/politicians-staging.csv' CSV HEADER;
COPY (SELECT * FROM promises ORDER BY id) TO '/tmp/promises-staging.csv' CSV HEADER;
```

#### 3. Clear Production and Import
```sql
-- In production fiacha database
TRUNCATE politicians CASCADE;
TRUNCATE promises CASCADE;

-- Import from staging exports
\COPY politicians FROM '/tmp/politicians-staging.csv' CSV HEADER;
\COPY promises FROM '/tmp/promises-staging.csv' CSV HEADER;
```

#### 4. Verify
```sql
SELECT position_type, COUNT(*) FROM politicians GROUP BY position_type;
-- Expected: 174 TDs, 123 Councillors

SELECT COUNT(*) FROM promises;
-- Expected: 18
```

### Prevention Measures

1. **Update Migration Script**
   - Always use `--database fiacha` flag
   - Add validation checks
   - Fail fast on errors

2. **Add Health Check Endpoint**
   ```typescript
   // /api/health
   {
     politicians: { total: 297, TDs: 174, Councillors: 123 },
     promises: 18,
     counties: 26,
     timestamp: "2025-10-10T..."
   }
   ```

3. **Documentation**
   - Document correct connection method
   - Add to README
   - Create MIGRATIONS.md guide

4. **Testing**
   - Always test on staging first
   - Verify counts before and after
   - Create automated tests

## Timeline
- Backup: 5 minutes
- Export/Import: 10 minutes
- Verification: 5 minutes
- **Total: 20 minutes**

## Rollback Plan
If anything goes wrong:
1. Stop production app
2. Restore from backup
3. Restart production app
4. Investigate issue before retry
