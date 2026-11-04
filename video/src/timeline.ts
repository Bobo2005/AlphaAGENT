// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH FOR TIMING — 2m 30s (150.0s = 75 bars @ 120 BPM = 4500 frames).
// Both the Remotion scenes (visuals) and scripts/synth.ts (soundtrack + UI
// sounds) import this file, so picture and sound can never drift apart.
// Pure TypeScript, no imports: runs in the browser bundle and in plain Node.
// ─────────────────────────────────────────────────────────────────────────────

export const FPS = 30;
export const BPM = 120;
export const BEAT = (FPS * 60) / BPM; // 15 frames = 0.5 s
export const BAR = BEAT * 4; // 60 frames = 2.0 s

export type SceneId = 'cover' | 'directory' | 'audit' | 'luck' | 'pick' | 'bot' | 'payoff' | 'outro';

const SCENE_BARS: [SceneId, number][] = [
  ['cover', 4],      // 8s   (0:00 - 0:08)  frames 0..240
  ['directory', 12], // 24s  (0:08 - 0:32)  frames 240..960
  ['audit', 13],     // 26s  (0:32 - 0:58)  frames 960..1740
  ['luck', 10],      // 20s  (0:58 - 1:18)  frames 1740..2340
  ['pick', 14],      // 28s  (1:18 - 1:46)  frames 2340..3180
  ['bot', 9],        // 18s  (1:46 - 2:04)  frames 3180..3720
  ['payoff', 9],     // 18s  (2:04 - 2:22)  frames 3720..4260
  ['outro', 4],      // 8s   (2:22 - 2:30)  frames 4260..4500
];

export type SceneSpan = { id: SceneId; startBar: number; bars: number; from: number; dur: number };

export const SCENES: SceneSpan[] = (() => {
  let bar = 0;
  return SCENE_BARS.map(([id, bars]) => {
    const s = { id, startBar: bar, bars, from: bar * BAR, dur: bars * BAR };
    bar += bars;
    return s;
  });
})();

export const TOTAL_BARS = SCENE_BARS.reduce((a, [, b]) => a + b, 0); // 75 bars
export const TOTAL_FRAMES = TOTAL_BARS * BAR; // 4500 frames = 150.0s

export const scene = (id: SceneId): SceneSpan => SCENES.find((s) => s.id === id)!;

// ── Sound types ──────────────────────────────────────────────────────────────
export type Sfx =
  | 'tap'
  | 'type'
  | 'send'
  | 'msg'
  | 'notify'
  | 'success'
  | 'stamp'
  | 'tick'
  | 'pop'
  | 'reject'
  | 'whoosh'
  | 'drag';

export type Cue = { at: number; sfx?: Sfx; text?: string; fpc?: number; to?: number; end?: number };

// Typing speed helpers (frames per character)
export const FAST_TYPE = 1.1; // smooth readable address typing across ~72 frames
export const SLOW_TYPE = 6;   // deliberate numeric input typing

// Example data used by typing cues (ALL INVENTED — not from the repo)
export const EX = {
  guestAddr: '0x8f2a6b1d93e4c07a5b18f2e6d40c9a73b25e18f4d6a0c39b7e21f58a4c90c41d',
  streakAddr: '0x5d21c8e4b07f93a6d15e2b48c9f07a36e1d84b25f9c03e7a6b14d82f5c39a7f0',
};

