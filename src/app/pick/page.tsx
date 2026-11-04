'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import PickSlip from '../../components/PickSlip';

export default function PickPortalPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0d14', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '12px' }}>
            PRE-KICKOFF PREDICTIONS
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 10px 0' }}>
            Lock in a Prediction Before the Game Starts
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', margin: 0, maxWidth: '820px', lineHeight: '1.6' }}>
            AlphaAgent stops cheating by locking every prediction onto the blockchain before kickoff. Once locked, it is impossible to edit, delete, or fake your pick after the game starts.
          </p>
        </div>

        {/* Layout: Interactive Pick Slip on Left, Protocol Rules on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', alignItems: 'start' }}>
          
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Submit a Prediction
            </div>
            <PickSlip />
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px' }}>
              The 3 Anti-Cheating Rules
            </div>

            <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0', color: '#f8fafc' }}>
                1. No Time Travel: Must Lock Before Kickoff
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                Picks must be recorded on the blockchain at least 2 minutes before the game starts. Any pick submitted after kickoff is rejected automatically by the smart contract.
              </p>
            </div>

            <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0', color: '#f8fafc' }}>
                2. No Deleting Bad Bets (Forfeits)
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                If you lock in a pick and try to hide it later when your team is losing, your receipt remains on the blockchain forever. AlphaAgent counts any hidden pick as an automatic 100% loss.
              </p>
            </div>

            <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0', color: '#f8fafc' }}>
                3. Tough Picks Count More Than Easy Favorites
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                Picking a 50/50 toss-up correctly shows true skill. Picking a heavy favorite (-1000) barely gives you any points. AlphaAgent measures how tough your picks really were.
              </p>
            </div>

            <div style={{ backgroundColor: '#070a10', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>
                DIGITAL RECEIPT FORMULA
              </div>
              <pre style={{ margin: 0, fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', overflowX: 'auto' }}>
{`Digital Stamp = SHA256(
  Your Wallet Address + 
  Game Matchup + 
  Your Chosen Team + 
  Your Estimated Probability + 
  Secret Security Code
)`}
              </pre>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

