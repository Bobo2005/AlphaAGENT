export type Verdict = 'FOLLOW' | 'WATCH' | 'SKIP';

export type GateStatus = 'passed' | 'not_yet' | 'failed' | 'applied';

export interface GateResult {
  id: 'picks' | 'luck' | 'hidden' | 'penalty' | 'category';
  label: string;   // plain English, e.g. "Verified picks"
  detail: string;  // e.g. "5 of 15 needed"
  status: GateStatus;
}

export interface TipsterSummary {
  address: string;
  label?: string;
  isSample: boolean;
  picks: number;
  skillPct: number | null;   // null shows "Too early" or "Not rated"
  hiddenBetsPct: number;
  verdict: Verdict;
  reason: string;            // one line, plain English
  wonCount?: number;
  lostCount?: number;
  pendingCount?: number;
  winRatePct?: number;
}

export interface PickRow {
  game: string;
  side: string;
  yourChancePct: number;
  marketChancePct: number;
  result: 'Won' | 'Lost' | 'Pending' | 'Disputed' | 'Void';
}

export interface TipsterReport extends TipsterSummary {
  lockedOnSui: number;
  savedInMemory: number;
  hiddenBets: number;
  gates: GateResult[];
  recentPicks: PickRow[];
}

export interface PickReceipt {
  matchup: string;
  side: string;
  yourChancePct: number;
  lockedAtUtc: string;
  txDigest: string;
  explorerUrl: string;
  fingerprint: string;
}

export interface RebuildStep {
  label: string;
  result: string;
  status: 'done' | 'running' | 'failed';
}
