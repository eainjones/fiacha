#!/usr/bin/env bash
#
# dev-clean.sh - Kill stale Next.js/node processes and free ports before starting dev server
#
# Usage:
#   ./scripts/dev-clean.sh          # clean up only
#   npm run dev:clean               # clean up then start dev server (see package.json)

set -euo pipefail

PORT="${1:-4000}"

echo "[dev-clean] Checking for stale processes on port $PORT..."

# Kill any process holding the target port
PIDS=$(lsof -ti :"$PORT" 2>/dev/null || true)
if [ -n "$PIDS" ]; then
  echo "[dev-clean] Found processes on port $PORT: $PIDS"
  echo "$PIDS" | xargs kill -9 2>/dev/null || true
  echo "[dev-clean] Killed stale processes on port $PORT"
else
  echo "[dev-clean] Port $PORT is free"
fi

# Kill orphaned next-server processes from previous dev sessions
NEXT_PIDS=$(pgrep -f "next-server" 2>/dev/null || true)
if [ -n "$NEXT_PIDS" ]; then
  echo "[dev-clean] Found orphaned next-server processes: $NEXT_PIDS"
  echo "$NEXT_PIDS" | xargs kill -9 2>/dev/null || true
  echo "[dev-clean] Killed orphaned next-server processes"
fi

# Kill orphaned next-router-worker processes
ROUTER_PIDS=$(pgrep -f "next-router-worker" 2>/dev/null || true)
if [ -n "$ROUTER_PIDS" ]; then
  echo "[dev-clean] Found orphaned next-router-worker processes: $ROUTER_PIDS"
  echo "$ROUTER_PIDS" | xargs kill -9 2>/dev/null || true
  echo "[dev-clean] Killed orphaned next-router-worker processes"
fi

echo "[dev-clean] Cleanup complete"
