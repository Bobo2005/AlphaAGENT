'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui';
import { coinFlipTail, oneIn } from '@/lib/luck';

export default function LuckLab() {
  const [n, setN] = useState(5);
  const [rate, setRate] = useState(100);
  const wins = Math.round((n * rate) / 100);
  const simple = n >= 5 && wins / n >= 0.7;
  const p = coinFlipTail(n, wins);
  return (
    <>
      <h1>Luck Lab</h1>
      <p className="mut lead">Illustration. Drag the sliders to see what record AlphaAgent needs before it trusts a tipster.</p>
      <div className="card" style={{ marginBottom: 16 }}>
        <label htmlFor="n"><strong>Picks made: {n}</strong></label>
        <input id="n" type="range" min={3} max={40} value={n} onChange={(e) => setN(Number(e.target.value))} />
        <label htmlFor="r"><strong>Share won: {rate}%</strong></label>
        <input id="r" type="range" min={50} max={100} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
      </div>
      <div className="row">
        <div className="card">
          <h2>Simple rule</h2>
          <p className="mut" style={{ marginTop: 0 }}>Follow anyone who wins 70% or more over 5+ picks.</p>
          {simple ? <Badge verdict="FOLLOW" /> : <span className="b n">Not followed</span>}
        </div>
        <div className="card">
          <h2>AlphaAgent</h2>
          <p className="mut" style={{ marginTop: 0 }}>Needs 15 verified picks and a luck check.</p>
          {n < 15 ? (<><Badge verdict="WATCH" /> <span className="small">Needs {15 - n} more verified picks.</span></>) : (
            <span className="small">Enough picks to grade. The verdict now depends on the market line. See Check a tipster.</span>
          )}
        </div>
      </div>
      <p className="mut stack">
        {wins} wins in {n} picks happens about 1 time in {oneIn(p).toLocaleString()} if every game is a coin flip. Real verdicts also weigh how hard each pick was against the market line.
      </p>
    </>
  );
}
