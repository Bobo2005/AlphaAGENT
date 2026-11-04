import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, Format } from '../brand';
import { keyed, prog, spr, typed } from '../anim';
import { CUES } from '../timeline';
import { AppShell } from '../ui/AppShell';
import { Camera, CamKey } from '../ui/Device';
import { Callout, Caret, Glow, Tap } from '../ui/Interact';
import { LAYOUT } from '../Layout';

const Q = CUES.bot;

const KELLY_OPTS = [
  'Quarter Kelly (0.25x - Recommended for bankroll preservation)',
  'Half Kelly (0.50x - Moderate risk tolerance)',
  'Full Kelly (1.00x - Aggressive expected growth)',
];

export const Bot: React.FC<{ format: Format }> = ({ format }) => {
  const f = useCurrentFrame();
  const mobile = format === 'vertical';

  const active = f >= Q.toggleDone.at;
  const bankTyping = f >= Q.bankrollTap.at && f < Q.kellyTap.at;
  const bankVal = f < Q.bankrollTap.at ? '20' : typed(f, Q.typeBankroll) || '';
  const kellyOpen = f >= Q.kellyTap.at + 2 && f < Q.kellyPick.at + 3;
  const kellyIdx = f >= Q.kellyPick.at + 2 ? 0 : 1; // switches Half -> Quarter
  const capTyping = f >= Q.capTap.at && f < Q.edgeTap.at;
  const capVal = f < Q.capTap.at ? '6.0' : typed(f, Q.typeCap) || '';
  const edgeTyping = f >= Q.edgeTap.at && f < Q.saveTap.at;
  const edgeVal = f < Q.edgeTap.at ? '1.5' : typed(f, Q.typeEdge) || '';

  const saved = f >= Q.alert.at;
  const showAlert = f >= Q.alert.at && f < Q.okTap.at + 4;
  const alertP = spr(f, Q.alert.at, 16) * (1 - prog(f, Q.okTap.at, Q.okTap.at + 5));

  const scroll = keyed(f, [
    { at: 0, v: 0 },
    { at: 65, v: mobile ? 380 : 185, dur: 20 },
    { at: Q.gateFocus.at - 10, v: mobile ? 960 : 210, dur: 22 },
    { at: 505, v: 0, dur: 24 },
  ]);

  const keys: CamKey[] = mobile
    ? [
        { at: 0, zoom: 1 },
        { at: 14, target: 'actionsBar', zoom: 1.35, dur: 16 },
        { at: 70, target: 'kellyCard', zoom: 1.22, dur: 20 },
        { at: Q.gateFocus.at - 8, target: 'gatesCard', zoom: 1.24, dur: 20 },
        { at: 505, zoom: 1, dur: 24 },
      ]
    : [
        { at: 0, zoom: 1 },
        { at: 14, target: 'actionsBar', zoom: 1.5, dur: 16 },
        { at: 70, target: 'kellyCard', zoom: 1.45, dur: 20 },
        { at: Q.gateFocus.at - 8, target: 'gatesCard', zoom: 1.5, dur: 20 },
        { at: 505, zoom: 1, dur: 24 },
      ];

  const dispBank = saved ? '25.00' : '20.00';

  return (
    <Camera format={format} stage={LAYOUT[format].stage} keys={keys} url="alphaagent.sui/copy-bot">
      <AppShell
        route="/copy-bot"
        mobile={mobile}
        wallet="guest"
        scroll={scroll}
        overlay={
          showAlert ? (
            <div className="overlay" style={{ opacity: alertP, alignItems: 'center' }}>
              <div className="modal-card" style={{ maxWidth: 400, padding: 20, transform: `scale(${0.92 + 0.08 * alertP})` }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
                  ✅ Copy bot configuration saved successfully!
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <span className="btn" style={{ padding: '8px 22px', minHeight: 36 }}>
                    OK
                    <Tap at={Q.okTap.at} />
                  </span>
                </div>
              </div>
            </div>
          ) : undefined
        }
      >
        <h1>🤖 Autonomous Copy Trading Bot</h1>
        <p className="mut lead">
          Mathematically sized copy-trading using the Fractional Kelly Criterion. AlphaAgent's due-diligence gate automatically blocks coin-toss streaks and cherry-pickers before any real capital is risked.
        </p>

        <div className="row" style={{ marginBottom: 24, gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4, 1fr)' }}>
          <div className="card" style={{ padding: 16 }}>
            <span className="mut small">TOTAL BANKROLL</span>
            <div className="big">{dispBank} SUI</div>
            <div className="mut small">Free Reserve: {dispBank} SUI</div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <span className="mut small">CAPITAL IN PLAY</span>
            <div className="big" style={{ color: '#2563eb' }}>0.00 SUI</div>
            <div className="mut small">0 active positions</div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <span className="mut small">REALIZED PNL &amp; ROI</span>
            <div className="big" style={{ color: '#16a34a' }}>+0.00 SUI</div>
            <div className="mut small">0 Won · 0 Lost (0%)</div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <span className="mut small">DUE-DILIGENCE SHIELD</span>
            <div className="big" style={{ color: '#16a34a', fontSize: 20, lineHeight: 1.4 }}>🛡️ SAFE-SHIELD ON</div>
            <div className="mut small">Only verified FOLLOW tipsters approved</div>
          </div>
        </div>

        <div className="actions" style={{ marginBottom: 24 }} data-a="actionsBar">
          <span className="btn">⚡ Run Audit &amp; Copy Scan</span>
          <span className="btn2" style={active ? { borderColor: '#16a34a', background: '#f0fdf4', color: '#15803d', fontWeight: 600 } : undefined}>
            {active ? '🟢 Bot Active' : '⏸️ Bot Paused'}
            <Tap at={Q.toggleTap.at} />
          </span>
        </div>

        <div className="row" style={{ marginBottom: 28 }}>
          <div className="card" data-a="kellyCard">
            <h2>⚙️ Fractional Kelly Risk Controls</h2>
            <p className="mut small" style={{ marginBottom: 16 }}>
              Optimal position sizing scaled to statistical edge over closing market odds.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label className="label">Total Bankroll (SUI)</label>
              <div className={`field${bankTyping ? ' focus' : ''}`}>
                <span>
                  {bankVal}
                  <Caret on={bankTyping} />
                </span>
                <Tap at={Q.bankrollTap.at} x="25%" />
              </div>
            </div>

            <div style={{ marginBottom: 14, position: 'relative' }}>
              <label className="label">Kelly Sizing Multiplier</label>
              <div className={`field${kellyOpen ? ' focus' : ''}`} style={{ fontSize: 13.5 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{KELLY_OPTS[kellyIdx]}</span>
                <span>▾</span>
                <Tap at={Q.kellyTap.at} x="82%" />
                {kellyOpen && (
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 4px)', background: '#fff', border: '1px solid var(--line-strong)', borderRadius: 8, boxShadow: '0 12px 28px rgba(0,0,0,.18)', zIndex: 30 }}>
                    {KELLY_OPTS.map((o, i) => (
                      <div key={o} style={{ padding: '9px 12px', fontSize: 13, background: i === 0 ? '#eff6ff' : '#fff', fontWeight: i === 0 ? 600 : 400, borderBottom: i < 2 ? '1px solid var(--line)' : undefined, position: 'relative' }}>
                        {o}
                        {i === 0 && <Tap at={Q.kellyPick.at} x="48%" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label">Maximum Bet Cap Per Position (% of Bankroll)</label>
              <div className={`field${capTyping ? ' focus' : ''}`}>
                <span>
                  {capVal}
                  <Caret on={capTyping} />
                </span>
                <Tap at={Q.capTap.at} x="25%" />
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label className="label">Minimum Required Edge Over Closing Line (%)</label>
              <div className={`field${edgeTyping ? ' focus' : ''}`}>
                <span>
                  {edgeVal}
                  <Caret on={edgeTyping} />
                </span>
                <Tap at={Q.edgeTap.at} x="25%" />
              </div>
            </div>

            <span className="btn2" style={{ width: '100%' }}>
              Save Bot Configuration
              <Tap at={Q.saveTap.at} />
            </span>
          </div>

          <div className="card" data-a="gatesCard" style={{ position: 'relative' }}>
            <Glow from={Q.gateFocus.at} to={502} color={C.blue} />
            <Callout at={Q.gate3Tick.at} k="KELLY" text="f* = (p − m) / (1 − m) · Safe-Shield on" color={C.blue} place="top" />
            <h2>🛡️ Three-Stage Gate Enforcement</h2>
            <p className="mut small" style={{ marginBottom: 16 }}>
              Every candidate trade must pass three independent mathematical gates before execution:
            </p>

            <div style={{ padding: 12, background: f >= Q.gate1Tick.at && f < Q.gate2Tick.at ? '#eff6ff' : 'var(--panel)', border: f >= Q.gate1Tick.at ? `1.5px solid ${f < Q.gate2Tick.at ? C.blue : '#cbd5e1'}` : undefined, borderRadius: 'var(--radius-sm)', marginBottom: 10 }}>
              <strong>1. Anti-Time Travel Gate (Tatum Sui Clock)</strong>
              <p className="mut small flush">Must be committed on-chain &gt; 2 minutes before game kickoff. Late posts are permanently inadmissible.</p>
            </div>

            <div style={{ padding: 12, background: f >= Q.gate2Tick.at && f < Q.gate3Tick.at ? '#f0fdf4' : 'var(--panel)', border: f >= Q.gate2Tick.at ? `1.5px solid ${f < Q.gate3Tick.at ? C.green : '#cbd5e1'}` : undefined, borderRadius: 'var(--radius-sm)', marginBottom: 10 }}>
              <strong>2. AlphaAgent Audit Gate (Permanent Walrus Memory)</strong>
              <p className="mut small flush">
                Only tipsters with verified <span className="b f">FOLLOW</span> status are eligible. Tipsters with <span className="b w">WATCH</span> (sample &lt; 15, coin-toss streaks) and <span className="b s">SKIP</span> (cherry-pickers) are completely blocked.
              </p>
            </div>

            <div style={{ padding: 12, background: f >= Q.gate3Tick.at ? '#eff6ff' : 'var(--panel)', border: f >= Q.gate3Tick.at ? `1.5px solid ${C.blue}` : undefined, borderRadius: 'var(--radius-sm)' }}>
              <strong>3. Fractional Kelly Sizer (Mathematical Utility)</strong>
              <p className="mut small flush">
                Positions are sized using{' '}
                <strong className="mono" style={{ color: C.blue, fontSize: 14 }}>
                  f* = (p − m) / (1 − m)
                </strong>
                . If edge is non-positive or below threshold, stake is automatically 0.
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    </Camera>
  );
};
