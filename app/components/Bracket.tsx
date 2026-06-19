import type { BracketMatchup, BracketTeam, KnockoutRound } from '@/lib/types';
import { fifaRank, UNRANKED } from '@/lib/engine/fifaRanking';
import { Flag } from './Flag';

// Pixel constants for the bracket tree layout.
// SLOT_H: height (px) allocated to each R32 slot; cards in later rounds span multiples of this.
// CARD_H: actual card height (px); cards are vertically centered in their slot-span.
// COL_W:  column width (px).
// CONN_W: horizontal gap between columns, occupied by connector lines.
const SLOT_H = 96;
const CARD_H = 80;
const COL_W  = 200;
const CONN_W = 28;
// How far above/below card center the connector arm exits the card.
const CONN_INSET = 13;

function TeamSlot({ team, label }: { team: BracketTeam; label: string }) {
  if (team.kind === 'tbd-pending-ranking') {
    return <div className="text-yellow-400 text-[11px] italic">TBD</div>;
  }
  if (team.kind === 'winner-of') {
    return <div className="text-slate-400 text-[11px] font-mono">W{team.matchId.slice(1)}</div>;
  }
  if (team.kind === 'loser-of') {
    return <div className="text-slate-400 text-[11px] font-mono">L{team.matchId.slice(1)}</div>;
  }
  if (team.kind === 'unknown') {
    return <div className="text-slate-500 text-[11px] italic truncate">{label}</div>;
  }
  const rank = fifaRank(team.name);
  return (
      <div className="flex items-baseline gap-1 min-w-0">
        <Flag name={team.name} className="self-center"/>
        <span
            className="relative top-[-0.5px] w-2.5 shrink-0 text-center text-yellow-500 text-[10px] font-mono tabular-nums"
            title="FIFA World Ranking"
        >
          {rank !== UNRANKED ? rank : ''}
        </span>
        <span className="text-slate-100 font-medium text-xs truncate">{team.name}</span>
      </div>
  );
}

function MatchCard({ matchup }: { matchup: BracketMatchup }) {
  return (
    <div className="bg-slate-800 rounded border border-slate-700 px-2 py-1.5 flex flex-col gap-1" style={{ height: CARD_H }}>
      {/* Top row: match ID (left) + city (right) */}
      <div className="flex flex-row justify-between items-center min-w-0 text-[9px] text-slate-500">
        <span className="font-mono uppercase shrink-0">{matchup.matchId}</span>
        <span className="truncate text-right">{matchup.venueCity}</span>
      </div>

      {/* Bottom row: team column (with FIFA rankings) + date/time column */}
      <div className="flex flex-row gap-1 flex-1 min-w-0">
        <div className="flex-1 flex flex-col justify-center space-y-0.5 min-w-0">
          <TeamSlot team={matchup.home} label={matchup.homeLabel} />
          <div className="text-slate-500 text-[9px] text-center leading-none">vs</div>
          <TeamSlot team={matchup.away} label={matchup.awayLabel} />
        </div>
        <div className="flex flex-col items-end justify-center text-right shrink-0 mb-0.5 text-[9px] leading-tight text-slate-100">
          <span>{matchup.date}</span>
          <span>{matchup.kickoffTime}</span>
        </div>
      </div>
    </div>
  );
}

type RoundDef = { round: KnockoutRound; label: string; slotsPerCard: number };

const ROUND_DEFS: RoundDef[] = [
  { round: 'R32',   label: 'Round of 32',    slotsPerCard: 1  },
  { round: 'R16',   label: 'Round of 16',    slotsPerCard: 2  },
  { round: 'QF',    label: 'Quarter-finals', slotsPerCard: 4  },
  { round: 'SF',    label: 'Semi-finals',    slotsPerCard: 8  },
  { round: 'Final', label: 'Final',          slotsPerCard: 16 },
];

const TOTAL_R32 = 16;
const BRACKET_H = TOTAL_R32 * SLOT_H;

