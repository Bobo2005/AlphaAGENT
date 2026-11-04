// Generates public/soundtrack.wav: original music + UI sounds, 100% synthesised.
// Timing comes from src/timeline.ts (the same file the visuals use).
// Run: node scripts/synth.ts
import { writeFileSync, mkdirSync } from 'node:fs';
import { BAR, FPS, SCENES, SOUND_EVENTS, TOTAL_BARS, TOTAL_FRAMES, type Sfx } from '../src/timeline.ts';

const SR = 48000;
const N = Math.ceil((TOTAL_FRAMES / FPS) * SR) + SR; // +1s tail safety, trimmed later
const BAR_S = BAR / FPS; // 2.0 s
const BEAT_S = BAR_S / 4;

const music = [new Float32Array(N), new Float32Array(N)];
const drums = [new Float32Array(N), new Float32Array(N)];
const sfx = [new Float32Array(N), new Float32Array(N)];

// deterministic RNG
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const noiseR = rng(12345);
const noise = () => noiseR() * 2 - 1;

const lpA = (fc: number) => 1 - Math.exp((-2 * Math.PI * fc) / SR);

function put(bus: Float32Array[], i: number, v: number, pan = 0) {
  if (i < 0 || i >= N) return;
  const l = Math.cos(((pan + 1) * Math.PI) / 4);
  const r = Math.sin(((pan + 1) * Math.PI) / 4);
  bus[0][i] += v * l * 1.414;
  bus[1][i] += v * r * 1.414;
}

// ── Instruments ──────────────────────────────────────────────────────────────
function kick(t0: number, g = 1) {
  const s0 = Math.round(t0 * SR);
  let ph = 0;
  const len = Math.round(0.42 * SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const f = 44 + 120 * Math.exp(-t * 30);
    ph += (2 * Math.PI * f) / SR;
    const amp = Math.exp(-t * 7.5) * (k < 48 ? k / 48 : 1);
    const click = k < 240 ? noise() * Math.exp(-k / 40) * 0.25 : 0;
    put(drums, s0 + k, (Math.sin(ph) * amp + click) * 0.9 * g);
  }
}
function hat(t0: number, g = 1, open = false, pan = 0.15) {
  const s0 = Math.round(t0 * SR);
  const len = Math.round((open ? 0.22 : 0.06) * SR);
  let prev = 0;
  let hp = 0;
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const n = noise();
    hp = n - prev; // crude high-pass
    prev = n;
    const amp = Math.exp(-t * (open ? 16 : 70));
    put(drums, s0 + k, hp * amp * 0.16 * g, pan);
  }
}
function clap(t0: number, g = 1) {
  const s0 = Math.round(t0 * SR);
  const len = Math.round(0.25 * SR);
  let lp = 0;
  let prev = 0;
  const a = lpA(2200);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    lp += a * (noise() - lp);
    const bp = lp - prev;
    prev = lp;
    const bursts = [0, 0.011, 0.022].reduce((acc, o) => acc + (t >= o ? Math.exp(-(t - o) * (o === 0.022 ? 18 : 120)) : 0), 0);
    put(drums, s0 + k, bp * bursts * 1.1 * g, -0.1);
  }
}
function saw(ph: number) {
  return 2 * (ph - Math.floor(ph + 0.5));
}
function bass(t0: number, dur: number, f: number, g = 1) {
  const s0 = Math.round(t0 * SR);
  const len = Math.round((dur + 0.05) * SR);
  let p1 = 0, p2 = 0, y = 0, y2 = 0;
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    p1 += f / SR;
    p2 += (f * 1.006) / SR;
    const x = 0.6 * saw(p1) + 0.4 * saw(p2) + 0.5 * Math.sin(2 * Math.PI * p1);
    const cut = 180 + 900 * Math.exp(-t * 14);
    const a = lpA(cut);
    y += a * (x - y);
    y2 += a * (y - y2);
    const env = Math.min(1, k / 120) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.05) : 1);
    put(music, s0 + k, y2 * env * 0.42 * g);
  }
}
function pad(t0: number, dur: number, freqs: number[], g = 1, cutoff = 1400) {
  const s0 = Math.round(t0 * SR);
  const rel = 0.5;
  const len = Math.round((dur + rel) * SR);
  freqs.forEach((f, idx) => {
    const det = [0.997, 1.0, 1.004];
    const ph = [0.1, 0.4, 0.7];
    let y = 0, y2 = 0;
    const a = lpA(cutoff);
    const pan = (idx - 1) * 0.35;
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      let x = 0;
      for (let d = 0; d < 3; d++) {
        ph[d] += (f * det[d]) / SR;
        x += saw(ph[d]);
      }
      x /= 3;
      y += a * (x - y);
      y2 += a * (y - y2);
      const att = Math.min(1, t / 0.25);
      const r = t > dur ? Math.max(0, 1 - (t - dur) / rel) : 1;
      put(music, s0 + k, y2 * att * r * 0.13 * g, pan);
    }
  });
}
function pluck(t0: number, f: number, g = 1, pan = 0, cutoff = 3200) {
  const s0 = Math.round(t0 * SR);
  const len = Math.round(0.5 * SR);
  let p = 0, y = 0;
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    p += f / SR;
    const x = 0.55 * saw(p) + 0.45 * (p % 1 < 0.5 ? 1 : -1);
    const a = lpA(400 + cutoff * Math.exp(-t * 18));
    y += a * (x - y);
    const env = Math.exp(-t * 9) * Math.min(1, k / 60);
    put(music, s0 + k, y * env * 0.12 * g, pan);
  }
}
function riser(tEnd: number, dur: number, g = 1) {
  const s0 = Math.round((tEnd - dur) * SR);
  const len = Math.round(dur * SR);
  let y = 0;
  for (let k = 0; k < len; k++) {
    const p = k / len;
    const a = lpA(300 + 7000 * p * p);
    y += a * (noise() - y);
    put(drums, s0 + k, y * p * p * 0.35 * g, Math.sin(p * 12) * 0.4);
  }
}
function impact(t0: number, g = 1) {
  const s0 = Math.round(t0 * SR);
  const len = Math.round(1.6 * SR);
  let ph = 0, y = 0;
  const a = lpA(5000);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    ph += (2 * Math.PI * (36 + 60 * Math.exp(-t * 10))) / SR;
    y += a * (noise() - y);
    const boom = Math.sin(ph) * Math.exp(-t * 3.2) * 0.7;
    const crash = y * Math.exp(-t * 2.6) * 0.18;
    put(drums, s0 + k, (boom + crash) * g);
  }
}

