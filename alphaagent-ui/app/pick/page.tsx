'use client';
import { useEffect, useState } from 'react';
import { useGuest } from '@/components/GuestContext';
import { Table } from '@/components/ui';
import { lockPick } from '@/lib/api';
import type { PickReceipt } from '@/lib/types';

interface MatchupItem {
  id: string;
  title: string;
  category: string;
  emoji?: string;
  sides: { name: string; market: number }[];
  minsUntil: number;
  kickoffTs?: number;
  isClosed?: boolean;
  status?: string;
}

const DEFAULT_MATCHUPS: MatchupItem[] = [
  { id: 'epl_mun_che', title: 'Manchester United vs Chelsea', category: 'EPL', emoji: '⚽', sides: [{ name: 'Man United', market: 46 }, { name: 'Chelsea', market: 54 }], minsUntil: 65, isClosed: false },
  { id: 'nba_lal_gsw', title: 'Lakers vs Warriors', category: 'NBA', emoji: '🏀', sides: [{ name: 'Lakers', market: 62 }, { name: 'Warriors', market: 38 }], minsUntil: 110, isClosed: false },
  { id: 'nfl_bal_buf', title: 'Baltimore Ravens vs Buffalo Bills', category: 'NFL', emoji: '🏈', sides: [{ name: 'Ravens', market: 48 }, { name: 'Bills', market: 52 }], minsUntil: 240, isClosed: false },
];

type Phase = 'idle' | 'locking' | 'confirming' | 'done' | 'error';
const LABEL: Record<Phase, string> = {
  idle: 'Lock pick on the blockchain', locking: 'Locking…', confirming: 'Confirming on blockchain…', done: 'Locked on Blockchain', error: 'Try again',
};

