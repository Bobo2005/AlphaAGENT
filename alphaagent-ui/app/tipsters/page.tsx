'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge, SampleTag, Table } from '@/components/ui';
import { listTipsters } from '@/lib/api';
import { formatSkill } from '@/lib/format';
import type { TipsterSummary, Verdict } from '@/lib/types';
import { useGuest } from '@/components/GuestContext';

const FILTERS: ('All' | Verdict)[] = ['All', 'FOLLOW', 'WATCH', 'SKIP'];

export default function Tipsters() {
  const { address: userWallet, setIsModalOpen } = useGuest();
  const [rows, setRows] = useState<TipsterSummary[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<'All' | Verdict>('All');
  const [followed, setFollowed] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const load = () => {
    setError(false);
    listTipsters().then(setRows).catch(() => setError(true));
    try {
      const stored = localStorage.getItem('alpha_followed_tipsters');
      if (stored) {
        setFollowed(JSON.parse(stored));
      } else {
        setFollowed([]);
      }
    } catch {}
  };

  useEffect(load, []);

  const toggleFollow = (tipsterAddr: string, label: string, verdict: Verdict) => {
    if (!userWallet) {
      setIsModalOpen(true);
      return;
    }

    let next: string[];
    if (followed.includes(tipsterAddr)) {
      next = followed.filter((a) => a !== tipsterAddr);
      setToast(`Unfollowed ${label}`);
    } else {
      if (verdict === 'SKIP' || verdict === 'WATCH') {
        const warn = verdict === 'SKIP'
          ? `⚠️ Safe-Shield Notice: ${label} is flagged as SKIP (failed audit gates / negative skill). Follow anyway?`
          : `⚠️ Safe-Shield Notice: ${label} is under WATCH (small sample depth). Follow anyway?`;
        if (!confirm(warn)) return;
      }
      next = [...followed, tipsterAddr];
      setToast(`✅ Now following ${label}! Added to Copy Trading Bot.`);
    }

    setFollowed(next);
    localStorage.setItem('alpha_followed_tipsters', JSON.stringify(next));
    setTimeout(() => setToast(null), 3000);
  };

  const count = (f: 'All' | Verdict) => (rows ?? []).filter((r) => f === 'All' || r.verdict === f).length;
  const shown = (rows ?? []).filter((r) => filter === 'All' || r.verdict === filter);

  return (
    <>
      <h1>Tipsters</h1>
      <p className="mut lead">Ranked by evidence, not by streaks. Follow verified tipsters to automatically copy approved picks.</p>
      <div className="actions" role="group" aria-label="Filter by verdict">
        {FILTERS.map((f) => (
          <button key={f} type="button" className={f === filter ? 'btn' : 'btn2'} aria-pressed={f === filter} onClick={() => setFilter(f)}>
            {f === 'All' ? 'All' : f[0] + f.slice(1).toLowerCase()} {rows ? count(f) : ''}
          </button>
        ))}
      </div>
      <div className="card">
        {error ? (
          <p role="alert">Couldn’t load tipsters. <button type="button" className="link" onClick={load}>Retry</button></p>
        ) : !rows ? (
          <p className="mut">Loading tipsters…</p>
        ) : shown.length === 0 ? (
          <p className="mut">No tipsters here yet.</p>
        ) : (
          <Table head={['Tipster', 'Picks', 'Win Rate (Record)', 'Skill Edge (BSS)', 'Hidden bets', 'Verdict', 'Why', 'Copy Bot Action']}>
            {shown.map((t) => {
              const isFollowing = followed.includes(t.address);
              const isSelf = userWallet && userWallet.toLowerCase() === t.address.toLowerCase();
              return (
                <tr key={t.address} style={isSelf ? { background: '#f0fdf4' } : undefined}>
                  <td>
                    <strong>{t.label ?? 'Tipster'}</strong>
                    {isSelf && (
                      <span style={{ display: 'inline-block', marginLeft: 6, fontSize: 11, background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', borderRadius: 999, padding: '2px 8px', fontWeight: 700 }}>
                        🟢 You
                      </span>
                    )}
                    <br />
                    <Link href={`/profile?address=${encodeURIComponent(t.address)}`} className="mut small">
                      {t.address.slice(0, 8)}…{t.address.slice(-4)} ↗
                    </Link>
                  </td>
                  <td><strong>{t.picks}</strong></td>
                  <td>
                    {typeof t.winRatePct === 'number' && t.picks > 0 ? (
                      <>
                        <strong>{t.winRatePct}%</strong>
                        <br />
                        <span className="mut small">
                          {t.wonCount ?? 0}W - {t.lostCount ?? 0}L
                          {(t.pendingCount ?? 0) > 0 ? ` (${t.pendingCount} pending)` : ''}
                        </span>
                      </>
                    ) : (
                      <span className="mut small">Pending results</span>
                    )}
                  </td>
                  <td>{formatSkill(t)}</td>
                  <td>{t.hiddenBetsPct}%</td>
                  <td><Badge verdict={t.verdict} /></td>
                  <td>{t.reason}</td>
                  <td>
                    <button
                      type="button"
                      className={isFollowing ? 'btn' : 'btn2'}
                      onClick={() => toggleFollow(t.address, t.label || t.address.slice(0, 8), t.verdict)}
                      style={{
                        padding: '6px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        background: isFollowing ? '#16a34a' : undefined,
                        borderColor: isFollowing ? '#16a34a' : undefined,
                        color: isFollowing ? '#ffffff' : undefined,
                      }}
                    >
                      {isFollowing ? '✓ Following' : '+ Follow'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: 8, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', zIndex: 9999, fontSize: 14 }}>
          {toast}
        </div>
      )}
    </>
  );
}
