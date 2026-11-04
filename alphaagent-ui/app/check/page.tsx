'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge, GateBadge, SampleTag, Stat, Table } from '@/components/ui';
import { getReport } from '@/lib/api';
import { formatSkill } from '@/lib/format';
import type { TipsterReport } from '@/lib/types';

type State = 'idle' | 'loading' | 'found' | 'missing' | 'error';

function Inner() {
  const router = useRouter();
  const address = useSearchParams().get('address') ?? '';
  const [input, setInput] = useState(address);
  const [state, setState] = useState<State>('idle');
  const [report, setReport] = useState<TipsterReport | null>(null);

  useEffect(() => {
    setInput(address);
    if (!address) { setState('idle'); setReport(null); return; }
    let live = true;
    setState('loading');
    getReport(address)
      .then((r) => { if (!live) return; setReport(r); setState(r ? 'found' : 'missing'); })
      .catch(() => { if (live) setState('error'); });
    return () => { live = false; };
  }, [address]);

  const go = (a: string) => router.push(`/check?address=${encodeURIComponent(a.trim())}`);
  const mismatch = report && report.lockedOnSui !== report.savedInMemory + report.hiddenBets;

  return (
    <>
      <h1>Check a tipster</h1>
      <form className="search" onSubmit={(e) => { e.preventDefault(); go(input); }}>
        <label htmlFor="addr" className="sr">Sui address</label>
        <input id="addr" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste a Sui address" />
        <button className="btn" type="submit">Check</button>
      </form>
      <p className="mut small">
        Enter any Sui address to audit its immutable on-chain record and Walrus permanent memory.
      </p>

      {state === 'idle' && <p className="mut">Paste an address to see its verdict.</p>}
      {state === 'loading' && <p className="mut" role="status">Checking the record…</p>}
      {state === 'missing' && <p role="status">No record found for that address. Check it and try again.</p>}
      {state === 'error' && <p role="alert">Couldn’t reach Sui or memory. <button type="button" className="link" onClick={() => go(address)}>Retry</button></p>}

      {state === 'found' && report && (
        <>
          <div className="card" style={{ margin: '16px 0' }}>
            <h2 style={{ fontSize: 24 }}>{report.label ?? report.address} <Badge verdict={report.verdict} /></h2>
            <p className="mut flush">{report.reason}.</p>
          </div>
          {mismatch && <p className="warn" role="alert">Locked picks and saved picks don’t add up. Some picks may still be pending.</p>}
          <div className="row">
            <Stat label="Locked on Sui" value={report.lockedOnSui} />
            <Stat label="Saved in memory" value={report.savedInMemory} />
            <Stat label="Hidden bets" value={report.hiddenBets} />
            <Stat label="Skill grade" value={formatSkill(report)} />
          </div>
          <h2 className="stack">Why this verdict</h2>
          <div className="card">
            <Table head={['Check', 'Result', 'Status']}>
              {report.gates.map((g) => (<tr key={g.id}><td>{g.label}</td><td>{g.detail}</td><td><GateBadge status={g.status} /></td></tr>))}
            </Table>
          </div>
          <h2 className="stack">Picks</h2>
          <div className="card">
            {report.recentPicks.length === 0 ? <p className="mut">No picks yet. Log your first pick.</p> : (
              <Table head={['Game', 'Pick', 'Market', 'Result']}>
                {report.recentPicks.map((p) => (
                  <tr key={p.game}><td>{p.game}</td><td>{p.side} {p.yourChancePct}%</td><td>Market {p.marketChancePct}%</td><td>{p.result}</td></tr>
                ))}
              </Table>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default function CheckPage() {
  return <Suspense fallback={<p className="mut">Loading…</p>}><Inner /></Suspense>;
}