// All cue frames are LOCAL to their scene (0 = the scene's first downbeat).
export const CUES = {
  // 4 bars = 240 frames
  cover: {
    hit: { at: 0 },
    pushHome: { at: 60, sfx: 'whoosh' },
    watchHighlight: { at: 105, sfx: 'tick' },
    followHighlight: { at: 145, sfx: 'pop' },
    ctaTap: { at: 195, sfx: 'tap' },
  },
  // 12 bars = 720 frames
  directory: {
    guestTap: { at: 36, sfx: 'tap' },
    guestDone: { at: 84, sfx: 'pop' },
    refreshTap: { at: 130, sfx: 'tap' },
    row1: { at: 162, sfx: 'msg' },
    row2: { at: 176, sfx: 'msg' },
    row3: { at: 190, sfx: 'msg' },
    row4: { at: 204, sfx: 'msg' },
    auditToast: { at: 214, sfx: 'notify' },
    auditToastOut: { at: 300 },
    skillCallout: { at: 248, sfx: 'tick' },
    filterWatchTap: { at: 340, sfx: 'tap' },
    filterFollowTap: { at: 410, sfx: 'tap' },
    filterAllTap: { at: 475, sfx: 'tap' },
    swipe: { at: 510, end: 548, sfx: 'drag' },
    followTap: { at: 570, sfx: 'tap' },
    toast: { at: 580, sfx: 'notify' },
    toastOut: { at: 690 },
  },
  // 13 bars = 780 frames
  audit: {
    focusTap: { at: 24, sfx: 'tap' },
    typeAddr: { at: 34, sfx: 'type', text: EX.streakAddr, fpc: FAST_TYPE },
    checkTap: { at: 126, sfx: 'tap' },
    send: { at: 128, sfx: 'send' },
    result: { at: 174, sfx: 'stamp' },
    stats: { at: 195 },
    tag1: { at: 225, sfx: 'tick' },
    tag2: { at: 255, sfx: 'tick' },
    tag3: { at: 285, sfx: 'tick' },
    tag4: { at: 315, sfx: 'tick' },
    scrollGates: { at: 380 },
    gate1: { at: 415, sfx: 'pop' },
    gate2: { at: 455, sfx: 'pop' },
    gate3: { at: 495, sfx: 'pop' },
    gate4: { at: 535, sfx: 'pop' },
    scrollPicks: { at: 600 },
    pick1: { at: 630, sfx: 'msg' },
    pick2: { at: 650, sfx: 'msg' },
    pick3: { at: 670, sfx: 'msg' },
  },
  // 10 bars = 600 frames
  luck: {
    highlight: { at: 24, sfx: 'tick' },
    compareCards: { at: 90, sfx: 'pop' },
    drag1: { at: 160, end: 250, sfx: 'drag' }, // n: 5 -> 10
    midPause: { at: 255, sfx: 'tick' },
    drag2: { at: 295, end: 385, sfx: 'drag' }, // n: 10 -> 15
    verdict: { at: 392, sfx: 'success' },
    dragRate: { at: 455, end: 520, sfx: 'drag' }, // n: 15 -> 20, rate: 100 -> 75
    settled: { at: 530, sfx: 'pop' },
  },
  // 14 bars = 840 frames
  pick: {
    selectTap: { at: 28, sfx: 'tap' },
    hoverOpt2: { at: 68, sfx: 'tick' },
    hoverOpt3: { at: 102, sfx: 'tick' },
    optionTap: { at: 138, sfx: 'tap' },
    sideTap: { at: 195, sfx: 'tap' },
    chanceDrag1: { at: 230, end: 290, sfx: 'drag' }, // 70 -> 62
    chanceDrag2: { at: 305, end: 365, sfx: 'drag' }, // 62 -> 68
    lockTap: { at: 405, sfx: 'tap' },
    modalIn: { at: 412, sfx: 'whoosh' },
    signerCheck: { at: 455, sfx: 'tick' },
    approveTap: { at: 515, sfx: 'tap' },
    step1: { at: 545, sfx: 'tick' },
    step2: { at: 585, sfx: 'tick' },
    step3: { at: 625, sfx: 'tick' },
    modalOut: { at: 660 },
    receipt: { at: 668, sfx: 'stamp' },
    hashHighlight: { at: 725, sfx: 'success' },
  },
  // 9 bars = 540 frames
  bot: {
    toggleTap: { at: 28, sfx: 'tap' },
    toggleDone: { at: 34, sfx: 'pop' },
    bankrollTap: { at: 85, sfx: 'tap' },
    typeBankroll: { at: 95, sfx: 'type', text: '25', fpc: SLOW_TYPE },
    kellyTap: { at: 140, sfx: 'tap' },
    kellyPick: { at: 185, sfx: 'tap' },
    capTap: { at: 225, sfx: 'tap' },
    typeCap: { at: 235, sfx: 'type', text: '5.0', fpc: SLOW_TYPE },
    edgeTap: { at: 275, sfx: 'tap' },
    typeEdge: { at: 285, sfx: 'type', text: '2.0', fpc: SLOW_TYPE },
    saveTap: { at: 325, sfx: 'tap' },
    alert: { at: 334, sfx: 'notify' },
    okTap: { at: 382, sfx: 'tap' },
    gateFocus: { at: 400 },
    gate1Tick: { at: 420, sfx: 'tick' },
    gate2Tick: { at: 445, sfx: 'tick' },
    gate3Tick: { at: 470, sfx: 'pop' },
  },
  // 9 bars = 540 frames
  payoff: {
    scanTap: { at: 26, sfx: 'tap' },
    send: { at: 28, sfx: 'send' },
    shield1: { at: 78, sfx: 'pop' },
    shield2: { at: 118, sfx: 'reject' },
    shield3: { at: 158, sfx: 'reject' },
    shield4: { at: 198, sfx: 'reject' },
    scrollLedger: { at: 245 },
    trade1: { at: 290, sfx: 'msg' },
    trade2: { at: 345, sfx: 'msg' },
    receiptFocus: { at: 395, sfx: 'tick' },
    done: { at: 440, sfx: 'success' },
  },
  // 4 bars = 240 frames
  outro: {
    logo: { at: 0 },
    tagline: { at: 50, sfx: 'pop' },
    cta: { at: 105, sfx: 'success' },
    pills: { at: 145, sfx: 'tick' },
  },
} satisfies Record<SceneId, Record<string, Cue>>;

// Flatten every cue into absolute-frame sound events.
export type SoundEvent = { frame: number; sfx: Sfx; seed: number };

export const SOUND_EVENTS: SoundEvent[] = (() => {
  const out: SoundEvent[] = [];
  let seed = 1;
  for (const s of SCENES) {
    const cues = (CUES as Record<string, Record<string, Cue>>)[s.id];
    for (const key of Object.keys(cues)) {
      const c = cues[key];
      if (!c.sfx) continue;
      const abs = s.from + c.at;
      if (c.sfx === 'type' && c.text) {
        const fpc = c.fpc ?? 1;
        const step = Math.max(fpc, 2);
        const durFrames = c.text.length * fpc;
        for (let f = 0; f < durFrames; f += step) out.push({ frame: Math.round(abs + f), sfx: 'type', seed: seed++ });
      } else if (c.sfx === 'drag' && c.end) {
        for (let f = c.at; f <= c.end; f += 6) out.push({ frame: s.from + f, sfx: 'tick', seed: seed++ });
      } else {
        out.push({ frame: abs, sfx: c.sfx, seed: seed++ });
      }
    }
    if (s.from > 0) out.push({ frame: s.from - 9, sfx: 'whoosh', seed: seed++ });
  }
  return out.sort((a, b) => a.frame - b.frame);
})();