// Detached third-place card placement: horizontally aligned with the Final
// column (index 4) and vertically aligned with M100 (the 4th/last QF card,
// Kansas City). M100's column-relative top mirrors the per-card math below:
// centerSlot = index(3) * slotsPerCard(4) + slotsPerCard/2 = 14.
const THIRD_PLACE_LEFT = 4 * (COL_W + CONN_W);
const THIRD_PLACE_TOP = 14 * SLOT_H - CARD_H / 2;

export function Bracket({ matchups }: { matchups: BracketMatchup[] }) {
  const byRound = (round: KnockoutRound) =>
    matchups.filter((m) => m.round === round).sort((a, b) => a.slot - b.slot);

  const hasUnknown = matchups.some(
    (m) => m.round === 'R32' && (m.home.kind === 'unknown' || m.away.kind === 'unknown'),
  );

  const thirdPlace = matchups.find((m) => m.round === 'ThirdPlace');

  return (
    <div>
      <p className="text-slate-400 text-sm mb-4 italic">
        Projected bracket — if the group stage ended now. Updates on each refresh.
      </p>

      <div className="overflow-x-auto pb-4">
        {/* Round headers */}
        <div className="flex mb-2" style={{ gap: CONN_W }}>
          {ROUND_DEFS.map(({ round, label }) => (
            <div
              key={round}
              style={{ width: COL_W, flexShrink: 0 }}
              className="text-center text-[10px] text-slate-500 uppercase tracking-wider font-medium"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bracket columns */}
        <div className="flex relative" style={{ height: BRACKET_H, gap: CONN_W }}>
          {ROUND_DEFS.map(({ round, slotsPerCard }, colIdx) => {
            const cards = byRound(round);
            const isLast = colIdx === ROUND_DEFS.length - 1;

            return (
              <div
                key={round}
                className="relative shrink-0"
                style={{ width: COL_W, height: BRACKET_H }}
              >
                {cards.map((m, i) => {
                  // Center the card within the span it occupies.
                  const centerSlot = i * slotsPerCard + slotsPerCard / 2;
                  const topPx = centerSlot * SLOT_H - CARD_H / 2;

                  // Connector arm: a border-right + one perpendicular border that meets
                  // the midpoint between this card and its sibling in the same R16/QF/SF slot.
                  const armH = (slotsPerCard * SLOT_H) / 2;
                  const isTopOfPair = i % 2 === 0;
                  const cardCenterY = topPx + CARD_H / 2;
                  // R32→R16 connectors are offset slightly from card center so they read
                  // as exiting from within the card body; all later connectors exit from center.
                  const inset = colIdx === 0 ? CONN_INSET : 0;
                  const armTop = isTopOfPair
                    ? cardCenterY - inset
                    : cardCenterY - armH;
                  const connH = armH + inset;

                  return (
                    <div key={m.matchId}>
                      {/* Card */}
                      <div className="absolute" style={{ top: topPx, left: 0, width: COL_W }}>
                        <MatchCard matchup={m} />
                      </div>

                      {/* Connector arm into the gap toward the next column */}
                      {!isLast && (
                        <div
                          className={`absolute border-slate-600 ${
                            isTopOfPair ? 'border-r border-t' : 'border-r border-b'
                          }`}
                          style={{
                            left: COL_W,
                            width: CONN_W * 2,
                            height: connH,
                            top: armTop,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Detached third-place match card (M103): x-aligned with the Final
              column, y-aligned with M100 (Kansas City QF). No connectors. */}
          {thirdPlace && (
            <div className="absolute" style={{ left: THIRD_PLACE_LEFT, top: THIRD_PLACE_TOP, width: COL_W }}>
              <MatchCard matchup={thirdPlace} />
              <div className="text-center text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-2">
                Third-place match
              </div>
            </div>
          )}
        </div>
      </div>

      {hasUnknown && (
        <p className="mt-4 text-amber-400 text-xs">
          ⚠ One or more bracket slots could not be resolved — check the allocation table.
        </p>
      )}
    </div>
  );
}
