import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, MONO } from '../brand';
import { prog, spr } from '../anim';

/** Visible touch: finger dot lands, presses, ripples, lifts. Place inside a position:relative element. */
export const Tap: React.FC<{ at: number; x?: string; y?: string; size?: number }> = ({ at, x = '50%', y = '50%', size = 40 }) => {
  const f = useCurrentFrame();
  const d = f - at;
  if (d < -9 || d > 24) return null;
  const appear = prog(f, at - 9, at - 1);
  const press = d >= 0 && d < 5 ? 0.82 : 1;
  const out = 1 - prog(f, at + 10, at + 22);
  const ripple = prog(f, at, at + 20);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, zIndex: 50, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: -size * 1.6,
          top: -size * 1.6,
          width: size * 3.2,
          height: size * 3.2,
          borderRadius: '50%',
          border: `3px solid ${C.blue}`,
          opacity: d >= 0 ? 0.55 * (1 - ripple) : 0,
          transform: `scale(${0.3 + ripple * 0.7})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -size / 2,
          top: -size / 2,
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.78)',
          border: `3px solid ${C.blue}`,
          boxShadow: '0 6px 18px rgba(15,23,42,0.35)',
          opacity: appear * out,
          transform: `scale(${(1.5 - appear * 0.5) * press})`,
        }}
      />
    </div>
  );
};

/** Finger held on a moving point (sliders, swipes). */
export const Finger: React.FC<{ from: number; to: number; size?: number }> = ({ from, to, size = 40 }) => {
  const f = useCurrentFrame();
  if (f < from - 9 || f > to + 14) return null;
  const o = prog(f, from - 9, from - 1) * (1 - prog(f, to + 2, to + 14));
  return (
    <div style={{ position: 'absolute', left: '50%', top: '50%', width: 0, height: 0, zIndex: 50 }}>
      <div
        style={{
          position: 'absolute',
          left: -size / 2,
          top: -size / 2,
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.78)',
          border: `3px solid ${C.blue}`,
          boxShadow: '0 6px 18px rgba(15,23,42,0.35)',
          opacity: o,
          transform: `scale(${f >= from && f <= to ? 0.88 : 1})`,
        }}
      />
    </div>
  );
};

export const Caret: React.FC<{ on: boolean }> = ({ on }) => {
  const f = useCurrentFrame();
  if (!on) return null;
  return <span style={{ display: 'inline-block', width: 2, height: '1.15em', background: C.blue, marginLeft: 1, verticalAlign: 'middle', opacity: Math.floor(f / 8) % 2 ? 0.15 : 1 }} />;
};

export const Spinner: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => {
  const f = useCurrentFrame();
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid ${color}`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        transform: `rotate(${f * 15}deg)`,
        verticalAlign: 'middle',
        flexShrink: 0,
      }}
    />
  );
};

/** Range input replica. value in [min,max]. */
export const Slider: React.FC<{ value: number; min: number; max: number; drag?: [number, number]; anchor?: string; disabled?: boolean }> = ({
  value,
  min,
  max,
  drag,
  anchor,
  disabled,
}) => {
  const p = (value - min) / (max - min);
  return (
    <div data-a={anchor} style={{ position: 'relative', height: 24, margin: '8px 0 16px', opacity: disabled ? 0.5 : 1 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 10, height: 5, borderRadius: 3, background: '#e5e7eb' }} />
      <div style={{ position: 'absolute', left: 0, width: `${p * 100}%`, top: 10, height: 5, borderRadius: 3, background: C.blue }} />
      <div
        style={{
          position: 'absolute',
          left: `calc(${p * 100}% - 11px)`,
          top: 1,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: C.blue,
          border: '3px solid #fff',
          boxShadow: '0 1px 4px rgba(0,0,0,.35)',
        }}
      >
        {drag && <Finger from={drag[0]} to={drag[1]} />}
      </div>
    </div>
  );
};

/** Annotation tag (video overlay, not product UI) that pops inside the top-right of its parent. */
export const Callout: React.FC<{ at: number; k: string; text: string; color?: string; place?: 'top' | 'bottom'; align?: 'left' | 'center' | 'right'; scale?: number; until?: number }> = ({
  at,
  k,
  text,
  color = C.ink,
  align = 'right',
  scale = 1,
  until,
}) => {
  const f = useCurrentFrame();
  const s = spr(f, at, 14);
  const out = until ? 1 - prog(f, until, until + 8) : 1;
  if (f < at) return null;
  const pos: React.CSSProperties =
    align === 'center' ? { left: '50%', transform: `translateX(-50%) scale(${s * scale})` } : align === 'left' ? { left: 10, transform: `scale(${s * scale})` } : { right: 10, transform: `scale(${s * scale})` };
  return (
    <div
      style={{
        position: 'absolute',
        top: -13,
        ...pos,
        transformOrigin: 'center center',
        zIndex: 40,
        opacity: out,
        whiteSpace: 'nowrap',
        background: color,
        color: '#fff',
        borderRadius: 8,
        padding: '4px 10px',
        boxShadow: '0 8px 18px rgba(15,23,42,.24)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.2,
        pointerEvents: 'none',
      }}
    >
      <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', background: 'rgba(255,255,255,.18)', padding: '2px 5px', borderRadius: 4 }}>{k}</span>
      {text}
    </div>
  );
};

/** Pulsing highlight ring around parent. */
export const Glow: React.FC<{ from: number; to: number; color?: string; radius?: number }> = ({ from, to, color = C.blue, radius = 12 }) => {
  const f = useCurrentFrame();
  if (f < from || f > to + 10) return null;
  const o = prog(f, from, from + 8) * (1 - prog(f, to, to + 10));
  const pulse = 0.5 + 0.5 * Math.sin((f - from) / 4);
  return (
    <div
      style={{
        position: 'absolute',
        inset: -5,
        borderRadius: radius + 4,
        border: `3px solid ${color}`,
        boxShadow: `0 0 ${10 + pulse * 14}px ${color}66`,
        opacity: o,
        pointerEvents: 'none',
        zIndex: 30,
      }}
    />
  );
};

