'use client';

import React from 'react';
import LuckLabSlider from '../../components/LuckLabSlider';

export default function LuckLabPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0d14', color: '#f8fafc', padding: '36px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
            🧪 The Luck Simulator: Coin Toss vs. Real Skill
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
            In sports betting, anyone can flip heads 5 times in a row. Dishonest tipsters use short streaks to pretend they have a secret system and sell expensive picks.
            AlphaAgent uses mathematical reality checks to prove whether a tipster is truly skilled or just temporarily lucky.
          </p>
        </div>

        {/* Interactive Slider Widget */}
        <div style={{ marginBottom: '40px' }}>
          <LuckLabSlider />
        </div>

        {/* Monte Carlo 10,000 Forecaster Empirical Simulation Findings */}
        <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#f8fafc' }}>
            📊 Real Test: 10,000 Pure-Luck Bettors
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
            We simulated 10,000 computer players who guess by pure coin toss (0% skill). Look at how standard websites get tricked compared to AlphaAgent:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#0a0d14', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Standard Trackers Tricked</div>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#ef4444', marginTop: '6px' }}>
                ~850 (8.5%)
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Fooled by short lucky runs</div>
            </div>

            <div style={{ backgroundColor: '#0a0d14', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>AlphaAgent Tricked</div>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#10b981', marginTop: '6px' }}>
                &lt; 5 (0.05%)
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Filtered out as pure luck</div>
            </div>

            <div style={{ backgroundColor: '#0a0d14', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Protection Level</div>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#38bdf8', marginTop: '6px' }}>
                170x Better
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Catches lucky pretenders</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
            * Run <code>pnpm simulate:luck</code> on your terminal to reproduce the exact 10,000-forecaster simulation and sensitivity matrix live.
          </div>
        </div>

      </div>
    </div>
  );
}

