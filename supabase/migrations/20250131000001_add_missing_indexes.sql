-- Add missing indexes for frequently-filtered columns

-- Politicians filtered by active status on nearly every query
CREATE INDEX IF NOT EXISTS idx_politicians_active ON politicians(active);

-- Politicians joined to parties table frequently
CREATE INDEX IF NOT EXISTS idx_politicians_party_id ON politicians(party_id);

-- Review queue filtered by status (table may not exist in all environments)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promise_review_queue') THEN
    CREATE INDEX IF NOT EXISTS idx_review_queue_status ON promise_review_queue(status);
  END IF;
END $$;

-- Composite index for promise list queries (politician + status + date ordering)
CREATE INDEX IF NOT EXISTS idx_promises_politician_status_date ON promises(politician_id, status, created_at DESC);

-- Add named FK constraint from politicians to parties if no FK exists on party_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.key_column_usage kcu
    JOIN information_schema.table_constraints tc
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'politicians'
    AND kcu.column_name = 'party_id'
  ) THEN
    ALTER TABLE politicians ADD CONSTRAINT fk_politicians_party
    FOREIGN KEY (party_id) REFERENCES parties(id);
  END IF;
END $$;
