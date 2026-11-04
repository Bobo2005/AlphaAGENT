'use client';
import { useEffect, useState } from 'react';
import { Stat, Table } from '@/components/ui';
import { getMemoryStats, rebuildFromMemory } from '@/lib/api';
import type { RebuildStep } from '@/lib/types';

const S = { done: ['Done', 'n'], running: ['Running', 'w'], failed: ['Failed', 's'] } as const;

export default function Memory() {
  const [stats, setStats] = useState<{ memories: number; tipsters: number } | null>(null);
  const [steps, setSteps] = useState<RebuildStep[]>([]);
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<'identical' | 'mismatch' | null>(null);

  useEffect(() => { getMemoryStats().then(setStats).catch(() => setStats(null)); }, []);

  async function run() {
    setRunning(true); setSteps([]); setOutcome(null);
    try {
      const r = await rebuildFromMemory((s) => setSteps((p) => [...p, s]));
      setOutcome(r.identical ? 'identical' : 'mismatch');
    } catch {
      setSteps((p) => [...p, { label: 'Rebuild', result: 'Couldn’t reach memory. Try again.', status: 'failed' }]);
    }
    setRunning(false);
  }

  return (
    <>
      <h1>Memory check</h1>
      <p className="mut lead">Everything AlphaAgent knows is saved in permanent memory on Walrus. To prove it, erase the local copy and rebuild from memory.</p>
      <div className="row" style={{ marginBottom: 20 }}>
        <Stat label="Memories on Walrus Testnet" value={stats ? stats.memories : '…'} />
        <Stat label="Tipsters in registry" value={stats ? stats.tipsters : '…'} />
        <Stat label="Last rebuild" value={outcome === 'identical' ? 'Identical verdicts' : outcome === 'mismatch' ? 'Mismatch found' : 'Not run yet'} />
      </div>
      <button type="button" className="btn2" onClick={run} disabled={running} style={{ marginBottom: 20 }}>
        {running ? 'Rebuilding…' : 'Erase local copy and rebuild'}
      </button>
      <div className="card">
        <h2>Rebuild log</h2>
        {steps.length === 0 ? <p className="mut">Nothing yet. Run a rebuild to see each step.</p> : (
          <Table head={['Step', 'What happened', 'Result', 'Status']}>
            {steps.map((s, i) => (
              <tr key={i}><td>{i + 1}</td><td>{s.label}</td><td>{s.result}</td><td><span className={`b ${S[s.status][1]}`}>{S[s.status][0]}</span></td></tr>
            ))}
          </Table>
        )}
      </div>
    </>
  );
}
