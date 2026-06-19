import { runPipeline } from '@/lib/pipeline';
import { initPoller } from '@/lib/poller';
import { resolvePhase, phaseWindow } from '@/lib/engine/phases';
import { buildSchedule } from '@/lib/engine/scheduleAssembly';
import { PhaseNav } from '../components/PhaseNav';
import { DaySection } from '../components/DaySection';

export const dynamic = 'force-dynamic';

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  initPoller();
  const [snapshot, params] = await Promise.all([runPipeline(), searchParams]);

  const dateParam = typeof params.date === 'string' ? params.date : undefined;
  const phase = resolvePhase(dateParam);
  const navWindow = phaseWindow(phase);
  const sections = buildSchedule(phase, snapshot.matches, snapshot.bracket);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Match Schedule</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kickoff times in Central Daylight Time (CDT)
          </p>
        </div>
        <div className="text-xs text-slate-600">
          Updated {new Date(snapshot.lastUpdated).toLocaleTimeString()}
          {snapshot.hasStaleData && (
            <span className="ml-2 text-amber-400">⚠ Stale data</span>
          )}
        </div>
      </div>

      <div className="mb-6">
        <PhaseNav window={navWindow} current={phase} />
      </div>

      {sections.length === 0 ? (
        <p className="text-slate-500 text-sm">No matches scheduled for this phase.</p>
      ) : (
        sections.map((section) => (
          <DaySection key={section.isoDate} header={section.header} rows={section.rows} />
        ))
      )}
    </div>
  );
}
