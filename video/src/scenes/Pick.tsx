import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, Format } from '../brand';
import { keyed, lerp, prog, shortAddr, spr } from '../anim';
import { CUES, EX } from '../timeline';
import { MATCHUPS, PICK_RECEIPT, timeStr } from '../data';
import { AppShell } from '../ui/AppShell';
import { Camera, CamKey } from '../ui/Device';
import { Callout, Glow, Slider, Spinner, Tap } from '../ui/Interact';
import { LAYOUT } from '../Layout';

const Q = CUES.pick;

export const Pick: React.FC<{ format: Format }> = ({ format }) => {
  const f = useCurrentFrame();
  const mobile = format === 'vertical';

  const selectOpen = f >= Q.selectTap.at + 2 && f < Q.optionTap.at + 3;
  const hoverIdx = f >= Q.optionTap.at - 8 ? 0 : f >= Q.hoverOpt3.at ? 2 : f >= Q.hoverOpt2.at ? 1 : 0;
  const matchupIdx = 0; // Manchester United vs Chelsea
  const m = MATCHUPS[matchupIdx];
  const sideIdx = f >= Q.sideTap.at + 2 ? 1 : 0; // selects Chelsea at sideTap
  const side = m.sides[sideIdx];

  // Chance slider: 70 -> 62 (chanceDrag1) -> 68 (chanceDrag2)
  const chance =
    f < Q.chanceDrag1.at
      ? 70
      : f < Q.chanceDrag2.at
      ? Math.round(lerp(70, 62, prog(f, Q.chanceDrag1.at, Q.chanceDrag1.end)))
      : Math.round(lerp(62, 68, prog(f, Q.chanceDrag2.at, Q.chanceDrag2.end)));

  const activeChanceDrag: [number, number] =
    f < Q.chanceDrag1.end + 14
      ? [Q.chanceDrag1.at, Q.chanceDrag1.end]
      : [Q.chanceDrag2.at, Q.chanceDrag2.end];

  const diff = chance - side.market;
  const locked = f >= Q.receipt.at;

  const modalOpen = f >= Q.modalIn.at && f < Q.modalOut.at;
  const modalP = spr(f, Q.modalIn.at, 16) * (1 - prog(f, Q.modalOut.at - 6, Q.modalOut.at));
  const approved = f >= Q.approveTap.at + 2;
  const step1Done = f >= Q.step1.at;
  const step2Done = f >= Q.step2.at;
  const step3Done = f >= Q.step3.at;

  const keys: CamKey[] = mobile
    ? [
        { at: 0, zoom: 1 },
        { at: 14, target: 'formCard', zoom: 1.22, dur: 18 },
        { at: Q.sideTap.at - 10, target: 'formCard', zoom: 1.28, dur: 18 },
        { at: Q.modalIn.at + 4, target: 'modal', zoom: 1.15, dur: 18 },
        { at: Q.receipt.at - 2, target: 'receiptCard', zoom: 1.25, dur: 20 },
        { at: Q.hashHighlight.at, target: 'receiptCard', zoom: 1.34, dur: 18 },
        { at: 795, zoom: 1, dur: 24 },
      ]
    : [
        { at: 0, zoom: 1 },
        { at: 14, target: 'formCard', zoom: 1.38, dur: 18 },
        { at: Q.sideTap.at - 10, target: 'formCard', zoom: 1.45, dur: 18 },
        { at: Q.modalIn.at + 4, target: 'modal', zoom: 1.35, dur: 18 },
        { at: Q.receipt.at - 2, target: 'receiptCard', zoom: 1.48, dur: 20 },
        { at: Q.hashHighlight.at, target: 'receiptCard', zoom: 1.56, dur: 18 },
        { at: 795, zoom: 1, dur: 24 },
      ];

  const scroll = mobile
    ? keyed(f, [
        { at: 0, v: 0 },
        { at: Q.receipt.at - 8, v: 560, dur: 22 },
        { at: 795, v: 0, dur: 24 },
      ])
    : 0;

  return (
    <Camera format={format} stage={LAYOUT[format].stage} keys={keys} url="alphaagent.sui/pick">
      <AppShell
        route="/pick"
        mobile={mobile}
        wallet="guest"
        scroll={scroll}
        overlay={
          modalOpen ? (
            <div className="overlay" style={{ opacity: modalP }}>
              <div className="modal-card" data-a="modal" style={{ transform: `translateY(${(1 - modalP) * 30}px)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, borderBottom: '1px solid #f3f4f6', paddingBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>💧</div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700 }}>Confirm Transaction with AlphaAgent</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Sui Testnet · Pre-Kickoff Commitment</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 22, color: '#9ca3af', lineHeight: 1 }}>&times;</span>
                </div>

                <div style={{ background: '#f0fdf4', border: f >= Q.signerCheck.at && f < Q.approveTap.at ? `2px solid ${C.green}` : '1px solid #bbf7d0', borderRadius: 10, padding: '10px 12px', marginBottom: 12, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: '#15803d' }}>CONNECTED SUI WALLET (SIGNER)</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#dcfce7', color: '#166534' }}>● Guest Sandbox</span>
                  </div>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: '#14532d' }}>{shortAddr(EX.guestAddr)}</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', marginBottom: 14, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: '#64748b' }}>Transaction Type:</span>
                    <strong>Pre-Kickoff Pick Commitment</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: '#64748b' }}>Matchup:</span>
                    <span style={{ fontWeight: 600 }}>{m.title}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: '#64748b' }}>Your Prediction:</span>
                    <span style={{ fontWeight: 700, color: C.blue }}>{side.name} ({chance}%)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, borderTop: '1px dashed #cbd5e1', paddingTop: 5 }}>
                    <span style={{ color: '#64748b' }}>Estimated Network Gas:</span>
                    <span className="mono" style={{ fontWeight: 600, color: '#16a34a' }}>~0.0012 SUI (Testnet Gas)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Permanent Memory Vault:</span>
                    <span style={{ fontWeight: 600, color: '#0284c7' }}>Walrus Testnet Blob (Subsidized)</span>
                  </div>
                </div>

                {!approved ? (
                  <div>
                    <div style={{ fontSize: 12, color: '#475569', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 10px', marginBottom: 12 }}>
                      ℹ️ Clicking <strong>"Approve &amp; Sign Transaction"</strong> will authorize this on-chain commitment.
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span className="btn" style={{ flex: 1, fontWeight: 600 }}>
                        ✓ Approve &amp; Sign Transaction
                        <Tap at={Q.approveTap.at} />
                      </span>
                      <span className="btn2">Cancel</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 13 }}>
                    <StepRow done={step1Done} active={!step1Done} text={step1Done ? `Signed by ${shortAddr(EX.guestAddr)}` : 'Authorizing signature...'} />
                    <StepRow done={step2Done} active={step1Done && !step2Done} text={step2Done ? 'Broadcasted to Sui Testnet' : 'Broadcasting commitment to Sui Testnet (Tatum RPC)'} />
                    <StepRow done={step3Done} active={step2Done && !step3Done} text={step3Done ? `Minted Sui Object (${PICK_RECEIPT.suiObject.slice(0, 8)}…)` : 'Minting storage object & registering blob on Walrus'} />
                  </div>
                )}
              </div>
            </div>
          ) : undefined
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
          <h1 style={{ margin: 0 }}>Log a pick before kickoff</h1>
          <span style={{ fontSize: 13, background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: 999, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0284c7' }} />
            ESPN Live Scoreboard Feed
          </span>
        </div>
        <p className="mut lead">
          Live games fetched directly from ESPN. Your prediction is committed to the blockchain before kickoff. Once a game starts, picks are automatically closed.
        </p>

        <div className="row">
          <div className="card" data-a="formCard" style={{ position: 'relative' }}>
            <label className="label" style={{ color: 'var(--muted)' }}>LIVE MATCHUPS &amp; BETTING MARKETS (ESPN)</label>
            <div className={`field${selectOpen ? ' focus' : ''}`} style={{ marginBottom: 16, fontSize: 14 }}>
              <span>{m.emoji} {m.cat} · {m.title} ({timeStr(m.mins)})</span>
              <span>▾</span>
              <Tap at={Q.selectTap.at} x="82%" />
              {selectOpen && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 4px)', background: '#fff', border: '1px solid var(--line-strong)', borderRadius: 8, boxShadow: '0 12px 28px rgba(0,0,0,.18)', zIndex: 30, overflow: 'hidden' }}>
                  {MATCHUPS.map((mm, idx) => (
                    <div
                      key={mm.id}
                      style={{
                        padding: '10px 12px',
                        fontSize: 13.5,
                        background: idx === hoverIdx ? '#eff6ff' : '#fff',
                        fontWeight: idx === hoverIdx ? 600 : 400,
                        borderBottom: idx < 2 ? '1px solid var(--line)' : undefined,
                        position: 'relative',
                      }}
                    >
                      {mm.emoji} {mm.cat} · {mm.title} ({timeStr(mm.mins)})
                      {idx === 0 && <Tap at={Q.optionTap.at} x="55%" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h2 style={{ marginTop: 0 }}>{m.title}</h2>
            <p className="mut flush">
              <span style={{ color: '#16a34a', fontWeight: 600 }}>⚡ Kickoff in 1 hours 5 minutes</span> • Pre-game lock open on ESPN schedule
            </p>

            {locked && (
              <div className="warn" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', margin: '12px 0' }}>
                <strong>Success:</strong> Your prediction has been committed to Sui Testnet &amp; Walrus. You cannot submit another pick for this game.
              </div>
            )}

            <div className="sides" style={{ marginTop: 16 }}>
              {m.sides.map((s, idx) => (
                <span key={s.name} className={idx === sideIdx ? 'btn' : 'btn2'}>
                  {s.name}
                  {idx === 1 && <Tap at={Q.sideTap.at} />}
                </span>
              ))}
            </div>

            <label>
              <strong>Chance {side.name} win: {chance}%</strong>
            </label>
            <Slider value={chance} min={1} max={99} drag={activeChanceDrag} disabled={locked} />
            <p className="mut">
              The market says {side.market}%. You are {Math.abs(diff)} points {diff > 0 ? 'more' : 'less'} confident than the bookmakers.
            </p>

            <span className="btn" style={{ width: '100%', ...(locked ? { background: '#6b7280', borderColor: '#6b7280' } : {}) }}>
              {locked ? '🔒 Prediction Locked for this Game' : 'Lock pick on the blockchain'}
              <Tap at={Q.lockTap.at} />
            </span>
          </div>

          <div className="card" data-a="receiptCard" style={{ position: 'relative' }}>
            <Glow from={Q.receipt.at} to={785} color={C.green} />
            <Callout at={Q.receipt.at + 6} until={Q.hashHighlight.at - 4} k="STAMPED" text="Pre-kickoff Sui timestamp" color={C.green} place="top" />
            <Callout at={Q.hashHighlight.at} k="WALRUS + SHA-256" text="Permanent blob & commit fingerprint" color={C.blue} place="top" />
            <h2>Pre-kickoff stamp</h2>
            {!locked ? (
              <p className="mut">Shown after you lock a pick.</p>
            ) : (
              <div style={{ opacity: spr(f, Q.receipt.at, 14) }}>
                <table className="t">
                  <thead>
                    <tr>
                      <th>Detail</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Matchup</td><td>{m.title}</td></tr>
                    <tr><td>Your side</td><td><strong>{side.name}, {chance}%</strong></td></tr>
                    <tr><td>Locked at</td><td style={{ color: C.green, fontWeight: 600 }}>{PICK_RECEIPT.lockedAt}</td></tr>
                    <tr>
                      <td>On-Chain Object</td>
                      <td>
                        <span className="mono" style={{ fontWeight: 600 }}>{shortAddr(PICK_RECEIPT.suiObject)}</span>{' '}
                        <span style={{ color: C.blue, fontSize: 13 }}>View Object on Suiscan ↗</span>
                      </td>
                    </tr>
                    <tr style={{ background: f >= Q.hashHighlight.at ? '#f0fdf4' : undefined }}>
                      <td>Permanent Memory</td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#16a34a' }}>Walrus Testnet</span>{' '}
                        <span style={{ fontWeight: 600, color: C.blue, fontSize: 13 }}>View on Walrus Storage (Instant Proof) ↗</span>
                      </td>
                    </tr>
                    <tr style={{ background: f >= Q.hashHighlight.at ? '#eff6ff' : undefined }}>
                      <td>SHA-256 Fingerprint</td>
                      <td className="mono" style={{ fontSize: 12, wordBreak: 'break-all', fontWeight: f >= Q.hashHighlight.at ? 700 : 400 }}>{PICK_RECEIPT.fingerprint}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            <p className="mut small" style={{ marginTop: 16 }}>
              Your details stay private until you reveal them to AlphaAgent. A locked pick you never reveal shows up as a hidden bet.
            </p>
          </div>
        </div>
      </AppShell>
    </Camera>
  );
};

const StepRow: React.FC<{ done: boolean; active: boolean; text: string }> = ({ done, active, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: done ? '#16a34a' : active ? C.blue : '#9ca3af', fontWeight: done || active ? 600 : 400 }}>
    {done ? <span>✓</span> : active ? <Spinner size={14} color={C.blue} /> : <span>○</span>}
    <span>{text}</span>
  </div>
);
