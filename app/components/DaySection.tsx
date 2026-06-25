import type { ScheduleMatchRow } from '@/lib/engine/scheduleAssembly';
import { GroupRow, KnockoutRow } from './ScheduleMatchRow';

interface DaySectionProps {
  header: string;
  rows: ScheduleMatchRow[];
}

export function DaySection({ header, rows }: DaySectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
        {header}
      </h3>
      <div className="flex flex-col gap-1.5">
        {rows.map((row, i) => {
          if (row.kind === 'group') {
            return <GroupRow key={`${row.fixture.groupId}-${row.fixture.home}-${row.fixture.away}`} row={row} />;
          }
          return <KnockoutRow key={row.matchId} row={row} />;
        })}
      </div>
    </div>
  );
}
