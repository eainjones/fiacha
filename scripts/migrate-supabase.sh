#!/bin/bash
# Apply Supabase migrations

set -e

echo "🔄 Applying Supabase migrations..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI is not installed."
  echo "Install it with: brew install supabase/tap/supabase"
  exit 1
fi

# Check if project is linked
if ! supabase status &> /dev/null; then
  echo "⚠️  Project not linked. Linking now..."
  read -p "Enter your project reference ID: " project_ref
  supabase link --project-ref "$project_ref"
fi

# Apply migrations
echo "📦 Pushing migrations to Supabase..."
supabase db push

echo ""
echo "✅ Migrations applied successfully!"
echo ""
echo "💡 To verify, check your Supabase dashboard:"
echo "https://supabase.com/dashboard/project/$(supabase status | grep 'Project URL' | awk '{print $3}' | sed 's|https://||' | sed 's|.supabase.co||')/editor"

