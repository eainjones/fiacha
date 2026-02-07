import Fuse from 'fuse.js';
import { DbPolitician, PoliticianMatch } from '../types/index.js';

/**
 * ============================================================================
 * FUZZY MATCHING CONFIGURATION
 * ============================================================================
 *
 * These constants control the politician matching behavior.
 * Adjust based on data quality and matching accuracy requirements.
 *
 * For TECH-IMPLEMENTATION.md compliance, all thresholds are documented here.
 */
export const MATCHING_CONFIG = {
  /**
   * FUSE_THRESHOLD - Fuse.js matching sensitivity
   * Range: 0.0 (exact match only) to 1.0 (match anything)
   * Current: 0.4 - Balances false positives vs. missed matches
   *
   * Lower values = stricter matching (fewer but more accurate matches)
   * Higher values = looser matching (more matches but higher false positive rate)
   *
   * Recommended ranges:
   * - 0.2-0.3: Very strict, use when data quality is high
   * - 0.4-0.5: Balanced, good for mixed quality data
   * - 0.6-0.7: Loose, use when catching all potential matches is priority
   */
  FUSE_THRESHOLD: 0.4,

  /**
   * MIN_MATCH_CHAR_LENGTH - Minimum characters for fuzzy matching
   * Prevents matching on very short strings that may produce false positives
   */
  MIN_MATCH_CHAR_LENGTH: 3,

  /**
   * KEY_WEIGHTS - Relative importance of each field in matching
   * Name is most important, followed by party, then constituency
   */
  KEY_WEIGHTS: {
    name: 0.7,
    party: 0.2,
    constituency: 0.1,
  },

  /**
   * MINIMUM_CONFIDENCE_SCORE - Below this score, matches are rejected
   * Range: 0-100 (percentage)
   * Current: 50 - Matches below 50% confidence are not returned
   *
   * This is the hard cutoff - matches below this are treated as "no match"
   */
  MINIMUM_CONFIDENCE_SCORE: 50,

  /**
   * LOW_CONFIDENCE_THRESHOLD - Below this score, matches are flagged as low confidence
   * Range: 0-100 (percentage)
   * Current: 70 - Matches 50-69% are logged as low confidence for review
   *
   * Used for metrics logging and identifying potentially incorrect matches
   */
  LOW_CONFIDENCE_THRESHOLD: 70,

  /**
   * HIGH_CONFIDENCE_THRESHOLD - Above this score, matches are considered high quality
   * Range: 0-100 (percentage)
   * Current: 90 - Matches >= 90% are high confidence
   */
  HIGH_CONFIDENCE_THRESHOLD: 90,

  /**
   * PARTY_MATCH_BONUS - Score boost when party name matches exactly
   * Added to base score when extracted party matches database party
   */
  PARTY_MATCH_BONUS: 10,

  /**
   * CONSTITUENCY_MATCH_BONUS - Score boost when constituency matches exactly
   * Added to base score when extracted constituency matches database constituency
   */
  CONSTITUENCY_MATCH_BONUS: 5,

  /**
   * MINIMUM_NAME_LENGTH - Minimum characters for a valid politician name
   * Names shorter than this are rejected before matching
   */
  MINIMUM_NAME_LENGTH: 3,
} as const;

/**
 * Fuzzy matching to find politicians in database
 * Handles variations in name spelling, formatting, etc.
 */
export class PoliticianMatcher {
  private fuse: Fuse<DbPolitician>;
  private politicians: DbPolitician[];

  constructor(politicians: DbPolitician[]) {
    this.politicians = politicians;

    // Configure Fuse.js for fuzzy matching
    // See MATCHING_CONFIG for threshold documentation
    this.fuse = new Fuse(politicians, {
      keys: [
        { name: 'name', weight: MATCHING_CONFIG.KEY_WEIGHTS.name },
        { name: 'party', weight: MATCHING_CONFIG.KEY_WEIGHTS.party },
        { name: 'constituency', weight: MATCHING_CONFIG.KEY_WEIGHTS.constituency },
      ],
      threshold: MATCHING_CONFIG.FUSE_THRESHOLD,
      includeScore: true,
      minMatchCharLength: MATCHING_CONFIG.MIN_MATCH_CHAR_LENGTH,
    });
  }

