'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGuest } from './GuestContext';
import { short } from '@/lib/format';

const LINKS = [
  ['/', 'Home'],
  ['/pick', 'Log pick'],
  ['/tipsters', 'Tipsters'],
  ['/check', 'Check a tipster'],
  ['/memory', 'Memory check'],
  ['/luck-lab', 'Luck Lab'],
  ['/copy-bot', '🤖 Copy Bot'],
  ['/profile', '👤 Profile'],
] as const;

export default function Nav() {
  const path = usePathname();
  const {
    address,
    isExtension,
    balanceSui,
    isModalOpen,
    setIsModalOpen,
    connectExtension,
    connectManual,
    connectGuest,
    disconnect,
  } = useGuest();

  const [walletError, setWalletError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [manualAddr, setManualAddr] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleConnectExtension = async () => {
    setWalletError(null);
    setIsConnecting(true);
    try {
      const result = await connectExtension();
      if (!result.success) {
        setWalletError(result.error || 'No Sui wallet found. Please install Sui Wallet from Chrome Web Store.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGuest = async () => {
    setIsGuestLoading(true);
    try {
      await connectGuest();
    } finally {
      setIsGuestLoading(false);
    }
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <nav className="nav" aria-label="Main">
        <div className="nav-brand-wrap">
          <Link href="/" className="brand">AlphaAgent</Link>
          <span className="nav-net-badge">Sui Testnet</span>
        </div>

        <div className="nav-links-wrap">
          <div className="nav-links">
            {LINKS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={path === href ? 'on' : ''}
                aria-current={path === href ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="nav-wallet">
          {address ? (
            <>
              <button
                type="button"
                className="pill"
                onClick={() => setIsModalOpen(true)}
                title="Click to view wallet details"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: isExtension ? '#16a34a' : '#f59e0b',
                  }}
                />
                <span>{isExtension ? 'Wallet: ' : 'Guest: '}{short(address)}</span>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>({balanceSui})</span>
              </button>

              <button
                type="button"
                className="pill"
                onClick={disconnect}
                title="Log out and disconnect wallet"
                style={{
                  cursor: 'pointer',
                  background: '#fef2f2',
                  color: '#991b1b',
                  borderColor: '#fca5a5',
                  fontWeight: 600,
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <button
              type="button"
              className="pill"
              onClick={() => {
                setWalletError(null);
                setIsModalOpen(true);
              }}
              style={{
                cursor: 'pointer',
                background: 'var(--accent)',
                color: '#ffffff',
                border: '1px solid var(--accent)',
                fontWeight: 600,
              }}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </nav>

      {/* Wallet Management Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            className="modal-card"
            style={{
              background: 'var(--bg)',
              color: 'var(--ink)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--line)',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              maxHeight: 'calc(100dvh - 32px)',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '19px' }}>
                {address ? 'Wallet Account' : 'Connect to Sui'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                }}
              >
                ✕
              </button>
            </div>

            {address ? (
              <div>
                <div style={{ background: 'var(--panel)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>
                    Connected as {isExtension ? 'Sui Wallet Extension' : '1-Click Testnet Guest'}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-all', marginBottom: '8px' }}>
                    {address}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Link
                      href={`/profile?address=${address}`}
                      onClick={() => setIsModalOpen(false)}
                      className="btn"
                      style={{ padding: '6px 12px', fontSize: '13px', textDecoration: 'none' }}
                    >
                      👤 View Profile
                    </Link>
                    <button
                      type="button"
                      className="btn2"
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={handleCopy}
                    >
                      {copied ? '✓ Copied' : 'Copy Address'}
                    </button>
                    <a
                      href={`https://testnet.suivision.xyz/account/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn2"
                      style={{ padding: '6px 12px', fontSize: '13px', textDecoration: 'none' }}
                    >
                      View on SuiVision ↗
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: '14px' }}>
                  <span style={{ color: 'var(--muted)' }}>Network</span>
                  <strong>Sui Testnet</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: '14px', marginBottom: '20px' }}>
                  <span style={{ color: 'var(--muted)' }}>Balance</span>
                  <strong>{balanceSui}</strong>
                </div>

                {!isExtension && (
                  <button
                    type="button"
                    className="btn"
                    onClick={handleConnectExtension}
                    style={{ width: '100%', marginBottom: '10px' }}
                  >
                    Switch to Sui Wallet Extension
                  </button>
                )}

                <button
                  type="button"
                  className="btn"
                  onClick={disconnect}
                  style={{ width: '100%', background: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
                >
                  Log out & Disconnect
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: 0, marginBottom: '16px' }}>
                  Connect your Sui wallet to lock picks on Sui Testnet before kickoff.
                </p>

                {walletError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '14px' }}>
                    {walletError}
                    <div style={{ marginTop: '6px' }}>
                      <a href="https://chromewebstore.google.com/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                        Install Sui Wallet extension ↗
                      </a>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn"
                    disabled={isConnecting}
                    onClick={handleConnectExtension}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', opacity: isConnecting ? 0.85 : 1 }}
                  >
                    <span>
                      {isConnecting ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #ffffff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Connecting to extension…
                        </span>
                      ) : (
                        'Connect Sui Browser Wallet'
                      )}
                    </span>
                    <span style={{ fontSize: '13px', opacity: 0.85 }}>{isConnecting ? 'Opening popup…' : 'Suiet / Martian / Sui'}</span>
                  </button>

                  <div style={{ padding: '14px', background: 'var(--panel)', borderRadius: 'var(--radius-sm)' }}>
                    <label htmlFor="manualSuiInput" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>
                      PASTE YOUR REAL SUI ADDRESS
                    </label>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--muted)' }}>
                      Use your own address to log picks under your real on-chain track record.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        id="manualSuiInput"
                        type="text"
                        placeholder="0x..."
                        value={manualAddr}
                        onChange={(e) => setManualAddr(e.target.value)}
                        style={{ flex: 1, padding: '8px 10px', fontFamily: 'monospace', fontSize: '13px', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius-sm)' }}
                      />
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          if (manualAddr.startsWith('0x') && manualAddr.length >= 10) {
                            connectManual(manualAddr);
                            setManualAddr('');
                          } else {
                            setWalletError('Please enter a valid Sui address starting with 0x (e.g. 0x...)');
                          }
                        }}
                        style={{ padding: '8px 14px', fontSize: '13px' }}
                      >
                        Connect
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn2"
                    disabled={isGuestLoading}
                    onClick={handleGuest}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', opacity: isGuestLoading ? 0.85 : 1 }}
                  >
                    <span>
                      {isGuestLoading ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Provisioning sandbox…
                        </span>
                      ) : (
                        '1-Click Funded Guest Session'
                      )}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Instant (0.05 SUI)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
