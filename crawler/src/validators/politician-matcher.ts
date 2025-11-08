import Fuse from 'fuse.js';
import { DbPolitician, PoliticianMatch } from '../types';

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
    this.fuse = new Fuse(politicians, {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'party', weight: 0.2 },
        { name: 'constituency', weight: 0.1 },
      ],
      threshold: 0.4, // 0 = perfect match, 1 = match anything
      includeScore: true,
      minMatchCharLength: 3,
    });
  }

  /**
   * Find politician by name with fuzzy matching
   * Returns best match with confidence score
   */
  findPolitician(
    name: string,
    party?: string,
    constituency?: string
  ): PoliticianMatch | null {
    if (!name || name.length < 3) {
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
    if (party && politician.party.toLowerCase() === party.toLowerCase()) {
      adjustedScore = Math.min(100, score + 10);
    }

    // If constituency is provided, boost score for matching constituency
    if (
      constituency &&
      politician.constituency &&
      politician.constituency.toLowerCase() === constituency.toLowerCase()
    ) {
      adjustedScore = Math.min(100, adjustedScore + 5);
    }

    // Only return if confidence is reasonable
    if (adjustedScore < 50) {
      console.warn(`[Matcher] Low confidence match for "${name}": ${adjustedScore}%`);
      return null;
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
      // Count by party
      stats.byParty[politician.party] = (stats.byParty[politician.party] || 0) + 1;

      // Count by position type
      stats.byPositionType[politician.position_type] =
        (stats.byPositionType[politician.position_type] || 0) + 1;
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