  /**
   * Find politician by name with fuzzy matching
   * Returns best match with confidence score
   *
   * @param name - Politician name to search for
   * @param party - Optional party name to boost match confidence
   * @param constituency - Optional constituency to boost match confidence
   * @returns PoliticianMatch if found above MINIMUM_CONFIDENCE_SCORE, null otherwise
   */
  findPolitician(
    name: string,
    party?: string,
    constituency?: string
  ): PoliticianMatch | null {
    if (!name || name.length < MATCHING_CONFIG.MINIMUM_NAME_LENGTH) {
      return null;
    }

    // First try exact match (case insensitive)
    const exactMatch = this.politicians.find(
      p => p.name.toLowerCase() === name.toLowerCase()
    );

    if (exactMatch) {
      return {
        id: exactMatch.id,
        name: exactMatch.name,
        party: exactMatch.party,
        constituency: exactMatch.constituency,
        matchScore: 100,
        isExactMatch: true,
      };
    }

    // Try fuzzy match
    const results = this.fuse.search(name);

    if (results.length === 0) {
      return null;
    }

    // Get best match
    const bestMatch = results[0];
    const politician = bestMatch.item;
    const score = 100 - (bestMatch.score || 0) * 100;

    // If party is provided, boost score for matching party
    let adjustedScore = score;
    if (party && politician.party && politician.party.toLowerCase() === party.toLowerCase()) {
      adjustedScore = Math.min(100, score + MATCHING_CONFIG.PARTY_MATCH_BONUS);
    }

    // If constituency is provided, boost score for matching constituency
    if (
      constituency &&
      politician.constituency &&
      politician.constituency.toLowerCase() === constituency.toLowerCase()
    ) {
      adjustedScore = Math.min(100, adjustedScore + MATCHING_CONFIG.CONSTITUENCY_MATCH_BONUS);
    }

    // Only return if confidence is above minimum threshold
    if (adjustedScore < MATCHING_CONFIG.MINIMUM_CONFIDENCE_SCORE) {
      console.warn(`[Matcher] Low confidence match for "${name}": ${adjustedScore}% (below ${MATCHING_CONFIG.MINIMUM_CONFIDENCE_SCORE}% threshold)`);
      return null;
    }

    // Log warning for matches that are above minimum but below "good" threshold
    if (adjustedScore < MATCHING_CONFIG.LOW_CONFIDENCE_THRESHOLD) {
      console.warn(`[Matcher] Low confidence match for "${name}": ${adjustedScore}% (below ${MATCHING_CONFIG.LOW_CONFIDENCE_THRESHOLD}% threshold)`);
    }

    return {
      id: politician.id,
      name: politician.name,
      party: politician.party,
      constituency: politician.constituency,
      matchScore: Math.round(adjustedScore),
      isExactMatch: false,
    };
  }

  /**
   * Find multiple possible matches
   * Useful for manual review
   */
  findPossibleMatches(name: string, limit: number = 5): PoliticianMatch[] {
    const results = this.fuse.search(name, { limit });

    return results.map(result => {
      const politician = result.item;
      const score = 100 - (result.score || 0) * 100;

      return {
        id: politician.id,
        name: politician.name,
        party: politician.party,
        constituency: politician.constituency,
        matchScore: Math.round(score),
        isExactMatch: false,
      };
    });
  }

  /**
   * Get politician by exact ID
   */
  getPoliticianById(id: number): DbPolitician | undefined {
    return this.politicians.find(p => p.id === id);
  }

  /**
   * Check if a politician exists by exact name
   */
  exactNameExists(name: string): boolean {
    return this.politicians.some(
      p => p.name.toLowerCase() === name.toLowerCase()
    );
  }

  /**
   * Get statistics about loaded politicians
   */
  getStats(): {
    total: number;
    byParty: Record<string, number>;
    byPositionType: Record<string, number>;
    active: number;
  } {
    const stats = {
      total: this.politicians.length,
      byParty: {} as Record<string, number>,
      byPositionType: {} as Record<string, number>,
      active: this.politicians.filter(p => p.active).length,
    };

    for (const politician of this.politicians) {
      // Count by party (use 'Unknown' for null parties)
      const party = politician.party || 'Unknown';
      stats.byParty[party] = (stats.byParty[party] || 0) + 1;

      // Count by position type
      const positionType = politician.position_type || 'Unknown';
      stats.byPositionType[positionType] =
        (stats.byPositionType[positionType] || 0) + 1;
    }

    return stats;
  }
}

/**
 * Normalize politician names for better matching
 */
export function normalizePoliticianName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.|TD|Cllr\.?)\s+/gi, '') // Remove titles
    .replace(/,?\s+(TD|Councillor)$/gi, ''); // Remove suffixes
}
