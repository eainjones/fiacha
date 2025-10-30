# Authentication Setup Guide

This guide will help you set up Supabase authentication for the Fiacha application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Your Fiacha project already using Supabase PostgreSQL database

## Step 1: Get Supabase API Credentials

1. Go to your Supabase project dashboard at https://supabase.com/dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - **Project API Key** → **anon/public** key

## Step 2: Configure Environment Variables

### For Local Development

1. Create a `.env.local` file in the project root (or update your `.env` file):

```bash
# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database URL (you should already have this)
DATABASE_URL=postgres://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

2. Replace the placeholders with your actual values from Step 1

### For Vercel Deployment

Add these environment variables to your Vercel project:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Enter your anon key when prompted
```

Or add them through the Vercel dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Configure Supabase Auth Settings

1. In your Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `https://fiacha.vercel.app` (or your production URL)
   - **Redirect URLs**: Add:
     - `https://fiacha.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for local development)

3. Go to **Authentication** → **Providers**
4. Enable **Email** provider (enabled by default)
5. Configure email settings:
   - You can use Supabase's built-in email service for testing
   - For production, configure your own SMTP provider

## Step 4: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Click **Sign In** in the navigation bar

4. Try creating an account:
   - Enter your email and password
   - Click **Sign Up**
   - Check your email for the confirmation link
   - Click the link to verify your email

5. Sign in with your credentials

6. Try accessing the **/add** page - you should now be able to add new promises and politicians

## Step 5: Enable Auth in Supabase (First Time Setup)

If this is your first time setting up auth, you may need to enable it:

1. Go to **Authentication** in your Supabase dashboard
2. If prompted, click **Enable Authentication**
3. The `auth` schema will be automatically created in your database

## Troubleshooting

### "Invalid API key" Error
- Double-check that you copied the **anon/public** key, not the service role key
- Ensure there are no extra spaces in your environment variables

### Email Confirmation Not Working
- Check your spam folder
- Verify your redirect URLs are configured correctly in Supabase
- For development, you can disable email confirmation temporarily:
  - Go to **Authentication** → **Settings**
  - Under **Email Auth**, disable **Enable email confirmations**

### Redirect Issues After Sign In
- Ensure your callback URL is added to the allowed redirect URLs in Supabase
- Check that your `NEXT_PUBLIC_SUPABASE_URL` is correct

### "Session not found" Errors
- Clear your browser cookies and local storage
- Make sure your environment variables are prefixed with `NEXT_PUBLIC_`
- Restart your development server after adding environment variables

## How Authentication Works

1. **Sign In Page**: Users enter their email and password at `/auth/sign-in`
2. **Supabase Auth**: Credentials are sent to Supabase for verification
3. **Session Management**: Supabase creates a session and stores it in browser cookies
4. **Protected Routes**: The `/add` page checks for a valid session before rendering
5. **Sign Out**: Clicking "Sign Out" clears the session and redirects to home

## Security Notes

- The anon key is safe to expose publicly - it only allows public operations
- Never expose your **service_role** key - keep it server-side only
- Always use HTTPS in production
- Consider enabling Multi-Factor Authentication (MFA) for admin users

## Step 6: Enable Google OAuth (Optional)

The application supports Google OAuth sign-in as an alternative to email/password authentication.

### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: `Fiacha` (or your preferred name)
   - User support email: Your email
   - Developer contact: Your email
   - Scopes: Add `email` and `profile` (or use defaults)
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Fiacha Web App`
   - Authorized JavaScript origins:
     - `https://fiacha.vercel.app` (your production URL)
     - `http://localhost:3000` (for local development)
   - Authorized redirect URIs:
     - `https://hgjefllkbbwevpyiazhx.supabase.co/auth/v1/callback`
     - (Replace `hgjefllkbbwevpyiazhx` with your Supabase project reference)
7. Copy the **Client ID** and **Client Secret**

### Configure Google OAuth in Supabase

1. Go to your Supabase dashboard → **Authentication** → **Providers**
2. Find **Google** in the provider list
3. Enable the Google provider
4. Paste your **Client ID** and **Client Secret** from Google Cloud Console
5. Click **Save**

### Configure Redirect URLs

Ensure your redirect URLs are configured in Supabase:
1. Go to **Authentication** → **URL Configuration**
2. Add these redirect URLs:
   - `https://fiacha.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`

### Test Google OAuth

1. Navigate to your sign-in page (`/auth/sign-in`)
2. Click **Sign in with Google**
3. You'll be redirected to Google's login page
4. Sign in with your Google account
5. Grant permission to the app
6. You'll be redirected back to the `/add` page as an authenticated user

### Troubleshooting Google OAuth

**"Error 400: redirect_uri_mismatch"**
- Verify the redirect URI in Google Cloud Console matches exactly: `https://[your-project-ref].supabase.co/auth/v1/callback`
- Check for trailing slashes - they must match exactly

**"Invalid OAuth Configuration"**
- Ensure both Client ID and Client Secret are correctly entered in Supabase
- Check for extra spaces or missing characters
- Try regenerating the credentials in Google Cloud Console

**OAuth Consent Screen Errors**
- Make sure your OAuth consent screen is published (or in testing mode with your email added as a test user)
- For development, use "Testing" mode and add test users
- For production, submit for verification

## Next Steps

Once authentication is working:
- Consider adding role-based access control (RBAC)
- Set up email templates in Supabase for better branded emails
- Add additional social login providers (GitHub, Facebook, etc.)
- Implement password reset functionality
