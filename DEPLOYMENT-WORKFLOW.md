# Vercel Deployment Workflow: Staging & Production

## Current Setup

✅ **Vercel Project**: `fiacha` (linked)
✅ **Supabase Project**: `hgjefllkbbwevpyiazhx` (configured)
✅ **Migrations**: Applied to Supabase

## GitHub Integration

### Option 1: Branch-Based Environments (Recommended)

Vercel automatically deploys based on branch names:

```
┌─────────────────────────────────────────┐
│          GitHub Repository              │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   ┌─────────┐            ┌──────────┐
   │  main   │            │ staging  │
   └────┬────┘            └────┬─────┘
        │                      │
        │                      │
        ▼                      ▼
┌──────────────┐      ┌──────────────┐
│  Production  │ oc│  Staging      │
│   Environment│      │ Environment  │
└──────────────┘      └──────────────┘
```

**Workflow**:
1. Push to `main` → Deploys to **Production**
2. Push to `staging` → Deploys to **Staging**
3. Create PR → Deploys to **Preview** (unique URL)

### How It Works

1. **GitHub Webhook**: When you push to GitHub, it sends a webhook to Vercel
2. **Vercel detects the branch** and triggers a build
3. **Build Process**:
   ```
   git clone → npm install → npm run build → deploy
   ```
4. **Environment Variables** are injected based on the environment
5. **Deployment** happens automatically

## Setup Steps

### Step 1: Connect GitHub Repository

**If repository is already on GitHub:**

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your `fiacha` project
3. Go to **Settings** → **Git**
4. Click **Connect Git Repository**
5. Select your GitHub repository
6. Click **Connect**

**If repository is NOT on GitHub yet:**

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/fiacha.git

# Push to GitHub
git push -u origin main

# Then follow steps above to connect
```

### Step 2: Create Staging Branch

```bash
# Create and push staging branch
git checkout -b staging
git push -u origin staging
```

### Step 3: Configure Environment Variables

You need to set `DATABASE_URL` for each environment:

#### Method 1: Vercel Dashboard

1. Go to project → **Settings** → **Environment Variables**
2. Add `DATABASE_URL`:
   - **Key**: `DATABASE_URL`
   - **Value**: Your Supabase connection string
   - **Environments**: Select which environments to use
     - ✅ Production (for `main` branch)
     - ✅ Preview (for `staging` and PRs)
     - ✅ Development (for local dev)

#### Method 2: Vercel CLI

```bash
# Production (main branch)
vercel env add DATABASE_URL production

# Preview/Staging (staging branch and PRs)
vercel env add DATABASE_URL preview

# Development (local)
vercel env add DATABASE_URL development
```

**Get your Supabase connection string:**
- https://supabase.com/dashboard/project/hgjefllkbbwevpyiazhx/settings/database
- Copy the **URI** connection string
- Replace `[YOUR-PASSWORD]` with your actual password

### Step 4: Configure Branch Settings

1. Go to project → **Settings** → **Git**
2. Set **Production Branch** to `main`
3. Vercel will automatically:
   - Deploy `main` → Production
   - Deploy `staging` → Staging (Preview environment)
   - Deploy other branches/PRs → Preview

## Build Process

### What Happens During a Build

```
1. GitHub Push Event
   │
   ▼
2. Vercel Webhook Triggered
   │
   ▼
3. Clone Repository
   │
   ▼
4. Install Dependencies
   ├─ npm install (or yarn/pnpm)
   │
   ▼
5. Build Application
   ├─ npm run build
   ├─ Next.js compiles TypeScript
   ├─ Generates static pages
   ├─ Creates serverless functions
   │
   ▼
6. Deploy
   ├─ Upload build artifacts
   ├─ Create serverless functions
   ├─ Set up edge network
   ├─ Assign domain
   │
   ▼
7. Deployment Complete
   └─ Your app is live!
```

### Build Configuration

Vercel auto-detects Next.js, but you can override in `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Environment Variables in Build

- Set at **build time**: Available during `npm run build`
- Set at **runtime**: Available in serverless functions and API routes
- `DATABASE_URL` is available at runtime for your API routes

## Deployment Workflow

### Development Workflow

```bash
# 1. Make changes locally
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "Add new feature"

# 2. Push to GitHub
git push origin feature/new-feature

# 3. Create Pull Request on GitHub
#    → Vercel automatically creates preview deployment
#    → Get preview URL in PR comments

# 4. Test preview deployment
#    → Share URL with team
#    → Verify changes work

# 5. Merge to staging
git checkout staging
git merge feature/new-feature
git push origin staging
#    → Deploys to staging environment

# 6. Test staging
#    → Full end-to-end testing

# 7. Merge to production
git checkout main
git merge staging
git push origin main
#    → Deploys to production
```

### Direct Deployment (CLI)

```bash
# Preview deployment (staging-like)
vercel

# Production deployment
vercel --prod

# With specific environment
vercel --prod --env DATABASE_URL=your_connection_string
```

## URLs Structure

After setup, you'll have:

- **Production**: `https://fiacha.vercel.app` or custom domain
- **Staging**: `https://fiacha-staging.vercel.app` (or preview URL)
- **Preview**: `https://fiacha-{hash}-{username}.vercel.app` (for PRs)

## Database Strategy

### Option 1: Single Database (Current Setup)

- ✅ Same Supabase database for staging and production
- ✅ Simpler to manage
- ✅ Lower cost
- ❌ Test data can mix with production

**Recommended for**: Small teams, early development

### Option 2: Separate Databases

- ✅ Clean separation
- ✅ Safe testing
- ✅ Can test migrations independently
- ❌ More to manage

**How to set up separate staging database:**

```bash
# Create new Supabase project for staging
# Get connection string

# Set in Vercel
vercel env add DATABASE_URL preview
# Use staging database connection string
```

## Verification

### Check Deployment Status

1. **Vercel Dashboard**: https://vercel.com/dashboard
   - See all deployments
   - View build logs
   - Check deployment status

2. **GitHub Integration**:
   - PR comments show deployment status
   - Commit status checks

### Test Deployments

```bash
# Test production
curl https://your-app.vercel.app/api/healthz

# Test staging
curl https://your-staging-url.vercel.app/api/healthz

# Test API endpoints
curl https://your-app.vercel.app/api/politicians
curl https://your-app.vercel.app/api/counties
```

## Common Commands

```bash
# Link project (already done)
vercel link

# Deploy
vercel              # Preview
vercel --prod       # Production

# Environment variables
vercel env ls                        # List all
vercel env add KEY production        # Add to production
vercel env rm KEY production         # Remove

# Logs
vercel logs                          # View logs
vercel logs --follow                 # Follow logs

# Project info
vercel project ls                    # List projects
vercel inspect [deployment-url]      # Inspect deployment
```

## Next Steps

1. ✅ Connect GitHub repository to Vercel
2. ✅ Create `staging` branch
3. ✅ Set `DATABASE_URL` environment variables
4. ✅ Push code to trigger first deployment
5. Optional: Set up custom domains
6. Optional: Configure preview deployments for PRs
7. Optional: Set up CI/CD checks

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Verify `package.json` scripts
- Check for TypeScript errors: `npm run build` locally

### Environment Variables Not Working

- Verify variable name matches exactly
- Check environment scope (Production vs Preview)
- Redeploy after adding variables

### Database Connection Issues

- Verify `DATABASE_URL` format
- Check Supabase project is active
- Verify network access in Supabase

### GitHub Not Triggering Deployments

- Check Git integration in Vercel dashboard
- Verify webhook is configured
- Check branch protection settings

