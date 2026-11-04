import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, Format } from '../brand';
import { keyed, shortAddr, spr, typed } from '../anim';
import { CUES } from '../timeline';
import { AppShell } from '../ui/AppShell';
import { Camera, CamKey } from '../ui/Device';
import { Callout, Caret, Glow, Tap } from '../ui/Interact';
import { LAYOUT } from '../Layout';

const Q = CUES.audit;

const GATES = [
  { id: 'picks', label: 'Verified picks', detail: '5 of 15 needed', status: 'Not yet', cls: 'w' },
  { id: 'luck', label: 'Luck check', detail: 'A 5-0 run happens by chance too often (1 in 32)', status: 'Not yet', cls: 'w' },
  { id: 'hidden', label: 'Hidden bets', detail: '0% (limit 10%)', status: 'Passed', cls: 'f' },
  { id: 'penalty', label: 'Beginner’s luck penalty', detail: 'Skill dampened toward zero (41.2% becomes 13.7%)', status: 'Applied', cls: 'n' },
];

const PICKS = [
  { game: 'Lakers vs Warriors', pick: 'Lakers 72%', market: 'Market 62%', result: 'Won' },
  { game: 'Man United vs Chelsea', pick: 'Chelsea 65%', market: 'Market 54%', result: 'Won' },
  { game: 'Ravens vs Bills', pick: 'Bills 60%', market: 'Market 52%', result: 'Won' },
  { game: 'Arsenal vs Liverpool', pick: 'Arsenal 58%', market: 'Market 50%', result: 'Won' },
  { game: 'Celtics vs Heat', pick: 'Celtics 74%', market: 'Market 66%', result: 'Won' },
];

/**
 * Scene 2: Cryptographic Due-Diligence Audit (/check) — 13 bars = 26s = 780 frames.
 * Beat A (0..174): Focus address input -> type StreakKing address -> tap Check -> Checking…
 * Beat B (174..380): WATCH verdict card lands -> pan across 4 stat cards & 4 gate callouts
 * Beat C (380..600): Scroll to "Why this verdict" -> 4 gate rows evaluate sequentially
 * Beat D (600..780): Scroll to "Picks" table showing pre-kickoff locked predictions vs market lines
 */
