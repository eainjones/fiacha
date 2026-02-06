-- Add index for ORDER BY created_at DESC (used on every promise list page)
CREATE INDEX IF NOT EXISTS idx_promises_created_at ON promises(created_at DESC);

-- Add index for ORDER BY updated_at DESC
CREATE INDEX IF NOT EXISTS idx_promises_updated_at ON promises(updated_at DESC);
