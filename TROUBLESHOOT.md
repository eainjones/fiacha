# Troubleshooting - App Not Loading

## Quick Diagnostic Steps

### Step 1: Check App Status

```bash
flyctl status -a fiacha-staging
```

**What to look for:**
- Status should be "running"
- Health checks should be "passing"

### Step 2: Check Logs

```bash
flyctl logs -a fiacha-staging
```

**Look for errors like:**
- Database connection errors
- Port binding errors
- Application crashes
- Module not found errors

### Step 3: Check if App Was Deployed

```bash
flyctl apps list | grep fiacha
```

Should show:
- fiacha-staging

```bash
flyctl releases -a fiacha-staging
```

Should show recent deployment.

## Common Issues & Fixes

### Issue 1: App Not Deployed Yet

**Fix:** Deploy the app first

```bash
npm run deploy:staging
```

Or manually:

```bash
flyctl deploy --config fly.staging.toml --app fiacha-staging
```

### Issue 2: Database Not Connected

**Check if DATABASE_URL is set:**

```bash
flyctl secrets list -a fiacha-staging
```

**Should show:** `DATABASE_URL`

**If missing, attach the database:**

```bash
flyctl postgres attach fiacha-staging-db --app fiacha-staging
```

**Then redeploy:**

```bash
flyctl deploy --config fly.staging.toml --app fiacha-staging
```

### Issue 3: Build Failed

**Rebuild and deploy:**

```bash
flyctl deploy --config fly.staging.toml --app fiacha-staging --build-only
```

If build succeeds:

```bash
flyctl deploy --config fly.staging.toml --app fiacha-staging
```

### Issue 4: Health Checks Failing

**Check health endpoint:**

```bash
curl https://fiacha-staging.fly.dev/api/healthz
```

This endpoint skips database calls; if it responds, the container is healthy and you can focus on downstream dependencies. If it fails, check logs:

```bash
flyctl logs -a fiacha-staging
```

### Issue 5: App is Scaled to 0

**Scale it up:**

```bash
flyctl scale count 1 -a fiacha-staging
```

## Step-by-Step Recovery

If nothing works, do a full redeploy:

### 1. Check Database is Ready

```bash
flyctl status -a fiacha-staging-db
```

Should be "running"

### 2. Ensure Database is Attached

```bash
flyctl secrets list -a fiacha-staging | grep DATABASE_URL
```

If not there:

```bash
flyctl postgres attach fiacha-staging-db --app fiacha-staging
```

### 3. Deploy the App

```bash
flyctl deploy --config fly.staging.toml --app fiacha-staging
```

**Wait 5-10 minutes for build to complete**

### 4. Check Status

```bash
flyctl status -a fiacha-staging
```

### 5. Check Logs

```bash
flyctl logs -a fiacha-staging
```

### 6. Test Again

```bash
open https://fiacha-staging.fly.dev
```

## Get Detailed Information

```bash
# Full app info
flyctl info -a fiacha-staging

# Check machines
flyctl machine list -a fiacha-staging

# SSH into app
flyctl ssh console -a fiacha-staging
```

## What to Share if Still Broken

Run these and share the output:

```bash
echo "=== APP STATUS ==="
flyctl status -a fiacha-staging

echo "=== SECRETS ==="
flyctl secrets list -a fiacha-staging

echo "=== RECENT LOGS ==="
flyctl logs -a fiacha-staging --lines 50

echo "=== RELEASES ==="
flyctl releases -a fiacha-staging
```
