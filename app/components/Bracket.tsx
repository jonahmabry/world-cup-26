import type { BracketMatchup, BracketTeam } from '@/lib/types';

function TeamSlot({ team, label }: { team: BracketTeam; label: string }) {
  if (team.kind === 'tbd-pending-ranking') {
    return (
      <div className="text-yellow-400 text-xs italic">TBD — FIFA Ranking</div>
    );
  }
  if (team.kind === 'unknown') {
    return <div className="text-slate-500 text-xs italic">{label}</div>;
  }
  return <div className="text-slate-100 font-medium text-sm">{team.name}</div>;
}

function MatchCard({ matchup }: { matchup: BracketMatchup }) {
  return (
    <div className="bg-slate-800 rounded border border-slate-700 p-3 space-y-2 min-w-[200px]">
      <div className="text-[10px] text-slate-500 font-mono uppercase">{matchup.matchId}</div>
      <div className="space-y-1">
        <TeamSlot team={matchup.home} label={matchup.homeLabel} />
        <div className="text-slate-600 text-xs text-center">vs</div>
        <TeamSlot team={matchup.away} label={matchup.awayLabel} />
      </div>
    </div>
  );
}

export function Bracket({ matchups }: { matchups: BracketMatchup[] }) {
  const sorted = [...matchups].sort((a, b) => {
    const n = (id: string) => parseInt(id.replace('M', ''), 10);
    return n(a.matchId) - n(b.matchId);
  });

  return (
    <div>
      <p className="text-slate-400 text-sm mb-4">
        Projected bracket — if the group stage ended now. Updates on each refresh.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {sorted.map((m) => (
          <MatchCard key={m.matchId} matchup={m} />
        ))}
      </div>
      {matchups.some((m) => m.home.kind === 'unknown' || m.away.kind === 'unknown') && (
        <p className="mt-4 text-amber-400 text-xs">
          ⚠ One or more bracket slots could not be resolved — check the allocation table.
        </p>
      )}
    </div>
  );
}
