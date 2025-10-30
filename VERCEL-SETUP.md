# Vercel Staging & Production Setup Guide

This guide explains how to set up Vercel with staging and production environments using GitHub integration.

## Architecture Overview

### GitHub Integration
- **Main branch** (`main`/`master`) → **Production** environment
- **Staging branch** (`staging`) → **Staging** environment
- **Other branches/PRs** → **Preview** deployments

### Build & Deploy Process
1. Push code to GitHub
2. Vercel detects changes via webhook
3. Vercel builds the Next.js app (`npm run build`)
4. Vercel deploys to the appropriate environment
5. Preview URLs are created for PRs

## Setup Steps

### Step 1: Connect GitHub Repository

1. **Push your code to GitHub** (if not already):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/fiacha.git
   git push -u origin main
   ```

2. **Import Project on Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your `fiacha` repository
   - Vercel will auto-detect Next.js

### Step 2: Create Staging and Production Projects

Vercel automatically creates environments based on branch names. We'll use:
- **Production**: `main` branch
- **Staging**: `staging` branch

#### Option A: Single Project with Branch-based Environments (Recommended)

1. **Import the repository** (creates one project)
2. **Configure branch settings**:
   - Production Branch: `main`
   - Staging Branch: `staging` (create this branch)

3. **Create staging branch**:
   ```bash
   git checkout -b staging
   git push -u origin staging
   ```

#### Option B: Two Separate Projects (More Control)

1. **Create Production Project**:
   ```bash
   vercel --prod --name fiacha-production
   ```

2. **Create Staging Project**:
   ```bash
   vercel --name fiacha-staging
   ```

### Step 3: Configure Environment Variables

You need different `DATABASE_URL` values for staging and production.

#### In Vercel Dashboard:

1. **Production Environment Variables**:
   - Go to project → Settings → Environment Variables
   - Add `DATABASE_URL`
   - Value: Your production Supabase connection string
   - Environments: **Production** ✅

2. **Staging Environment Variables**:
   - Same page, add `DATABASE_URL` again
   - Value: Your staging Supabase connection string (or same as prod for now)
   - Environments: **Preview, Development, Staging** ✅

#### Via CLI (Alternative):

```bash
# Production
vercel env add DATABASE_URL production

# Staging/Preview
vercel env add DATABASE_URL preview
```

### Step 4: Configure Build Settings

Vercel auto-detects Next.js, but you can verify in:
- Settings → General → Build & Development Settings
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Step 5: Set Up Branch Protection (Optional but Recommended)

In GitHub:
1. Go to Settings → Branches
2. Add rule for `main` branch:
   - Require pull request reviews
   - Require status checks to pass (Vercel builds)
   - Include administrators

## Build & Deploy Workflow

### Automatic Deployments

```
┌─────────────────┐
│  Push to GitHub │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Vercel Webhook  │  (GitHub → Vercel)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Detect Branch   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌─────────┐
│ main   │ │ staging │
└───┬────┘ └───┬─────┘
    │          │
    ▼          ▼
┌──────────┐ ┌──────────┐
│Production│ │ Staging  │
└──────────┘ └──────────┘
```

### Manual Deployments

```bash
# Deploy to preview (staging-like)
vercel

# Deploy to production
vercel --prod

# Deploy specific project
vercel --prod --name fiacha-production
vercel --name fiacha-staging
```

## Database Strategy

### Option 1: Single Database (Simpler)
- Use the same Supabase database for staging and production可以使用同一个数据库
- Differentiate via application logic if needed
- ✅ Simpler setup
- ❌ Risk of test data in production

### Option 2: Separate Databases (Recommended)
- **Production**: Use existing Supabase project (`hgjefllkbbwevpyiazhx`)
- **Staging**: Create a new Supabase project for staging
- ✅ Safe testing environment
- ✅ Can test migrations without affecting production
- ❌ Requires managing two databases

### Setting Up Separate Staging Database

1. **Create staging Supabase project**:
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Create new project: `fiacha-staging`
   - Get connection string

2. **Run migrations on staging**:
   ```bash
   supabase link --project-ref STAGING_PROJECT_REF
   supabase db push
   ```

3. **Set staging DATABASE_URL in Vercel**:
   - Add environment variable for Preview/Staging environments

## Deployment URLs

After setup, you'll have:
- **Production**: `https://fiacha-production.vercel.app` (or custom domain)
- **Staging**: `https://fiacha-staging.vercel.app`
- **Preview**: `https://fiacha-{hash}.vercel.app` (for PRs/branches)

## Verification Steps

1. **Test Production Deployment**:
   ```bash
   git checkout main
   git push origin main
   # Check Vercel dashboard for deployment
   ```

2. **Test Staging Deployment**:
   ```bash
   git checkout staging
   git push origin staging
   # Check Vercel dashboard for deployment
   ```

3. **Test Preview Deployment**:
   ```bash
   git checkout -b feature/test
   git push origin feature/test
   # Create PR on GitHub
   # Vercel creates preview deployment
   ```

4. **Verify API Endpoints**:
   ```bash
   # Production
   curl https://your-production-url.vercel.app/api/healthz
   
   # Staging
   curl https://your-staging-url.vercel.app/api/healthz
   ```

## Monitoring & Logs

### View Deployments
- Vercel Dashboard → Deployments
- See all deployments with status, logs, and URLs

### View Logs
```bash
# Production logs
vercel logs --prod

# Specific deployment
vercel logs [deployment-url]
```

### Analytics
- Vercel Dashboard → Analytics
- View performance metrics, traffic, etc.

## Troubleshooting

### Build Failures
- Check Vercel deployment logs
- Verify `DATABASE_URL` is set correctly
- Check build command in `package.json`

### Environment Variable Issues
- Verify environment scope (Production vs Preview)
- Check variable names match exactly
- Redeploy after adding new variables

### Database Connection Errors
- Verify connection string format
- Check Supabase project is active
- Verify network access in Supabase settings

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Import project on Vercel
3. ✅ Set up staging branch
4. ✅ Configure environment variables
5. ✅ Test deployments
6. Optional: Set up custom domains
7. Optional: Configure preview deployments for PRs