// ── Harmony: A-minor progression Am – F – C – G (one chord per bar) ─────────
const CHORDS = [
  { pad: [220.0, 261.63, 329.63], bass: 110.0, arp: [440.0, 523.25, 659.25, 880.0] }, // Am
  { pad: [174.61, 220.0, 261.63], bass: 87.31, arp: [349.23, 440.0, 523.25, 698.46] }, // F
  { pad: [196.0, 261.63, 329.63], bass: 65.41, arp: [392.0, 523.25, 659.25, 783.99] }, // C
  { pad: [196.0, 246.94, 293.66], bass: 98.0, arp: [392.0, 493.88, 587.33, 783.99] }, // G
];

const sceneOfBar = (b: number) => SCENES.find((s) => b >= s.startBar && b < s.startBar + s.bars)!.id;
const kickTimes: number[] = [];

for (let b = 0; b < TOTAL_BARS; b++) {
  const t = b * BAR_S;
  const sc = sceneOfBar(b);
  const ch = CHORDS[b % 4];
  const isOutro = sc === 'outro';
  const isCover = sc === 'cover';
  const isLuck = sc === 'luck';
  const isPayoff = sc === 'payoff';
  const lastBar = b === TOTAL_BARS - 1;

  // Pad
  if (isOutro) {
    if (b === SCENES.find((s) => s.id === 'outro')!.startBar) pad(t, BAR_S * 3 - 0.6, CHORDS[0].pad.concat([440]), 1.25, 1800);
  } else {
    pad(t, BAR_S, ch.pad, isCover ? 1.15 : isLuck ? 1.0 : 0.85, isCover ? 900 : 1500);
  }

  // Drums
  const fullDrums = !isCover && !isOutro;
  for (let q = 0; q < 4; q++) {
    const tb = t + q * BEAT_S;
    if (fullDrums) {
      if (isLuck) {
        if (q === 0 || q === 2) { kick(tb, 0.8); kickTimes.push(tb); }
      } else {
        kick(tb, 1); kickTimes.push(tb);
      }
      if (!isLuck || b >= SCENES.find((s) => s.id === 'luck')!.startBar + 2) {
        hat(tb + BEAT_S / 2, 1, isPayoff && q % 2 === 1);
        if (isPayoff || sc === 'bot') { hat(tb + BEAT_S / 4, 0.5, false, -0.2); hat(tb + (3 * BEAT_S) / 4, 0.5, false, -0.2); }
      }
      if ((q === 1 || q === 3) && sc !== 'directory' && !isLuck) clap(tb, 0.9);
      if ((q === 1 || q === 3) && sc === 'directory' && b >= 4) clap(tb, 0.6);
    }
  }

  // Bass: driving 8ths
  if (fullDrums) {
    for (let e = 0; e < 8; e++) {
      const te = t + e * (BEAT_S / 2);
      if (isLuck && e % 2 === 1) continue;
      const oct = e === 3 || e === 7 ? 2 : 1;
      bass(te, BEAT_S / 2 - 0.03, ch.bass * oct, isLuck ? 0.8 : 1);
    }
  }

  // Arps
  if (isCover || isLuck || sc === 'bot' || isPayoff || sc === 'pick') {
    const steps = isPayoff ? 16 : 8;
    const dt = BAR_S / steps;
    for (let s = 0; s < steps; s++) {
      const idx = [0, 1, 2, 3, 2, 1, 2, 3][s % 8];
      const f = ch.arp[idx] * (isPayoff && s % 4 === 3 ? 2 : 1);
      const g = isCover ? 0.8 : sc === 'pick' ? 0.45 : isPayoff ? 0.75 : 0.65;
      pluck(t + s * dt, f, g, s % 2 ? 0.35 : -0.35, isCover ? 1600 : 3200);
    }
  }
  if (isOutro && !lastBar) {
    // gentle bell arpeggio over the resolve
    [0, 1, 2, 3].forEach((s) => pluck(t + s * BEAT_S, CHORDS[0].arp[s] * 2, 0.5, s % 2 ? 0.3 : -0.3, 2400));
  }
}