export default function PickPage() {
  const { address, isExtension, setIsModalOpen } = useGuest();
  const [matchups, setMatchups] = useState<MatchupItem[]>(DEFAULT_MATCHUPS);
  const [matchupIndex, setMatchupIndex] = useState(0);
  const currentMatchup = matchups[matchupIndex] || DEFAULT_MATCHUPS[0];
  const [sideIndex, setSideIndex] = useState(0);
  const currentSide = currentMatchup.sides[sideIndex] || currentMatchup.sides[0];
  const [chance, setChance] = useState(70);
  const [phase, setPhase] = useState<Phase>('idle');
  const [receipt, setReceipt] = useState<PickReceipt | null>(null);
  const [showTxModal, setShowTxModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load live ESPN fixtures
  useEffect(() => {
    async function fetchFixtures() {
      try {
        const res = await fetch('/api/fixtures');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.fixtures && data.fixtures.length > 0) {
            setMatchups(data.fixtures);
            const firstOpen = data.fixtures.findIndex((f: MatchupItem) => !f.isClosed);
            if (firstOpen >= 0) setMatchupIndex(firstOpen);
          }
        }
      } catch {}
    }
    fetchFixtures();
    const interval = setInterval(fetchFixtures, 30000);
    return () => clearInterval(interval);
  }, []);

  const diff = chance - currentSide.market;
  const isClosed = currentMatchup.isClosed || currentMatchup.minsUntil <= 0;
  const busy = phase === 'locking' || phase === 'confirming' || phase === 'done';

  async function onLock() {
    if (!address) {
      setIsModalOpen(true);
      return;
    }
    if (isClosed) return;
    setShowTxModal(true);
  }

  async function executeConfirmedTx() {
    setPhase('locking');
    try {
      const r = await lockPick(
        {
          address: address!,
          matchup: currentMatchup.title,
          side: currentSide.name,
          yourChancePct: chance,
        },
        () => setPhase('confirming')
      );
      setReceipt(r);
      setPhase('done');
      setShowTxModal(false);
    } catch {
      setPhase('error');
    }
  }

  function reset() {
    setPhase('idle');
    setReceipt(null);
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <h1 style={{ margin: 0 }}>Log a pick before kickoff</h1>
        <span style={{ fontSize: 13, background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: 999, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0284c7' }}></span>
          ESPN Live Scoreboard Feed
        </span>
      </div>
      <p className="mut lead">Live games fetched directly from ESPN. Your prediction is committed to the blockchain before kickoff. Once a game starts, picks are automatically closed.</p>

      <div className="row">
        <div className="card">
          <label htmlFor="matchupSelect" style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
            LIVE MATCHUPS & BETTING MARKETS (ESPN)
          </label>
          <select
            id="matchupSelect"
            value={matchupIndex}
            onChange={(e) => {
              setMatchupIndex(Number(e.target.value));
              setSideIndex(0);
            }}
            disabled={busy}
            style={{
              width: '100%',
              padding: 12,
              font: 'inherit',
              fontSize: 14,
              border: '1px solid var(--line-strong)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 16,
              background: 'var(--bg)',
              color: 'var(--ink)',
            }}
          >
            {matchups.map((m, idx) => {
              const timeStr = m.isClosed
                ? `🔴 Closed (${m.status || 'Past'})`
                : m.minsUntil > 60
                ? `⏳ In ${Math.floor(m.minsUntil / 60)}h ${m.minsUntil % 60}m`
                : `⚡ In ${m.minsUntil}m`;
              return (
                <option key={m.id} value={idx}>
                  {m.emoji || '🏆'} {m.category} · {m.title} ({timeStr})
                </option>
              );
            })}
          </select>

          <h2 style={{ marginTop: 0 }}>{currentMatchup.title}</h2>
          <p className="mut flush" role="status">
            {isClosed ? (
              <span style={{ color: '#dc2626', fontWeight: 600 }}>
                ⚠️ Kickoff has passed ({currentMatchup.status || 'In Progress'}). Pre-game picks are locked & closed.
              </span>
            ) : (
              <span style={{ color: '#16a34a', fontWeight: 600 }}>
                ⚡ Kickoff in {currentMatchup.minsUntil > 60 ? `${Math.floor(currentMatchup.minsUntil / 60)} hours ${currentMatchup.minsUntil % 60} minutes` : `${currentMatchup.minsUntil} minutes`} • Pre-game lock open
              </span>
            )}
          </p>

          <div className="sides" role="group" aria-label="Choose a side" style={{ marginTop: 16 }}>
            {currentMatchup.sides.map((s, idx) => (
              <button
                key={s.name}
                type="button"
                className={idx === sideIndex ? 'btn' : 'btn2'}
                aria-pressed={idx === sideIndex}
                onClick={() => setSideIndex(idx)}
                disabled={busy}
              >
                {s.name}
              </button>
            ))}
          </div>

          <label htmlFor="chance">
            <strong>Chance {currentSide.name} win: {chance}%</strong>
          </label>
          <input
            id="chance"
            type="range"
            min={1}
            max={99}
            value={chance}
            onChange={(e) => setChance(Number(e.target.value))}
            disabled={busy}
          />
          <p className="mut">
            The market says {currentSide.market}%.{' '}
            {diff === 0
              ? 'You agree with the bookmakers.'
              : `You are ${Math.abs(diff)} points ${diff > 0 ? 'more' : 'less'} confident than the bookmakers.`}
          </p>

          <button
            type="button"
            className="btn"
            style={{ width: '100%' }}
            onClick={onLock}
            disabled={!address || busy || isClosed}
          >
            {isClosed ? 'Picks Closed (Game Started)' : LABEL[phase]}
          </button>

          {!address && (
            <div style={{ marginTop: 12 }}>
              <p className="mut small" style={{ marginBottom: 8 }}>
                Connect your Sui wallet to lock picks on the blockchain.
              </p>
              <button type="button" className="btn2" onClick={() => setIsModalOpen(true)}>
                Connect Wallet
              </button>
            </div>
          )}

          {phase === 'error' && <p className="warn" role="alert">Couldn’t reach blockchain. Try again.</p>}
          {phase === 'done' && (
            <p style={{ marginTop: 12 }}>
              <button type="button" className="link" onClick={reset}>
                Log another pick
              </button>
            </p>
          )}
        </div>

        <div className="card">
          <h2>Pre-kickoff stamp</h2>
          {receipt ? (
            <Table head={['Detail', 'Value']}>
              <tr><td>Matchup</td><td>{receipt.matchup}</td></tr>
              <tr><td>Your side</td><td>{receipt.side}, {receipt.yourChancePct}%</td></tr>
              <tr><td>Locked at</td><td>{receipt.lockedAtUtc}, before kickoff</td></tr>
              <tr>
                <td>On-Chain Account</td>
                <td>
                  <a href={receipt.explorerUrl} target="_blank" rel="noopener noreferrer">
                    View on SuiVision ↗
                  </a>
                </td>
              </tr>
              <tr><td>Fingerprint</td><td style={{ fontFamily: 'monospace' }}>{receipt.fingerprint}</td></tr>
            </Table>
          ) : (
            <p className="mut">Shown after you lock a pick.</p>
          )}
          <p className="mut small" style={{ marginTop: 16 }}>
            Your details stay private until you reveal them to AlphaAgent. A locked pick you never reveal shows up as a hidden bet.
          </p>
        </div>
      </div>

      {showTxModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--bg, #ffffff)', color: 'var(--ink, #111827)', borderRadius: 14, maxWidth: 500, width: '100%', padding: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid var(--line, #e5e7eb)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, borderBottom: '1px solid var(--line, #f3f4f6)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💧</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ink, #111827)' }}>Confirm Transaction with AlphaAgent</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted, #6b7280)' }}>Sui Testnet · Pre-Kickoff Commitment</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowTxModal(false)} style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--muted, #9ca3af)', lineHeight: 1 }}>&times;</button>
            </div>

            {/* Connected Signer & User Identity Box */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', color: '#15803d', textTransform: 'uppercase' }}>CONNECTED SUI WALLET (SIGNER)</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#dcfce7', color: '#166534', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }}></span>
                  <span>{isExtension ? 'Real Sui Extension' : 'Guest Sandbox'}</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#14532d', wordBreak: 'break-all' }}>{address}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (address && navigator.clipboard) {
                      navigator.clipboard.writeText(address);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }
                  }}
                  style={{ background: '#ffffff', border: '1px solid #86efac', borderRadius: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer', color: '#15803d', whiteSpace: 'nowrap' }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div style={{ fontSize: 11, color: '#166534', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>Identity: <strong>Forecaster Account</strong></span>
                <span>Network: <strong>Sui Testnet (Tatum RPC)</strong></span>
              </div>
            </div>

            {/* Transaction Details Card */}
            <div style={{ background: 'var(--panel, #f8fafc)', border: '1px solid var(--line, #e2e8f0)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--muted, #64748b)' }}>Transaction Type:</span>
                <strong style={{ color: 'var(--ink, #0f172a)' }}>Pre-Kickoff Pick Commitment</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--muted, #64748b)' }}>Matchup:</span>
                <span style={{ fontWeight: 600, color: 'var(--ink, #0f172a)', textAlign: 'right' }}>{currentMatchup.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--muted, #64748b)' }}>Your Prediction:</span>
                <span style={{ fontWeight: 700, color: '#2563eb', textAlign: 'right' }}>{currentSide.name} ({chance}%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, borderTop: '1px dashed var(--line, #cbd5e1)', paddingTop: 6 }}>
                <span style={{ color: 'var(--muted, #64748b)' }}>Estimated Network Gas:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#16a34a' }}>~0.0012 SUI (Testnet Gas)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted, #64748b)' }}>Permanent Memory Vault:</span>
                <span style={{ fontWeight: 600, color: '#0284c7' }}>Walrus Testnet Blob (Subsidized)</span>
              </div>
            </div>

            {/* Review phase & buttons */}
            <div style={{ fontSize: 12, color: 'var(--muted, #475569)', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
              ℹ️ Please confirm your connected wallet address and pick details above. Clicking <strong>"Approve & Sign Transaction"</strong> will authorize this on-chain commitment.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn"
                style={{ flex: 1, padding: 12, fontSize: 14, fontWeight: 600, background: '#2563eb', borderColor: '#2563eb' }}
                onClick={executeConfirmedTx}
                disabled={busy}
              >
                {busy ? 'Processing…' : '✓ Approve & Sign Transaction'}
              </button>
              <button
                type="button"
                className="btn2"
                onClick={() => setShowTxModal(false)}
                disabled={busy}
                style={{ padding: '12px 18px', fontSize: 14 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
