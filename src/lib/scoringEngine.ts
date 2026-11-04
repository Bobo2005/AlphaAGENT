import { EpisodeRecord, StatusRecord } from './walrusClient';

export interface ScoreItem {
  forecast: number; // f
  market: number;   // m
  outcome: 1 | 0;   // o: 1 if win, 0 if loss
  bsUser: number;   // (f - o)^2
  bsMkt: number;    // (m - o)^2
}

export interface ForecasterStatisticalProfile {
  forecaster: string;
  sampleSize: number;           // n (resolved picks)
  totalCommits: number;         // Total on-chain commits (resolved + forfeited)
  forfeitedCount: number;       // Forfeited count
  forfeitRate: number;          // forfeits / totalCommits
  sumBsUser: number;            // sum of BS_user
  sumBsMkt: number;             // sum of BS_mkt (information depth)
  rawBss: number;               // BSS = 1 - sum(BS_user) / sum(BS_mkt)
  bssShrunk: number;            // BSS * n / (n + k), k=10
  priorWeightK: number;         // k = 10
  bootstrapLowerBound80: number;// 80% confidence lower bound from 2,000 iterations
  winCount: number;
  lossCount: number;
  winRate: number;              // Raw win percentage
  byCategory: Record<
    string,
    {
      n: number;
      rawBss: number;
      bssShrunk: number;
      winRate: number;
    }
  >;
}

export class ScoringEngine {
  public static readonly DEFAULT_K = 10;
  public static readonly BOOTSTRAP_ITERATIONS = 2000;

  /**
   * Computes comprehensive statistical profile from historical episodes and statuses
   */
  computeProfile(
    episodes: EpisodeRecord[],
    statuses: StatusRecord[] = [],
    k = ScoringEngine.DEFAULT_K
  ): ForecasterStatisticalProfile {
    const forecaster = episodes[0]?.forecaster || statuses[0]?.forecaster || 'unknown';
    const forfeitedCount = statuses.filter((s) => s.state === 'forfeited').length;
    const resolvedCount = episodes.length;
    const totalCommits = resolvedCount + forfeitedCount;
    const forfeitRate = totalCommits > 0 ? forfeitedCount / totalCommits : 0;

    let winCount = 0;
    let lossCount = 0;
    let sumBsUser = 0;
    let sumBsMkt = 0;

    const items: ScoreItem[] = [];
    const categoryBuckets: Record<string, ScoreItem[]> = {};

    for (const ep of episodes) {
      const outcomeVal: 1 | 0 = ep.outcome === 'win' ? 1 : 0;
      if (outcomeVal === 1) winCount++;
      else lossCount++;

      const bsUser = Math.pow(ep.forecast - outcomeVal, 2);
      const bsMkt = Math.pow(ep.market - outcomeVal, 2);

      sumBsUser += bsUser;
      sumBsMkt += bsMkt;

      const item: ScoreItem = {
        forecast: ep.forecast,
        market: ep.market,
        outcome: outcomeVal,
        bsUser,
        bsMkt,
      };

      items.push(item);

      const cat = ep.category || 'GENERAL';
      if (!categoryBuckets[cat]) categoryBuckets[cat] = [];
      categoryBuckets[cat].push(item);
    }

    const n = episodes.length;
    const rawBss = sumBsMkt > 0 ? 1 - sumBsUser / sumBsMkt : 0;
    const bssShrunk = n > 0 ? rawBss * (n / (n + k)) : 0;
    const winRate = n > 0 ? winCount / n : 0;

    // 2,000-iteration bootstrap resampling for 80% confidence lower bound
    const bootstrapLowerBound80 = this.computeBootstrapLowerBound(items, ScoringEngine.BOOTSTRAP_ITERATIONS, 0.20);

    // Compute category level shrinkage
    const byCategory: Record<string, { n: number; rawBss: number; bssShrunk: number; winRate: number }> = {};
    for (const [cat, catItems] of Object.entries(categoryBuckets)) {
      const catN = catItems.length;
      const catSumUser = catItems.reduce((acc, i) => acc + i.bsUser, 0);
      const catSumMkt = catItems.reduce((acc, i) => acc + i.bsMkt, 0);
      const catRawBss = catSumMkt > 0 ? 1 - catSumUser / catSumMkt : 0;
      const catShrunk = catN > 0 ? catRawBss * (catN / (catN + k)) : 0;
      const catWins = catItems.filter((i) => i.outcome === 1).length;

      byCategory[cat] = {
        n: catN,
        rawBss: parseFloat(catRawBss.toFixed(4)),
        bssShrunk: parseFloat(catShrunk.toFixed(4)),
        winRate: parseFloat((catWins / catN).toFixed(4)),
      };
    }

    return {
      forecaster,
      sampleSize: n,
      totalCommits,
      forfeitedCount,
      forfeitRate: parseFloat(forfeitRate.toFixed(4)),
      sumBsUser: parseFloat(sumBsUser.toFixed(4)),
      sumBsMkt: parseFloat(sumBsMkt.toFixed(4)),
      rawBss: parseFloat(rawBss.toFixed(4)),
      bssShrunk: parseFloat(bssShrunk.toFixed(4)),
      priorWeightK: k,
      bootstrapLowerBound80: parseFloat(bootstrapLowerBound80.toFixed(4)),
      winCount,
      lossCount,
      winRate: parseFloat(winRate.toFixed(4)),
      byCategory,
    };
  }

  /**
   * Resamples items with replacement to compute empirical quantile lower bound
   */
  private computeBootstrapLowerBound(items: ScoreItem[], iterations: number, lowerQuantile: number): number {
    if (items.length < 2) return 0;

    const n = items.length;
    const bootstrapBssValues: number[] = new Array(iterations);

    for (let iter = 0; iter < iterations; iter++) {
      let bSumUser = 0;
      let bSumMkt = 0;

      for (let i = 0; i < n; i++) {
        const randIdx = Math.floor(Math.random() * n);
        const item = items[randIdx];
        bSumUser += item.bsUser;
        bSumMkt += item.bsMkt;
      }

      const bBss = bSumMkt > 0 ? 1 - bSumUser / bSumMkt : 0;
      bootstrapBssValues[iter] = bBss;
    }

    // Sort ascending
    bootstrapBssValues.sort((a, b) => a - b);

    // Pick lower quantile index (e.g. index 400 out of 2000 for 20th percentile / 80% confidence bound)
    const targetIdx = Math.floor(iterations * lowerQuantile);
    return bootstrapBssValues[targetIdx];
  }
}

export const scoringEngine = new ScoringEngine();

