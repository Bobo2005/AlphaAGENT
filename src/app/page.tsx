'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import RefusalCard from '../components/RefusalCard';
import PickSlip from '../components/PickSlip';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0d14', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '48px 24px' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '16px' }}>
            TATUM × WALRUS TOTAL RECALL HACKATHON · TRACK 02
          </div>
          <h1 style={{ fontSize: '46px', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.15', margin: '0 auto 16px auto', maxWidth: '850px' }}>
            The Lie Detector for Sports Tipsters & Prediction "Gurus"
          </h1>
          <p style={{ fontSize: '18px', color: '#94a3b8', maxWidth: '720px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
            AlphaAgent stops fake prediction experts from scamming people. It verifies three simple rules: picks were locked on the blockchain before kickoff, no losing bets were deleted, and track records are proven over time—not just beginner's luck.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a
              href="/verify"
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Check All Bets (/verify)
            </a>
            <a
              href="/proof"
              style={{
                backgroundColor: '#111726',
                border: '1px solid #1e293b',
                color: '#f8fafc',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Test Memory Rebuild (/proof)
            </a>
            <a
              href="/luck-lab"
              style={{
                backgroundColor: '#111726',
                border: '1px solid #1e293b',
                color: '#38bdf8',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Test Luck Simulator
            </a>
          </div>
        </div>

        {/* The Headline Feature: Refusal Card & Pick Slip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '32px', marginBottom: '64px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '8px' }}>
              Rule 01: Stopping 5-0 Lucky Streaks
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
              "This tipster went 5-0. AlphaAgent said NO."
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              Ordinary websites celebrate lucky streaks and sell expensive subscriptions. AlphaAgent treats small streaks like a coin toss and refuses to recommend anyone without at least 15 verified games.
            </p>
            <RefusalCard />
          </div>

          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Rule 02: Locking Predictions Before Kickoff
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
              Lock Receipts on Sui Before Kickoff
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
              No deleting losing bets, no posting after the game started, no faking receipts. Test locking in a prediction below with 1 click:
            </p>
            <PickSlip />
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', borderTop: '1px solid #1e293b', paddingTop: '48px' }}>
          <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>1-Click Guest Mode</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
              Test everything in under 30 seconds. No crypto wallet to install, no passwords, no test coins needed.
            </p>
          </div>

          <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🧠</div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Permanent Walrus Memory</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
              A memory vault that never forgets. Even if our server crashes or gets deleted, AlphaAgent rebuilds its entire history with zero data lost.
            </p>
          </div>

          <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>💳</div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>1-Cent AI Micropayments</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
              Other AI bots can pay 1 cent on the blockchain to buy our verified audit reports without humans, forms, or monthly plans.
            </p>
          </div>

          <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '8px', padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>No Deleted Losses</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: '1.5' }}>
              Every bet you submit is counted. If a tipster tries to hide or delete a losing pick, it counts as an automatic 100% loss.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

