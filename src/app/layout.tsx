import React from 'react';

export const metadata = {
  title: 'AlphaAgent · Autonomous Risk-Auditing Agent for Predictive Systems',
  description: 'Auditing predictive track records using Sui Testnet commit-reveal receipts, Walrus Memory as system of record, and x402 micropayments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#0a0d14',
          color: '#f8fafc',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flex: '1 0 auto' }}>
          {children}
        </div>
        <footer
          style={{
            flexShrink: 0,
            borderTop: '1px solid #1e293b',
            backgroundColor: '#070a10',
            padding: '24px',
            fontSize: '13px',
            color: '#64748b',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <strong style={{ color: '#94a3b8' }}>AlphaAgent</strong> · Tatum × Walrus Total Recall Hackathon · Track 02: Smart Agents for Real Life
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="/verify" style={{ color: '#64748b', textDecoration: 'none' }}>Completeness Audit</a>
              <a href="/proof" style={{ color: '#64748b', textDecoration: 'none' }}>Wipe & Rebuild</a>
              <a href="/luck-lab" style={{ color: '#64748b', textDecoration: 'none' }}>Luck Simulator</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>Source Code</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

