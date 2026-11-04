'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useGuest } from '../../components/GuestContext';
import { short } from '@/lib/format';

interface UserPick {
  id?: string;
  matchId?: string;
  matchName?: string;
  category?: string;
  pick?: string;
  pickSelection?: string;
  pickProb?: number;
  marketOdds?: string;
  timestamp?: number;
  suiObjectId?: string;
  digest?: string;
  walrusBlobId?: string;
  status?: string;
  outcome?: string;
}

interface ProfileStats {
  totalCommits: number;
  resolvedCount: number;
  wonCount: number;
  lostCount: number;
  pendingCount: number;
  voidCount: number;
  winRatePct: number;
  forfeitedCount: number;
  forfeitRatePct: number;
  shrunkBssPct: string;
  verdict: 'FOLLOW' | 'WATCH' | 'SKIP' | 'UNRATED';
  verdictReason: string;
  explorerUrl: string;
  suiVisionUrl: string;
}

interface UserProfile {
  address: string;
  displayName: string;
  bio: string;
  avatar: string;
  socialTwitter: string;
  preferredSports: string[];
  riskTolerance: string;
  defaultStakeSui: number;
  joinedAt: number;
  stats: ProfileStats;
  picks: UserPick[];
}

const AVATAR_OPTIONS = ['⚡', '🎯', '🔥', '🏆', '🦁', '🦅', '👑', '💎', '🎲', '📈', '🚀', '🍀'];

