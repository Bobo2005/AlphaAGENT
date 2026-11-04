'use client';

import React, { useState } from 'react';

export default function PickSlip() {
  const [side, setSide] = useState<'LAL' | 'GSW'>('LAL');
  const [probability, setProbability] = useState(0.65);
  const [isCommitting, setIsCommitting] = useState(false);
  const [receipt, setReceipt] = useState<{ digest: string; commitHash: string; explorerUrl: string } | null>(null);

  const marketProbLAL = 0.5513; // de-vigged from 1.75
  const marketProbGSW = 0.4487; // de-vigged from 2.15

  const handleCommit = async () => {
    setIsCommitting(true);
    try {
      const res = await fetch('/api/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: 'nba_lal_gsw',
          category: 'NBA',
          side,
          probability,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReceipt({
          digest: data.digest,
          commitHash: data.commitHash,
          explorerUrl: data.explorerUrl,
        });
      }
    } catch (err) {
      console.error('Commit failed:', err);
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', color: '#f8fafc' }}>
      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#f8fafc' }}>
          🏀 Log Pre-Kickoff Prediction Slip
        </h2>
        <div style={{ fontSize: '13px', color: '#94a3b8' }}>
          Event: <strong style={{ color: '#f8fafc' }}>Los Angeles Lakers vs. Golden State Warriors</strong> (NBA)
        </div>
      </div>

      {/* Team Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => setSide('LAL')}
          style={{
            padding: '14px',
            borderRadius: '8px',
            border: `2px solid ${side === 'LAL' ? '#38bdf8' : '#1e293b'}`,
            backgroundColor: side === 'LAL' ? '#182238' : '#0a0d14',
            color: '#f8fafc',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Lakers (LAL)</div>
          <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '4px' }}>Odds: 1.75 (Market: 55.1% chance)</div>
        </button>

        <button
          onClick={() => setSide('GSW')}
          style={{
            padding: '14px',
            borderRadius: '8px',
            border: `2px solid ${side === 'GSW' ? '#38bdf8' : '#1e293b'}`,
            backgroundColor: side === 'GSW' ? '#182238' : '#0a0d14',
            color: '#f8fafc',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Warriors (GSW)</div>
          <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '4px' }}>Odds: 2.15 (Market: 44.9% chance)</div>
        </button>
      </div>

      {/* Probability Slider */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
          <span style={{ color: '#94a3b8' }}>Your Forecast Probability:</span>
          <span style={{ fontWeight: 'bold', color: '#10b981', fontFamily: 'monospace', fontSize: '15px' }}>
            {(probability * 100).toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          min="0.10"
          max="0.95"
          step="0.05"
          value={probability}
          onChange={(e) => setProbability(parseFloat(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
          Market Odds: {side === 'LAL' ? '55.1%' : '44.9%'} fair chance | Your Expected Advantage:{' '}
          <strong style={{ color: probability > (side === 'LAL' ? marketProbLAL : marketProbGSW) ? '#10b981' : '#f59e0b' }}>
            {((probability - (side === 'LAL' ? marketProbLAL : marketProbGSW)) * 100).toFixed(1)}%
          </strong>
        </div>
      </div>

      {/* Commit Button */}
      <button
        onClick={handleCommit}
        disabled={isCommitting}
        style={{
          width: '100%',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '14px',
          fontWeight: '700',
          fontSize: '14px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {isCommitting ? 'Broadcasting to Sui Testnet...' : '🔒 Lock In Pick On Sui (No Time Travel)'}
      </button>

      {/* On-Chain Receipt */}
      {receipt && (
        <div style={{ marginTop: '20px', backgroundColor: '#0a0d14', border: '1px solid #10b981', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
            ✔ VERIFIED RECEIPT RECORDED BEFORE KICKOFF
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
            Blockchain Receipt ID:{' '}
            <a href={receipt.explorerUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontFamily: 'monospace' }}>
              {receipt.digest}
            </a>
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
            Cryptographic Seal: {receipt.commitHash}...
          </div>
        </div>
      )}
    </div>
  );
}

