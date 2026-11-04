import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT, Format, MONO } from '../brand';
import { easeIO, keyed, prog } from '../anim';
import { CUES } from '../timeline';
import { Logo } from '../Layout';
import { Device } from '../ui/Device';
import { AppShell } from '../ui/AppShell';
import { Callout, Glow, Tap } from '../ui/Interact';

const Q = CUES.cover;

/**
 * Scene 0 (4 bars = 8s = 240 frames).
 * Frame 0 is a finished cover thumbnail. At bar 1 (f=60), the cover pushes
 * smoothly into the live Home screen so the viewer sees the real `/` landing
 * page (`Is this tipster skilled, or just lucky?`) and its WATCH vs FOLLOW
 * comparison cards before tapping `Check a tipster` into Scene 1.
 */
export const Cover: React.FC<{ format: Format }> = ({ format }) => {
  const f = useCurrentFrame();
  const v = format === 'vertical';
  const push = prog(f, Q.pushHome.at, Q.pushHome.at + 45, easeIO);
  const float = Math.sin(f / 20) * 5 * (1 - push);
  const scroll = v && f >= 130 ? keyed(f, [{ at: 0, v: 0 }, { at: 130, v: 220, dur: 28 }]) : 0;

  // Device position & scale interpolates from right/bottom thumbnail pose to centered hero view
  const devLeft = v ? 540 : 1410 - push * 450;
  const devTop = v ? 1310 - push * 350 : 560 - push * 20;
  const devScale = v ? 1.55 + push * 0.55 : 0.78 + push * 0.44;
  const devRot = (v ? -2 : -3) * (1 - push);

  return (
    <AbsoluteFill style={{ fontFamily: FONT, overflow: 'hidden' }}>
      {/* Left / top: logo, tagline, verdict pills (fully visible at frame 0) */}
      <div
        style={{
          position: 'absolute',
          left: v ? 72 : 110,
          top: v ? 110 : 0,
          width: v ? 936 : 780,
          height: v ? 640 : 1080,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: v ? 'flex-start' : 'center',
          opacity: Math.max(0, 1 - push * 1.35),
          transform: `translateY(${-push * 50}px) scale(${1 - push * 0.08})`,
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, alignSelf: 'flex-start', background: '#fff', border: '1.5px solid #cbd5e1', borderRadius: 999, padding: '8px 18px', marginBottom: v ? 28 : 32, boxShadow: '0 6px 18px rgba(15,23,42,.06)' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.green }} />
          <span style={{ fontFamily: MONO, fontSize: v ? 21 : 18, fontWeight: 600, color: C.ink }}>
            SUI TESTNET · WALRUS PERMANENT MEMORY · FRACTIONAL KELLY
          </span>
        </div>

        <Logo size={v ? 116 : 108} />

        <div style={{ fontSize: v ? 56 : 52, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.025em', color: C.ink, marginTop: v ? 22 : 26, marginBottom: v ? 22 : 24 }}>
          The lie detector for sports tipsters.
        </div>

        <div style={{ fontSize: v ? 32 : 27, lineHeight: 1.4, color: C.muted, fontWeight: 500, maxWidth: v ? 900 : 700, marginBottom: v ? 34 : 40 }}>
          Decentralized quantitative due-diligence &amp; autonomous copy-trading that blocks coin-toss streaks before capital is risked.
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Pill bg="#e3effc" fg={C.blue} label="FOLLOW" sub="Verified BSS edge ≥ 15 picks" v={v} />
          <Pill bg="#fdf0d5" fg={C.amber} label="WATCH" sub="5–0 coin-toss streak blocked" v={v} />
          <Pill bg="#fbe4e4" fg={C.red} label="SKIP" sub="Hidden bets / negative edge" v={v} />
        </div>
      </div>

      {/* Right / bottom -> Center: real Home screen inside device frame */}
      <div
        style={{
          position: 'absolute',
          left: devLeft,
          top: devTop,
          transform: `translate(-50%, -50%) translateY(${float}px) scale(${devScale}) rotate(${devRot}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <Device format={format} url="alphaagent.sui">
          <AppShell route="/" mobile={v} wallet="guest" scroll={scroll}>
            <h1>Is this tipster skilled, or just lucky?</h1>
            <p className="mut lead">
              AlphaAgent checks that every pick was locked before kickoff, that no bets were hidden, and that the record is long enough to mean something.
            </p>
            <div className="actions">
              <span className="btn">
                Check a tipster
                <Tap at={Q.ctaTap.at} />
              </span>
              <span className="btn2">Log a pick</span>
            </div>
            <div className="row">
              <div className="card" style={{ position: 'relative' }}>
                <Glow from={Q.watchHighlight.at} to={Q.followHighlight.at + 10} color={C.amber} />
                <Callout at={Q.watchHighlight.at} k="5-0 STREAK" text="1 in 32 by coin flip" color={C.amber} until={Q.followHighlight.at + 10} />
                <h2>Looks perfect, not proven yet</h2>
                <span className="b w">WATCH</span>
                <p style={{ marginTop: 10 }}>
                  <strong>Short Streak (5-0)</strong>: 5 wins, 0 losses.
                </p>
                <p className="mut">
                  If every game were a coin flip, five wins in a row happens 1 time in 32. AlphaAgent requires at least 15 verified picks before anyone risks real money.
                </p>
              </div>
              <div className="card" style={{ position: 'relative' }}>
                <Glow from={Q.followHighlight.at} to={230} color={C.green} />
                <Callout at={Q.followHighlight.at} k="PROVEN EDGE" text="30 picks · +7.8% shrunk BSS" color={C.green} until={230} />
                <h2>Long record, checked</h2>
                <span className="b f">FOLLOW</span>
                <p style={{ marginTop: 10 }}>
                  <strong>Verified Forecaster</strong>: 30 verified picks.
                </p>
                <p className="mut">
                  Skill rating +7.8% verified profit edge over market. Zero hidden bets, all locked before kickoff.
                </p>
              </div>
            </div>
            <h2 className="stack">How it works</h2>
            <div className="row">
              <div className="card">
                <strong>1. Lock before kickoff</strong>
                <p className="mut">Each pick gets a time stamp on Sui before the game starts.</p>
              </div>
              <div className="card">
                <strong>2. Save every result</strong>
                <p className="mut">Results go into permanent memory on Walrus, so nothing can be quietly deleted.</p>
              </div>
              <div className="card">
                <strong>3. Get a verdict</strong>
                <p className="mut">FOLLOW, WATCH or SKIP, based on evidence and not on streaks.</p>
              </div>
            </div>
          </AppShell>
        </Device>
      </div>
    </AbsoluteFill>
  );
};

const Pill: React.FC<{ bg: string; fg: string; label: string; sub: string; v: boolean }> = ({ bg, fg, label, sub, v }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: v ? '10px 16px' : '9px 14px', boxShadow: '0 4px 12px rgba(15,23,42,.04)' }}>
    <span style={{ background: bg, color: fg, fontWeight: 700, fontSize: v ? 20 : 16, padding: '3px 10px', borderRadius: 6 }}>{label}</span>
    <span style={{ fontSize: v ? 22 : 17, color: C.ink, fontWeight: 600 }}>{sub}</span>
  </div>
);
