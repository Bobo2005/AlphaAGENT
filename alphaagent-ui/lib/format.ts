import type { Verdict } from './types';

export const short = (a: string) => (a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

export function formatSkill(t: { skillPct: number | null; verdict: Verdict }) {
  if (t.skillPct === null) return t.verdict === 'WATCH' ? 'Too early' : 'Not rated';
  return `${t.skillPct >= 0 ? '+' : ''}${t.skillPct.toFixed(1)}%`;
}
