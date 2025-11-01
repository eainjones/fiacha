# Fiacha Researcher Guide

Welcome to the Fiacha research team! This guide will help you accurately track Irish politicians and their promises.

## Mission

Fiacha is Ireland's political promise tracker. Our goal is to hold politicians accountable by tracking what they promise and whether they deliver. Your role is to:

1. Keep politician information up-to-date
2. Document political promises with evidence
3. Track promise status changes with citations
4. Maintain accuracy and impartiality

## Getting Started

### 1. Request Access
Contact the project administrator to get:
- Sign-in credentials for https://fiacha.vercel.app
- Assignment of counties/regions to research

### 2. Sign In
1. Go to https://fiacha.vercel.app/auth/sign-in
2. Sign in with your credentials
3. Click "+ Add New" in the navigation

## Current Data Coverage

### Complete Coverage (TDs + Councillors)
- ✅ Dublin (69 total)
- ✅ Cork (45 total)
- ✅ Wexford (39 total)
- ✅ Cavan (22 total)
- ✅ Carlow (20 total)
- ✅ Galway (17 total)

### Needs Councillors (TDs Only)
- ⚠️ Kildare, Meath, Limerick, Tipperary, Mayo, Louth, Wicklow, Kerry, Donegal
- ⚠️ Sligo, Clare, Waterford, Roscommon, Kilkenny, Laois, Longford
- ⚠️ Offaly, Westmeath, Monaghan

### Needs Everything
- ❌ Leitrim (no data)

## Part 1: Adding Politicians

### Data Sources

