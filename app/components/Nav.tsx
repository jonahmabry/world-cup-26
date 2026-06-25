'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Standings', key: 'standings' },
  { href: '/bracket', label: 'Bracket', key: 'bracket' },
  { href: '/schedule', label: 'Schedule', key: 'schedule' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`px-4 py-2 rounded text-sm transition-colors ${
            pathname === tab.href
              ? 'bg-slate-700 text-slate-100 font-medium'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
