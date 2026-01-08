/**
 * Crawler Metrics Logger
 *
 * Provides structured metrics logging for crawler runs.
 * Outputs JSON-formatted metrics for monitoring and analysis.
 */

export interface CrawlerMetrics {
  /** Total number of promises extracted from all sources */
  totalExtracted: number;
  /** Number of promises matched to politicians in database */
  matchedPoliticians: number;
  /** Number of promises with no politician match found */
  unmatchedPoliticians: number;
  /** Number of matches with confidence below LOW_CONFIDENCE_THRESHOLD */
  lowConfidenceMatches: number;
  /** Number of promises successfully inserted into review queue */
  insertedToQueue: number;
}

export interface DetailedMetrics extends CrawlerMetrics {
  /** Timestamp of the crawl run */
  timestamp: string;
  /** Duration of the crawl in milliseconds */
  durationMs: number;
  /** Number of sources crawled */
  sourcesCrawled: number;
  /** Number of pages crawled (for deep crawls) */
  pagesCrawled: number;
  /** Number of errors encountered */
  errorCount: number;
  /** Average match confidence score */
  averageMatchConfidence: number;
  /** Breakdown by match score ranges */
  matchScoreDistribution: {
    high: number;    // >= 90%
    medium: number;  // 70-89%
    low: number;     // 50-69%
  };
  /** Breakdown by source */
  bySource: Record<string, SourceMetrics>;
}

export interface SourceMetrics {
  sourceName: string;
  extracted: number;
  matched: number;
  unmatched: number;
  lowConfidence: number;
  queued: number;
  errors: number;
}

/**
 * Threshold below which a match is considered "low confidence"
 * This should align with MATCHING_CONFIG.LOW_CONFIDENCE_THRESHOLD in politician-matcher.ts
 */
export const LOW_CONFIDENCE_THRESHOLD = 70;

/**
 * MetricsCollector accumulates metrics during a crawl run
 */
export class MetricsCollector {
  private startTime: number;
  private metrics: DetailedMetrics;
  private matchScores: number[] = [];
  private currentSource: string | null = null;

  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      timestamp: new Date().toISOString(),
      durationMs: 0,
      totalExtracted: 0,
      matchedPoliticians: 0,
      unmatchedPoliticians: 0,
      lowConfidenceMatches: 0,
      insertedToQueue: 0,
      sourcesCrawled: 0,
      pagesCrawled: 0,
      errorCount: 0,
      averageMatchConfidence: 0,
      matchScoreDistribution: {
        high: 0,
        medium: 0,
        low: 0,
      },
      bySource: {},
    };
  }

  /**
   * Start tracking a new source
   */
  startSource(sourceName: string): void {
    this.currentSource = sourceName;
    this.metrics.sourcesCrawled++;
    if (!this.metrics.bySource[sourceName]) {
      this.metrics.bySource[sourceName] = {
        sourceName,
        extracted: 0,
        matched: 0,
        unmatched: 0,
        lowConfidence: 0,
        queued: 0,
        errors: 0,
      };
    }
  }

  /**
   * Record pages crawled for current source
   */
  recordPagesCrawled(count: number): void {
    this.metrics.pagesCrawled += count;
  }

  /**
   * Record an extracted promise
   */
  recordExtraction(count: number = 1): void {
    this.metrics.totalExtracted += count;
    if (this.currentSource && this.metrics.bySource[this.currentSource]) {
      this.metrics.bySource[this.currentSource].extracted += count;
    }
  }

  /**
   * Record a politician match result
   */
  recordMatch(matchScore: number | null, isExactMatch: boolean = false): void {
    if (matchScore === null) {
      // No match found
      this.metrics.unmatchedPoliticians++;
      if (this.currentSource && this.metrics.bySource[this.currentSource]) {
        this.metrics.bySource[this.currentSource].unmatched++;
      }
    } else {
      // Match found
      this.metrics.matchedPoliticians++;
      this.matchScores.push(matchScore);

      // Track score distribution
      if (matchScore >= 90 || isExactMatch) {
        this.metrics.matchScoreDistribution.high++;
      } else if (matchScore >= 70) {
        this.metrics.matchScoreDistribution.medium++;
      } else {
        this.metrics.matchScoreDistribution.low++;
        this.metrics.lowConfidenceMatches++;
        if (this.currentSource && this.metrics.bySource[this.currentSource]) {
          this.metrics.bySource[this.currentSource].lowConfidence++;
        }
      }

      if (this.currentSource && this.metrics.bySource[this.currentSource]) {
        this.metrics.bySource[this.currentSource].matched++;
      }
    }
  }

  /**
   * Record a promise inserted to queue
   */
  recordQueueInsertion(): void {
    this.metrics.insertedToQueue++;
    if (this.currentSource && this.metrics.bySource[this.currentSource]) {
      this.metrics.bySource[this.currentSource].queued++;
    }
  }

  /**
   * Record an error
   */
  recordError(): void {
    this.metrics.errorCount++;
    if (this.currentSource && this.metrics.bySource[this.currentSource]) {
      this.metrics.bySource[this.currentSource].errors++;
    }
  }

  /**
   * Finalize and return the metrics
   */
  finalize(): DetailedMetrics {
    this.metrics.durationMs = Date.now() - this.startTime;

    // Calculate average match confidence
    if (this.matchScores.length > 0) {
      this.metrics.averageMatchConfidence = Math.round(
        this.matchScores.reduce((sum, score) => sum + score, 0) / this.matchScores.length
      );
    }

    return this.metrics;
  }

  /**
   * Get the basic metrics summary (for email/logging)
   */
  getSummary(): CrawlerMetrics {
    return {
      totalExtracted: this.metrics.totalExtracted,
      matchedPoliticians: this.metrics.matchedPoliticians,
      unmatchedPoliticians: this.metrics.unmatchedPoliticians,
      lowConfidenceMatches: this.metrics.lowConfidenceMatches,
      insertedToQueue: this.metrics.insertedToQueue,
    };
  }
}

