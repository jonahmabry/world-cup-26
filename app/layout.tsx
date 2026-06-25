import type { Metadata } from 'next';
import './globals.css';
import { Nav } from './components/Nav';
import { RefreshButton } from './components/RefreshButton';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'World Cup 2026 Tracker',
  description: 'Live group standings, clinch tracker, match schedule, and projected knockout bracket for the FIFA World Cup 2026',
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
            <div className="flex items-center gap-3 sm:gap-4">
              <a
                href="https://github.com/jonahmabry/world-cup-26"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors shrink-0"
              >
                GitHub ↗
              </a>
              <RefreshButton />
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
