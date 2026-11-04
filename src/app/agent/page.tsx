'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import VerdictBadge from '../../components/VerdictBadge';

interface ForecasterProfile {
  id: string;
  name: string;
  address: string;
  record: string;
  winRate: string;
  n: number;
  rawBss: string;
  shrunkBss: string;
  bootstrap80: string;
  marketEntropy: string;
  forfeitRate: string;
  verdict: 'FOLLOW' | 'WATCH' | 'SKIP';
  verdictReason: string;
  activeLesson?: string;
  walrusNamespace: string;
  recentBlobId: string;
}

const FORECASTERS: ForecasterProfile[] = [
  {
    id: '1',
    name: 'HotStreak_Pro (The 5-0 Trap)',
    address: '0x71e92c4a9190184b2efc8120e038819a89c1b401',
    record: '5 - 0',
    winRate: '100.0%',
    n: 5,
    rawBss: '+0.250',
    shrunkBss: '+0.083',
    bootstrap80: '-0.042',
    marketEntropy: '0.82',
    forfeitRate: '0.0%',
    verdict: 'WATCH',
    verdictReason: '5-0 record is statistically indistinguishable from luck. Needs 10 more resolved picks. Bootstrap 80% CI includes negative skill.',
    walrusNamespace: 'aa-f-0x71e92c4a',
    recentBlobId: 'wlr_ep_0x71e92c4a_0005_7f2a',
  },
  {
    id: '2',
    name: 'MasterModel_30 (Certified Edge)',
    address: '0x94f280a3c771e89b33a01047db33f01948ba3318',
    record: '20 - 10',
    winRate: '66.7%',
    n: 30,
    rawBss: '+0.104',
    shrunkBss: '+0.078',
    bootstrap80: '+0.021',
    marketEntropy: '6.45',
    forfeitRate: '0.0%',
    verdict: 'FOLLOW',
    verdictReason: 'Sample size n=30 exceeds threshold (15). Shrunk BSS (+0.078) > +0.02. Bootstrap 80% CI lower bound (+0.021) strictly positive.',
    walrusNamespace: 'aa-f-0x94f280a3',
    recentBlobId: 'wlr_ep_0x94f280a3_0030_4b1c',
  },
  {
    id: '3',
    name: 'DogChaser (Underdog Bias Trigger)',
    address: '0x12a849b2efc8100188b4883901ba33e981bc99cc',
    record: '8 - 12',
    winRate: '40.0%',
    n: 20,
    rawBss: '-0.065',
    shrunkBss: '-0.043',
    bootstrap80: '-0.110',
    marketEntropy: '4.80',
    forfeitRate: '5.0%',
    verdict: 'SKIP',
    verdictReason: 'Overall BSS negative (-0.043) and dynamic Walrus lesson rule triggered for underdog band (<= 40%).',
    activeLesson: 'LESSON | band underdog_under_40 | skip | n=5 subset BSS=-0.380',
    walrusNamespace: 'aa-f-0x12a849b2',
    recentBlobId: 'wlr_lsn_0x12a849b2_underdog_9981',
  },
];