// Risers into key sections and impacts on the downbeat
for (const id of ['directory', 'pick', 'payoff', 'outro'] as const) {
  const s = SCENES.find((x) => x.id === id)!;
  const ts = s.startBar * BAR_S;
  riser(ts, id === 'directory' ? BAR_S : BAR_S / 2, id === 'payoff' ? 1.2 : 0.9);
  impact(ts, id === 'outro' ? 1.2 : 0.9);
  if (id === 'outro') kickTimes.push(ts);
}

// Sidechain duck on the music bus
for (const tk of kickTimes) {
  const s0 = Math.round(tk * SR);
  const len = Math.round(0.3 * SR);
  for (let k = 0; k < len; k++) {
    const d = 1 - 0.55 * Math.exp((-k / SR) * 11);
    const i = s0 + k;
    if (i < N) { music[0][i] *= d; music[1][i] *= d; }
  }
}

// ── UI sounds ────────────────────────────────────────────────────────────────
function tone(s0: number, f0: number, f1: number, dur: number, decay: number, g: number, pan = 0, shape: 'sin' | 'sq' = 'sin') {
  const len = Math.round(dur * SR);
  let ph = 0;
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const f = f0 + (f1 - f0) * Math.min(1, t / dur);
    ph += f / SR;
    const w = shape === 'sin' ? Math.sin(2 * Math.PI * ph) : Math.tanh(Math.sin(2 * Math.PI * ph) * 3) * 0.6;
    const env = Math.exp(-t * decay) * Math.min(1, k / 30);
    put(sfx, s0 + k, w * env * g, pan);
  }
}
function noiseBurst(s0: number, dur: number, fc: number, decay: number, g: number, pan = 0, r = noise) {
  const len = Math.round(dur * SR);
  let y = 0, prev = 0;
  const a = lpA(fc);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    y += a * (r() - y);
    const hp = y - prev;
    prev = y;
    put(sfx, s0 + k, (hp * 2 + y * 0.5) * Math.exp(-t * decay) * g, pan);
  }
}
function bell(s0: number, f: number, g: number, pan = 0) {
  tone(s0, f, f, 0.9, 5, g, pan);
  tone(s0, f * 2.76, f * 2.76, 0.5, 9, g * 0.25, pan);
  tone(s0, f * 5.4, f * 5.4, 0.25, 16, g * 0.1, pan);
}

