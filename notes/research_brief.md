# Algorithmic Research Brief: Promise Fulfilment & Commitment Scoring

## Context & Goals
Fiacha tracks Irish political promises and needs an evidence-based method for classifying fulfilment status (kept, partially kept, broken, pending) and rolling the results into an overall "commitment score" per politician. The current application stores promises, politicians, and supporting evidence (see `db/schema.sql`, `lib/db.ts`). We seek a researcher to design and validate an algorithmic framework that can be implemented within the existing Next.js/Postgres stack.

## Key Questions
1. How can we normalise free-form promises into structured statements with measurable outcomes?
2. What signals and data sources allow us to infer completion, partial completion, or failure with defensible confidence?
3. How should multiple promises aggregate into a single commitment score that reflects impact, timeliness, and transparency?
4. What annotation process is required to bootstrap supervised or weakly supervised models, and how much human oversight is needed long term?

## Deliverables
- A literature and tooling review covering civic-tech scorecards, policy tracking, and relevant ML/NLP approaches.
- Proposed scoring methodology with clear formulas or pseudo-code, including weighting logic for promise importance, recency, and evidence strength.
- Evaluation plan with metrics (precision/recall, inter-rater agreement) and recommended dataset sizes.
- Implementation roadmap outlining data ingestion, model training, and deployment considerations compatible with our TypeScript backend.
- Prototype artifacts (model notebooks, annotated datasets, API sketches) if time allows.

## Data Inputs & Resources
- Existing schema supports `promises`, `politicians`, and `evidence`; researcher should review `db/schema.sql` and adjust as needed.
- Manual and crowd-sourced evidence (news articles, parliamentary transcripts, budget outcomes) will be available; expect mixed data quality.
- Notes in `notes/development_flow.md` contain current manual workflows; researcher can use curl examples for API exploration.
- External APIs of interest: Oireachtas API, Irish budget documents, verified news archives, NGOs tracking policy outcomes.

## Methodology Expectations
- Combine rule-based checks (e.g., vote recorded, budget line funded) with probabilistic/NLP techniques (semantic similarity, entailment, fact verification).
- Evaluate transformer-based language models for entity extraction and evidence alignment; assess feasibility of fine-tuning vs. retrieval-augmented inference.
- Consider Bayesian or survival-analysis models for decaying promise relevance over time.
- Recommend data labeling strategy (expert annotation, crowd workflow, active learning) and QA processes.

## Timeline & Collaboration
- Discovery & literature review: 2 weeks.
- Initial methodology proposal & feedback cycle: 1 week.
- Prototype experiments & evaluation plan: 2–3 weeks.
- Final handoff (documentation, roadmap, datasets): 1 week.
- Total engagement: ~6–7 weeks with weekly check-ins via shared docs and optional Loom updates.

## Success Criteria
- Clear, defensible rubric for promise status classification accepted by product stakeholders.
- Commitment score model explainable to the public and auditable by reviewers.
- Prototype or pseudo-code that engineering can implement without major rework.
- Identified data gaps, ethical considerations, and risk mitigation plan (bias, misclassification, appeals).

## Collaboration Details
- Primary contact: engineering lead/maintainer (GitHub issues in this repo).
- Working artifacts: GitHub project board, shared Notion/Google Drive, version-controlled notebooks.
- Required access: read-only databases, curated evidence corpus, API keys for external data sources.
- Deliverables should be licensed for internal use, with citations for third-party datasets or models.
