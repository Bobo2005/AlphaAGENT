import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GuestProvider } from '@/components/GuestContext';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'AlphaAgent: the lie detector for sports tipsters',
  description: 'Checks that picks were locked before kickoff, that no bets were hidden, and that a record is long enough to mean something.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GuestProvider>
          <Nav />
          <div className="note">Sui Testnet Live Gateway (Tatum RPC). Permanent memory vault live on Walrus.</div>
          <main className="wrap">{children}</main>
          <footer className="foot">Picks are stamped on Sui testnet. Memory is saved on Walrus Mainnet.</footer>
        </GuestProvider>
      </body>
    </html>
  );
}