function ProfileContent() {
  const searchParams = useSearchParams();
  const { address: connectedAddress, setIsModalOpen, connectGuest } = useGuest();

  const [activeTab, setActiveTab] = useState<'predictions' | 'followed' | 'settings'>('predictions');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; isError: boolean } | null>(null);
  const [searchAddr, setSearchAddr] = useState('');

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('⚡');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [sports, setSports] = useState<string[]>(['EPL', 'NBA', 'NFL']);
  const [riskTolerance, setRiskTolerance] = useState('balanced');
  const [defaultStake, setDefaultStake] = useState('2.0');
  const [saving, setSaving] = useState(false);

  // Followed tipsters
  const [followedList, setFollowedList] = useState<string[]>([]);

  const targetAddress = (searchParams?.get('address') || connectedAddress || '').trim().toLowerCase();

  const showToast = (msg: string, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchProfile = async (addr: string) => {
    if (!addr || !addr.startsWith('0x')) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/profile?address=${encodeURIComponent(addr)}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        // Sync form states
        setDisplayName(data.profile.displayName || '');
        setBio(data.profile.bio || '');
        setAvatar(data.profile.avatar || '⚡');
        setSocialTwitter(data.profile.socialTwitter || '');
        setSports(data.profile.preferredSports || ['EPL', 'NBA', 'NFL']);
        setRiskTolerance(data.profile.riskTolerance || 'balanced');
        setDefaultStake(String(data.profile.defaultStakeSui || 2.0));
      } else {
        setError(data.error || 'Failed to retrieve profile');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetAddress) {
      fetchProfile(targetAddress);
    } else {
      setLoading(false);
    }
  }, [targetAddress]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('alpha_followed_tipsters') || '[]');
      setFollowedList(stored);
    } catch {}
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAddress) return;
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: targetAddress,
          displayName,
          bio,
          avatar,
          socialTwitter,
          preferredSports: sports,
          riskTolerance,
          defaultStakeSui: parseFloat(defaultStake) || 2.0,
        }),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        showToast('✅ Profile saved and linked permanently to your wallet!');
        setActiveTab('predictions');
      } else {
        showToast(data.error || 'Failed to save profile', true);
      }
    } catch (err: any) {
      showToast(err.message || 'Network error saving settings', true);
    } finally {
      setSaving(false);
    }
  };

  const handleUnfollow = (tipsterAddr: string) => {
    const updated = followedList.filter(a => a.toLowerCase() !== tipsterAddr.toLowerCase());
    setFollowedList(updated);
    localStorage.setItem('alpha_followed_tipsters', JSON.stringify(updated));
    showToast(`Unfollowed ${short(tipsterAddr)}`);
  };

  const toggleSport = (s: string) => {
    setSports(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 12 }} />
        <div className="mut">Loading on-chain forecaster profile & Walrus audit record...</div>
      </div>
    );
  }

  if (!targetAddress) {
    return (
      <div>
        <h1 style={{ margin: '0 0 6px' }}>Forecaster Profile</h1>
        <p className="mut small" style={{ margin: '0 0 24px' }}>Connect your Sui wallet or look up any on-chain tipster address.</p>

        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
          <h2 style={{ margin: '0 0 8px' }}>No Wallet Connected</h2>
          <p className="mut" style={{ maxWidth: 500, margin: '0 auto 24px' }}>
            Connect your Sui wallet to view your personalized forecaster profile, edit your copy-trading parameters, and view your immutable prediction audit trail.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" type="button" onClick={() => setIsModalOpen(true)}>
              Connect Sui Wallet
            </button>
            <button className="btn2" type="button" onClick={connectGuest}>
              ⚡ Try as guest
            </button>
            <Link href="/profile?address=0x71e92c4a9190184b2efc8120e038819a89c1b401" className="btn2">
              View Demo Tipster (0x71e9...b401)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSelf = connectedAddress && connectedAddress.toLowerCase() === targetAddress.toLowerCase();

  return (
    <div>
      {/* Top Header & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, margin: '0 0 24px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px' }}>Forecaster Profile</h1>
          <p className="mut small" style={{ margin: 0 }}>On-chain identity, verifiable prediction audit & autonomous bot settings.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchAddr.startsWith('0x')) {
              window.location.href = `/profile?address=${encodeURIComponent(searchAddr.trim())}`;
            }
          }}
          style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <input
            value={searchAddr}
            onChange={(e) => setSearchAddr(e.target.value)}
            placeholder="Lookup any Sui address (0x...)"
            style={{ padding: '10px 14px', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius-sm)', fontSize: 13, minWidth: 280, fontFamily: 'monospace' }}
          />
          <button type="submit" className="btn2" style={{ padding: '10px 16px', fontWeight: 600 }}>
            Lookup
          </button>
        </form>
      </div>

      {toast && (
        <div style={{ padding: '12px 18px', borderRadius: 'var(--radius-sm)', marginBottom: 20, fontWeight: 500, fontSize: 14, background: toast.isError ? '#fef2f2' : '#ecfdf5', color: toast.isError ? '#991b1b' : '#047857', border: `1px solid ${toast.isError ? '#fca5a5' : '#a7f3d0'}` }}>
          {toast.msg}
        </div>
      )}

      {error && (
        <div className="card" style={{ background: '#fef2f2', borderColor: '#fca5a5', color: '#991b1b', marginBottom: 24 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {profile && (
        <>
          {/* Profile Hero Card */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#eff6ff', border: '2px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  {profile.avatar || '⚡'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <h2 style={{ margin: 0, fontSize: 24 }}>{profile.displayName || `Forecaster_${targetAddress.slice(2, 6)}`}</h2>
                    <span className={`b ${profile.stats.verdict === 'FOLLOW' ? 'f' : profile.stats.verdict === 'SKIP' ? 's' : 'w'}`}>
                      {profile.stats.verdict}
                    </span>
                    {isSelf && (
                      <span style={{ fontSize: 11, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: 999, padding: '2px 8px', fontWeight: 600 }}>
                        🟢 My Connected Identity
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--muted)', background: 'var(--panel)', padding: '3px 8px', borderRadius: 4 }}>
                      {short(profile.address)}
                    </span>
                    <button
                      type="button"
                      className="btn2"
                      onClick={() => {
                        navigator.clipboard.writeText(profile.address);
                        showToast(`📋 Address copied: ${profile.address}`);
                      }}
                      style={{ padding: '3px 8px', fontSize: 12, minHeight: 28 }}
                    >
                      📋 Copy
                    </button>
                    <a href={profile.stats.explorerUrl} target="_blank" rel="noopener noreferrer" className="mut small" style={{ textDecoration: 'underline', fontSize: 12 }}>
                      Suiscan ↗
                    </a>
                    <a href={profile.stats.suiVisionUrl} target="_blank" rel="noopener noreferrer" className="mut small" style={{ textDecoration: 'underline', fontSize: 12 }}>
                      SuiVision ↗
                    </a>
                  </div>
                  <p style={{ margin: 0, color: '#374151', maxWidth: 650, fontSize: 14 }}>
                    {profile.bio || 'Verified on-chain sports forecaster. Predictions committed to Sui Testnet prior to kickoff.'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <button type="button" className="btn" onClick={() => setActiveTab('settings')} style={{ gap: 6 }}>
                  ⚙️ Edit Settings
                </button>
                <Link href="/pick" className="btn2" style={{ fontSize: 13, gap: 6 }}>
                  ✍️ Log Pre-Kickoff Pick
                </Link>
              </div>
            </div>

            {/* Meta Tags Row */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--line)', fontSize: 13 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--panel)', borderRadius: 6 }}>
                <span>🛡️ Risk:</span> <strong>{profile.riskTolerance.toUpperCase()}</strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--panel)', borderRadius: 6 }}>
                <span>💰 Default Stake:</span> <strong>{profile.defaultStakeSui} SUI</strong>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'var(--panel)', borderRadius: 6 }}>
                <span>🏆 Preferred:</span> <strong>{profile.preferredSports.join(', ')}</strong>
              </span>
              {profile.socialTwitter && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#f0fdf4', borderRadius: 6, color: '#166534' }}>
                  <span>🐦 X:</span> <strong>{profile.socialTwitter}</strong>
                </span>
              )}
            </div>
          </div>

          {/* 4 Stat Summary Cards */}
          <div className="row" style={{ marginBottom: 28 }}>
            <div className="card">
              <div className="mut small">Total Predictions Stamped</div>
              <p className="big" style={{ margin: '4px 0 2px' }}>{profile.stats.totalCommits}</p>
              <div className="mut small">Locked pre-kickoff on Sui</div>
            </div>
            <div className="card">
              <div className="mut small">Record & Win Rate</div>
              <p className="big" style={{ margin: '4px 0 2px' }}>{profile.stats.wonCount}W - {profile.stats.lostCount}L ({profile.stats.winRatePct.toFixed(1)}%)</p>
              <div className="mut small">{profile.stats.pendingCount} pending, {profile.stats.voidCount} void</div>
            </div>
            <div className="card">
              <div className="mut small">Shrunk Skill Score (BSS)</div>
              <p className="big" style={{ margin: '4px 0 2px' }}>{profile.stats.shrunkBssPct}</p>
              <div className="mut small">{profile.stats.verdictReason}</div>
            </div>
            <div className="card">
              <div className="mut small">Audit & Forfeit Rate</div>
              <p className="big" style={{ margin: '4px 0 2px' }}>{profile.stats.forfeitRatePct}% (0 hidden)</p>
              <div className="mut small">Permanent Walrus proof vault</div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid var(--line)', marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => setActiveTab('predictions')}
              className="pill"
              style={{
                borderRadius: '8px 8px 0 0',
                fontWeight: activeTab === 'predictions' ? 600 : 500,
                background: 'transparent',
                cursor: 'pointer',
                borderColor: activeTab === 'predictions' ? 'transparent transparent var(--accent) transparent' : 'transparent',
                color: activeTab === 'predictions' ? 'var(--accent)' : 'var(--muted)',
                borderBottom: activeTab === 'predictions' ? '2px solid var(--accent)' : 'none',
              }}
            >
              📜 Locked Predictions ({profile.picks.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('followed')}
              className="pill"
              style={{
                borderRadius: '8px 8px 0 0',
                fontWeight: activeTab === 'followed' ? 600 : 500,
                background: 'transparent',
                cursor: 'pointer',
                borderColor: activeTab === 'followed' ? 'transparent transparent var(--accent) transparent' : 'transparent',
                color: activeTab === 'followed' ? 'var(--accent)' : 'var(--muted)',
                borderBottom: activeTab === 'followed' ? '2px solid var(--accent)' : 'none',
              }}
            >
              🤖 Followed Tipsters ({followedList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="pill"
              style={{
                borderRadius: '8px 8px 0 0',
                fontWeight: activeTab === 'settings' ? 600 : 500,
                background: 'transparent',
                cursor: 'pointer',
                borderColor: activeTab === 'settings' ? 'transparent transparent var(--accent) transparent' : 'transparent',
                color: activeTab === 'settings' ? 'var(--accent)' : 'var(--muted)',
                borderBottom: activeTab === 'settings' ? '2px solid var(--accent)' : 'none',
              }}
            >
              ⚙️ Profile & Risk Settings
            </button>
          </div>

          {/* TAB 1: LOCKED PREDICTIONS */}
          {activeTab === 'predictions' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16 }}>Pre-Kickoff Prediction Registry</h2>
                  <span className="mut small">Cryptographically timestamped on Sui Testnet before match kickoff.</span>
                </div>
                <button type="button" className="btn2" onClick={() => fetchProfile(targetAddress)} style={{ padding: '6px 12px', fontSize: 13 }}>
                  🔄 Refresh Statuses
                </button>
              </div>

              {profile.picks.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <p className="mut" style={{ margin: '0 0 16px' }}>No predictions committed under this address yet.</p>
                  <Link href="/pick" className="btn" style={{ display: 'inline-flex' }}>
                    Lock your first pick before kickoff →
                  </Link>
                </div>
              ) : (
                <div className="scroll">
                  <table className="t" style={{ margin: 0 }}>
                    <thead>
                      <tr style={{ background: 'var(--panel)' }}>
                        <th>Event & Matchup</th>
                        <th>Pick & Probability</th>
                        <th>Market Odds</th>
                        <th>Locked Pre-Kickoff</th>
                        <th>Sui Commitment</th>
                        <th>Walrus Proof</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.picks.map((p, idx) => {
                        const timeStr = p.timestamp ? new Date(p.timestamp).toLocaleString() : 'Pre-kickoff';
                        const suiObj = p.suiObjectId || p.digest || '';
                        let outBadge = <span className="b" style={{ background: '#fef3c7', color: '#92400e' }}>Pending</span>;
                        if (p.outcome === 'win' || p.status === 'Won') {
                          outBadge = <span className="b" style={{ background: '#dcfce7', color: '#166534' }}>✓ Won</span>;
                        } else if (p.outcome === 'loss' || p.status === 'Lost') {
                          outBadge = <span className="b" style={{ background: '#fee2e2', color: '#991b1b' }}>✗ Lost</span>;
                        } else if (p.outcome === 'void' || p.status === 'Voided') {
                          outBadge = <span className="b" style={{ background: '#f3f4f6', color: '#374151' }}>Void</span>;
                        }

                        return (
                          <tr key={idx}>
                            <td><strong>{p.matchName || p.matchId || 'Match Fixture'}</strong></td>
                            <td>{p.pickSelection ? `${p.pickSelection} (${p.pickProb ? (p.pickProb * 100).toFixed(0) + '%' : ''})` : (p.pick || 'Pick')}</td>
                            <td>{p.marketOdds || '50%'}</td>
                            <td className="mut small">{timeStr}</td>
                            <td>
                              {suiObj ? (
                                <a href={`https://suiscan.xyz/testnet/object/${suiObj}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                                  {short(suiObj)} ↗
                                </a>
                              ) : <span className="mut small">Committed</span>}
                            </td>
                            <td>
                              {p.walrusBlobId ? (
                                <a href={`https://walruscan.com/testnet/blob/${p.walrusBlobId}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                                  {short(p.walrusBlobId)} ↗
                                </a>
                              ) : <span className="mut small">Walrus Vault</span>}
                            </td>
                            <td>{outBadge}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FOLLOWED TIPSTERS */}
          {activeTab === 'followed' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Followed Forecasters Whitelist</h2>
                  <div className="mut small">These verified tipsters are automatically evaluated and eligible for your Copy Trading Bot.</div>
                </div>
                <Link href="/copy-bot" className="btn2" style={{ fontSize: 13 }}>
                  🤖 Open Copy Bot Dashboard
                </Link>
              </div>

              {followedList.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center' }} className="mut">
                  <p style={{ margin: '0 0 12px' }}>You have not followed any tipsters yet.</p>
                  <Link href="/tipsters" className="btn2" style={{ display: 'inline-flex', fontSize: 13 }}>
                    Browse Rated Tipsters →
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {followedList.map((addr) => (
                    <div key={addr} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--panel)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20 }}>👤</span>
                        <div>
                          <strong style={{ fontFamily: 'monospace', fontSize: 14 }}>{short(addr)}</strong>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{addr}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Link href={`/profile?address=${encodeURIComponent(addr)}`} className="btn2" style={{ padding: '6px 12px', fontSize: 12 }}>
                          View Profile
                        </Link>
                        <button type="button" className="btn2" onClick={() => handleUnfollow(addr)} style={{ padding: '6px 12px', fontSize: 12, color: '#991b1b' }}>
                          Unfollow
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EDIT PROFILE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="card" style={{ maxWidth: 720 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 18 }}>Profile & Forecaster Settings</h2>
              <p className="mut small" style={{ margin: '0 0 20px' }}>Customize your public tipster identity and copy-trading parameters. Tied permanently to your wallet address.</p>

              <form onSubmit={handleSaveSettings}>
                {/* Display Name */}
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="formDisplayName" style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Display Name / Handle</label>
                  <input
                    id="formDisplayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius-sm)', font: 'inherit' }}
                    placeholder="e.g. MasterModel_30, SharpBettor"
                  />
                </div>

                {/* Avatar Picker */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Forecaster Avatar Emoji</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {AVATAR_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAvatar(emoji)}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          fontSize: 22,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: avatar === emoji ? '#eff6ff' : '#f9fafb',
                          border: avatar === emoji ? '2px solid var(--accent)' : '1px solid var(--line)',
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="formBio" style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Forecaster Bio & Methodology</label>
                  <textarea
                    id="formBio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius-sm)', font: 'inherit', resize: 'vertical' }}
                    placeholder="Explain your model, sport specialties, or betting strategy..."
                  />
                </div>

                {/* Twitter / X */}
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="formTwitter" style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Twitter / X Profile</label>
                  <input
                    id="formTwitter"
                    type="text"
                    value={socialTwitter}
                    onChange={(e) => setSocialTwitter(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius-sm)', font: 'inherit' }}
                    placeholder="@username"
                  />
                </div>

                {/* Preferred Sports */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Preferred Sports</label>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={sports.includes('EPL')} onChange={() => toggleSport('EPL')} /> ⚽ Premier League
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={sports.includes('NBA')} onChange={() => toggleSport('NBA')} /> 🏀 NBA Basketball
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={sports.includes('NFL')} onChange={() => toggleSport('NFL')} /> 🏈 NFL Football
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
                  {/* Risk Tolerance */}
                  <div style={{ flex: '1 1 240px' }}>
                    <label htmlFor="formRisk" style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Risk Sizing Strategy</label>
                    <select
                      id="formRisk"
                      value={riskTolerance}
                      onChange={(e) => setRiskTolerance(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius-sm)', font: 'inherit' }}
                    >
                      <option value="conservative">🛡️ Conservative (0.25x Quarter Kelly)</option>
                      <option value="balanced">⚖️ Balanced (0.5x Half Kelly)</option>
                      <option value="aggressive">⚡ Aggressive (1.0x Full Kelly)</option>
                    </select>
                  </div>

                  {/* Default Stake */}
                  <div style={{ flex: '1 1 200px' }}>
                    <label htmlFor="formStake" style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Default Stake (SUI)</label>
                    <input
                      id="formStake"
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={defaultStake}
                      onChange={(e) => setDefaultStake(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line-strong)', borderRadius: 'var(--radius-sm)', font: 'inherit' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button type="submit" disabled={saving} className="btn" style={{ minWidth: 160 }}>
                    {saving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button type="button" className="btn2" onClick={() => setActiveTab('predictions')}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 12 }} />
        <div className="mut">Loading profile...</div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}

