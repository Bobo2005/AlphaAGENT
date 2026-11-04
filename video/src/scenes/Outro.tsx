import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, FONT, Format, MONO } from '../brand';
import { spr } from '../anim';
import { CUES } from '../timeline';
import { Logo } from '../Layout';

const Q = CUES.outro;

export const Outro: React.FC<{ format: Format }> = ({ format }) => {
  const f = useCurrentFrame();
  const v = format === 'vertical';
  const sLogo = spr(f, Q.logo.at, 16);
  const sTag = spr(f, Q.tagline.at, 14);
  const sCta = spr(f, Q.cta.at, 16);
  const sPills = spr(f, Q.pills.at, 16);

  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: v ? '0 72px' : '0 120px',
        textAlign: 'center',
      }}
    >
      <div style={{ opacity: sLogo, transform: `translateY(${(1 - sLogo) * 32}px) scale(${0.92 + 0.08 * sLogo})`, marginBottom: v ? 44 : 36 }}>
        <Logo size={v ? 98 : 96} />
      </div>

      <div
        style={{
          fontSize: v ? 112 : 118,
          fontWeight: 800,
          lineHeight: 1.02,
          letterSpacing: '-0.035em',
          color: C.ink,
          marginBottom: v ? 56 : 50,
          opacity: sTag,
          transform: `translateY(${(1 - sTag) * 40}px) scale(${0.94 + 0.06 * sTag})`,
        }}
      >
        Evidence over <span style={{ color: C.blue }}>streaks.</span>
      </div>

      <div
        style={{
          opacity: sCta,
          transform: `translateY(${(1 - sCta) * 36}px) scale(${0.94 + 0.06 * sCta})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            background: C.blue,
            color: '#fff',
            borderRadius: 20,
            padding: v ? '26px 42px' : '24px 48px',
            fontSize: v ? 36 : 34,
            fontWeight: 700,
            boxShadow: '0 24px 50px -12px rgba(11,79,156,0.42)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <span>Launch AlphaAgent at</span>
          <span style={{ fontFamily: MONO, background: 'rgba(255,255,255,0.16)', padding: '4px 16px', borderRadius: 10 }}>
            alphaagent.sui
          </span>
          <span style={{ opacity: 0.55 }}>|</span>
          <span>Test on Sui &amp; Walrus</span>
        </div>

        <div
          style={{
            opacity: sPills,
            transform: `translateY(${(1 - sPills) * 20}px)`,
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
            fontFamily: MONO,
            fontSize: v ? 22 : 19,
            color: C.muted,
            fontWeight: 600,
          }}
        >
          <span>● Sui Testnet Pre-Kickoff Commits</span>
          <span>·</span>
          <span>● Permanent Walrus Episode Vault</span>
          <span>·</span>
          <span>● Fractional Kelly Copy Bot</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
