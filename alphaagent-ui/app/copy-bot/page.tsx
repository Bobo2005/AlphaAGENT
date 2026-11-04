'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Trade {
  id: string;
  timestamp: number;
  forecaster: string;
  forecasterLabel: string;
  eventId: string;
  displayEvent: string;
  category: string;
  side: string;
  forecastProb: number;
  marketProb: number;
  decimalOdds: number;
  edge: number;
  stakeSui: number;
  stakePct: number;
  expectedValuePct: number;
  minsBeforeKickoff: number;
  status: 'ACTIVE' | 'WON' | 'LOST' | 'REJECTED';
  verdictPassed: string;
  auditReason: string;
  pnlSui: number;
  commitHash: string;
  txDigest: string;
  walrusBlobId?: string;
  explorerUrl?: string;
}

interface Stats {
  enabled: boolean;
  bankrollSui: number;
  currentAllocatedSui: number;
  availableBankrollSui: number;
  totalTradesCopied: number;
  activeTradesCount: number;
  wonCount: number;
  lostCount: number;
  totalPnlSui: number;
  roiPct: number;
  monitoredForecastersCount: number;
}

export default function CopyBotPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [shieldTipsters, setShieldTipsters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const [resStatus, resTipsters] = await Promise.all([
        fetch('/api/copy-bot/status'),
        fetch('/api/tipsters')
      ]);
      const data = await resStatus.json();
      if (data.success) {
        setStats(data.stats);
        setTrades(data.trades || []);
      }
      const tipData = await resTipsters.json();
      if (tipData.success && Array.isArray(tipData.tipsters)) {
        setShieldTipsters(tipData.tipsters);
      }
    } catch {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setFeedback('Auditing ESPN games & running Walrus gate checks...');
    try {
      const res = await fetch('/api/copy-bot/scan', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setTrades(data.trades || []);
        setFeedback(`✅ Scanned ${data.scannedPicksCount} picks. Copied: ${data.copiedCount} · Blocked by Safe-Shield: ${data.rejectedCount}`);
      } else {
        setFeedback(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setFeedback(`Network error: ${e.message}`);
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      <h1>🤖 Autonomous Copy Trading Bot</h1>
      <p className="mut lead">
        Mathematically sized copy-trading using the Fractional Kelly Criterion. AlphaAgent's due-diligence gate automatically blocks coin-toss streaks and cherry-pickers before any real capital is risked.
      </p>

      {/* Metrics Row */}
      <div className="row" style={{ marginBottom: 24 }}>
        <div className="card">
          <span className="mut small">TOTAL BANKROLL</span>
          <div className="big">{stats ? stats.bankrollSui.toFixed(2) : '25.00'} SUI</div>
          <div className="mut small">Free Reserve: {stats ? stats.availableBankrollSui.toFixed(2) : '25.00'} SUI</div>
        </div>
        <div className="card">
          <span className="mut small">CAPITAL IN PLAY</span>
          <div className="big" style={{ color: '#2563eb' }}>{stats ? stats.currentAllocatedSui.toFixed(2) : '0.00'} SUI</div>
          <div className="mut small">{stats ? stats.activeTradesCount : 0} active positions</div>
        </div>
        <div className="card">
          <span className="mut small">REALIZED PNL & ROI</span>
          <div className="big" style={{ color: (stats?.totalPnlSui || 0) >= 0 ? '#16a34a' : '#dc2626' }}>
            {((stats?.totalPnlSui || 0) >= 0 ? '+' : '') + (stats?.totalPnlSui?.toFixed(2) || '0.00')} SUI
          </div>
          <div className="mut small">
            {stats ? `${stats.wonCount} Won · ${stats.lostCount} Lost (${stats.roiPct > 0 ? '+' : ''}${stats.roiPct}%)` : '0 Won · 0 Lost'}
          </div>
        </div>
        <div className="card">
          <span className="mut small">DUE-DILIGENCE SHIELD</span>
          <div className="big" style={{ color: '#16a34a', fontSize: 20, lineHeight: 1.4 }}>🛡️ SAFE-SHIELD ON</div>
          <div className="mut small">Only verified FOLLOW tipsters approved</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions" style={{ marginBottom: 24 }}>
        <button className="btn" onClick={handleScan} disabled={scanning}>
          {scanning ? 'Auditing & Scanning...' : '⚡ Run Audit & Copy Scan'}
        </button>
        <button className="btn2">
          {stats?.enabled ? '🟢 Bot Active' : '⏸️ Bot Paused'}
        </button>
        {feedback && (
          <span className="mut small" style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center' }}>
            {feedback}
          </span>
        )}
      </div>

      {/* Monitored Tipsters Card */}
      <div className="card" style={{ marginBottom: 28 }}>
        <h2>📋 Monitored Tipsters & AlphaAgent Safe-Shield Status</h2>
        <div className="scroll">
          <table className="t">
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
              {shieldTipsters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="mut" style={{ textAlign: 'center', padding: 24 }}>
                    No forecasters registered yet. Once forecasters log picks on Sui and Walrus, their automated Safe-Shield verdicts will appear here.
                  </td>
                </tr>
              ) : (
                shieldTipsters.map((t) => {
                  const edgeStr = t.skillPct !== null && t.skillPct !== undefined
                    ? `${t.skillPct >= 0 ? '+' : ''}${t.skillPct}% edge`
                    : 'Too early';
                  return (
                    <tr key={t.address}>
                      <td><strong>{t.label || 'Forecaster'}</strong><br/><span className="mut small">{t.address.slice(0, 10)}…{t.address.slice(-4)}</span></td>
                      <td>{t.picks || 0} picks</td>
                      <td><span style={{ color: (t.skillPct ?? 0) >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{edgeStr}</span></td>
                      <td>{t.hiddenBetsPct || 0}%</td>
                      <td>
                        <span className={`b ${t.verdict === 'FOLLOW' ? 'f' : t.verdict === 'WATCH' ? 'w' : 's'}`}>
                          {t.verdict}
                        </span>
                      </td>
                      <td>
                        {t.verdict === 'FOLLOW' && (
                          <span style={{ color: '#16a34a', fontWeight: 600 }}>✅ APPROVED (Kelly Sized)</span>
                        )}
                        {t.verdict === 'WATCH' && (
                          <span style={{ color: '#b45309', fontWeight: 600 }}>⛔ BLOCKED (Coin-toss risk, needs {Math.max(0, 15 - (t.picks || 0))} more picks)</span>
                        )}
                        {t.verdict === 'SKIP' && (
                          <span style={{ color: '#dc2626', fontWeight: 600 }}>⛔ BLOCKED (Negative edge or forfeited bets)</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Executed Copy Trades Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 className="flush">📜 Executed Copy Trades Ledger</h2>
            <span className="mut small">Live positions executed on Sui Testnet & logged to Walrus permanent memory</span>
          </div>
          <button className="btn2" onClick={fetchStatus} style={{ padding: '6px 14px', fontSize: 13 }}>
            🔄 Refresh
          </button>
        </div>

        <div className="scroll">
          <table className="t">
            <thead>
              <tr>
                <th>Matchup</th>
                <th>Tipster</th>
                <th>Pick</th>
                <th>Odds & Edge</th>
                <th>Kelly Stake</th>
                <th>Timeliness</th>
                <th>Proof Receipts</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="mut" style={{ textAlign: 'center', padding: 28 }}>
                    No copy-trades executed yet. Click <strong>"⚡ Run Audit & Copy Scan"</strong> to discover games and execute verified FOLLOW picks.
                  </td>
                </tr>
              ) : (
                trades.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.displayEvent}</strong><br/><span className="mut small">{t.category}</span></td>
                    <td><strong>{t.forecasterLabel}</strong><br/><span className="mut small">{t.forecaster.slice(0, 8)}…</span></td>
                    <td><strong>{t.side}</strong><br/><span className="mut small">{(t.forecastProb * 100).toFixed(0)}% forecast</span></td>
                    <td>{t.decimalOdds.toFixed(2)} odds<br/><span style={{ color: '#16a34a', fontWeight: 600 }} className="small">+{(t.edge * 100).toFixed(1)}% edge</span></td>
                    <td><strong style={{ fontSize: 15 }}>{t.stakeSui.toFixed(2)} SUI</strong><br/><span className="mut small">{t.stakePct}% bankroll</span></td>
                    <td><span className="small">{t.minsBeforeKickoff}m before start</span><br/><span className="mut small">Locked pre-game</span></td>
                    <td>
                      {t.explorerUrl && <a href={t.explorerUrl} target="_blank" rel="noreferrer" className="small">Sui: {t.txDigest.slice(0, 8)}…</a>}
                      {t.walrusBlobId && (
                        <>
                          <br/>
                          <a href={`https://walruscan.com/testnet/blob/${t.walrusBlobId}`} target="_blank" rel="noreferrer" className="small mut">
                            Walrus: {t.walrusBlobId.slice(0, 8)}…
                          </a>
                        </>
                      )}
                    </td>
                    <td>
                      <span className="b" style={{ background: t.status === 'ACTIVE' ? '#e0f2fe' : t.status === 'WON' ? '#dcfce7' : '#fee2e2', color: t.status === 'ACTIVE' ? '#0369a1' : t.status === 'WON' ? '#15803d' : '#b91c1c' }}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

