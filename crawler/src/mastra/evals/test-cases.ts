/**
 * Test Cases for Extraction Quality Evaluation
 *
 * Curated articles with known promise counts and politician names.
 * Used by eval runner and CI.
 */

export interface TestCase {
  id: string;
  name: string;
  content: string;
  sourceUrl: string;
  expectedPromiseCount: number;
  expectedPoliticians: string[];
  category: 'oireachtas' | 'rss' | 'web';
}

export const TEST_CASES: TestCase[] = [
  // --- Oireachtas PQ with clear ministerial commitment ---
  {
    id: 'oireachtas-housing-1',
    name: 'Housing Minister PQ - specific target',
    content: `Minister for Housing Darragh O'Brien responded to Deputy Eoin Ó Broin:

"The Government will deliver 33,000 new homes this year under Housing for All. We have allocated €4.5 billion specifically for social and affordable housing in Budget 2026. I can confirm that 9,500 new social homes will be built, with a further 6,000 affordable purchase homes and 2,000 cost-rental units."

Deputy Ó Broin: "These targets have been missed before. What accountability measures are in place?"

Minister O'Brien: "I commit to publishing quarterly progress reports and appearing before this committee every six months to account for delivery."`,
    sourceUrl: 'https://www.oireachtas.ie/en/debates/question/12345',
    expectedPromiseCount: 3,
    expectedPoliticians: ["Darragh O'Brien"],
    category: 'oireachtas',
  },

  // --- News article with multiple politicians ---
  {
    id: 'rss-budget-1',
    name: 'Budget announcement with multiple commitments',
    content: `Budget 2026: Key Announcements

Taoiseach Simon Harris announced today that the Government will invest €2 billion in a new National Childcare Scheme, reducing costs for families by 50%.

Minister for Finance Jack Chambers confirmed that the income tax standard rate band will increase by €3,000, benefiting workers earning over €40,000.

Minister for Health Stephen Donnelly pledged to open 1,500 new hospital beds by the end of 2027 and recruit 3,000 additional nurses.

The opposition criticized the budget as insufficient. Sinn Féin leader Mary Lou McDonald said her party would have allocated more to housing.`,
    sourceUrl: 'https://www.rte.ie/news/politics/budget-2026',
    expectedPromiseCount: 3,
    expectedPoliticians: ['Simon Harris', 'Jack Chambers', 'Stephen Donnelly'],
    category: 'rss',
  },

  // --- Article with no promises (should extract 0) ---
  {
    id: 'rss-no-promises-1',
    name: 'Opinion piece with no commitments',
    content: `Analysis: The State of Irish Politics in 2026

Political commentator Noel Whelan reflects on the changing landscape of Irish politics. The coalition government has faced numerous challenges since taking office, including housing supply issues and healthcare waiting lists.

"The public mood has shifted significantly," says Whelan. "Voters are increasingly frustrated with the pace of change."

Recent polls show a decline in support for the government parties, with Sinn Féin maintaining a strong position in opposition. However, no major policy announcements have been made this week.

Historical analysis shows that mid-term polling rarely predicts election outcomes in Ireland.`,
    sourceUrl: 'https://www.irishtimes.com/politics/analysis-2026',
    expectedPromiseCount: 0,
    expectedPoliticians: [],
    category: 'rss',
  },

  // --- Northern Ireland Assembly ---
  {
    id: 'oireachtas-ni-1',
    name: 'NI Assembly - ministerial commitment',
    content: `Northern Ireland Assembly - Plenary Session

First Minister Michelle O'Neill (Sinn Féin) announced a new £500 million investment package for the North's infrastructure.

"We will build 200km of new cycling infrastructure across Belfast, Derry, and Newry by 2028. This commitment includes dedicated bus lanes on all major arterial routes."

Deputy First Minister Emma Little-Pengelly (DUP) endorsed the plan, adding: "We will also create 5,000 apprenticeship positions in construction to support this programme."`,
    sourceUrl: 'https://aims.niassembly.gov.uk/plenary/12345',
    expectedPromiseCount: 3,
    expectedPoliticians: ["Michelle O'Neill", 'Emma Little-Pengelly'],
    category: 'oireachtas',
  },

  // --- Government press release ---
  {
    id: 'web-press-release-1',
    name: 'Government press release - climate action',
    content: `Press Release: Climate Action Plan Progress Update

Minister for the Environment Eamon Ryan today published the Climate Action Plan quarterly update.

Key commitments:
- Ireland will reduce greenhouse gas emissions by 51% by 2030 compared to 2018 levels
- The Government will install 2 GW of offshore wind capacity by 2030
- A new retrofit scheme will upgrade 500,000 homes to BER B2 standard by 2030
- Electric vehicle charging points will increase to 100,000 nationally by 2028

Minister Ryan stated: "We are on track to meet our climate targets. The Government remains fully committed to delivering on these ambitious goals."`,
    sourceUrl: 'https://www.gov.ie/en/press-release/climate-action-2026',
    expectedPromiseCount: 4,
    expectedPoliticians: ['Eamon Ryan'],
    category: 'web',
  },

  // --- Vague content that should produce low/no extraction ---
  {
    id: 'rss-vague-1',
    name: 'Vague political statements without commitments',
    content: `TD Speaks at Conference

Independent TD Michael Lowry addressed supporters at a constituency event in Thurles.

"We need to do more for rural Ireland. The government should be looking at better broadband and road infrastructure. I hope to see improvements in the coming years."

"I've been talking to ministers about these issues and I'm hopeful we'll see progress."

No specific commitments or targets were announced at the event.`,
    sourceUrl: 'https://www.thejournal.ie/politics/lowry-conference',
    expectedPromiseCount: 0,
    expectedPoliticians: [],
    category: 'rss',
  },

  // --- Council-level promise ---
  {
    id: 'web-council-1',
    name: 'Local council commitment',
    content: `Dublin City Council Meeting Minutes

Councillor Donna Cooney (Green Party) proposed a motion to create 50 new public parks in Dublin by 2028. The motion was seconded by Councillor Daithí de Róiste (Fianna Fáil).

Lord Mayor James Geoghegan stated: "Dublin City Council will allocate €25 million from the capital budget to deliver these parks, with the first 10 to be completed by end of 2027."

The motion passed with 42 votes in favour and 11 against.`,
    sourceUrl: 'https://www.dublincity.ie/council-meetings/2026-02',
    expectedPromiseCount: 2,
    expectedPoliticians: ['Donna Cooney', 'James Geoghegan'],
    category: 'web',
  },

  // --- Mixed content with sports (should be filtered) ---
  {
    id: 'rss-mixed-1',
    name: 'Sports article with tangential political mention',
    content: `GAA Championship Preview: Dublin vs Kerry

The All-Ireland Football Championship semi-final between Dublin and Kerry promises to be an epic encounter. Dublin manager Dessie Farrell has assembled a formidable squad.

In related news, Minister for Sport Thomas Byrne confirmed that €50 million will be invested in grassroots GAA facilities over the next three years.

"Every club in the country will benefit from this investment," said Byrne.

Back to the match, pundits are predicting a closely contested affair...`,
    sourceUrl: 'https://www.rte.ie/sport/gaa/2026-championship',
    expectedPromiseCount: 1,
    expectedPoliticians: ['Thomas Byrne'],
    category: 'rss',
  },
];

/**
 * Get test cases by category
 */
export function getTestCasesByCategory(
  category: TestCase['category']
): TestCase[] {
  return TEST_CASES.filter((tc) => tc.category === category);
}

/**
 * Get test cases that should produce promises
 */
export function getPositiveTestCases(): TestCase[] {
  return TEST_CASES.filter((tc) => tc.expectedPromiseCount > 0);
}

/**
 * Get test cases that should produce zero promises
 */
export function getNegativeTestCases(): TestCase[] {
  return TEST_CASES.filter((tc) => tc.expectedPromiseCount === 0);
}
