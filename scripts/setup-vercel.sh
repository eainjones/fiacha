#!/bin/bash
# Setup Vercel + Supabase Branching integration for Fiacha
#
# Prerequisites:
#   - Supabase project hgjefllkbbwevpyiazhx with Branching enabled
#   - GitHub repo connected to Supabase (for auto-branch creation)

set -e

echo "Setting up Vercel for Fiacha (single project, Supabase Branching)..."

if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI is not installed. Install with: npm i -g vercel"
  exit 1
fi

if ! vercel whoami &> /dev/null; then
  echo "Please log in to Vercel:"
  vercel login
fi

echo ""
echo "Current Vercel user: $(vercel whoami)"
echo ""

# Link project
echo "Linking Vercel project..."
vercel link

echo ""
echo "Project linked."
echo ""
echo "Next steps (manual):"
echo ""
echo "1. Enable Supabase Branching:"
echo "   - Supabase Dashboard → Project Settings → Branching"
echo "   - Connect to GitHub repo: eainjones/fiacha"
echo "   - Production branch: main"
echo ""
echo "2. Install Supabase Vercel integration:"
echo "   - Vercel Dashboard → Integrations → Supabase"
echo "   - Connect project hgjefllkbbwevpyiazhx"
echo "   - This auto-injects DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY"
echo "   - per Vercel environment (production / preview)"
echo ""
echo "3. Create staging branch if it doesn't exist:"
echo "   git checkout -b staging && git push -u origin staging"
echo ""
echo "4. Verify:"
echo "   - Push to staging → Vercel preview deploy uses staging branch DB"
echo "   - Merge to main → Vercel production deploy uses production DB"
echo ""
echo "Setup complete."
