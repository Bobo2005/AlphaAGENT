import type { ReactNode } from 'react';
import type { GateStatus, Verdict } from '@/lib/types';

const V = { FOLLOW: 'f', WATCH: 'w', SKIP: 's' } as const;
export const Badge = ({ verdict }: { verdict: Verdict }) => <span className={`b ${V[verdict]}`}>{verdict}</span>;

const G: Record<GateStatus, [string, string]> = {
  passed: ['Passed', 'n'], not_yet: ['Not yet', 'w'], failed: ['Failed', 's'], applied: ['Applied', 'n'],
};
export function GateBadge({ status }: { status: GateStatus }) {
  const [t, c] = G[status];
  return <span className={`b ${c}`}>{t}</span>;
}

export const SampleTag = () => null;

export const Stat = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="card"><p className="mut flush">{label}</p><p className="big">{value}</p></div>
);

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="scroll">
      <table className="t">
        <thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
