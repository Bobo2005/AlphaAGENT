'use client';

import React, { useState } from 'react';

export default function Navbar() {
  const [judgeSession, setJudgeSession] = useState<{ address: string; balanceSui: string } | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);

  const handleLaunchJudgeMode = async () => {
    setIsProvisioning(true);
    try {
      const res = await fetch('/api/judge-mode', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setJudgeSession({
          address: data.address,
          balanceSui: data.balanceSui,
        });
      }
    } catch (err) {
      console.error('Judge Mode error', err);
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <nav style={{ backgroundColor: '#0a0d14', borderBottom: '1px solid #1e293b', padding: '14px 24px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.025em', color: '#f8fafc' }}>
              ALPHA<span style={{ color: '#38bdf8' }}>AGENT</span>
            </span>
            <span style={{ fontSize: '11px', backgroundColor: '#182238', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', border: '1px solid #1e293b', fontWeight: '600' }}>
              TRACK 02
            </span>
          </a>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px', fontWeight: '500' }}>
          <a href="/pick" style={{ color: '#94a3b8', textDecoration: 'none' }}>Make a Pick</a>
          <a href="/agent" style={{ color: '#94a3b8', textDecoration: 'none' }}>Forecasters</a>
          <a href="/verify" style={{ color: '#94a3b8', textDecoration: 'none' }}>Audit History</a>
          <a href="/proof" style={{ color: '#94a3b8', textDecoration: 'none' }}>Memory Vault</a>
          <a href="/luck-lab" style={{ color: '#94a3b8', textDecoration: 'none' }}>Luck Simulator</a>
        </div>

        {/* Protocol Beacons & Judge Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#10b981', fontFamily: 'monospace' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            Tatum Sui Testnet & Walrus
          </div>

          {judgeSession ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#111726', border: '1px solid #38bdf8', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontFamily: 'monospace' }}>
              <span style={{ color: '#38bdf8' }}>Guest Pass:</span>
              <span style={{ color: '#f8fafc' }}>{judgeSession.address.slice(0, 6)}...{judgeSession.address.slice(-4)}</span>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>({judgeSession.balanceSui} SUI Free Gas)</span>
            </div>
          ) : (
            <button
              onClick={handleLaunchJudgeMode}
              disabled={isProvisioning}
              style={{
                backgroundColor: '#38bdf8',
                color: '#0a0d14',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ⚡ {isProvisioning ? 'Provisioning...' : 'Test as Guest (1-Click)'}
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}

