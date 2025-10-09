# Data Collection Plan: Wexford County Council Minutes

## Objective
Compile outcomes on promises related to Wexford County Council by parsing meeting minutes, plans, publications, and reports available at:
https://www.wexfordcoco.ie/council-and-democracy/council-minutes-plans-publications-and-reports/county-council-meetings

## Scope
- Extract agenda items, motions, resolutions, and follow-up actions from County Council meeting documents.
- Track commitments that intersect with Fiacha promises (housing, infrastructure, public services, fiscal pledges).
- Capture document metadata: meeting date, document type (minutes/reports), section, and page/paragraph reference.

## Workflow for Research Team
1. **Inventory Documents**
   - Crawl the index page to list all available PDFs/HTML for meetings (target at least 2018–present).
   - Record download URLs, publication dates, and file types in a tracking spreadsheet.
2. **Download & Storage**
   - Save files to shared object storage (e.g., `evidence/wexford/` bucket) using naming pattern `YYYY-MM-DD_wexford_meeting.pdf`.
   - Maintain checksum log to avoid duplicates.
3. **Parsing**
   - Use PDF-to-text tools (`pdftotext`, `pdfminer.six`) or OCR (Tesseract) for scanned documents.
   - Normalize output to UTF-8 plain text; persist raw text alongside original file.
4. **Promise Extraction**
   - Identify sections describing commitments, motions carried, or action items.
   - Tag entries with categories (policy area, responsible council member, funding amount if mentioned).
   - Capture quoted text plus paraphrased summary suitable for promise database ingestion.
5. **Outcome Tracking**
   - For each promise-like item, note explicit outcomes (approved, deferred, rejected) and any follow-up deadlines.
   - Flag unresolved items for ongoing monitoring.
6. **Data Structure**
   - Store structured records in CSV/JSON with fields: `meeting_date`, `source_url`, `agenda_item`, `promise_summary`, `status`, `evidence_excerpt`, `page_reference`, `category`, `confidence`.
7. **Quality Review**
   - Conduct double-coding on 10% sample to ensure consistency.
   - Document ambiguous cases and escalate to subject matter expert for resolution.

## Tooling Suggestions
- Crawling: `requests` + `BeautifulSoup` or `wget` with `--recursive` (respect robots.txt).
- Parsing: `pdfminer.six`, `PyMuPDF`, `textract` for mixed media.
- Annotation: Airtable/Notion database or shared Google Sheet with validation rules.
- Version Control: Check raw text and structured exports into `data/wexford/` folder in repo or dedicated storage.

## Deliverables
- Evidence corpus with original files and extracted text.
- Structured dataset of council promises/outcomes ready for ingestion into promise normalization pipeline.
- Summary memo highlighting key commitments, recurring themes, and data quality issues.

## Immediate Next Steps
1. Assign a lead researcher to own the Wexford council stream.
2. Provision shared storage location and checklist template.
3. Begin document inventory and report preliminary coverage by end of Week 1.
