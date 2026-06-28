import { Flag } from './Flag';
import type { GroupMatchRow, KnockoutMatchRow, MatchRowStatus } from '@/lib/engine/scheduleAssembly';

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

// One team's score, with penalty-shootout goals in parentheses, e.g. "1 (4)".
function score(value: number | null, shootout: number | null): string {
  const base = value ?? 0;
  return shootout != null ? `${base} (${shootout})` : `${base}`;
}

// Shared score/kickoff cell used by both group and knockout rows so they read identically.
// Shows the kickoff time until kickoff, the running score (+ LIVE) in progress, the final score after.
function ScoreCell({
  homeScore,
  awayScore,
  homeShootout = null,
  awayShootout = null,
  status,
  kickoffTime,
}: {
  homeScore: number | null;
  awayScore: number | null;
  homeShootout?: number | null;
  awayShootout?: number | null;
  status: MatchRowStatus;
  kickoffTime: string;
}) {
  const isLive = status === 'in-progress';
  const isFinal = status === 'final';

  return (
    <div className="flex-shrink-0 text-center min-w-[80px]">
      {isFinal || isLive ? (
        <span className="font-mono font-semibold text-slate-100">
          {score(homeScore, homeShootout)} – {score(awayScore, awayShootout)}
        </span>
      ) : (
        <span className="text-xs text-slate-500">{kickoffTime}</span>
      )}
      {isLive && (
        <span className="ml-1 text-xs font-bold text-red-400 animate-pulse">LIVE</span>
      )}
    </div>
  );
}

export function GroupRow({ row }: { row: GroupMatchRow }) {
  const { fixture, homeScore, awayScore, status } = row;

  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded bg-slate-800/50 border border-slate-700/40">
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <Flag name={fixture.home} />
        <span className="text-sm text-slate-100 truncate">{fixture.home}</span>
      </div>

      <ScoreCell
        homeScore={homeScore}
        awayScore={awayScore}
        status={status}
        kickoffTime={fixture.kickoffTime}
      />

      <div className="flex-1 min-w-0 flex items-center gap-2 justify-end">
        <span className="text-sm text-slate-100 truncate">{fixture.away}</span>
        <Flag name={fixture.away} />
      </div>

      <div className="hidden sm:block text-xs text-slate-500 flex-shrink-0 ml-2 text-right min-w-[120px]">
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

      <ScoreCell
        homeScore={row.homeScore}
        awayScore={row.awayScore}
        homeShootout={row.homeShootout}
        awayShootout={row.awayShootout}
        status={row.status}
        kickoffTime={row.kickoffTime}
      />

      <div className="flex-1 min-w-0 flex justify-end">
        <TeamSlot name={row.awayName} placeholder={row.awayLabel} />
      </div>

      <div className="hidden sm:block text-xs text-slate-500 flex-shrink-0 ml-2 text-right min-w-[120px]">
        {row.venueCity}
      </div>
    </div>
  );
}
