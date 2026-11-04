'use client';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type WalletType = 'extension' | 'guest' | null;

type WalletContextType = {
  address: string | null;
  walletType: WalletType;
  isExtension: boolean;
  balanceSui: string;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  connectExtension: () => Promise<{ success: boolean; error?: string }>;
  connectManual: (addr: string) => void;
  connectGuest: () => Promise<void>;
  disconnect: () => void;
};

const Ctx = createContext<WalletContextType>({
  address: null,
  walletType: null,
  isExtension: false,
  balanceSui: '0.00 SUI',
  isModalOpen: false,
  setIsModalOpen: () => {},
  connectExtension: async () => ({ success: false }),
  connectManual: () => {},
  connectGuest: async () => {},
  disconnect: () => {},
});

export const useGuest = () => useContext(Ctx);

export function GuestProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [balanceSui, setBalanceSui] = useState<string>('0.05 SUI');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Restore session from localStorage if present
    if (typeof window !== 'undefined') {
      const savedAddr = localStorage.getItem('alpha_connected_wallet');
      const savedType = localStorage.getItem('alpha_wallet_type') as WalletType;
      const savedBal = localStorage.getItem('alpha_wallet_balance') || '0.05 SUI';
      if (savedAddr) {
        setAddress(savedAddr);
        setWalletType(savedType || 'guest');
        setBalanceSui(savedBal);
      }
    }
  }, []);

  const connectExtension = async (): Promise<{ success: boolean; error?: string }> => {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Window not defined' };
    }

    const win = window as any;
    // Check common Sui Wallet Standard injections (Sui Wallet, Suiet, Martian, Nightly, etc.)
    const provider = win.suiWallet || win.suiet || win.martian || win.ethos;

    if (provider) {
      try {
        if (provider.requestPermissions) {
          await provider.requestPermissions();
        }
        let accounts: any[] = [];
        if (provider.getAccounts) {
          accounts = await provider.getAccounts();
        } else if (provider.accounts) {
          accounts = provider.accounts;
        }

        if (accounts && accounts.length > 0) {
          const raw = accounts[0];
          const addr = typeof raw === 'string' ? raw : raw.address;
          if (addr) {
            setAddress(addr);
            setWalletType('extension');
            setBalanceSui('Live Testnet');
            localStorage.setItem('alpha_connected_wallet', addr);
            localStorage.setItem('alpha_wallet_type', 'extension');
            localStorage.setItem('alpha_wallet_balance', 'Live Testnet');
            setIsModalOpen(false);
            return { success: true };
          }
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Connection rejected by wallet' };
      }
    }

    // Modern Wallet Standard event hook
    if (win.__WALLET_STANDARD_WALLETS__ && win.__WALLET_STANDARD_WALLETS__.length > 0) {
      try {
        const wallet = win.__WALLET_STANDARD_WALLETS__[0];
        const connectFeature = wallet.features?.['standard:connect'];
        if (connectFeature) {
          const res = await connectFeature.connect();
          if (res && res.accounts && res.accounts[0]) {
            const addr = res.accounts[0].address;
            setAddress(addr);
            setWalletType('extension');
            setBalanceSui('Live Testnet');
            localStorage.setItem('alpha_connected_wallet', addr);
            localStorage.setItem('alpha_wallet_type', 'extension');
            localStorage.setItem('alpha_wallet_balance', 'Live Testnet');
            setIsModalOpen(false);
            return { success: true };
          }
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return {
      success: false,
      error: 'No Sui wallet extension detected. Please install Sui Wallet, Suiet, or use 1-Click Guest Session.',
    };
  };

  const connectGuest = async () => {
    try {
      const res = await fetch('/api/judge-mode', { method: 'POST' });
      const data = await res.json();
      if (data && data.success && data.address) {
        const addr = data.address;
        const bal = `${data.balanceSui || 0.05} SUI`;
        setAddress(addr);
        setWalletType('guest');
        setBalanceSui(bal);
        localStorage.setItem('alpha_connected_wallet', addr);
        localStorage.setItem('alpha_wallet_type', 'guest');
        localStorage.setItem('alpha_wallet_balance', bal);
        setIsModalOpen(false);
        return;
      }
    } catch {
      // Fallback local key generation if backend offline
    }

    const b = new Uint8Array(32);
    crypto.getRandomValues(b);
    const fallbackAddr = '0x' + Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
    setAddress(fallbackAddr);
    setWalletType('guest');
    setBalanceSui('0.05 SUI');
    localStorage.setItem('alpha_connected_wallet', fallbackAddr);
    localStorage.setItem('alpha_wallet_type', 'guest');
    localStorage.setItem('alpha_wallet_balance', '0.05 SUI');
    setIsModalOpen(false);
  };

  const connectManual = (rawAddr: string) => {
    const addr = rawAddr.trim();
    if (addr.startsWith('0x') && addr.length >= 10) {
      setAddress(addr);
      setWalletType('extension');
      setBalanceSui('Real Wallet');
      localStorage.setItem('alpha_connected_wallet', addr);
      localStorage.setItem('alpha_wallet_type', 'extension');
      localStorage.setItem('alpha_wallet_balance', 'Real Wallet');
      setIsModalOpen(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setWalletType(null);
    setBalanceSui('0.00 SUI');
    setIsModalOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('alpha_connected_wallet');
      localStorage.removeItem('alpha_wallet_type');
      localStorage.removeItem('alpha_wallet_balance');
    }
  };

  return (
    <Ctx.Provider
      value={{
        address,
        walletType,
        isExtension: walletType === 'extension',
        balanceSui,
        isModalOpen,
        setIsModalOpen,
        connectExtension,
        connectManual,
        connectGuest,
        disconnect,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
