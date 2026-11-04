import React from 'react';

export type VerdictType = 'FOLLOW' | 'WATCH' | 'SKIP';

interface Props {
  verdict: VerdictType;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerdictBadge({ verdict, size = 'md' }: Props) {
  const styles: Record<VerdictType, { bg: string; color: string; border: string; label: string }> = {
    FOLLOW: {
      bg: 'rgba(16, 185, 129, 0.12)',
      color: '#10b981',
      border: 'rgba(16, 185, 129, 0.35)',
      label: 'FOLLOW (VERIFIED ALPHA)',
    },
    WATCH: {
      bg: 'rgba(245, 158, 11, 0.12)',
      color: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.35)',
      label: 'WATCH (INSUFFICIENT DEPTH)',
    },
    SKIP: {
      bg: 'rgba(239, 68, 68, 0.12)',
      color: '#ef4444',
      border: 'rgba(239, 68, 68, 0.35)',
      label: 'SKIP (FRAUD / NEGATIVE EDGE)',
    },
  };

  const current = styles[verdict] || styles.WATCH;
  const padding = size === 'sm' ? '3px 8px' : size === 'lg' ? '8px 18px' : '5px 12px';
  const fontSize = size === 'sm' ? '11px' : size === 'lg' ? '16px' : '13px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding,
        fontSize,
        fontWeight: '700',
        letterSpacing: '0.04em',
        borderRadius: '6px',
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        fontFamily: 'monospace',
      }}
    >
      [ {current.label} ]
    </span>
  );
}

