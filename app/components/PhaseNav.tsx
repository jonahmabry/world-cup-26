import Link from 'next/link';
import type { Phase } from '@/lib/types';

interface PhaseNavProps {
  window: Phase[];
  current: Phase;
}

export function PhaseNav({ window: phases, current }: PhaseNavProps) {
  return (
    <div className="flex gap-1 flex-wrap">
      {phases.map((phase) => {
        const isActive = phase.key === current.key;
        return (
          <Link
            key={phase.key}
            href={`/schedule?date=${phase.startDate}`}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              isActive
                ? 'bg-slate-700 text-slate-100'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {phase.label}
          </Link>
        );
      })}
    </div>
  );
}
