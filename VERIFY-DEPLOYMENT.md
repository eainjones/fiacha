# Verify Your Deployment

Quick checks to make sure everything is working after migration.

## Step 1: Check Database Tables

```bash
flyctl postgres connect -a fiacha-staging-db
```

In psql, run:

```sql
-- List all tables
\dt

-- Should show:
--  counties
--  local_authorities
--  politicians
--  promises
--  evidence
--  milestones
--  status_history
```

## Step 2: Check Data Counts

Still in psql:

```sql
-- Check counties (should be 26)
SELECT COUNT(*) FROM counties;

-- Check local authorities (should be 31)
SELECT COUNT(*) FROM local_authorities;

-- Check politicians (should be ~110)
SELECT COUNT(*) FROM politicians;

-- Check promises (should be 18)
SELECT COUNT(*) FROM promises;

-- Exit psql
\q
```

## Step 3: Check App Status

```bash
flyctl status -a fiacha-staging
```

Should show:
- ✅ Status: running
- ✅ Health checks: passing

## Step 4: Test API Endpoints

```bash
# Health check
curl https://fiacha-staging.fly.dev/api/healthz

# Test politicians endpoint
curl https://fiacha-staging.fly.dev/api/politicians

# Should return JSON with 110 politicians

# Test counties endpoint
curl https://fiacha-staging.fly.dev/api/counties

# Should return JSON with 26 counties

# Test promises endpoint
curl https://fiacha-staging.fly.dev/api/promises

# Should return JSON with 18 promises
```

## Step 5: Open in Browser

```bash
open https://fiacha-staging.fly.dev
```

You should see:
- ✅ Homepage loads
- ✅ Shows 110 politicians
- ✅ Shows 26 counties
- ✅ Shows 18 promises
- ✅ Can click through to different pages

## Step 6: Test Navigation

In the browser, test these links:
- `/politicians` - Should show all politicians with filtering
- `/counties` - Should show all 26 counties grouped by province
- `/promises` - Should show all promises with search
- Click on a promise - Should show promise details

## Expected Results

### Database
- ✅ 26 counties
- ✅ 31 local authorities
- ✅ 110 politicians (21 TDs + 89 Councillors)
- ✅ 18 promises

### API Endpoints
- ✅ `/api/healthz` - Returns `{ ok: true }`
- ✅ `/api/politicians` - Returns 110 politicians
- ✅ `/api/counties` - Returns 26 counties
- ✅ `/api/promises` - Returns 18 promises

### Pages
- ✅ Homepage - Shows stats and data
- ✅ Politicians page - Shows filterable list
- ✅ Counties page - Shows counties by province
- ✅ Promises page - Shows searchable promises

## If Something's Wrong

### No data showing?
```bash
# Re-run migrations
npm run migrate:staging
```

### App not loading?
```bash
# Check logs
flyctl logs -a fiacha-staging

# Restart app
flyctl apps restart fiacha-staging
```

### Database connection error?
```bash
# Check DATABASE_URL is set
flyctl secrets list -a fiacha-staging | grep DATABASE_URL

# Check database status
flyctl status -a fiacha-staging-db
```

## Success Checklist

- [ ] Database has 7 tables
- [ ] Counties table has 26 rows
- [ ] Politicians table has 110 rows
- [ ] Promises table has 18 rows
- [ ] API endpoints return data
- [ ] Homepage loads and shows stats
- [ ] Can navigate to all pages
- [ ] Filtering/search works

## 🎉 All Good?

If all checks pass, your staging environment is **fully deployed and working**!

Next steps:
1. Test thoroughly
2. When ready, deploy to production
3. See `DEPLOY-NOW.md` for production setup
