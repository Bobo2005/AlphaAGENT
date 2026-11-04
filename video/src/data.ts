// ALL EXAMPLE DATA — invented for the video. Nothing here comes from the repo's
// data files, environment, keys or real accounts.
import { EX } from './timeline';

export type Verdict = 'FOLLOW' | 'WATCH' | 'SKIP';
export type Tipster = {
  avatar: string;
  label: string;
  addr: string;
  picks: number;
  win: number;
  W: number;
  L: number;
  skill: string;
  edge: string;
  hidden: number;
  verdict: Verdict;
  reason: string;
};

export const TIPSTERS: Tipster[] = [
  { avatar: '🎯', label: 'SharpModel_30', addr: '0x3c7e91a4d2f08b5e6c13a9d47f2e80b5c61d9a3e7f04b28c5d19e6a3f7b29b12', picks: 30, win: 63, W: 19, L: 11, skill: '+7.8%', edge: '+7.8% edge', hidden: 0, verdict: 'FOLLOW', reason: 'Passed all 4 verification gates with positive shrunk edge.' },
  { avatar: '🔥', label: 'StreakKing', addr: EX.streakAddr, picks: 5, win: 100, W: 5, L: 0, skill: 'Too early', edge: 'Too early', hidden: 0, verdict: 'WATCH', reason: 'Sample size too small (5/15 picks). Cannot rule out luck.' },
  { avatar: '🦅', label: 'LineHawk', addr: '0x81b4f6e2a90c37d5b18e4f60a2c97d3b5e81f40c6a29d7b3e5f18c04a6d92c9d', picks: 9, win: 67, W: 6, L: 3, skill: 'Too early', edge: 'Too early', hidden: 0, verdict: 'WATCH', reason: 'Sample size too small (9/15 picks). Cannot rule out luck.' },
  { avatar: '🎲', label: 'HypeTips', addr: '0xe04a9c1f7b36d28e5a40c9f13b7e62d8a5c04f91e3b7d26a8c51f0e9b47a6d33', picks: 22, win: 55, W: 12, L: 10, skill: '-4.1%', edge: '-4.1% edge', hidden: 18, verdict: 'SKIP', reason: 'Negative skill vs market odds closing lines.' },
];

export const MATCHUPS = [
  // The app's own built-in fallback fixtures (DEFAULT_MATCHUPS), used as example games.
  { id: 'epl', emoji: '⚽', cat: 'EPL', title: 'Manchester United vs Chelsea', sides: [{ name: 'Man United', market: 46 }, { name: 'Chelsea', market: 54 }], mins: 65 },
  { id: 'nba', emoji: '🏀', cat: 'NBA', title: 'Lakers vs Warriors', sides: [{ name: 'Lakers', market: 62 }, { name: 'Warriors', market: 38 }], mins: 110 },
  { id: 'nfl', emoji: '🏈', cat: 'NFL', title: 'Baltimore Ravens vs Buffalo Bills', sides: [{ name: 'Ravens', market: 48 }, { name: 'Bills', market: 52 }], mins: 240 },
];

export const timeStr = (mins: number) => (mins > 60 ? `⏳ In ${Math.floor(mins / 60)}h ${mins % 60}m` : `⚡ In ${mins}m`);

export const PICK_RECEIPT = {
  suiObject: '0x7f3a91c5e2d84b06a1f9c37e5d20b84a6c19f3e7d05a2b8c4e61f9d3a7b05e21c',
  fingerprint: '9c4e1f7a2b8d03e6f5a19c7d4e2b60f83a5d1c9e7b24f06a8d3e5c1b9f7a42d6',
  lockedAt: '02:51 UTC, before kickoff',
};

// Copy-trade ledger rows (Fractional Kelly: f* = (p − m) / (1 − m), ¼ Kelly, 5% cap)
export const TRADES = [
  { event: 'Manchester United vs Chelsea', cat: 'EPL', tipster: 'SharpModel_30', taddr: TIPSTERS[0].addr, side: 'Chelsea', forecast: 68, odds: 1.85, edge: 14.0, stake: 1.25, stakePct: 5, mins: 65, digest: '4f9c2a1e7b3d', blob: 'Qm7Lk2pXv9RtB4' },
  { event: 'Baltimore Ravens vs Buffalo Bills', cat: 'NFL', tipster: 'SharpModel_30', taddr: TIPSTERS[0].addr, side: 'Bills', forecast: 59, odds: 1.92, edge: 7.0, stake: 0.91, stakePct: 3.6, mins: 240, digest: 'b81e5d03c9fa', blob: 'Zx4Wq8NmCe2Ld' },
];