/**
 * Log metrics in structured JSON format
 */
export function logMetricsJson(metrics: DetailedMetrics | CrawlerMetrics): void {
  const logEntry = {
    type: 'crawler_metrics',
    ...metrics,
  };
  console.log('\n[METRICS] Structured output:');
  console.log(JSON.stringify(logEntry, null, 2));
}

/**
 * Log metrics in human-readable format
 */
export function logMetricsReadable(metrics: DetailedMetrics): void {
  console.log('\n' + '='.repeat(60));
  console.log('CRAWLER METRICS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Timestamp:           ${metrics.timestamp}`);
  console.log(`Duration:            ${(metrics.durationMs / 1000).toFixed(2)}s`);
  console.log('-'.repeat(60));
  console.log(`Sources Crawled:     ${metrics.sourcesCrawled}`);
  console.log(`Pages Crawled:       ${metrics.pagesCrawled}`);
  console.log('-'.repeat(60));
  console.log(`Total Extracted:     ${metrics.totalExtracted}`);
  console.log(`Matched Politicians: ${metrics.matchedPoliticians}`);
  console.log(`Unmatched:           ${metrics.unmatchedPoliticians}`);
  console.log(`Low Confidence:      ${metrics.lowConfidenceMatches}`);
  console.log(`Inserted to Queue:   ${metrics.insertedToQueue}`);
  console.log('-'.repeat(60));
  console.log(`Avg Match Confidence: ${metrics.averageMatchConfidence}%`);
  console.log(`Match Distribution:`);
  console.log(`  - High (>=90%):    ${metrics.matchScoreDistribution.high}`);
  console.log(`  - Medium (70-89%): ${metrics.matchScoreDistribution.medium}`);
  console.log(`  - Low (50-69%):    ${metrics.matchScoreDistribution.low}`);
  console.log('-'.repeat(60));
  console.log(`Errors:              ${metrics.errorCount}`);
  console.log('='.repeat(60));
}

/**
 * Export metrics to file (for later analysis)
 */
export function getMetricsFilename(): string {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toISOString().split('T')[1].substring(0, 8).replace(/:/g, '-');
  return `crawler-metrics-${date}-${time}.json`;
}
