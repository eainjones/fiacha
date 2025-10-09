# Promise Scoring Research Roadmap

## Phase 1 – Foundations (Week 1–2)
- **Assemble Evidence Corpus**: curate 200–300 articles and official documents across housing, health, taxation; capture source metadata (publisher, date, URL, document type) in CSV.
- **Promise Normalisation Pilot**: label 50 promises with structured fields (policy_area, measurable_outcome, due_date, impact_flag). Use shared spreadsheet for quick iteration.
- **Tooling Setup**: prepare shared notebooks (Jupyter or Observable) with access to Postgres read replica and object storage for documents; configure GitHub project board.

## Phase 2 – Algorithm Prototyping (Week 3–5)
- **Milestone Tracker Prototype**: ingest Oireachtas vote records and budget line items; build rules mapping to promises; evaluate on labeled set for precision/recall.
- **Evidence Alignment Pipeline**: implement dense retrieval (e.g., sentence-transformers) over evidence corpus; fine-tune textual entailment model using labeled promise/evidence pairs.
- **Confidence Layer Design**: define confidence schema (`coverage`, `source_diversity`, `model_agreement`) and implement scoring logic; integrate manual review workflow in Notion/GitHub.

## Phase 3 – Commitment Score & Validation (Week 6–7)
- **Score Aggregation Model**: operationalise weighting formula from `notes/expert_assessment.md` (impact, recency decay, confidence). Produce reproducible notebook outputting per-politician scores.
- **Fairness & Ethics Review**: run bias diagnostics (score distribution by party/gender, data coverage gaps) and document mitigations.
- **Reviewer Dashboard Spec**: outline UI requirements for internal reviewers (status history, evidence list, override controls) plus audit log structure.

## Phase 4 – Handoff (Week 8)
- **Documentation Bundle**: final report including methodology, data schema changes, evaluation metrics, limitations, and go-live checklist.
- **Implementation Plan**: backlog tickets for engineering (API endpoints, background jobs, moderation tooling) with estimates.
- **Training Session**: schedule walkthrough for maintainers covering annotation workflow, dashboard, and appeal process.

## Immediate Actions
1. Share `notes/research_brief.md` and this roadmap with shortlisted researchers.
2. Secure access to Oireachtas API, news archives, and internal Postgres snapshot.
3. Prepare annotation template and recruit pilot annotators for Week 1.
