import { runPipeline } from '@/lib/pipeline';
import { GroupTable } from './components/GroupTable';
import { Flag } from './components/Flag';
import { initPoller } from '@/lib/poller';

export const dynamic = 'force-dynamic';

export default async function StandingsPage() {
  initPoller();
  const snapshot = await runPipeline();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Group Standings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Standings are live and updated on refresh — color coding reflects current snapshot
          </p>
        </div>
        <div className="text-xs text-slate-600">
          Updated {new Date(snapshot.lastUpdated).toLocaleTimeString()}
          {snapshot.hasStaleData && (
            <span className="ml-2 text-amber-400">⚠ Stale data</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-6">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-green-700 inline-block" /> Qualified (top 2)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-amber-800 inline-block" /> Best third (advancing)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-red-900 inline-block" /> Eliminated
        </span>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {snapshot.groups.map((g) => (
          <GroupTable key={g.groupId} standings={g} />
        ))}
      </div>

      {snapshot.allThirds.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Third-place ranking (best 8 advance)
          </h3>
          <div className="overflow-x-auto">
            <table className="text-sm w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase border-b border-slate-700">
                  <th className="text-left py-1.5 px-2">#</th>
                  <th className="text-left py-1.5 px-2">Team</th>
                  <th className="text-left py-1.5 px-2">Group</th>
                  <th className="text-center py-1.5 px-2">Pts</th>
                  <th className="text-center py-1.5 px-2">GD</th>
                  <th className="text-center py-1.5 px-2">GF</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.allThirds.map((row, i) => (
                  <tr
                    key={row.team}
                    className={`border-b border-slate-800 ${
                      i < 8 ? 'text-slate-200' : 'text-slate-500'
                    } ${i === 7 ? 'border-b-2 border-amber-600' : ''}`}
                  >
                    <td className="py-1.5 px-2">{i + 1}</td>
                    <td className="py-1.5 px-2 font-medium">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <Flag name={row.team} />
                        <span className="truncate">{row.team}</span>
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-slate-400">{row.groupId}</td>
                    <td className="py-1.5 px-2 text-center">{row.pts}</td>
                    <td className="py-1.5 px-2 text-center">
                      {row.gd > 0 ? `+${row.gd}` : row.gd}
                    </td>
                    <td className="py-1.5 px-2 text-center">{row.gf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
