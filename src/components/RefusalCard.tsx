import React from 'react';
import VerdictBadge from './VerdictBadge';

export default function RefusalCard() {
  return (
    <div
      style={{
        backgroundColor: '#111726',
        border: '1px solid #1e293b',
        borderRadius: '12px',
        padding: '24px',
        color: '#f8fafc',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'monospace' }}>
            Forecaster Profile: 0x9a8f...4e1b (Social Tipster)
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            Reported Track Record: <span style={{ color: '#10b981' }}>5-0 (100% Win Rate)</span>
          </div>
        </div>
        <VerdictBadge verdict="WATCH" size="md" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#0a0d14', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>✖ TOO FEW GAMES</div>
          <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>Only 5 Games Played</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Rule: Needs at least 15 verified games</div>
        </div>

        <div style={{ backgroundColor: '#0a0d14', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>✖ LUCK WARNING</div>
          <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>Coin-Toss Level Luck</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Anyone can flip Heads 5 times in a row</div>
        </div>

        <div style={{ backgroundColor: '#0a0d14', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '6px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>✔ HONEST RECORD</div>
          <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>Zero Deleted Bets</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>All picks were locked in publicly</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#182238', borderRadius: '8px', padding: '14px 18px', borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '4px' }}>
          Why AlphaAgent Refuses to Follow:
        </div>
        <p style={{ fontSize: '13px', color: '#e2e8f0', margin: 0, lineHeight: '1.5' }}>
          "Most websites see a 5-0 streak and tell you to buy their VIP picks. AlphaAgent says <strong>NO</strong>: if 32 people flip a coin 5 times, someone is guaranteed to get 5 heads in a row. That's just beginner's luck. This tipster needs 10 more verified games before anyone risks real money."
        </p>
      </div>
    </div>
  );
}

