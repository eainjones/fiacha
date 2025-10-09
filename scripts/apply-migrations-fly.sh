#!/bin/bash

# Apply all database migrations on Fly.io by connecting through the app container.
# Usage: ./scripts/apply-migrations-fly.sh <app-name>
# Example: ./scripts/apply-migrations-fly.sh fiacha-staging

set -e

APP_NAME=${1:-fiacha-staging}

echo "🚀 Applying migrations to $APP_NAME..."

echo "📊 Preparing SQL payload..."

TEMP_FILE=$(mktemp /tmp/fiacha-migrations-XXXX.sql)
trap 'rm -f "$TEMP_FILE"' EXIT

MIGRATION_FILES=(
    "db/schema.sql"
    "db/migrations/001_add_geographical_hierarchy.sql"
    "db/migrations/002_seed_local_authorities.sql"
    "db/migrations/003_seed_real_politicians.sql"
    "db/migrations/004_seed_real_promises.sql"
    "db/migrations/005_seed_councillors.sql"
)

for file in "${MIGRATION_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing migration file: $file"
        exit 1
    fi
    cat "$file" >> "$TEMP_FILE"
    echo "\n" >> "$TEMP_FILE"
done

echo "✅ SQL bundle ready: $TEMP_FILE"

echo "🔌 Connecting via flyctl ssh console..."

if flyctl ssh console -a "$APP_NAME" -C "psql \$DATABASE_URL" < "$TEMP_FILE"; then
    echo "✨ All migrations applied successfully!"
else
    echo "❌ Migration failed. Combined script preserved at: $TEMP_FILE"
    exit 1
fi
