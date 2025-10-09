#!/bin/bash
flyctl ssh console -a fiacha-db -C '
psql postgres://postgres:m2XKHjan3ahmbxz@localhost:5432/fiacha <<EOF
CREATE TABLE IF NOT EXISTS politicians (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  party VARCHAR(100),
  constituency VARCHAR(100),
  role VARCHAR(100),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promises (
  id SERIAL PRIMARY KEY,
  politician_id INTEGER REFERENCES politicians(id),
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(100),
  promise_date DATE,
  target_date DATE,
  status VARCHAR(50) DEFAULT '"'pending'"',
  score INTEGER CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evidence (
  id SERIAL PRIMARY KEY,
  promise_id INTEGER REFERENCES promises(id),
  source_type VARCHAR(50),
  source_url TEXT,
  title TEXT,
  description TEXT,
  published_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS status_history (
  id SERIAL PRIMARY KEY,
  promise_id INTEGER REFERENCES promises(id),
  status VARCHAR(50) NOT NULL,
  score INTEGER,
  rationale TEXT,
  evidence_ids INTEGER[],
  changed_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  promise_id INTEGER REFERENCES promises(id),
  title TEXT NOT NULL,
  description TEXT,
  milestone_date DATE,
  achieved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promises_politician ON promises(politician_id);
CREATE INDEX IF NOT EXISTS idx_promises_status ON promises(status);
CREATE INDEX IF NOT EXISTS idx_promises_category ON promises(category);
CREATE INDEX IF NOT EXISTS idx_evidence_promise ON evidence(promise_id);
CREATE INDEX IF NOT EXISTS idx_status_history_promise ON status_history(promise_id);
CREATE INDEX IF NOT EXISTS idx_milestones_promise ON milestones(promise_id);
EOF
'
