'use client';

import React, { useState } from 'react';
import { luckSimulator } from '../lib/luckSimulator';

export default function LuckLabSlider() {
  const [sampleSize, setSampleSize] = useState(5);
  const [winRate, setWinRate] = useState(1.0); // 100% (5-0)

  const scenario = luckSimulator.evaluateCustomScenario(sampleSize, winRate);

  return (
    <div style={{ backgroundColor: '#111726', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px', color: '#f8fafc' }}>
      <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#38bdf8' }}>
          🎲 Luck Lab: The Illusion of Skill Visualizer
        </h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          Adjust the sliders below to see why naive betting apps blindly follow lucky coin-flippers, while AlphaAgent refuses them.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Slider 1: Sample Size */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
            <span>Picks Completed (Total Games):</span>
            <span style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{sampleSize} picks</span>
          </div>
          <input
            type="range"
            min="3"
            max="40"
            value={sampleSize}
            onChange={(e) => setSampleSize(parseInt(e.target.value, 10))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            <span>3 (Beginner)</span>
            <span>15 (AlphaAgent Minimum)</span>
            <span>40 (Established)</span>
          </div>
        </div>

        {/* Slider 2: Win Rate */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
            <span>Reported Win Rate:</span>
            <span style={{ color: '#10b981', fontFamily: 'monospace' }}>{(winRate * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.50"
            max="1.00"
            step="0.05"
            value={winRate}
            onChange={(e) => setWinRate(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            <span>50% (Break-Even)</span>
            <span>70% (Great)</span>
            <span>100% (Hot Streak)</span>
          </div>
        </div>
      </div>

      {/* Comparison Verdict Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Naive Rule Card */}
        <div style={{ backgroundColor: '#0a0d14', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Naive Betting Trackers
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 'bold',
              color: scenario.naiveVerdict === 'FOLLOW' ? '#10b981' : '#ef4444',
            }}
          >
            [ {scenario.naiveVerdict} ]
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            Blindly gives FOLLOW whenever someone hits 70%+ win rate, falling for short coin-toss streaks every time.
          </p>
        </div>

        {/* AlphaAgent Card */}
        <div style={{ backgroundColor: '#0a0d14', border: '1px solid #1e293b', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
            AlphaAgent Reality Check
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 'bold',
              color:
                scenario.alphaAgentVerdict === 'FOLLOW'
                  ? '#10b981'
                  : scenario.alphaAgentVerdict === 'WATCH'
                  ? '#f59e0b'
                  : '#ef4444',
            }}
          >
            [ {scenario.alphaAgentVerdict} ]
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
            {scenario.explanation}
          </p>
        </div>
      </div>

      {/* Probability Box */}
      <div style={{ backgroundColor: '#182238', borderRadius: '8px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
        <span>Chance this winning record is pure coin-toss luck:</span>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: scenario.chanceOfZeroSkillMatchPct > 5 ? '#f59e0b' : '#10b981', fontFamily: 'monospace' }}>
          {scenario.chanceOfZeroSkillMatchPct}%
        </span>
      </div>
    </div>
  );
}

