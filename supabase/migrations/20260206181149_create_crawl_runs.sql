-- Crawl Run Monitoring
-- Logs each cron crawl execution for admin visibility.

CREATE TABLE IF NOT EXISTS crawl_runs (
  id            SERIAL PRIMARY KEY,
  pipeline      TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'running',
  promises_found    INTEGER DEFAULT 0,
  politicians_matched INTEGER DEFAULT 0,
  queued_for_review INTEGER DEFAULT 0,
  error_count   INTEGER DEFAULT 0,
  error_message TEXT,
  duration_ms   INTEGER,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crawl_runs_started_at ON crawl_runs (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawl_runs_pipeline ON crawl_runs (pipeline, started_at DESC);
