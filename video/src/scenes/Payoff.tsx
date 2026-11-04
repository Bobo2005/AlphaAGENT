import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, Format } from '../brand';
import { keyed, lerp, prog, spr } from '../anim';
import { CUES } from '../timeline';
import { TIPSTERS, TRADES } from '../data';
import { AppShell } from '../ui/AppShell';
import { Camera, CamKey } from '../ui/Device';
import { Callout, Glow, Tap } from '../ui/Interact';
import { LAYOUT } from '../Layout';

const Q = CUES.payoff;

export const Payoff: React.FC<{ format: Format }> = ({ format }) => {
  const f = useCurrentFrame();
  const mobile = format === 'vertical';

  const scanning = f >= Q.scanTap.at + 2 && f < Q.done.at;
  const done = f >= Q.done.at;
  const shieldAts = [Q.shield1.at, Q.shield2.at, Q.shield3.at, Q.shield4.at];
  const tradeAts = [Q.trade1.at, Q.trade2.at];

  const allocP = prog(f, Q.trade1.at, Q.trade2.at + 20);
  const alloc = lerp(0, 2.16, allocP);
  const free = 25 - alloc;
  const activeCount = f >= Q.trade2.at ? 2 : f >= Q.trade1.at ? 1 : 0;

  const scroll = keyed(f, [
    { at: 0, v: 0 },
    { at: 50, v: mobile ? 410 : 210, dur: 20 },
    { at: Q.scrollLedger.at, v: mobile ? 1320 : 470, dur: 24 },
    { at: Q.done.at - 6, v: 0, dur: 24 },
  ]);

  const swipeShield = mobile ? keyed(f, [{ at: 0, v: 0 }, { at: 65, v: 360, dur: 26 }]) : 0;
  const swipeTrades = mobile ? keyed(f, [{ at: 0, v: 0 }, { at: Q.receiptFocus.at - 10, v: 460, dur: 28 }]) : 0;

  const keys: CamKey[] = mobile
    ? [
        { at: 0, zoom: 1 },
        { at: 10, target: 'scanBar', zoom: 1.3, dur: 16 },
        { at: 58, target: 'shieldCard', zoom: 1.15, dur: 20 },
        { at: Q.scrollLedger.at + 8, target: 'ledgerCard', zoom: 1.18, dur: 22 },
        { at: Q.done.at - 4, zoom: 1, dur: 26 },
      ]
    : [
        { at: 0, zoom: 1 },
        { at: 10, target: 'scanBar', zoom: 1.35, dur: 16 },
        { at: 58, target: 'shieldCard', zoom: 1.15, dur: 20 },
        { at: Q.scrollLedger.at + 8, target: 'ledgerCard', zoom: 1.15, dur: 22 },
        { at: Q.done.at - 4, zoom: 1, dur: 26 },
      ];

  return (
    <Camera format={format} stage={LAYOUT[format].stage} keys={keys} url="alphaagent.sui/copy-bot">
      <AppShell route="/copy-bot" mobile={mobile} wallet="guest" scroll={scroll}>
        <h1>🤖 Autonomous Copy Trading Bot</h1>
        <p className="mut lead">
          Mathematically sized copy-trading using the Fractional Kelly Criterion. AlphaAgent's due-diligence gate automatically blocks coin-toss streaks and cherry-pickers before any real capital is risked.
        </p>

        <div className="row" style={{ marginBottom: 24, gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4, 1fr)' }}>
          <div className="card" style={{ padding: 16 }}>
            <span className="mut small">TOTAL BANKROLL</span>
            <div className="big">25.00 SUI</div>
            <div className="mut small">Free Reserve: {free.toFixed(2)} SUI</div>
          </div>
          <div className="card" style={{ padding: 16, position: 'relative' }}>
            <Glow from={Q.trade1.at} to={Q.done.at + 70} color={C.blue} />
            <span className="mut small">CAPITAL IN PLAY</span>
            <div className="big" style={{ color: '#2563eb' }}>{alloc.toFixed(2)} SUI</div>
            <div className="mut small">{activeCount} active positions</div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <span className="mut small">REALIZED PNL &amp; ROI</span>
            <div className="big" style={{ color: '#16a34a' }}>+3.42 SUI</div>
            <div className="mut small">4 Won · 1 Lost (+13.7%)</div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <span className="mut small">DUE-DILIGENCE SHIELD</span>
            <div className="big" style={{ color: '#16a34a', fontSize: 20, lineHeight: 1.4 }}>🛡️ SAFE-SHIELD ON</div>
            <div className="mut small">Only verified FOLLOW tipsters approved</div>
          </div>
        </div>

        <div className="actions" style={{ marginBottom: 24 }} data-a="scanBar">
          <span className="btn" style={{ opacity: scanning ? 0.75 : 1 }}>
            {scanning ? 'Auditing & Scanning...' : '⚡ Run Audit & Copy Scan'}
            <Tap at={Q.scanTap.at} />
          </span>
          <span className="btn2" style={{ borderColor: '#16a34a', background: '#f0fdf4', color: '#15803d', fontWeight: 600 }}>
            🟢 Bot Active
          </span>
          {(scanning || done) && (
            <span className="small" style={{ marginLeft: 4 }}>
              {done ? (
                <span style={{ color: '#16a34a', fontWeight: 600 }}>
                  ✅ Scan complete: Scanned 6 picks. Copied: 2 · Blocked by Safe-Shield: 4
                </span>
              ) : (
                <span style={{ color: '#2563eb', fontWeight: 500 }}>
                  Running ESPN schedule &amp; Walrus due-diligence checks...
                </span>
              )}
            </span>
          )}
        </div>

        <div className="card" style={{ marginBottom: 28, position: 'relative' }} data-a="shieldCard">
          <Callout at={Q.shield2.at} k="SAFE-SHIELD" text="5-0 streak & cherry-picker blocked" color={C.red} place="top" until={Q.scrollLedger.at + 8} />
          <h2>📋 Monitored Tipsters &amp; AlphaAgent Safe-Shield Status</h2>
          <p className="mut small">Real-time status of monitored forecasters evaluated against Sui testnet commits and Walrus memory:</p>
          <div className="scroll">
            <table className="t" style={{ minWidth: mobile ? 760 : undefined, transform: `translateX(${-swipeShield}px)` }}>
              <thead>
                <tr>
                  <th>Tipster</th>
                  <th>Sample Size</th>
                  <th>Verified Edge</th>
                  <th>Forfeit Rate</th>
                  <th>Verdict</th>
                  <th>Copy Bot Action</th>
                </tr>
              </thead>
              <tbody>
                {TIPSTERS.map((t, i) => {
                  const s = spr(f, shieldAts[i], 14);
                  const hit = f >= shieldAts[i] && f < shieldAts[i] + 28;
                  const badge = t.verdict === 'FOLLOW' ? 'f' : t.verdict === 'SKIP' ? 's' : 'w';
                  const edgeColor = t.edge.startsWith('+') ? '#16a34a' : t.edge.startsWith('-') ? '#dc2626' : '#4b5563';
                  const action =
                    t.verdict === 'FOLLOW' ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>✅ APPROVED (Kelly Sized)</span>
                    ) : t.verdict === 'WATCH' ? (
                      <span style={{ color: '#b45309', fontWeight: 600 }}>
                        ⛔ BLOCKED (Coin-toss risk, needs {15 - t.picks} more picks)
                      </span>
                    ) : (
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>
                        ⛔ BLOCKED (Negative edge or forfeited bets)
                      </span>
                    );
                  return (
                    <tr key={t.label} style={{ background: hit ? (t.verdict === 'FOLLOW' ? '#f0fdf4' : '#fef2f2') : undefined }}>
                      <td>
                        <strong>{t.label}</strong>
                        <br />
                        <span className="mut small mono">
                          {t.addr.slice(0, 10)}…{t.addr.slice(-4)}
                        </span>
                      </td>
                      <td>{t.picks} picks</td>
                      <td>
                        <span style={{ color: edgeColor, fontWeight: 600 }}>{t.edge}</span>
                      </td>
                      <td>{t.hidden}%</td>
                      <td>
                        <span className={`b ${badge}`}>{t.verdict}</span>
                      </td>
                      <td style={{ opacity: 0.25 + 0.75 * s, transform: `scale(${0.92 + 0.08 * s})`, transformOrigin: 'left center' }}>
                        {action}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" data-a="ledgerCard" style={{ position: 'relative' }}>
          <Callout at={Q.trade1.at + 6} until={Q.receiptFocus.at - 4} k="EXECUTED" text="Fractional Kelly sized positions" color={C.green} place="top" />
          <Callout at={Q.receiptFocus.at} k="VERIFIABLE" text="Sui tx digest + Walrus blob receipts" color={C.blue} place="top" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 className="flush">📜 Executed Copy Trades Ledger</h2>
              <span className="mut small">Live positions executed on Sui Testnet &amp; logged to Walrus permanent memory</span>
            </div>
            <span className="btn2" style={{ padding: '6px 14px', fontSize: 13 }}>🔄 Refresh Ledger</span>
          </div>
          <div className="scroll">
            <table className="t" style={{ minWidth: mobile ? 860 : undefined, transform: `translateX(${-swipeTrades}px)` }}>
              <thead>
                <tr>
                  <th>Matchup</th>
                  <th>Tipster</th>
                  <th>Pick</th>
                  <th>Odds &amp; Edge</th>
                  <th>Kelly Stake</th>
                  <th>Timeliness</th>
                  <th>Receipts (Sui &amp; Walrus)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {f < Q.trade1.at ? (
                  <tr>
                    <td colSpan={8} className="mut" style={{ textAlign: 'center', padding: 28 }}>
                      No copy-trades executed yet. Click <strong>"⚡ Run Audit &amp; Copy Scan"</strong> to discover games and execute verified FOLLOW picks.
                    </td>
                  </tr>
                ) : (
                  TRADES.map((t, i) => {
                    if (f < tradeAts[i]) return null;
                    const s = spr(f, tradeAts[i], 14);
                    const receiptHi = f >= Q.receiptFocus.at;
                    return (
                      <tr key={t.event} style={{ opacity: s, transform: `translateY(${(1 - s) * 16}px)` }}>
                        <td>
                          <strong>{t.event}</strong>
                          <br />
                          <span className="mut small">{t.cat}</span>
                        </td>
                        <td>
                          <strong>{t.tipster}</strong>
                          <br />
                          <span className="mut small mono">{t.taddr.slice(0, 8)}…</span>
                        </td>
                        <td>
                          <strong>{t.side}</strong>
                          <br />
                          <span className="mut small">{t.forecast}% forecast</span>
                        </td>
                        <td>
                          {t.odds.toFixed(2)} odds
                          <br />
                          <span className="small" style={{ color: '#16a34a', fontWeight: 600 }}>+{t.edge.toFixed(1)}% edge</span>
                        </td>
                        <td>
                          <strong style={{ fontSize: 15 }}>{t.stake.toFixed(2)} SUI</strong>
                          <br />
                          <span className="mut small">{t.stakePct}% bankroll</span>
                        </td>
                        <td>
                          <span className="small">{t.mins}m before start</span>
                          <br />
                          <span className="mut small">Locked pre-game</span>
                        </td>
                        <td className="mono" style={{ fontSize: 12.5, background: receiptHi ? '#eff6ff' : undefined }}>
                          <span style={{ color: C.blue, fontWeight: 700 }}>Sui: {t.digest.slice(0, 8)}… ↗</span>
                          <br />
                          <span style={{ color: receiptHi ? '#15803d' : undefined, fontWeight: receiptHi ? 600 : 400 }} className={receiptHi ? undefined : 'mut'}>
                            Walrus: {t.blob.slice(0, 8)}… ↗
                          </span>
                        </td>
                        <td>
                          <span className="b" style={{ background: '#e0f2fe', color: '#0369a1' }}>ACTIVE</span>
                          <br />
                          <span className="mut small">Pending result</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AppShell>
    </Camera>
  );
};
