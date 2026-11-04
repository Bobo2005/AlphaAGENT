import { scoringEngine, ForecasterStatisticalProfile } from '../lib/scoringEngine';
import { EpisodeRecord, StatusRecord, LessonRecord } from '../lib/walrusClient';
import { lessonEngine } from './lessonEngine';

export type VerdictState = 'FOLLOW' | 'WATCH' | 'SKIP';

export interface GateResult {
  name: string;
  passed: boolean;
  actual: string | number;
  required: string;
  reason?: string;
}

export interface VerdictBundle {
  forecaster: string;
  verdict: VerdictState;
  headline: string;
  rationale: string;
  missingCriteria: string[];
  gates: GateResult[];
  profile: ForecasterStatisticalProfile;
  activeLessonRule?: string;
  timestamp: number;
}

export class DecisionEngine {
  public static readonly MIN_RESOLVED_PICKS = 15;
  public static readonly MIN_INFO_DEPTH = 1.0;
  public static readonly MIN_BSS_SHRUNK = 0.02;
  public static readonly MAX_FORFEIT_RATE = 0.10;
  public static readonly MIN_CATEGORY_PICKS = 8;

  /**
   * Evaluates historical records and lesson rules to formulate a deterministic verdict
   */
  evaluate(
    episodes: EpisodeRecord[],
    statuses: StatusRecord[] = [],
    requestedCategory?: string,
    activeLessons: LessonRecord[] = []
  ): VerdictBundle {
    const profile = scoringEngine.computeProfile(episodes, statuses);
    const timestamp = Math.floor(Date.now() / 1000);

    const gates: GateResult[] = [];
    const missingCriteria: string[] = [];

    // Gate 1: Forfeit Gate (Anti-Cherry Picking)
    const forfeitPassed = profile.forfeitRate <= DecisionEngine.MAX_FORFEIT_RATE;
    gates.push({
      name: 'Forfeit Rate Gate',
      passed: forfeitPassed,
      actual: `${(profile.forfeitRate * 100).toFixed(1)}%`,
      required: `<= ${(DecisionEngine.MAX_FORFEIT_RATE * 100).toFixed(1)}%`,
      reason: forfeitPassed
        ? 'Completeness verified: selective logging within tolerance.'
        : `Cherry-picking detected: ${profile.forfeitedCount} of ${profile.totalCommits} commits forfeited.`,
    });

    // Gate 2: Sample Size Gate
    const sampleSizePassed = profile.sampleSize >= DecisionEngine.MIN_RESOLVED_PICKS;
    gates.push({
      name: 'Minimum Sample Size Gate',
      passed: sampleSizePassed,
      actual: profile.sampleSize,
      required: `>= ${DecisionEngine.MIN_RESOLVED_PICKS}`,
      reason: sampleSizePassed
        ? 'Sufficient sample size to distinguish skill from random luck.'
        : `Sample too thin (n=${profile.sampleSize}). Needs ${DecisionEngine.MIN_RESOLVED_PICKS - profile.sampleSize} more resolved picks.`,
    });
    if (!sampleSizePassed) {
      missingCriteria.push(`Needs ${DecisionEngine.MIN_RESOLVED_PICKS - profile.sampleSize} more resolved picks`);
    }

    // Gate 3: Information Guard (Market Uncertainty Depth)
    const infoDepthPassed = profile.sumBsMkt >= DecisionEngine.MIN_INFO_DEPTH;
    gates.push({
      name: 'Market Information Depth Gate',
      passed: infoDepthPassed,
      actual: profile.sumBsMkt.toFixed(3),
      required: `>= ${DecisionEngine.MIN_INFO_DEPTH.toFixed(3)}`,
      reason: infoDepthPassed
        ? 'Markets had sufficient uncertainty to measure predictive skill.'
        : `Market depth too shallow (${profile.sumBsMkt.toFixed(3)}). Picks were on extreme heavy favorites with zero informational content.`,
    });
    if (!infoDepthPassed) {
      missingCriteria.push('Needs picks on competitive markets (sum of market Brier >= 1.0)');
    }

    // Gate 4: Shrunk Brier Skill Score Gate
    const bssPassed = profile.bssShrunk >= DecisionEngine.MIN_BSS_SHRUNK;
    gates.push({
      name: 'Shrunk Skill Score Gate (k=10)',
      passed: bssPassed,
      actual: profile.bssShrunk.toFixed(4),
      required: `>= ${DecisionEngine.MIN_BSS_SHRUNK.toFixed(4)}`,
      reason: bssPassed
        ? `Positive shrunk skill: beats market baseline by ${(profile.bssShrunk * 100).toFixed(2)}%.`
        : `Insufficient skill score (${profile.bssShrunk.toFixed(4)}). Forecaster does not demonstrably beat market closing odds.`,
    });
    if (!bssPassed && profile.rawBss > 0) {
      missingCriteria.push(`Shrunk score (${profile.bssShrunk.toFixed(4)}) dampened by prior; needs larger sample`);
    }

    // Gate 5: 80% Bootstrap Resampling Lower Bound Gate
    const bootstrapPassed = profile.bootstrapLowerBound80 > 0;
    gates.push({
      name: '80% Bootstrap Confidence Gate',
      passed: bootstrapPassed,
      actual: profile.bootstrapLowerBound80.toFixed(4),
      required: `> 0.0000`,
      reason: bootstrapPassed
        ? 'Resampling test passed: skill is statistically distinct from zero at 80% confidence.'
        : 'Bootstrap lower bound <= 0: skill cannot be statistically distinguished from pure luck.',
    });
    if (!bootstrapPassed) {
      missingCriteria.push('Bootstrap 80% lower bound must exceed 0');
    }

    // Gate 6: Category Gate (if category specified)
    let categoryPassed = true;
    if (requestedCategory) {
      const catStats = profile.byCategory[requestedCategory];
      const catN = catStats?.n || 0;
      const catShrunk = catStats?.bssShrunk || 0;
      categoryPassed = catN >= DecisionEngine.MIN_CATEGORY_PICKS && catShrunk > 0;

      gates.push({
        name: `Category Gate (${requestedCategory})`,
        passed: categoryPassed,
        actual: `n=${catN}, BSS=${catShrunk.toFixed(4)}`,
        required: `n >= ${DecisionEngine.MIN_CATEGORY_PICKS} and BSS > 0`,
        reason: categoryPassed
          ? `Sufficient category track record in ${requestedCategory}.`
          : `Thin or negative track record in ${requestedCategory} (n=${catN}, BSS=${catShrunk.toFixed(4)}).`,
      });
      if (!categoryPassed) {
        missingCriteria.push(`Needs at least ${Math.max(0, DecisionEngine.MIN_CATEGORY_PICKS - catN)} more resolved ${requestedCategory} picks with positive BSS`);
      }
    }

    // Check for Active Walrus LESSON Rule Override
    let activeLessonRule: string | undefined;
    for (const lesson of activeLessons) {
      if (lesson.rule.startsWith('SKIP')) {
        if (!requestedCategory || lesson.category === requestedCategory) {
          activeLessonRule = lesson.rule;
          break;
        }
      }
    }

    // Determine Final Verdict State
    let verdict: VerdictState;
    let headline: string;
    let rationale: string;

    // Hard Rejection 1: Active Lesson Rule Override
    if (activeLessonRule) {
      verdict = 'SKIP';
      headline = 'OVERRIDDEN BY MEMORY LESSON';
      rationale = `Agent memory applied empirical rule: "${activeLessonRule}". High-risk pattern detected.`;
    }
    // Hard Rejection 2: Forfeit Gate Failure (Cherry-Picking)
    else if (!forfeitPassed) {
      verdict = 'SKIP';
      headline = 'CHERRY-PICKING AUDIT FAILED';
      rationale = `Forfeit rate is ${(profile.forfeitRate * 100).toFixed(1)}% (Limit: 10%). Commits were made on Sui but abandoned or unrevealed after line shifts.`;
    }
    // Hard Rejection 3: Negative Skill Score
    else if (profile.rawBss < 0 || profile.bssShrunk < 0) {
      verdict = 'SKIP';
      headline = 'NEGATIVE PREDICTIVE ALPHA';
      rationale = `Forecaster underperforms market baseline (BSS=${profile.bssShrunk.toFixed(4)}). Copying these picks has negative expected value.`;
    }
    // Category Gate Rejection
    else if (!categoryPassed) {
      verdict = 'WATCH';
      headline = `INSUFFICIENT ${requestedCategory} EVIDENCE`;
      rationale = `Overall record is active, but evidence is insufficient for category ${requestedCategory}.`;
    }
    // Insufficient Sample / Luck Indistinguishable -> WATCH
    else if (!sampleSizePassed || !infoDepthPassed || !bootstrapPassed || profile.bssShrunk < DecisionEngine.MIN_BSS_SHRUNK) {
      verdict = 'WATCH';
      if (profile.sampleSize <= 5 && profile.winRate === 1.0) {
        headline = 'LUCKY STREAK IMMATERIAL (5-0 REFUSAL)';
        rationale = `A 5-0 record occurs naturally in coin flips with 3.1% probability. The agent refuses to follow unproven streaks without mathematical depth.`;
      } else {
        headline = 'INSUFFICIENT SAMPLE EVIDENCE';
        rationale = `Track record is promising but has not cleared the statistical significance threshold.`;
      }
    }
    // Unanimous Pass -> FOLLOW
    else {
      verdict = 'FOLLOW';
      headline = 'VERIFIED PREDICTIVE ALPHA';
      rationale = `Forecaster has cleared all 6 audit gates with n=${profile.sampleSize} resolved picks, positive shrunk edge (${(profile.bssShrunk * 100).toFixed(2)}%), and zero-forfeit integrity.`;
    }

    return {
      forecaster: profile.forecaster,
      verdict,
      headline,
      rationale,
      missingCriteria,
      gates,
      profile,
      activeLessonRule,
      timestamp,
    };
  }

  /**
   * Asynchronous evaluation that actively performs semantic memory recall into Walrus
   * to check if any learned behavioral lesson overrides the upcoming pick
   */
  async evaluateWithMemoryRecall(
    episodes: EpisodeRecord[],
    statuses: StatusRecord[] = [],
    upcomingPick?: { category: string; probability: number }
  ): Promise<VerdictBundle> {
    const forecaster = episodes[0]?.forecaster || statuses[0]?.forecaster || 'unknown';
    const activeLessons: LessonRecord[] = [];

    if (upcomingPick) {
      const override = await lessonEngine.checkLessonOverrideForPick(
        forecaster,
        upcomingPick.category,
        upcomingPick.probability
      );
      if (override.override && override.rule) {
        activeLessons.push({
          type: 'LESSON',
          version: 'v1',
          forecaster,
          category: upcomingPick.category,
          band: lessonEngine.getOddsBand(upcomingPick.probability),
          finding: override.reason || 'Historical pattern failure',
          rule: override.rule,
          triggerN: episodes.length,
          ts: Math.floor(Date.now() / 1000),
        });
      }
    }

    return this.evaluate(episodes, statuses, upcomingPick?.category, activeLessons);
  }
}

export const decisionEngine = new DecisionEngine();