#### For TDs (Teachta Dála)
**Primary Source**: [Oireachtas.ie Members](https://www.oireachtas.ie/en/members/)
- Official government database
- Always up-to-date
- Includes contact info and constituency

**What to Record**:
- Full legal name (e.g., "Mary Lou McDonald")
- Party affiliation
- Constituency (e.g., "Dublin Central")
- Role (e.g., "Tánaiste", "Minister for Finance", "TD")

#### For Councillors
**Primary Sources**:
1. County Council websites (see list below)
2. [LocalAuthorities.ie](https://www.localauthority.ie/)
3. Local newspaper archives
4. Council meeting minutes

**What to Record**:
- Full name
- Party affiliation (or "Independent")
- County
- Local Authority (e.g., "Dublin City Council", "Cork County Council")
- Electoral Area / LEA (e.g., "Ballyfermot-Drimnagh", "Cobh")
- Role (e.g., "Councillor", "Mayor", "Cathaoirleach")

### County Council Websites

**Connacht**:
- Galway: https://www.galway.ie/
- Leitrim: https://www.leitrimcoco.ie/
- Mayo: https://www.mayo.ie/
- Roscommon: https://www.roscommoncoco.ie/
- Sligo: https://www.sligococo.ie/

**Leinster**:
- Carlow: https://www.carlow.ie/
- Dublin: https://www.dublincity.ie/ (and DLR, Fingal, South Dublin)
- Kildare: https://kildare.ie/
- Kilkenny: https://www.kilkennycoco.ie/
- Laois: https://www.laois.ie/
- Longford: https://www.longfordcoco.ie/
- Louth: https://www.louthcoco.ie/
- Meath: https://www.meath.ie/
- Offaly: https://www.offaly.ie/
- Westmeath: https://www.westmeathcoco.ie/
- Wexford: https://www.wexford.ie/
- Wicklow: https://www.wicklow.ie/

**Munster**:
- Clare: https://www.clare.ie/
- Cork: https://www.corkcoco.ie/ (County) and https://www.corkcity.ie/ (City)
- Kerry: https://www.kerrycoco.ie/
- Limerick: https://www.limerick.ie/
- Tipperary: https://www.tipperarycoco.ie/
- Waterford: https://www.waterfordcouncil.ie/

**Ulster (Republic)**:
- Cavan: https://www.cavancoco.ie/
- Donegal: https://www.donegalcoco.ie/
- Monaghan: https://www.monaghan.ie/

### Adding a Politician

1. Click "+ Add New" → "Add Politician" tab
2. Fill in the form:
   - **Name**: Full legal name (required)
   - **Party**: Select from dropdown or type if not listed
   - **Constituency**: For TDs, use Dáil constituency name. For Councillors, use Electoral Area
   - **Role**: TD, Councillor, Minister, Tánaiste, etc.
3. Click "Add Politician"

**Quality Checklist**:
- ✓ Spelled name correctly (check official source)
- ✓ Used official party name (not nickname)
- ✓ Constituency matches official records
- ✓ Included ministerial role if applicable

## Part 2: Recording Promises

### What Counts as a Promise?

A promise is a **specific, verifiable commitment** made by a politician. It must be:

1. **Specific**: Not vague ("improve healthcare" ❌ vs "build 300,000 homes by 2030" ✓)
2. **Public**: Made in an official capacity (speech, manifesto, interview)
3. **Actionable**: Something that can be done or measured
4. **Time-bound**: Has or implies a deadline

### Promise Categories

- Housing
- Health
- Childcare
- Education
- Transport
- Climate
- Employment
- Taxation
- Social Welfare
- Law & Order
- Infrastructure
- Other

### Sources for Promises

**Tier 1 (Most Reliable)**:
1. Official party manifestos
2. Oireachtas debates (searchable at oireachtas.ie)
3. Ministerial statements
4. Government press releases

**Tier 2 (Reliable with Citation)**:
1. RTÉ News reports
2. The Irish Times
3. The Irish Independent
4. The Journal.ie
5. Local newspapers (Nationalist, Echo, etc.)

**Tier 3 (Use with Caution)**:
1. Social media (only for direct quotes from verified accounts)
2. Campaign materials
3. Party websites

### Adding a Promise

1. Click "+ Add New" → "Add Promise" tab
2. Select the politician from dropdown
3. Fill in:
   - **Title**: Brief summary (e.g., "Deliver 300,000 new homes by 2030")
   - **Description**: Full details with context
   - **Category**: Select most appropriate
   - **Promise Date**: When the promise was made
   - **Target Date**: When it should be completed (if stated)
4. Click "Add Promise"

**Promise Title Guidelines**:
- Start with action verb (Deliver, Build, Increase, Reduce, Introduce)
- Be specific with numbers
- Keep under 100 characters
- Examples:
  - ✓ "Build 300,000 homes by 2030"
  - ✓ "Reduce income tax for workers earning under €100k"
  - ✓ "Introduce statutory home care scheme"
  - ❌ "Help people"
  - ❌ "Fix housing crisis"

**Description Best Practices**:
- Provide full context
- Quote directly when possible
- Note conditions or qualifications
- Keep objective tone (no editorializing)

Example:
```
Title: Build 100,000 affordable and social homes
Description: Sinn Féin committed to building 100,000 affordable
and social homes over the lifetime of government, as stated in
their 2024 general election manifesto. This includes both local
authority housing and cost-rental schemes.
```

## Part 3: Tracking Promise Status

### Status Definitions

**Pending**: Default status when promise is added. No clear progress yet.

**In Progress**: Visible steps being taken toward fulfillment:
- Legislation drafted
- Budget allocated
- Program announced
- Construction/implementation begun

**Completed**: Promise fully delivered:
- Legislation passed AND enacted
- Target numbers reached
- Program operational
- Infrastructure completed

**Broken**: Promise explicitly abandoned or contradicted:
- Public statement withdrawing promise
- Opposite action taken
- Deadline passed with no progress
- U-turn or policy reversal

**Compromised**: Partially fulfilled or modified:
- Lower numbers delivered
- Watered-down version
- Delayed but still happening
- Conditions not met

### Evidence Requirements

Every status change MUST have evidence:

**For "In Progress"**:
- Government announcement
- Budget allocation
- Bill publication
- News report showing concrete action

**For "Completed"**:
- Official government statistics
- Signed legislation
- News reports confirming completion
- Independent verification

**For "Broken"**:
- Quote from politician admitting failure
- Deadline passed with official statement
- Policy reversal announcement
- Budget showing no allocation

**For "Compromised"**:
- Official statistics showing partial delivery
- Revised target announcement
- News analysis

### Citation Format

When documenting evidence, include:
1. Source name
2. Date
3. URL (if online)
4. Direct quote (if applicable)

Example:
```
Source: The Irish Times
Date: 15 January 2025
URL: https://www.irishtimes.com/...
Quote: "Minister confirms only 50,000 homes built,
falling short of 100,000 target"
```

## Quality Standards

### Accuracy First
- Always verify with primary sources
- When in doubt, leave blank rather than guess
- Flag inconsistencies for review

### Impartiality
- Use neutral language
- Record promises from ALL parties equally
- No editorializing or personal opinions
- Let the data speak for itself

### Consistency
- Use official party names (not abbreviations)
- Standardize constituency names
- Use proper diacritics (é, á) in Irish names
- Date format: DD/MM/YYYY or use date picker

### Citations
- Always include source
- Link to original when possible
- Quote directly for key claims
- Note if information is reported vs confirmed

## Common Scenarios

### Scenario 1: Promise Made in Opposition
**Q**: Should I record promises made by opposition TDs?
**A**: Yes! Track promises from all politicians, regardless of party or position.

### Scenario 2: Vague Promises
**Q**: TD says they'll "improve healthcare". Should I record this?
**A**: No. Wait for specific commitments with measurable outcomes.

### Scenario 3: Local vs National Promises
**Q**: Councillor promises to fix potholes on Main Street. Record it?
**A**: Yes! Local promises count. Be specific about location and scope.

### Scenario 4: Collective Promises
**Q**: Government (not individual) makes promise. Who gets credit?
**A**: Assign to relevant minister (e.g., housing minister for housing promises).

### Scenario 5: Changed Timeline
**Q**: Promise originally said 2025, now saying 2027. What status?
**A**: Mark as "Compromised" with evidence of timeline change.

### Scenario 6: Conflicting Information
**Q**: TD says promise completed, but stats show otherwise?
**A**: Follow the evidence. If stats are reliable, status is "Compromised" or still "In Progress".

## Research Workflow

### Daily Tasks (15-30 minutes)
1. Check assigned county council websites for updates
2. Scan local newspapers for new promises
3. Review Oireachtas debates for your assigned TDs
4. Update any promise statuses with new evidence

### Weekly Tasks (1-2 hours)
1. Review national news for major announcements
2. Check for new councillors (elections, co-options)
3. Update promise progress based on government reports
4. Cross-reference with other researchers to avoid duplicates

### Monthly Tasks (2-3 hours)
1. Audit your county data for completeness
2. Review and update outdated information
3. Add newly elected officials
4. Archive retired politicians

## Researcher Ethics

### Do:
- ✓ Be thorough and accurate
- ✓ Cite all sources
- ✓ Flag uncertainties
- ✓ Treat all parties equally
- ✓ Update outdated information
- ✓ Collaborate with other researchers
- ✓ Ask questions when unsure

### Don't:
- ✗ Editorialize or add opinions
- ✗ Make assumptions without evidence
- ✗ Copy from Wikipedia without verification
- ✗ Rush to mark promises as broken
- ✗ Ignore small or local promises
- ✗ Duplicate other researchers' work
- ✗ Leave obvious errors uncorrected

## Getting Help

### Technical Issues
- Can't sign in
- Website not loading
- Form not submitting

**Contact**: Project administrator

### Content Questions
- Not sure if something is a promise
- Conflicting information sources
- Can't find official data

**Solution**:
1. Check this guide first
2. Ask fellow researchers
3. Flag for editorial review

### Ethical Concerns
- Pressure to bias data
- Unsure about source reliability
- Political controversy

**Action**:
1. Document concerns
2. Report to project lead
3. Do not compromise accuracy

## Quick Reference

### Top 5 Rules
1. Accuracy over speed
2. Always cite sources
3. No opinions, just facts
4. Verify before publishing
5. When in doubt, ask

### Red Flags
- Information only from one source
- Vague or immeasurable promises
- No date available
- Source is clearly biased
- Can't find official confirmation

### Research Time Estimates
- Adding one TD: 5 minutes
- Adding one Councillor: 5-10 minutes
- Adding one promise: 10-15 minutes
- Updating promise status: 5-10 minutes
- Researching a county: 2-3 hours

## Appendix: Irish Political Terms

**Dáil Éireann**: Lower house of parliament (like House of Commons)
**Seanad Éireann**: Upper house (Senate)
**TD (Teachta Dála)**: Member of Dáil (MP equivalent)
**Taoiseach**: Prime Minister
**Tánaiste**: Deputy Prime Minister
**Oireachtas**: Irish Parliament (Dáil + Seanad)
**LEA**: Local Electoral Area
**Cathaoirleach**: Chairperson of council
**Comhairle**: Council

## Version History

- **v1.0** (January 2025): Initial researcher guide

---

**Questions?** Contact the Fiacha project team.

**Updates to this guide?** Submit suggestions to improve it!
