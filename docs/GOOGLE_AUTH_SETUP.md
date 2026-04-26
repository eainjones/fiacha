# Google OAuth Setup Guide

## Status: Ready to Enable

Google OAuth is **already implemented** in the codebase. Just needs Supabase configuration.

## Existing Code

- **Sign-in page**: `/app/auth/sign-in/page.tsx` - Has `handleGoogleSignIn()` function
- **Callback handler**: `/app/auth/callback/route.ts` - Handles OAuth redirect
- **Supabase clients**: `/lib/supabase.ts` (browser) and `/lib/supabase-server.ts` (server)

## Setup Steps

### 1. Supabase Dashboard

**Production**: https://supabase.com/dashboard/project/hgjefllkbbwevpyiazhx

With Supabase Branching enabled, staging/preview branches get their own auth
endpoints automatically. Configure the Google provider on the main (production)
project — branches inherit the config.

Navigate to: **Authentication** → **Providers** → **Google** → Enable

### 2. Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URIs:
   - Production: `https://hgjefllkbbwevpyiazhx.supabase.co/auth/v1/callback`
   - Branch callbacks are auto-registered by Supabase Branching
4. Copy Client ID and Client Secret to Supabase provider settings

### 3. Test

Visit `/auth/sign-in` and click "Sign in with Google"

## Optional Future Improvements

1. **Add Auth Context Provider** - Centralized state management
2. **Implement Middleware** - Server-side route protection in `middleware.ts`
3. **API Auth Checks** - Protect `/api/promises` and `/api/politicians` endpoints
4. **User Profile** - Store additional metadata (name, avatar)

## Current Auth Flow

```
User clicks "Sign in with Google"
    ↓
supabase.auth.signInWithOAuth({ provider: 'google' })
    ↓
Redirected to Google for consent
    ↓
Google redirects to Supabase callback
    ↓
Supabase redirects to /auth/callback
    ↓
App exchanges code for session
    ↓
User redirected to /add (authenticated)
```

---
*Research saved: 2025-01-04*