export const Audit: React.FC<{ format: Format }> = ({ format }) => {
  const f = useCurrentFrame();
  const mobile = format === 'vertical';
  const addrText = typed(f, Q.typeAddr);
  const typing = f >= Q.typeAddr.at && addrText.length < (Q.typeAddr.text?.length ?? 0);
  const checking = f >= Q.checkTap.at + 2 && f < Q.result.at;
  const hasResult = f >= Q.result.at;

  const scroll = keyed(f, [
    { at: 0, v: 0 },
    { at: 190, v: mobile ? 200 : 60, dur: 24 },
    { at: Q.scrollGates.at, v: mobile ? 380 : 210, dur: 26 },
    { at: Q.scrollPicks.at, v: mobile ? 680 : 410, dur: 28 },
  ]);

  const keys: CamKey[] = mobile
    ? [
        { at: 0, zoom: 1 },
        { at: 14, target: 'search', zoom: 1.35, dur: 18 },
        { at: 165, target: 'verdictCard', zoom: 1.25, dur: 20 },
        { at: 210, target: 'statsRow', zoom: 1.15, dur: 22 },
        { at: 375, target: 'gatesCard', zoom: 1.24, dur: 24 },
        { at: 595, target: 'picksCard', zoom: 1.22, dur: 24 },
        { at: 720, zoom: 1, dur: 28 },
      ]
    : [
        { at: 0, zoom: 1 },
        { at: 14, target: 'search', zoom: 1.45, dur: 18 },
        { at: 165, target: 'verdictCard', zoom: 1.35, dur: 20 },
        { at: 210, target: 'statsRow', zoom: 1.15, dur: 22 },
        { at: 375, target: 'gatesCard', zoom: 1.18, dur: 24 },
        { at: 595, target: 'picksCard', zoom: 1.18, dur: 24 },
        { at: 720, zoom: 1, dur: 28 },
      ];

  const gateAts = [Q.gate1.at, Q.gate2.at, Q.gate3.at, Q.gate4.at];

  return (
    <Camera format={format} stage={LAYOUT[format].stage} keys={keys} url="alphaagent.sui/check">
      <AppShell route="/check" mobile={mobile} wallet="guest" scroll={scroll}>
        <h1>Check a tipster</h1>
        <div className="search" data-a="search">
          <div className={`input mono${f >= Q.focusTap.at && f < Q.checkTap.at ? ' focus' : ''}`} style={{ fontSize: 13 }}>
            {addrText ? <span>{addrText}</span> : <span className="ph">Paste any Sui address (0x...)</span>}
            <Caret on={typing || (f >= Q.focusTap.at && f < Q.checkTap.at)} />
            <Tap at={Q.focusTap.at} x="24%" />
          </div>
          <span className="btn" style={{ opacity: checking ? 0.65 : 1 }}>
            {checking ? 'Checking…' : 'Check'}
            <Tap at={Q.checkTap.at} />
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          <p className="mut small" style={{ margin: 0 }}>
            Quick check: <span className="link">my connected wallet</span>
          </p>
          <span className="small mut">Cryptographically audited against Sui RPC &amp; Walrus Memory</span>
        </div>

        {!hasResult && !checking ? (
          <div className="card" style={{ marginTop: 24, textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>🔍</div>
            <h2 style={{ margin: '0 0 8px' }}>Audit Any Forecaster on Sui</h2>
            <p className="mut" style={{ maxWidth: 500, margin: '0 auto 20px' }}>
              Paste any Sui address above or click "my connected wallet" to inspect on-chain commitments, unrevealed bets, and verified skill rating.
            </p>
            <span className="btn">Audit My Connected Wallet</span>
          </div>
        ) : (
          <div style={{ marginTop: 24, opacity: spr(f, Q.result.at - 10, 16) }}>
            <div className="card" style={{ margin: '16px 0' }} data-a="verdictCard">
              <Glow from={Q.result.at} to={Q.result.at + 42} color={C.amber} />
              <h2 style={{ fontSize: 24, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="mono">{shortAddr(Q.typeAddr.text!)}</span>
                <span className="b w" style={{ transform: `scale(${0.7 + 0.3 * spr(f, Q.result.at, 12)})` }}>
                  WATCH
                </span>
                <span className="btn2" style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, minHeight: 28 }}>
                  + Follow Tipster
                </span>
              </h2>
              <p className="mut flush">Needs 10 more verified picks before risking money</p>
            </div>

            <div className="row" data-a="statsRow" style={{ gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4, 1fr)' }}>
              <div className="card" style={{ position: 'relative' }}>
                <p className="mut" style={{ margin: '0 0 4px' }}>Locked on Sui</p>
                <p className="big">5</p>
                <Callout at={Q.tag1.at} k="G1" text="Sui Clock" color={C.blue} until={Q.scrollGates.at + 10} />
              </div>
              <div className="card" style={{ position: 'relative' }}>
                <p className="mut" style={{ margin: '0 0 4px' }}>Saved in memory</p>
                <p className="big">5</p>
                <Callout at={Q.tag2.at} k="G2" text="Walrus Vault" color={C.blue} until={Q.scrollGates.at + 10} />
              </div>
              <div className="card" style={{ position: 'relative' }}>
                <p className="mut" style={{ margin: '0 0 4px' }}>Hidden bets</p>
                <p className="big">0</p>
                <Callout at={Q.tag3.at} k="G3" text="Forfeit Check" color={C.green} until={Q.scrollGates.at + 10} />
              </div>
              <div className="card" style={{ position: 'relative' }}>
                <p className="mut" style={{ margin: '0 0 4px' }}>Skill grade</p>
                <p className="big">Too early</p>
                <Callout at={Q.tag4.at} k="G4" text="BSS Shrinkage" color={C.amber} until={Q.scrollGates.at + 10} />
              </div>
            </div>

            <h2 className="stack">Why this verdict</h2>
            <div className="card" data-a="gatesCard">
              <div className="scroll">
                <table className="t">
                  <thead>
                    <tr>
                      <th>Check</th>
                      <th>Result</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GATES.map((g, i) => {
                      const s = spr(f, gateAts[i], 14);
                      const active = f >= gateAts[i] && f < gateAts[i] + 24;
                      return (
                        <tr key={g.id} style={{ background: active ? '#eff6ff' : undefined }}>
                          <td><strong>{g.label}</strong></td>
                          <td style={{ opacity: 0.35 + 0.65 * s }}>{g.detail}</td>
                          <td>
                            <span className={`b ${g.cls}`} style={{ opacity: s, transform: `scale(${0.7 + 0.3 * s})` }}>
                              {g.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <h2 className="stack">Picks</h2>
            <div className="card" data-a="picksCard" style={{ position: 'relative' }}>
              <Callout at={Q.pick1.at} k="VERIFIED" text="5 pre-kickoff commits vs closing line" color={C.blue} />
              <table className="t">
                <thead>
                  <tr>
                    <th>Game</th>
                    <th>Pick</th>
                    <th>Market</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {PICKS.map((p, idx) => {
                    const rowIn = spr(f, Q.pick1.at + idx * 12, 16);
                    return (
                      <tr key={p.game} style={{ opacity: 0.35 + 0.65 * rowIn }}>
                        <td>{p.game}</td>
                        <td>{p.pick}</td>
                        <td>{p.market}</td>
                        <td style={{ color: C.blue, fontWeight: 600 }}>{p.result}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AppShell>
    </Camera>
  );
};
