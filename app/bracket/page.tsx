import { runPipeline } from '@/lib/pipeline';
import { Bracket } from '../components/Bracket';
import { initPoller } from '@/lib/poller';

export const dynamic = 'force-dynamic';

export default async function BracketPage() {
  initPoller();
  const snapshot = await runPipeline();
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-100">Projected Bracket</h2>
        <div className="text-xs text-slate-600">
          Updated {new Date(snapshot.lastUpdated).toLocaleTimeString()}
          {snapshot.hasStaleData && (
            <span className="ml-2 text-amber-400">⚠ Stale data</span>
          )}
        </div>
      </div>
      <Bracket matchups={snapshot.bracket} />
    </div>
  );
}
