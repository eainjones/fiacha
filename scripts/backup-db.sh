#!/bin/bash
# Production database backup script
# Usage: ./scripts/backup-db.sh
#
# With Supabase Branching, staging branches are disposable and don't need
# backups. This script targets the persistent production project only.

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PROJECT_REF="hgjefllkbbwevpyiazhx"

mkdir -p "$BACKUP_DIR"

echo "Backing up production database..."
echo "Project: $PROJECT_REF"

BACKUP_FILE="$BACKUP_DIR/production-$TIMESTAMP.sql"
supabase db dump -f "$BACKUP_FILE" --project-ref "$PROJECT_REF"

echo "Backup saved: $BACKUP_FILE"
echo "  Size: $(du -h "$BACKUP_FILE" | cut -f1)"
