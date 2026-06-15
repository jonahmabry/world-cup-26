import type { Metadata } from 'next';
import './globals.css';
import { Nav } from './components/Nav';
import { RefreshButton } from './components/RefreshButton';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'World Cup 2026 Tracker',
  description: 'Live group standings, projected bracket, and player stats',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-slate-800 bg-slate-900 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <h1 className="text-lg font-bold text-slate-100 shrink-0">
                🏆 WC 2026
              </h1>
              <Nav />
            </div>
            <RefreshButton />
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
