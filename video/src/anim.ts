import { Easing, interpolate, spring } from 'remotion';
import { FPS } from './timeline';

export const easeIO = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** 0→1 between frames a and b (eased, clamped). */
export const prog = (f: number, a: number, b: number, ease = easeIO) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

/** Spring 0→1 starting at frame `at`. */
export const spr = (f: number, at: number, damping = 18, mass = 0.6) =>
  spring({ frame: f - at, fps: FPS, config: { damping, mass, stiffness: 140 } });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Number of characters visible for a typing cue. */
export const typedCount = (f: number, at: number, len: number, fpc: number) =>
  Math.max(0, Math.min(len, Math.floor((f - at) / fpc) + (f >= at ? 1 : 0)));

export const typed = (f: number, cue: { at: number; text?: string; fpc?: number }) => {
  const t = cue.text ?? '';
  return t.slice(0, typedCount(f, cue.at, t.length, cue.fpc ?? 1));
};

/** Generic keyframed value: keys = [{at, v, dur}] — eases from previous value. */
export type Key = { at: number; v: number; dur?: number };
export const keyed = (f: number, keys: Key[], ease = easeIO) => {
  let v = keys[0].v;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.at) break;
    const t = prog(f, k.at, k.at + (k.dur ?? 18), ease);
    v = lerp(keys[i - 1].v, k.v, t);
    if (t < 1) break;
  }
  return v;
};

export const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

