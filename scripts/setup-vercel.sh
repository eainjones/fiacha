#!/bin/bash
# Setup Vercel projects for staging and production

set -e

echo "🚀 Setting up Vercel for Fiacha (Staging & Production)..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI is not installed."
  echo "Install it with: npm i -g vercel"
  exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
  echo "📝 Please log in to Vercel:"
  vercel login
fi

echo ""
echo "Current Vercel user: $(vercel whoami)"
echo ""

# Check if GitHub remote exists
if ! git remote get-url origin &> /dev/null; then
  echo "⚠️  No GitHub remote found."
  echo ""
  read -p "Do you want to add a GitHub remote? (y/n): " add_remote
  if [ "$add_remote" = "y" ]; then
    read -p "Enter your GitHub repository URL: " github_url
    git remote add origin "$github_url"
    echo "✅ Added GitHub remote"
  fi
fi

echo ""
echo "Choose setup method:"
echo "1. Single project with branch-based environments (Recommended)"
echo "   - Main branch → Production"
echo "   - Staging branch → Staging"
echo "   - PRs → Preview"
echo ""
echo "2. Two separate projects"
echo "   - fiacha-production project"
echo "   - fiacha-staging project"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
  echo ""
  echo "📦 Setting up single project with branch-based environments..."
  echo ""
  
  # Link project (will create if doesn't exist)
  echo "Linking Vercel project..."
  vercel link
  
  echo ""
  echo "✅ Project linked!"
  echo ""
  echo "Next steps:"
  echo "1. Push your code to GitHub:"
  echo "   git add ."
  echo "   git commit -m 'Setup Vercel and Supabase'"
  echo "   git push origin main"
  echo ""
  echo "2. Create staging branch:"
  echo "   git checkout -b staging"
  echo "   git push -u origin staging"
  echo ""
  echo "3. In Vercel dashboard, configure:"
  echo "   - Production Branch: main"
  echo "   - Go to Settings → Git"
  echo "   - Connect your GitHub repository"
  echo ""
  echo "4. Set environment variables:"
  echo "   vercel env add DATABASE_URL production"
  echo "   vercel env add DATABASE_URL preview"
  echo ""
  
elif [ "$choice" = "2" ]; then
  echo ""
  echo "📦 Setting up two separate projects..."
  echo ""
  
  # Production project
  echo "Creating production project..."
  vercel link --prod --name fiacha-production --yes
  
  echo ""
  echo "Creating staging project..."
  mkdir -p .vercel-staging
  cd .vercel-staging
  vercel link --name fiacha-staging --yes
  cd ..
  
  echo ""
  echo "✅ Both projects created!"
  echo ""
  echo "Next steps:"
  echo "1. Set environment variables for production:"
  echo "   vercel env add DATABASE_URL production --scope fiacha-production"
  echo ""
  echo "2. Set environment variables for staging:"
  echo "   vercel env add DATABASE_URL preview --scope fiacha-staging"
  echo ""
  echo "3. Deploy:"
  echo "   vercel --prod --scope fiacha-production  # Production"
  echo "   vercel --scope fiacha-staging             # Staging"
  echo ""
else
  echo "Invalid choice"
  exit 1
fi

echo ""
echo "📋 Get your Supabase connection string from:"
echo "https://supabase.com/dashboard/project/hgjefllkbbwevpyiazhx/settings/database"
echo ""
echo "✅ Setup complete!"

