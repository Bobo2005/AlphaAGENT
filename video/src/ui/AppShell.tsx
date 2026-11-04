import React from 'react';
import { Spinner } from './Interact';
import { APP_CSS } from './css';
import { EX } from '../timeline';
import { shortAddr } from '../anim';

export type Wallet = 'none' | 'loading' | 'guest';

const LINKS: [string, string][] = [
  ['/', 'Home'],
  ['/pick', 'Log pick'],
  ['/tipsters', 'Tipsters'],
  ['/check', 'Check a tipster'],
  ['/memory', 'Memory check'],
  ['/luck-lab', 'Luck Lab'],
  ['/copy-bot', '🤖 Copy Bot'],
  ['/profile', '👤 Profile'],
];

/** The live app's page chrome: nav, network note, main wrap (scrollable), overlays. */
export const AppShell: React.FC<{
  route: string;
  mobile: boolean;
  wallet: Wallet;
  scroll?: number;
  linkShift?: number;
  guestTap?: React.ReactNode;
  overlay?: React.ReactNode;
  children: React.ReactNode;
}> = ({ route, mobile, wallet, scroll = 0, linkShift, guestTap, overlay, children }) => {
  // On narrow screens the app's link row scrolls horizontally; keep the active link visible.
  const activeIdx = LINKS.findIndex(([h]) => h === route);
  const shift = linkShift ?? (mobile ? Math.max(0, activeIdx - 1) * 78 : 0);
  return (
    <div className={`aa${mobile ? ' m' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
      <style>{APP_CSS}</style>
      <nav className="nav">
        <div className="nav-brand-wrap">
          <span className="brand">AlphaAgent</span>
          <span className="nav-net-badge">Sui Testnet</span>
        </div>
        <div className="nav-links-wrap">
          <div className="nav-links" style={{ transform: `translateX(${-shift}px)` }}>
            {LINKS.map(([h, l]) => (
              <span key={h} className={h === route ? 'on' : ''}>
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="nav-wallet" data-a="wallet">
          {wallet === 'guest' ? (
            <>
              <span className="pill" style={{ borderColor: '#10b981', color: '#047857', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                <span className="mono" style={{ fontSize: mobile ? 11.5 : 12.5 }}>Guest: {shortAddr(EX.guestAddr)}</span>
                <span className="wallet-badge-note" style={{ fontSize: 12, color: 'var(--muted)' }}>(0.05 SUI)</span>
              </span>
              {!mobile && (
                <span className="pill" style={{ background: 'transparent', color: 'var(--accent)', fontWeight: 600 }}>
                  Connect Real Wallet
                </span>
              )}
              <span className="pill" style={{ background: '#fef2f2', color: '#991b1b', borderColor: '#fca5a5', fontWeight: 600 }}>
                Log out
              </span>
            </>
          ) : (
            <>
              <span className="pill" style={{ background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)', fontWeight: 600 }}>
                Connect Sui Wallet
              </span>
              <span className="pill" data-a="guestBtn">
                {wallet === 'loading' ? (
                  <>
                    <Spinner size={12} /> Provisioning…
                  </>
                ) : (
                  '⚡ Try as guest'
                )}
                {guestTap}
              </span>
            </>
          )}
        </div>
      </nav>
      <div style={{ position: 'relative', flex: '1 1 auto', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          <div className="note">Sui Testnet Live Gateway (Tatum RPC). Permanent memory vault live on Walrus.</div>
          <main className="wrap">{children}</main>
          <footer className="foot">Picks are stamped on Sui testnet. Memory is saved on Walrus Testnet.</footer>
        </div>
      </div>
      {overlay}
    </div>
  );
};

// Invisible copy of the nav to reserve its exact height (nav is sticky in the app).
const NavSpacer: React.FC<{ mobile: boolean; wallet: Wallet }> = ({ mobile, wallet }) => (
  <nav className="nav" style={{ boxShadow: 'none' }}>
    <div className="nav-brand-wrap">
      <span className="brand">AlphaAgent</span>
      <span className="nav-net-badge">Sui Testnet</span>
    </div>
    <div className="nav-links-wrap">
      <div className="nav-links">
        <span>Home</span>
      </div>
    </div>
    <div className="nav-wallet">
      {wallet === 'guest' ? (
        <>
          <span className="pill">
            <span className="mono" style={{ fontSize: mobile ? 11.5 : 12.5 }}>Guest: 0x8f2a…c41d</span>
          </span>
          <span className="pill">Log out</span>
        </>
      ) : (
        <span className="pill">Connect Sui Wallet</span>
      )}
    </div>
  </nav>
);

/** Toast exactly like the app's #followToast (bottom-right, slate). */
export const Toast: React.FC<{ show: number; children: React.ReactNode; mobile: boolean }> = ({ show, children, mobile }) => (
  <div
    style={{
      position: 'absolute',
      bottom: mobile ? 16 : 24,
      right: mobile ? 12 : 24,
      left: mobile ? 12 : undefined,
      background: '#0f172a',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: 8,
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
      zIndex: 30,
      fontSize: 14,
      border: '1px solid #334155',
      lineHeight: 1.4,
      opacity: show,
      transform: `translateY(${(1 - show) * 40}px)`,
    }}
  >
    {children}
  </div>
);
