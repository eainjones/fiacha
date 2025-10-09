# Synthetic Expert Assessment: Promise Fulfilment Algorithms

## 1. Political Methodologist Perspective
- **Core Premise**: Promises align with policy commitments, legislative actions, and spending outcomes. Evaluate fulfilment along observable institutional milestones.
- **Draft Algorithm A — Policy Milestone Tracker**
  1. Normalise each promise into `(policy_area, target_outcome, due_date)` using controlled vocabularies.
  2. Query institutional datasets (Oireachtas votes, programme for government updates, budget releases) for matching milestones.
  3. Score milestone completion: `bill_passed`, `budget_allocated`, `implementation_reported` (boolean flags).
  4. Derive status: kept if all required milestones true; partially kept if legislative stage complete but implementation flag false; broken if due_date passed with no milestone.
  5. Attach qualitative notes referencing official documents for public transparency.
- **Strengths**: High transparency, auditable; leverages structured government data.
- **Risks**: Some promises lack direct legislative artefacts; requires continual monitoring of official sources.

## 2. NLP Scientist Perspective
- **Core Premise**: Apply retrieval-augmented NLP to align free-text promises with evidence from news and reports.
- **Draft Algorithm B — Evidence Alignment Classifier**
  1. Ingest promise text and encode with transformer embeddings (e.g., `all-mpnet-base-v2`).
  2. Retrieve top-k evidence documents using dense retrieval over curated corpus (news, NGO reports, FOI releases).
  3. Run textual entailment / fact verification model (e.g., fine-tuned DeBERTa) on `(promise, evidence)` pairs.
  4. Aggregate entailment probabilities with time decay: `score = Σ (p_entailment * recency_weight * source_trust)`.
  5. Classify status: kept if score ≥ 0.75, partial if 0.45–0.74, pending if <0.45 but within deadline, broken if <0.45 and past deadline.
- **Strengths**: Scales to unstructured evidence; adaptable to new domains.
- **Risks**: Requires labeled data for fine-tuning; susceptible to hallucinated entailment if retrieval quality low.

## 3. Data Ethicist & Governance Perspective
- **Core Premise**: Ensure algorithm outputs are explainable, bias-aware, and appealable.
- **Draft Algorithm C — Confidence & Oversight Layer**
  1. For each promise status from Algorithms A/B, compute confidence intervals based on data coverage and source diversity.
  2. Flag items with `confidence < 0.6` or conflicting signals for human review.
  3. Record decision provenance (sources, reviewer, timestamp) in audit log.
  4. Provide public-facing rationale template summarising factors and outstanding evidence gaps.
  5. Surface fairness analytics (distribution of broken/kept by party, gender) to monitor systemic bias.
- **Strengths**: Builds public trust; ready-made appeal process.
- **Risks**: Adds operational overhead; requires governance tooling.

## 4. Integrated Commitment Score
- **Draft Algorithm D — Weighted Recency Commitment Score**
  1. Merge statuses and confidences: `status_score` mapping (`kept=1`, `partial=0.6`, `pending=0.4`, `broken=0`).
  2. Weight each promise by `(impact_weight * recency_decay * confidence)`.
  3. Compute `commitment_score = (Σ status_score_i * weight_i) / Σ weight_i`.
  4. Impact weight suggestions: baseline 1.0, +0.5 for national scope, +0.3 for budget ≥ €100M, +0.2 if manifesto flagship.
  5. Recency decay: `decay = exp(-λ * months_since_update)` with λ set so half-life ≈ 18 months.
  6. Publish score, 95% confidence interval (bootstrapped), and top explanatory factors (e.g., "3 flagship housing promises broken").

## 5. Next Actions for Researcher
- Validate controlled vocabularies and milestone mappings with policy experts.
- Assemble labeled dataset of promises with known outcomes to calibrate entailment thresholds.
- Prototype retrieval pipeline using small evidence corpus; measure precision/recall.
- Design reviewer dashboard capturing confidence, rationale, and appeal workflow.
- Stress-test commitment score against historical politicians to ensure face validity.
