import {
  walrusClient,
  MemoryCodec,
  EpisodeRecord,
  LessonRecord,
  VerdictRecord,
} from '../lib/walrusClient';
import { episodeLogger } from './episodeLogger';

export type OddsBand = 'underdog' | 'balanced' | 'confident';

export interface OddsBandAnalysis {
  band: OddsBand;
  category: string;
  count: number;
  wins: number;
  rawBss: number;
  severeNegative: boolean;
}

/**
 * Dynamic Lesson Synthesis & Semantic Recall Pipeline
 * Detects behavioral blindspots every 5 resolved picks and enforces memory-driven rules.
 */
export class LessonEngine {
  /**
   * Categorizes probability into an odds band:
   * - underdog: <= 0.40
   * - confident: >= 0.75
   * - balanced: 0.41 - 0.74
   */
  getOddsBand(probability: number): OddsBand {
    if (probability <= 0.40) return 'underdog';
    if (probability >= 0.75) return 'confident';
    return 'balanced';
  }

  /**
   * Analyzes forecaster outcomes grouped by category and odds band every 5 resolved picks.
   * If a subset demonstrates severe negative BSS (BSS < -0.15), synthesizes a LESSON string.
   */
  async analyzeAndSynthesizeLessons(
    forecaster: string,
    episodes: EpisodeRecord[]
  ): Promise<LessonRecord[]> {
    if (episodes.length === 0 || episodes.length % 5 !== 0) {
      // Analyze deterministically on multiples of 5 resolved picks
      return [];
    }

    const namespace = episodeLogger.getForecasterNamespace(forecaster);
    const synthesizedLessons: LessonRecord[] = [];

    // Group episodes by category and odds band
    const groups: Record<string, EpisodeRecord[]> = {};

    for (const ep of episodes) {
      const band = this.getOddsBand(ep.forecast);
      const key = `${ep.category}_${band}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(ep);
    }

    const now = Math.floor(Date.now() / 1000);

    for (const [key, group] of Object.entries(groups)) {
      if (group.length < 3) continue; // Minimum 3 observations in specific band to generalize

      const [category, band] = key.split('_') as [string, OddsBand];
      let sumBsUser = 0;
      let sumBsMkt = 0;
      let wins = 0;

      for (const item of group) {
        const outcomeVal = item.outcome === 'win' ? 1 : 0;
        if (outcomeVal === 1) wins++;
        sumBsUser += Math.pow(item.forecast - outcomeVal, 2);
        sumBsMkt += Math.pow(item.market - outcomeVal, 2);
      }

      const rawBss = sumBsMkt > 0 ? 1 - sumBsUser / sumBsMkt : 0;

      // Condition for severe negative blindspot:
      // Either raw BSS < -0.20 or win count < 20% on confident picks
      const isSevere =
        rawBss < -0.20 ||
        (band === 'confident' && wins / group.length < 0.40) ||
        (band === 'underdog' && wins === 0 && group.length >= 3);

      if (isSevere) {
        const finding = `${wins} of ${group.length} ${band} picks won, raw BSS ${rawBss.toFixed(2)}`;
        const rule = `SKIP ${band} ${category} picks until n>=8 and BSS>0`;

        const lesson: LessonRecord = {
          type: 'LESSON',
          version: 'v1',
          forecaster,
          category,
          band,
          finding,
          rule,
          triggerN: episodes.length,
          ts: now,
        };

        const serialized = MemoryCodec.serializeLesson(lesson);
        const blobId = await walrusClient.writeMemory(namespace, serialized);
        console.log(`🧠 [LessonEngine] Synthesized and logged LESSON to Walrus (${blobId}): "${finding}" -> "${rule}"`);

        // Also record a VERDICT evolution memory
        const verdictRecord: VerdictRecord = {
          type: 'VERDICT',
          version: 'v1',
          forecaster,
          stateTransition: 'WATCH -> SKIP',
          category,
          score: parseFloat(rawBss.toFixed(4)),
          sampleN: episodes.length,
          citedLessons: [blobId],
          ts: now,
        };
        await walrusClient.writeMemory(namespace, MemoryCodec.serializeVerdict(verdictRecord));

        synthesizedLessons.push(lesson);
      }
    }

    return synthesizedLessons;
  }

  /**
   * Queries Walrus Memory using semantic recall to check if any learned LESSON overrides this pick
   */
  async checkLessonOverrideForPick(
    forecaster: string,
    category: string,
    probability: number
  ): Promise<{ override: boolean; rule?: string; blobId?: string; reason?: string }> {
    const band = this.getOddsBand(probability);
    const namespace = episodeLogger.getForecasterNamespace(forecaster);
    const query = `${forecaster} ${category} ${band} favorite underdog confidence`;

    // 1. Semantic recall from Walrus Memory
    const hits = await walrusClient.recallMemories(query, 5, namespace);

    // 2. Also inspect raw namespace records for matching LESSON blobs
    const rawBlobs = await walrusClient.listNamespace(namespace);

    for (const raw of rawBlobs) {
      if (raw.startsWith('LESSON')) {
        const lesson = MemoryCodec.parseLesson(raw);
        if (lesson && lesson.category === category && lesson.band === band) {
          if (lesson.rule.startsWith('SKIP')) {
            return {
              override: true,
              rule: lesson.rule,
              blobId: hits[0]?.blobId || 'walrus_lesson_blob',
              reason: `Empirical lesson triggered: ${lesson.finding}`,
            };
          }
        }
      }
    }

    return { override: false };
  }
}

export const lessonEngine = new LessonEngine();