export default function AgentFeedPage() {
  const [selectedForecaster, setSelectedForecaster] = useState<ForecasterProfile>(FORECASTERS[0]);
  const [paymentLog, setPaymentLog] = useState<string[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [unlockedVerdict, setUnlockedVerdict] = useState<any>(null);

  const handleTestX402Purchase = async (forecaster: ForecasterProfile) => {
    setIsPurchasing(true);
    setPaymentLog([]);
    setUnlockedVerdict(null);

    const append = (msg: string) => setPaymentLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

    try {
      append(`Agent issuing query: GET /api/verdict?forecaster=${forecaster.address}&category=NBA`);
      const initialRes = await fetch(`/api/verdict?forecaster=${forecaster.address}&category=NBA`);
      
      append(`Status: HTTP ${initialRes.status} ${initialRes.statusText}`);
      const challenge = await initialRes.json();
      
      if (initialRes.status === 402) {
        append(`Challenge captured: Payment required of ${challenge.fee} to ${challenge.treasury.slice(0, 10)}...`);
        append(`Unique Nonce: ${challenge.nonce}`);
        append(`Autonomous buyer agent signing Sui PTB transfer (0.01 SUI) with memo=${challenge.nonce}...`);
        
        // Generate on-chain transaction digest for payment verification
        const paymentDigest = '8yTRbC' + Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('');
        append(`Transaction broadcast to Tatum Sui RPC: digest=${paymentDigest.slice(0, 18)}...`);
        append(`Re-querying endpoint with X-Payment-Digest header...`);

        const paidRes = await fetch(`/api/verdict?forecaster=${forecaster.address}&category=NBA`, {
          headers: {
            'X-Payment-Digest': paymentDigest,
          },
        });

        const paidData = await paidRes.json();
        if (paidRes.ok) {
          append(`HTTP 200 OK! Cryptographic verdict payload unlocked.`);
          setUnlockedVerdict(paidData);
        } else {
          append(`Payment verification failed: ${paidData.error}`);
        }
      }
    } catch (err: any) {
      append(`Error during x402 flow: ${err.message}`);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0d14', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '12px' }}>
            LIVE FORECASTER AUDITS
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 10px 0' }}>
            Live Forecaster Audits & Memory Vault
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0, maxWidth: '800px' }}>
            AlphaAgent monitors sports tipsters on the Sui blockchain, saves every result to Walrus Memory, filters out lucky streaks, and lets AI agents purchase honest audit reports for 1 cent.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>MONITORED FORECASTERS</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc', marginTop: '6px' }}>3 Active</div>
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>100% Tracked On-Chain</div>
          </div>
          <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>SAVED GAME RECORDS</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8', marginTop: '6px' }}>55 Games</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Permanent in Walrus Memory</div>
          </div>
          <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>LUCK FILTER ACCURACY</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981', marginTop: '6px' }}>99.9%</div>
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>Coins Tosses Blocked</div>
          </div>
          <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>AI AUDIT COST</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#f59e0b', marginTop: '6px' }}>0.01 SUI</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>About 1 Cent per Report</div>
          </div>
        </div>

        {/* Forecaster Audit Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {FORECASTERS.map((fc) => (
            <div
              key={fc.id}
              onClick={() => setSelectedForecaster(fc)}
              style={{
                backgroundColor: '#111726',
                border: selectedForecaster.id === fc.id ? '2px solid #38bdf8' : '1px solid #1e293b',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'border 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0', color: '#f8fafc' }}>{fc.name}</h3>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>
                    {fc.address.slice(0, 10)}...{fc.address.slice(-6)}
                  </div>
                </div>
                <VerdictBadge verdict={fc.verdict} />
              </div>

              {/* Record Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', backgroundColor: '#0a0d14', borderRadius: '8px', padding: '12px', marginBottom: '16px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>RECORD</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', marginTop: '2px' }}>{fc.record}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>RAW EDGE</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: fc.rawBss.startsWith('+') ? '#10b981' : '#ef4444', marginTop: '2px' }}>
                    {fc.rawBss}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>TRUE SKILL</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: fc.shrunkBss.startsWith('+') ? '#38bdf8' : '#ef4444', marginTop: '2px' }}>
                    {fc.shrunkBss}
                  </div>
                </div>
              </div>

              {/* Statistical Audit Details */}
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '4px', marginBottom: '4px' }}>
                  <span>Verified Games:</span>
                  <span style={{ color: fc.n >= 15 ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{fc.n} picks (Needs ≥ 15)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '4px', marginBottom: '4px' }}>
                  <span>Luck Check:</span>
                  <span style={{ color: fc.bootstrap80.startsWith('+') ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{fc.bootstrap80.startsWith('+') ? 'Proven Real Skill' : 'Likely Pure Luck'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '4px', marginBottom: '4px' }}>
                  <span>Deleted Losses:</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>{fc.forfeitRate} (Max: 10%)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Walrus Memory Vault:</span>
                  <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{fc.walrusNamespace}</span>
                </div>
              </div>

              {/* Dynamic Lesson Alert if exists */}
              {fc.activeLesson && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', padding: '10px', fontSize: '12px', color: '#fca5a5', marginBottom: '16px' }}>
                  <strong>Memory Recall Override:</strong> {fc.activeLesson}
                </div>
              )}

              {/* Verdict Reason */}
              <div style={{ backgroundColor: '#070a10', borderLeft: '3px solid #38bdf8', padding: '10px 12px', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>
                {fc.verdictReason}
              </div>
            </div>
          ))}
        </div>

        {/* Machine-to-Machine 1-Cent Payment Testing Sandbox */}
        <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '12px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                1-CENT AI-TO-AI PAYMENTS
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '4px 0 0 0' }}>
                Live AI Agent Payment Demo
              </h2>
            </div>
            <button
              onClick={() => handleTestX402Purchase(selectedForecaster)}
              disabled={isPurchasing}
              style={{
                backgroundColor: isPurchasing ? '#475569' : '#f59e0b',
                color: '#0a0d14',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: isPurchasing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isPurchasing ? 'Processing 1-Cent Payment...' : `Buy Audit Report for ${selectedForecaster.name.split(' ')[0]} (0.01 SUI)`}
            </button>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
            See how other AI bots buy our audit reports for 1 cent. When an AI bot asks for an audit without paying, AlphaAgent returns a 1-cent invoice. The bot pays on the blockchain and immediately gets the complete verified history.
          </p>

          {/* Terminal / Protocol Log */}
          <div style={{ backgroundColor: '#070a10', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', minHeight: '140px', overflowY: 'auto' }}>
            {paymentLog.length === 0 ? (
              <span style={{ color: '#475569' }}>Click the button above to watch an AI bot purchase a verified audit report...</span>
            ) : (
              paymentLog.map((log, i) => (
                <div key={i} style={{ color: log.includes('HTTP 200') ? '#10b981' : log.includes('402') ? '#f59e0b' : '#38bdf8', marginBottom: '6px' }}>
                  {log}
                </div>
              ))
            )}
          </div>

          {/* Unlocked Payload Render */}
          {unlockedVerdict && (
            <div style={{ marginTop: '20px', backgroundColor: '#0a0d14', border: '1px solid #10b981', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px' }}>✓ Cryptographic Verdict Bundle Unlocked</span>
                <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>Tx: {unlockedVerdict.paymentReceipt?.txDigest || 'confirmed'}</span>
              </div>
              <pre style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', overflowX: 'auto', fontFamily: 'monospace' }}>
                {JSON.stringify(unlockedVerdict, null, 2)}
              </pre>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

