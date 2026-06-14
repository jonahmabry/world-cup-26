'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function RefreshButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRefresh() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/refresh', { method: 'POST' });
        if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
        router.refresh();
      } catch (err) {
        setError(String(err));
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={isPending}
        className="px-4 py-1.5 rounded text-sm font-medium bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-slate-200"
      >
        {isPending ? 'Refreshing…' : 'Refresh'}
      </button>
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  );
}
