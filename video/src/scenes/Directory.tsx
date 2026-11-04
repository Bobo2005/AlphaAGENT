import React from 'react';
import { useCurrentFrame } from 'remotion';
import { C, Format } from '../brand';
import { keyed, prog, spr } from '../anim';
import { CUES } from '../timeline';
import { TIPSTERS } from '../data';
import { AppShell, Toast, Wallet } from '../ui/AppShell';
import { Camera, CamKey } from '../ui/Device';
import { Callout, Glow, Spinner, Tap } from '../ui/Interact';
import { LAYOUT } from '../Layout';

const Q = CUES.directory;

/**
 * Scene 1: Connect & Explore Directory (/tipsters) — 12 bars = 24s = 720 frames.
 * Beat A (0..120): Tap ⚡ Try as guest -> Provisioning… -> Guest: 0x8f2a…c41d (0.05 SUI)
 * Beat B (120..320): Tap 🔄 Refresh Live Audits -> 4 rows stream in -> toast "✅ Audited 4 on-chain forecasters..." + Skill Edge BSS callout
 * Beat C (320..500): Tap filter Watch 2 -> Follow 1 -> All 4
 * Beat D (500..720): Tap + Follow on SharpModel_30 -> ✓ Following + whitelist toast
 */
export const Directory: React.FC<{ format: Format }> = ({ format }) => {
  const f = useCurrentFrame();
  const mobile = format === 'vertical';
  const wallet: Wallet = f < Q.guestTap.at + 3 ? 'none' : f < Q.guestDone.at ? 'loading' : 'guest';
  const refreshing = f >= Q.refreshTap.at + 2 && f < Q.row1.at;
  const rowsAt = [Q.row1.at, Q.row2.at, Q.row3.at, Q.row4.at];
  const loaded = f >= Q.row1.at;
  const following = f >= Q.followTap.at + 2;

  const activeFilter: 'All' | 'FOLLOW' | 'WATCH' | 'SKIP' =
    f >= Q.filterAllTap.at + 2
      ? 'All'
      : f >= Q.filterFollowTap.at + 2
      ? 'FOLLOW'
      : f >= Q.filterWatchTap.at + 2
      ? 'WATCH'
      : 'All';

  const auditToastShow = spr(f, Q.auditToast.at, 16) * (1 - prog(f, Q.auditToastOut.at, Q.auditToastOut.at + 12));
  const followToastShow = spr(f, Q.toast.at, 16) * (1 - prog(f, Q.toastOut.at, Q.toastOut.at + 12));
  const toastShow = Math.max(auditToastShow, followToastShow);

  const scroll = mobile
    ? keyed(f, [
        { at: 0, v: 0 },
        { at: 110, v: 180, dur: 22 },
        { at: 220, v: 240, dur: 22 },
      ])
    : 0;

  const swipe = mobile
    ? keyed(f, [
        { at: 0, v: 0 },
        { at: 230, v: 330, dur: 22 },
        { at: 330, v: 0, dur: 20 },
        { at: Q.swipe.at, v: 760, dur: Q.swipe.end - Q.swipe.at },
      ])
    : 0;

  const keys: CamKey[] = mobile
    ? [
        { at: 0, zoom: 1 },
        { at: 18, target: 'wallet', zoom: 1.42, dur: 18 },
        { at: 112, target: 'refreshBtn', zoom: 1.28, dur: 18 },
        { at: 165, target: 'table', zoom: 1.12, dur: 22 },
        { at: 325, target: 'filters', zoom: 1.25, dur: 18 },
        { at: 500, target: 'follow1', zoom: 1.32, dur: 20 },
        { at: 650, zoom: 1, dur: 28 },
      ]
    : [
        { at: 0, zoom: 1 },
        { at: 18, target: 'wallet', zoom: 1.9, dur: 20 },
        { at: 112, target: 'refreshBtn', zoom: 1.45, dur: 18 },
        { at: 165, zoom: 1.05, dur: 22 },
        { at: 238, target: 'table', zoom: 1.15, dur: 22 },
        { at: 325, target: 'filters', zoom: 1.35, dur: 20 },
        { at: 535, target: 'follow1', zoom: 1.42, dur: 22 },
        { at: 650, zoom: 1, dur: 28 },
      ];

  const count = (v?: string) => (loaded ? ' ' + TIPSTERS.filter((t) => !v || t.verdict === v).length : '');
  const shown = TIPSTERS.filter((t) => activeFilter === 'All' || t.verdict === activeFilter);

  return (
    <Camera format={format} stage={LAYOUT[format].stage} keys={keys} url="alphaagent.sui/tipsters">
      <AppShell
        route="/tipsters"
        mobile={mobile}
        wallet={wallet}
        scroll={scroll}
        guestTap={<Tap at={Q.guestTap.at} />}
        overlay={
          <Toast show={toastShow} mobile={mobile}>
            {f >= Q.toast.at ? (
              <>
                ✅ Now following <strong>SharpModel_30</strong>! Added to Copy Trading Bot whitelist.
              </>
            ) : (
              <>✅ Audited 4 on-chain forecasters against Sui &amp; Walrus!</>
            )}
          </Toast>
        }
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 12 }}>
          <div style={{ flex: '1 1 300px' }}>
            <h1 style={{ margin: '0 0 6px' }}>Tipsters</h1>
            <p className="mut lead" style={{ margin: 0 }}>
              Ranked by cryptographic proof &amp; mathematical edge, not by streaks. Follow verified forecasters to automatically copy their pre-kickoff predictions.
            </p>
          </div>
          <span className="btn2" data-a="refreshBtn" style={{ padding: '10px 16px', fontWeight: 600, opacity: refreshing ? 0.75 : 1 }}>
            {refreshing ? (
              <>
                <Spinner size={14} color={C.blue} /> Auditing &amp; Refreshing...
              </>
            ) : (
              <>🔄 Refresh Live Audits</>
            )}
            <Tap at={Q.refreshTap.at} />
          </span>
        </div>

        <div className="actions" data-a="filters">
          <span className={activeFilter === 'All' ? 'btn' : 'btn2'}>
            All{count()}
            <Tap at={Q.filterAllTap.at} />
          </span>
          <span className={activeFilter === 'FOLLOW' ? 'btn' : 'btn2'}>
            Follow{count('FOLLOW')}
            <Tap at={Q.filterFollowTap.at} />
          </span>
          <span className={activeFilter === 'WATCH' ? 'btn' : 'btn2'}>
            Watch{count('WATCH')}
            <Tap at={Q.filterWatchTap.at} />
          </span>
          <span className={activeFilter === 'SKIP' ? 'btn' : 'btn2'}>Skip{count('SKIP')}</span>
        </div>

        <div className="card" data-a="table">
          <Callout at={Q.skillCallout.at} k="RANKED BY" text="Shrunk BSS — not win streak" color={C.blue} until={Q.filterWatchTap.at - 6} />
          <div className="scroll">
            <table className="t" style={{ minWidth: mobile ? 1090 : undefined, transform: `translateX(${-swipe}px)`, tableLayout: mobile ? 'fixed' : 'auto' }}>
              <thead>
                <tr>
                  <th style={{ width: mobile ? 190 : undefined }}>Tipster</th>
                  <th style={{ width: mobile ? 70 : undefined }}>Picks</th>
                  <th style={{ width: mobile ? 150 : undefined }}>Win Rate (Record)</th>
                  <th style={{ position: 'relative', width: mobile ? 140 : undefined }} data-a="skillCol">
                    Skill Edge (BSS)
                  </th>
                  <th style={{ width: mobile ? 110 : undefined }}>Hidden bets</th>
                  <th style={{ width: mobile ? 100 : undefined }}>Verdict</th>
                  <th style={{ width: mobile ? 220 : undefined }}>Mathematical Audit Reason</th>
                  <th style={{ width: mobile ? 130 : undefined }}>Copy Bot Action</th>
                </tr>
              </thead>
              <tbody>
                {!loaded ? (
                  <tr>
                    <td colSpan={8} className="mut" style={{ textAlign: mobile ? 'left' : 'center', padding: 32 }}>
                      Loading live forecaster directory &amp; Walrus audits...
                    </td>
                  </tr>
                ) : (
                  shown.map((t) => {
                    const origIdx = TIPSTERS.findIndex((x) => x.label === t.label);
                    const s = spr(f, rowsAt[origIdx], 18);
                    if (f < rowsAt[origIdx]) return null;
                    const badge = t.verdict === 'FOLLOW' ? 'f' : t.verdict === 'SKIP' ? 's' : 'w';
                    const skillColor = t.skill.startsWith('+') ? '#16a34a' : t.skill.startsWith('-') ? '#dc2626' : '#374151';
                    const isF = origIdx === 0 && following;
                    return (
                      <tr key={t.label} style={{ opacity: s, transform: `translateY(${(1 - s) * 14}px)` }}>
                        <td style={{ minWidth: 190 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 22 }}>{t.avatar}</span>
                            <div>
                              <strong style={{ whiteSpace: 'nowrap' }}>{t.label}</strong>
                              <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                {t.addr.slice(0, 6)}…{t.addr.slice(-4)} ↗
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{t.picks}</strong>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <strong>{t.win}%</strong>
                          <br />
                          <span className="mut small">
                            {t.W}W - {t.L}L
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap', position: 'relative' }}>
                          <span style={{ color: skillColor, fontWeight: 600 }}>{t.skill}</span>
                          {origIdx === 0 && <Glow from={Q.skillCallout.at} to={Q.filterWatchTap.at - 8} color="#16a34a" radius={6} />}
                        </td>
                        <td>{t.hidden}%</td>
                        <td>
                          <span className={`b ${badge}`}>{t.verdict}</span>
                        </td>
                        <td style={{ minWidth: mobile ? undefined : 200, fontSize: 13, lineHeight: 1.4 }}>{t.reason}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <span
                            data-a={origIdx === 0 ? 'follow1' : undefined}
                            className={isF ? 'btn' : 'btn2'}
                            style={{ padding: '6px 14px', fontSize: 13, fontWeight: 600, minHeight: 34, ...(isF ? { background: '#16a34a', borderColor: '#16a34a', color: '#fff' } : {}) }}
                          >
                            {isF ? '✓ Following' : '+ Follow'}
                            {origIdx === 0 && <Tap at={Q.followTap.at} />}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {mobile && <SwipeDot />}
        </div>
      </AppShell>
    </Camera>
  );
};

const SwipeDot: React.FC = () => {
  const f = useCurrentFrame();
  const segs: [number, number][] = [
    [230, 252],
    [CUES.directory.swipe.at, CUES.directory.swipe.end],
  ];
  const seg = segs.find(([a, b]) => f >= a - 6 && f <= b + 8);
  if (!seg) return null;
  const [a, b] = seg;
  const p = prog(f, a, b);
  const o = prog(f, a - 6, a) * (1 - prog(f, b, b + 8));
  return (
    <div style={{ position: 'absolute', left: 290 - p * 200, top: 150, width: 40, height: 40, marginLeft: -20, borderRadius: '50%', background: 'rgba(255,255,255,.78)', border: '3px solid #0b4f9c', boxShadow: '0 6px 18px rgba(15,23,42,.35)', opacity: o, zIndex: 50 }} />
  );
};
