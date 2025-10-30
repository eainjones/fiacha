#!/bin/bash
# Script to help connect GitHub repository to Vercel

set -e

echo "🔗 Connecting GitHub Repository to Vercel"
echo ""

# Check if already has remote
if git remote get-url origin &> /dev/null; then
  echo "✅ GitHub remote already exists:"
  git remote -v
  echo ""
  read -p "Do you want to use this remote? (y/n): " use_existing
  if [ "$use_existing" != "y" ]; then
    read -p "Enter new GitHub repository URL: " github_url
    git remote set-url origin "$github_url"
  fi
else
  echo "No GitHub remote found."
  echo ""
  echo "Options:"
  echo "1. Create a new GitHub repository"
  echo "2. Connect to existing GitHub repository"
  echo ""
  read -p "Enter choice (1 or 2): " choice
  
  if [ "$choice" = "1" ]; then
    echo ""
    echo "📝 To create a new repository:"
    echo "1. Go to https://github.com/new"
    echo "2. Create repository named 'fiacha'"
    echo "3. Don't initialize with README (we already have code)"
    echo ""
    read -p "Enter your GitHub username: " github_username
    read -p "Repository name (default: fiacha): " repo_name
    repo_name=${repo_name:-fiacha}
    
    github_url="https://github.com/${github_username}/${repo_name}.git"
    echo ""
    echo "Will use: $github_url"
    read -p "Continue? (y/n): " confirm
    
    if [ "$confirm" = "y" ]; then
      git remote add origin "$github_url"
      echo "✅ Added remote: $github_url"
    else
      echo "Cancelled."
      exit 1
    fi
    
  elif [ "$choice" = "2" ]; then
    read -p "Enter GitHub repository URL: " github_url
    git remote add origin "$github_url"
    echo "✅ Added remote: $github_url"
  else
    echo "Invalid choice"
    exit 1
  fi
fi

echo ""
echo "📦 Pushing code to GitHub..."

# Get current branch
current_branch=$(git branch --show-current)

# Push main branch
echo "Pushing $current_branch branch..."
git push -u origin "$current_branch"

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Connect repository in Vercel:"
echo "   https://vercel.com/dashboard"
echo "   → Select 'fiacha' project"
echo "   → Settings → Git → Connect Git Repository"
echo "   → Select your repository"
echo ""
echo "2. Create staging branch:"
echo "   git checkout -b staging"
echo "   git push -u origin staging"
echo ""
echo "3. Set environment variables:"
echo "   vercel env add DATABASE_URL production"
echo "   vercel env add DATABASE_URL preview"
echo ""
echo "✅ Setup complete!"

