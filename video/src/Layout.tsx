import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT, Format, MONO } from './brand';
import { prog, spr } from './anim';

export const LAYOUT = {
  desktop: { caption: { x: 96, y: 0, w: 470, h: 1080 }, stage: { x: 610, y: 60, w: 1250, h: 960 } },
  vertical: { caption: { x: 70, y: 96, w: 940, h: 470 }, stage: { x: 40, y: 600, w: 1000, h: 1280 } },
};

export const CAPTIONS: Record<string, { n: string; label: string; head: string; line: string }> = {
  directory: { n: '01', label: 'Directory', head: 'Ranked by evidence, not streaks.', line: 'One-tap guest wallet, then a leaderboard sorted by shrunk Brier Skill Score.' },
  audit: { n: '02', label: 'Audit', head: 'Four gates. No shortcuts.', line: 'Sui timestamps, Walrus memory, hidden-bet check, beginner’s-luck shrinkage.' },
  luck: { n: '03', label: 'Luck Lab', head: '5–0 is a coin-flip story.', line: '1 in 32 by pure chance. AlphaAgent waits for 15 verified picks.' },
  pick: { n: '04', label: 'Lock a pick', head: 'Stamped before kickoff.', line: 'Live ESPN fixture, SHA-256 commit on Sui, permanent Walrus blob.' },
  bot: { n: '05', label: 'Copy Bot', head: 'Sized by math, not mood.', line: 'Fractional Kelly, bankroll caps, Safe-Shield on.' },
  payoff: { n: '06', label: 'Payoff', head: 'Only proven edges get copied.', line: 'Coin-toss streaks blocked. Every trade leaves a Sui digest and a Walrus receipt.' },
};

export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const a = f / 240;
  return (
    <AbsoluteFill style={{ background: C.canvas }}>
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(15,23,42,0.07) 1.2px, transparent 1.2px)', backgroundSize: '28px 28px' }} />
      <div style={{ position: 'absolute', width: 1100, height: 1100, borderRadius: '50%', left: -300 + Math.sin(a) * 80, top: -420 + Math.cos(a) * 60, background: 'radial-gradient(circle, rgba(11,79,156,0.13), transparent 65%)' }} />
      <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', right: -280 + Math.cos(a * 0.8) * 70, bottom: -380 + Math.sin(a * 0.8) * 60, background: 'radial-gradient(circle, rgba(22,163,74,0.10), transparent 65%)' }} />
    </AbsoluteFill>
  );
};

export const Logo: React.FC<{ size: number; badgeScale?: number }> = ({ size, badgeScale = 1 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.22, fontFamily: FONT }}>
    <span style={{ fontSize: size, fontWeight: 800, letterSpacing: '-0.035em', color: C.ink, lineHeight: 1 }}>AlphaAgent</span>
    <span
      style={{
        fontSize: size * 0.24 * badgeScale,
        fontWeight: 600,
        color: C.blue,
        background: '#eff6ff',
        border: `${Math.max(1, size * 0.012)}px solid #bfdbfe`,
        borderRadius: 999,
        padding: `${size * 0.04}px ${size * 0.13}px`,
        whiteSpace: 'nowrap',
        transform: `translateY(${size * 0.04}px)`,
      }}
    >
      Sui Testnet
    </span>
  </div>
);

export const Caption: React.FC<{ id: string; dur: number; format: Format }> = ({ id, dur, format }) => {
  const f = useCurrentFrame();
  const c = CAPTIONS[id];
  if (!c) return null;
  const v = format === 'vertical';
  const L = LAYOUT[format].caption;
  const out = prog(f, dur - 12, dur - 2);
  const item = (at: number) => {
    const s = spr(f, at, 16);
    return { opacity: s * (1 - out), transform: `translateY(${(1 - s) * 40 - out * 30}px)` };
  };
  const steps = Object.keys(CAPTIONS);
  const idx = steps.indexOf(id);
  return (
    <div
      style={{
        position: 'absolute',
        left: L.x,
        top: L.y,
        width: L.w,
        height: L.h,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: v ? 'flex-end' : 'center',
        fontFamily: FONT,
        paddingBottom: v ? 10 : 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: v ? 22 : 26, ...item(3) }}>
        <span style={{ fontFamily: MONO, fontSize: v ? 34 : 30, fontWeight: 600, color: '#fff', background: C.blue, borderRadius: 12, padding: v ? '6px 16px' : '5px 14px' }}>{c.n}</span>
        <span style={{ fontSize: v ? 30 : 26, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.blue }}>{c.label}</span>
      </div>
      <div style={{ fontSize: v ? 80 : 66, fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.03em', color: C.ink, marginBottom: v ? 22 : 28, ...item(7) }}>{c.head}</div>
      <div style={{ fontSize: v ? 36 : 31, lineHeight: 1.35, color: C.muted, fontWeight: 500, ...item(11) }}>{c.line}</div>
      {!v && (
        <div style={{ display: 'flex', gap: 10, marginTop: 48, ...item(14) }}>
          {steps.map((s, i) => (
            <span key={s} style={{ height: 6, width: i === idx ? 56 : 22, borderRadius: 3, background: i <= idx ? C.blue : '#cbd5e1' }} />
          ))}
        </div>
      )}
    </div>
  );
};

/** The rounded stage panel that holds the device; handles bar-aligned enter/exit motion. */
export const Stage: React.FC<{ format: Format; dur: number; children: React.ReactNode }> = ({ format, dur, children }) => {
  const f = useCurrentFrame();
  const S = LAYOUT[format].stage;
  const enter = spr(f, 0, 20, 0.5);
  const out = prog(f, dur - 8, dur);
  const blur = (1 - Math.min(1, enter * 1.15)) * 14 + out * 12;
  return (
    <div
      style={{
        position: 'absolute',
        left: S.x,
        top: S.y,
        width: S.w,
        height: S.h,
        borderRadius: 36,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #e9eff7 0%, #f3f6fa 55%, #eaf2ee 100%)',
        boxShadow: 'inset 0 0 0 1.5px rgba(15,23,42,0.06)',
        opacity: Math.min(1, enter * 1.4) * (1 - out),
        transform: `translateY(${(1 - enter) * 70 - out * 50}px) scale(${0.94 + enter * 0.06 - out * 0.03})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

