'use client';

import React, { useState, useEffect } from 'react';

interface AuditItem {
  commitTx: string;
  commitTs: number;
  eventId?: string;
  walrusBlobId?: string;
  category?: string;
  pick?: string;
  outcome?: 'win' | 'loss';
  state: string;
  bssContribution?: number;
  reason?: string;
}

interface ReconciliationReport {
  forecaster: string;
  totalCommitsOnSui: number;
  resolvedEpisodesCount: number;
  forfeitedCount: number;
  disputedCount: number;
  voidedCount: number;
  unaccountedCount: number;
  completenessRate: number;
  forfeitRate: number;
  isFullyReconciled: boolean;
  items: AuditItem[];
}

export default function VerifyPage() {
  const [address, setAddress] = useState('0x7b2f3491a98bc19da082');
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAudit = async (addr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit?forecaster=${encodeURIComponent(addr)}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
      }
    } catch (err) {
      console.error('Failed to load audit report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit(address);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0d14', color: '#f8fafc', padding: '32px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px', borderBottom: '1px solid #1e293b', paddingBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#f8fafc', marginBottom: '8px' }}>
            🔍 Check All Bets & Catch Deleted Losses
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Every prediction locked on the blockchain is matched against permanent records in Walrus Memory. If someone tried to hide or delete a losing bet, it shows up here as an automatic penalty.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Forecaster Sui Address (0x...)"
            style={{
              flex: 1,
              backgroundColor: '#111726',
              border: '1px solid #1e293b',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#f8fafc',
              fontFamily: 'monospace',
              fontSize: '14px',
            }}
          />
          <button
            onClick={() => fetchAudit(address)}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Auditing...' : 'Check History'}
          </button>
        </div>

        {report && (
          <>
            {/* Reconciliation KPI Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Locked on Blockchain</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#38bdf8', marginTop: '8px' }}>
                  {report.totalCommitsOnSui} bets
                </div>
              </div>

              <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Saved in Memory Vault</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#a855f7', marginTop: '8px' }}>
                  {report.resolvedEpisodesCount + report.forfeitedCount + report.disputedCount + report.voidedCount} records
                </div>
              </div>

              <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Record Honesty</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: report.completenessRate === 100 ? '#10b981' : '#f59e0b', marginTop: '8px' }}>
                  {report.completenessRate}%
                </div>
              </div>

              <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Hidden / Deleted Bets</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: report.forfeitRate <= 10 ? '#10b981' : '#ef4444', marginTop: '8px' }}>
                  {report.forfeitRate}% <span style={{ fontSize: '14px', color: '#94a3b8' }}>({report.forfeitedCount} deleted)</span>
                </div>
              </div>

              <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Audit Status</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: report.isFullyReconciled ? '#10b981' : '#ef4444', marginTop: '12px' }}>
                  {report.isFullyReconciled ? '✔ 100% COMPLETE' : '✖ DELETED BETS FOUND'}
                </div>
              </div>
            </div>

            {/* Reconciliation Table */}
            <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', fontWeight: '600' }}>
                Complete Bet History: Blockchain Receipts ↔ Memory Vault
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#182238', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>
                      <th style={{ padding: '12px 16px' }}>Blockchain Receipt (Sui)</th>
                      <th style={{ padding: '12px 16px' }}>Memory Record (Walrus)</th>
                      <th style={{ padding: '12px 16px' }}>Match & Pick</th>
                      <th style={{ padding: '12px 16px' }}>Result</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Skill Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>
                          <a
                            href={`https://testnet.suivision.xyz/txblock/${item.commitTx}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#38bdf8', textDecoration: 'none' }}
                          >
                            {item.commitTx.slice(0, 10)}...
                          </a>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#a855f7' }}>
                          {item.walrusBlobId || 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {item.eventId ? `${item.eventId} (${item.pick})` : item.reason || 'Unrevealed'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {item.outcome ? (
                            <span style={{ color: item.outcome === 'win' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                              {item.outcome.toUpperCase()}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor:
                                item.state === 'RESOLVED'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : item.state === 'FORFEITED'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(245, 158, 11, 0.15)',
                              color:
                                item.state === 'RESOLVED'
                                  ? '#10b981'
                                  : item.state === 'FORFEITED'
                                  ? '#ef4444'
                                  : '#f59e0b',
                            }}
                          >
                            {item.state}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>
                          {item.bssContribution !== undefined ? (
                            <span style={{ color: item.bssContribution >= 0 ? '#10b981' : '#ef4444' }}>
                              {item.bssContribution >= 0 ? `+${item.bssContribution}` : item.bssContribution}
                            </span>
                          ) : (
                            <span style={{ color: '#ef4444' }}>Penalty Applied</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

