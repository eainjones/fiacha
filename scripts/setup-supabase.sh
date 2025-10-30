#!/bin/bash
# Setup Supabase project for Fiacha

set -e

echo "🚀 Setting up Supabase for Fiacha..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Supabase CLI is not installed."
  echo "Install it with: brew install supabase/tap/supabase"
  exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
  echo "📝 Please log in to Supabase:"
  supabase login
fi

# Create a new Supabase project (or link to existing)
echo ""
echo "Choose an option:"
echo "1. Create a new Supabase project"
echo "2. Link to an existing project"
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
  echo "Creating new project..."
  read -p "Enter project name (default: fiacha): " project_name
  project_name=${project_name:-fiacha}
  
  read -p "Enter organization ID (find at https://supabase.com/dashboard/org): " org_id
  read -p "Enter database password (min 8 chars): " db_password
  read -p "Enter region (e.g., us-east-1, eu-west-1): " region
  
  supabase projects create "$project_name" \
    --org-id "$org_id" \
    --db-password "$db_password" \
    --region "$region"
    
  echo "✅ Project created! Linking now..."
  supabase link --project-ref "$project_name"
elif [ "$choice" = "2" ]; then
  echo "Linking to existing project..."
  read -p "Enter your project reference ID: " project_ref
  supabase link --project-ref "$project_ref"
else
  echo "Invalid choice"
  exit 1
fi

# Get connection string
echo ""
echo "📋 Getting database connection string..."
DB_URL=$(supabase status | grep "DB URL" | awk '{print $3}')

if [ -z "$DB_URL" ]; then
  echo "⚠️  Could not get DB URL. You can find it at:"
  echo "https://supabase.com/dashboard/project/$(supabase status | grep 'Project URL' | awk '{print $3}' | sed 's|https://||' | sed 's|.supabase.co||')/settings/database"
  echo ""
  read -p "Enter your database connection string: " DB_URL
fi

echo ""
echo "✅ Supabase setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add DATABASE_URL to your .env.local file:"
echo "   DATABASE_URL=$DB_URL"
echo ""
echo "2. Run migrations:"
echo "   npm run migrate:supabase"
echo ""
echo "3. For local development:"
echo "   supabase start"
echo ""

