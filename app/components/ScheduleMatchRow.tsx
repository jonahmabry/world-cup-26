import { Flag } from './Flag';
import type { GroupMatchRow, KnockoutMatchRow } from '@/lib/engine/scheduleAssembly';

function TeamSlot({ name, placeholder }: { name: string | null; placeholder: string }) {
  const display = name ?? placeholder;
  return (
    <span className="flex items-center gap-1.5 min-w-0">
      {name && <Flag name={name} />}
      <span className={`truncate text-sm ${name ? 'text-slate-100' : 'text-slate-500 italic'}`}>
        {display}
      </span>
    </span>
  );
}

export function GroupRow({ row }: { row: GroupMatchRow }) {
  const { fixture, homeScore, awayScore, status } = row;
  const isLive = status === 'in-progress';
  const isFinal = status === 'final';

  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded bg-slate-800/50 border border-slate-700/40">
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <Flag name={fixture.home} />
        <span className="text-sm text-slate-100 truncate">{fixture.home}</span>
      </div>

      <div className="flex-shrink-0 text-center min-w-[80px]">
        {isFinal || isLive ? (
          <span className="font-mono font-semibold text-slate-100">
            {homeScore} – {awayScore}
          </span>
        ) : (
          <span className="text-xs text-slate-500">{fixture.kickoffTime}</span>
        )}
        {isLive && (
          <span className="ml-1 text-xs font-bold text-red-400 animate-pulse">LIVE</span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2 justify-end">
        <span className="text-sm text-slate-100 truncate">{fixture.away}</span>
        <Flag name={fixture.away} />
      </div>

      <div className="hidden sm:block text-xs text-slate-500 flex-shrink-0 ml-2 text-right min-w-[100px]">
        {fixture.venueCity}
      </div>
    </div>
  );
}

export function KnockoutRow({ row }: { row: KnockoutMatchRow }) {
  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded bg-slate-800/50 border border-slate-700/40">
      <div className="flex-1 min-w-0">
        <TeamSlot name={row.homeName} placeholder={row.homeLabel} />
      </div>

      <div className="flex-shrink-0 text-center min-w-[80px]">
        <span className="text-xs text-slate-500">{row.kickoffTime}</span>
      </div>

      <div className="flex-1 min-w-0 flex justify-end">
        <TeamSlot name={row.awayName} placeholder={row.awayLabel} />
      </div>

      <div className="hidden sm:block text-xs text-slate-500 flex-shrink-0 ml-2 text-right min-w-[100px]">
        {row.venueCity}
      </div>
    </div>
  );
}
