/**
 * Oireachtas Open Data API Client
 *
 * Fetches parliamentary questions, debates, and member data from the
 * official Oireachtas API (https://api.oireachtas.ie)
 *
 * This is a goldmine for political promises - ministers respond to
 * questions with specific commitments on the official record.
 */

const API_BASE = 'https://api.oireachtas.ie/v1';
const DATA_BASE = 'https://data.oireachtas.ie';

// ============================================================================
// Types
// ============================================================================

export interface OireachtasQuestion {
  id: string;
  date: string;
  questionNumber: number;
  questionType: 'oral' | 'written';
  topic: string;
  askedBy: {
    name: string;
    memberCode: string;
    uri: string;
  };
  directedTo: string;
  questionText: string;
  xmlUri: string | null;
  house: string;
}

export interface OireachtasSpeech {
  speaker: string;
  role: string | null;
  text: string;
  timestamp: string | null;
}

export interface OireachtasDebateSection {
  topic: string;
  date: string;
  question: string | null;
  speeches: OireachtasSpeech[];
}

export interface OireachtasMember {
  name: string;
  firstName: string;
  lastName: string;
  memberCode: string;
  party: string | null;
  constituency: string | null;
  house: string;
  dateRange: { start: string; end: string | null };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch recent parliamentary questions
 */
export async function fetchQuestions(options: {
  limit?: number;
  dateStart?: string;
  dateEnd?: string;
  member?: string;
  topic?: string;
} = {}): Promise<OireachtasQuestion[]> {
  const params = new URLSearchParams();
  params.set('limit', String(options.limit || 20));

  if (options.dateStart) params.set('date_start', options.dateStart);
  if (options.dateEnd) params.set('date_end', options.dateEnd);
  if (options.member) params.set('member_id', options.member);

  const url = `${API_BASE}/questions?${params.toString()}`;
  console.log(`[Oireachtas] Fetching questions: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Oireachtas API error: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[Oireachtas] Found ${data.head.counts.questionCount} questions`);

  return data.results.map((r: any) => ({
    id: r.question.uri,
    date: r.question.date,
    questionNumber: r.question.questionNumber,
    questionType: r.question.questionType,
    topic: r.question.debateSection?.showAs || 'Unknown',
    askedBy: {
      name: r.question.by.showAs,
      memberCode: r.question.by.memberCode,
      uri: r.question.by.uri,
    },
    directedTo: r.question.to.showAs,
    questionText: r.question.showAs,
    xmlUri: r.question.debateSection?.formats?.xml?.uri || null,
    house: r.question.house.showAs,
  }));
}

/**
 * Fetch and parse the XML debate section containing Q&A
 */
export async function fetchDebateXml(xmlUri: string): Promise<OireachtasDebateSection | null> {
  console.log(`[Oireachtas] Fetching debate XML: ${xmlUri}`);

  const response = await fetch(xmlUri);
  if (!response.ok) {
    console.error(`[Oireachtas] XML fetch failed: ${response.status}`);
    return null;
  }

  const xml = await response.text();
  return parseDebateXml(xml);
}

/**
 * Parse Akoma Ntoso XML into structured debate data
 */
function parseDebateXml(xml: string): OireachtasDebateSection {
  const speeches: OireachtasSpeech[] = [];

  // Extract topic from heading
  const headingMatch = xml.match(/<heading>([^<]+)/);
  const topic = headingMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Unknown';

  // Extract date
  const dateMatch = xml.match(/<docDate date="([^"]+)"/);
  const date = dateMatch?.[1] || '';

  // Extract question text
  const questionMatch = xml.match(/<question[^>]*>([\s\S]*?)<\/question>/);
  const questionText = questionMatch?.[1]
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || null;

  // Extract speeches
  const speechRegex = /<speech[^>]*by="#([^"]+)"[^>]*(?:as="#([^"]+)")?[^>]*>([\s\S]*?)<\/speech>/g;
  let match;

  while ((match = speechRegex.exec(xml)) !== null) {
    const speakerId = match[1];
    const role = match[2] || null;
    const speechContent = match[3];

    // Extract speaker name from <from> tag
    const fromMatch = speechContent.match(/<from>([^<]+)/);
    const speakerName = fromMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || speakerId;

    // Extract timestamp
    const timeMatch = speechContent.match(/<recordedTime time="([^"]+)"/);
    const timestamp = timeMatch?.[1] || null;

    // Extract paragraphs
    const paragraphs: string[] = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/g;
    let pMatch;
    while ((pMatch = pRegex.exec(speechContent)) !== null) {
      const text = pMatch[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) paragraphs.push(text);
    }

    if (paragraphs.length > 0) {
      speeches.push({
        speaker: speakerName,
        role: role?.replace(/_/g, ' ') || null,
        text: paragraphs.join('\n\n'),
        timestamp,
      });
    }
  }

  return { topic, date, question: questionText, speeches };
}

/**
 * Fetch current members of a house
 */
export async function fetchMembers(options: {
  house?: 'dail' | 'seanad';
  limit?: number;
} = {}): Promise<OireachtasMember[]> {
  const params = new URLSearchParams();
  params.set('limit', String(options.limit || 100));
  if (options.house) params.set('house', options.house);

  // Only get current members
  params.set('date_start', new Date().toISOString().split('T')[0]);

  const url = `${API_BASE}/members?${params.toString()}`;
  console.log(`[Oireachtas] Fetching members: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Oireachtas API error: ${response.status}`);
  }

  const data = await response.json();
  const members: OireachtasMember[] = [];

  for (const r of data.results) {
    const member = r.member;
    const latestMembership = member.memberships?.[0]?.membership;

    if (!latestMembership) continue;

    const party = latestMembership.parties?.[0]?.party?.showAs || null;
    const constituency = latestMembership.represents?.[0]?.represent?.showAs || null;

    members.push({
      name: member.fullName,
      firstName: member.firstName,
      lastName: member.lastName,
      memberCode: member.memberCode,
      party,
      constituency,
      house: latestMembership.house.showAs,
      dateRange: {
        start: latestMembership.dateRange.start,
        end: latestMembership.dateRange.end,
      },
    });
  }

  console.log(`[Oireachtas] Found ${members.length} members`);
  return members;
}

/**
 * Convert debate section to markdown for AI processing
 */
export function debateToMarkdown(debate: OireachtasDebateSection): string {
  const lines: string[] = [];

  lines.push(`# ${debate.topic}`);
  lines.push(`Date: ${debate.date}`);
  lines.push('');

  if (debate.question) {
    lines.push('## Question');
    lines.push(debate.question);
    lines.push('');
  }

  lines.push('## Debate');
  for (const speech of debate.speeches) {
    const roleText = speech.role ? ` (${speech.role})` : '';
    lines.push(`### ${speech.speaker}${roleText}`);
    lines.push(speech.text);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Fetch questions with full debate content
 */
export async function fetchQuestionsWithDebates(options: {
  limit?: number;
  dateStart?: string;
  dateEnd?: string;
  delayMs?: number;
}): Promise<Array<{ question: OireachtasQuestion; debate: OireachtasDebateSection | null }>> {
  const questions = await fetchQuestions(options);
  const results: Array<{ question: OireachtasQuestion; debate: OireachtasDebateSection | null }> = [];

  for (const question of questions) {
    let debate: OireachtasDebateSection | null = null;

    if (question.xmlUri) {
      debate = await fetchDebateXml(question.xmlUri);

      // Rate limiting
      if (options.delayMs) {
        await new Promise(r => setTimeout(r, options.delayMs));
      }
    }

    results.push({ question, debate });
  }

  return results;
}