function playSfx(type: Sfx, frame: number, seed: number) {
  const s0 = Math.round((frame / FPS) * SR);
  const r = rng(seed * 7919);
  const rn = () => r() * 2 - 1;
  switch (type) {
    case 'tap':
      tone(s0, 2400, 1800, 0.03, 160, 0.35);
      tone(s0, 220, 120, 0.08, 45, 0.45);
      break;
    case 'type':
      noiseBurst(s0, 0.025, 2500 + r() * 2500, 220, 0.22 + r() * 0.1, rn() * 0.3, rn);
      tone(s0, 900 + r() * 500, 700, 0.012, 300, 0.05);
      break;
    case 'send': {
      const len = Math.round(0.28 * SR);
      let y = 0;
      for (let k = 0; k < len; k++) {
        const p = k / len;
        y += lpA(400 + 6000 * p) * (rn() - y);
        put(sfx, s0 + k, y * Math.sin(Math.PI * p) * 0.35, -0.6 + 1.2 * p);
      }
      tone(s0, 420, 980, 0.18, 10, 0.12);
      break;
    }
    case 'msg':
      tone(s0, 880, 880, 0.12, 28, 0.2, -0.1);
      tone(s0 + Math.round(0.06 * SR), 1320, 1320, 0.16, 24, 0.2, 0.1);
      break;
    case 'notify':
      bell(s0, 1318.5, 0.28, -0.15);
      bell(s0 + Math.round(0.1 * SR), 1975.5, 0.22, 0.15);
      break;
    case 'success':
      [1046.5, 1318.5, 1568.0, 2093.0].forEach((f, i) => bell(s0 + Math.round(i * 0.07 * SR), f, 0.2, -0.3 + i * 0.2));
      break;
    case 'stamp':
      tone(s0, 130, 48, 0.35, 11, 0.85);
      noiseBurst(s0, 0.12, 900, 40, 0.5);
      break;
    case 'tick':
      tone(s0, 3200, 3000, 0.015, 380, 0.14, rn() * 0.4);
      break;
    case 'pop':
      tone(s0, 520, 980, 0.07, 40, 0.3);
      break;
    case 'reject':
      tone(s0, 240, 190, 0.11, 22, 0.22, 0, 'sq');
      tone(s0 + Math.round(0.12 * SR), 200, 160, 0.13, 20, 0.2, 0, 'sq');
      break;
    case 'whoosh': {
      const len = Math.round(0.36 * SR);
      let y = 0;
      for (let k = 0; k < len; k++) {
        const p = k / len;
        const env = p < 0.83 ? Math.pow(p / 0.83, 2) : Math.max(0, 1 - (p - 0.83) / 0.17);
        y += lpA(500 + 5000 * p) * (rn() - y);
        put(sfx, s0 + k, y * env * 0.4, 0.7 - 1.4 * p);
      }
      break;
    }
    case 'drag':
      break;
  }
}
for (const e of SOUND_EVENTS) playSfx(e.sfx, e.frame, e.seed);

// ── Mix down ─────────────────────────────────────────────────────────────────
const outLen = Math.ceil((TOTAL_FRAMES / FPS) * SR);
const L = new Float32Array(outLen);
const R = new Float32Array(outLen);
let peak = 0;
for (let i = 0; i < outLen; i++) {
  let l = music[0][i] * 0.9 + drums[0][i] * 0.75 + sfx[0][i] * 1.0;
  let r = music[1][i] * 0.9 + drums[1][i] * 0.75 + sfx[1][i] * 1.0;
  l = Math.tanh(l * 1.2);
  r = Math.tanh(r * 1.2);
  L[i] = l;
  R[i] = r;
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
}
const norm = 0.93 / peak;
const fadeOut = Math.round(1.6 * SR);
const fadeIn = Math.round(0.01 * SR);

const buf = Buffer.alloc(44 + outLen * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + outLen * 4, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(outLen * 4, 40);
for (let i = 0; i < outLen; i++) {
  let g = norm;
  if (i < fadeIn) g *= i / fadeIn;
  if (i > outLen - fadeOut) g *= Math.max(0, (outLen - i) / fadeOut);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
}
mkdirSync(new URL('../public/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/soundtrack.wav', import.meta.url), buf);
console.log(`soundtrack.wav  ${(outLen / SR).toFixed(2)}s  ${SOUND_EVENTS.length} UI sound events  peak-norm x${norm.toFixed(2)}`);

