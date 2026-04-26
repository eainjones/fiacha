#!/bin/bash
# Setup Supabase for Fiacha (single-project with Branching)
#
# This links the CLI to the production project. Staging is handled
# automatically via Supabase Branching (no separate project needed).

set -e

echo "Setting up Supabase for Fiacha..."

if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI is not installed."
  echo "Install it with: brew install supabase/tap/supabase"
  exit 1
fi

if ! supabase projects list &> /dev/null; then
  echo "Please log in to Supabase:"
  supabase login
fi

PROJECT_REF="hgjefllkbbwevpyiazhx"

echo ""
echo "Linking to production project: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

echo ""
echo "Linked. Checking migration status..."
supabase migration list

echo ""
echo "Next steps:"
echo ""
echo "1. For local development:"
echo "   supabase start"
echo "   npm run dev"
echo ""
echo "2. To enable Branching (one-time):"
echo "   - Supabase Dashboard → Project Settings → Branching"
echo "   - Connect GitHub repo: eainjones/fiacha"
echo "   - Production branch: main"
echo ""
echo "3. To test migrations locally:"
echo "   supabase db reset    # runs all migrations + seed.sql"
echo ""
echo "Setup complete."
