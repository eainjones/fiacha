# Vercel Deployment Guide

This guide covers deploying Fiacha to Vercel with Supabase as the database.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **Vercel CLI**: Already installed at `/opt/homebrew/bin/vercel`
4. **Supabase CLI**: Already installed at `/opt/homebrew/bin/supabase`

## Step 1: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name**: `fiacha` (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `eu-west-1` for Ireland)
4. Wait 2-3 minutes for the project to be created

### Get Your Database Connection String

1. In your Supabase project, go to **Settings** → **Database**
2. Scroll to **Connection String**
3. Copy the **URI** connection string (should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
4. Replace `[YOUR-PASSWORD]` with your actual database password

### Run Migrations

1. Link your local project to Supabase:
   ```bash
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find your project ref in the Supabase dashboard URL or run `npm run setup:supabase`)

2. Apply migrations:
   ```bash
   npm run migrate:supabase
   ```

   Or manually:
   ```bash
   supabase db push
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via CLI (Recommended)

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Link your project**:
   ```bash
   vercel link
   ```
   Follow the prompts to link to an existing project or create a new one.

3. **Set environment variables**:
   ```bash
   vercel env add DATABASE_URL
   ```
   Paste your Supabase connection string when prompted.

4. **Deploy to preview**:
   ```bash
   npm run vercel:deploy
   ```

5. **Deploy to production**:
   ```bash
   npm run vercel:prod
   ```

### Option B: Deploy via GitHub Integration

1. **Push to GitHub** (if not already):
   ```bash
   git push origin main
   ```

2. **Import Project on Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to **Settings** → **Environment Variables**
   - Add `DATABASE_URL` with your Supabase connection string
   - Select environments: Production, Preview, Development

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy automatically

## Step 3: Verify Deployment

1. **Check deployment URL**:
   - Vercel provides a URL like `https://fiacha.vercel.app`
   - Check build logs for any errors

2. **Test API endpoints**:
   ```bash
   curl https://your-app.vercel.app/api/healthz
   curl https://your-app.vercel.app/api/politicians
   curl https://your-app.vercel.app/api/counties
   ```

3. **Check database connection**:
   - Visit your app URL in a browser
   - Verify data is loading correctly

## Environment Variables

### Required Variables

- `DATABASE_URL`: Your Supabase PostgreSQL connection string

### Setting in Vercel

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
   - **Environments**: Select all (Production, Preview, Development)

## Database Migrations

When you need to update the database schema:

1. **Update migration files** in `supabase/migrations/`
2. **Push to Supabase**:
   ```bash
   npm run migrate:supabase
   ```
3. **Redeploy to Vercel** (if needed):
   ```bash
   vercel --prod
   ```

## Local Development with Supabase

1. **Start local Supabase**:
   ```bash
   supabase start
   ```

2. **Get local connection string**:
   ```bash
   supabase status
   ```
   Copy the "DB URL" value

3. **Set in `.env.local`**:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
   ```

4. **Run dev server**:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Database Connection Errors

- **Check connection string**: Ensure `DATABASE_URL` is set correctly in Vercel
 predecessors- **Verify Supabase is running**: Check Supabase dashboard → Database → Connection Pooling
- **Check firewall**: Supabase allows connections by default, but verify in project settings

### Build Failures

- **Check build logs**: Go to Vercel dashboard → Deployments → View logs
- **Verify Node version**: Vercel auto-detects, but you can specify in `package.json`:
  ```json
  "engines": {
    "node": "20.x"
  }
  ```

### Migration Issues

- **Check migration order**: Supabase runs migrations in filename order
- **Verify SQL syntax**: Test migrations locally first:
  ```bash
  supabase start
  supabase db reset
  ```

## Migration from Fly.io

If you're migrating from Fly.io:

1. **Export data from Fly Postgres** (if needed):
   ```bash
   flyctl postgres connect -a fiacha-production-db
   pg_dump -F c -b -v -f backup.dump fiacha
   ```

2. **Import to Supabase** (if needed):
   - Use Supabase dashboard → Database → Backups
   - Or use `pg_restore` with your connection string

3. **Update environment variables** in Vercel
4. **Redeploy**

## Useful Commands

```bash
# Setup Supabase
npm run setup:supabase

# Run migrations
npm run migrate:supabase

# Deploy to Vercel
npm run vercel:deploy        # Preview
npm run vercel:prod          # Production

# Check Supabase status
supabase status

# View Vercel deployments
vercel ls

# View Vercel logs
vercel logs
```

## Next Steps

- Set up custom domain in Vercel (Settings → Domains)
- Configure preview deployments for pull requests
- Set up monitoring (Vercel Analytics)
- Configure caching and CDN settings

