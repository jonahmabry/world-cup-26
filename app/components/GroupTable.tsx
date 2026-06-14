import type { GroupStandings } from '@/lib/types';

function rowBg(qualStatus: string): string {
  if (qualStatus === 'auto') return 'bg-green-950 border-l-2 border-green-500';
  if (qualStatus === 'best-third') return 'bg-amber-950 border-l-2 border-amber-500';
  if (qualStatus === 'eliminated') return 'bg-red-950 border-l-2 border-red-700';
  return 'border-l-2 border-slate-700'; // pending — no color
}

export function GroupTable({ standings }: { standings: GroupStandings }) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      <div className="bg-slate-800 px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          Group {standings.groupId}
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-500 uppercase bg-slate-900">
            <th className="text-left px-3 py-1.5 w-6">#</th>
            <th className="text-left px-3 py-1.5">Team</th>
            <th className="px-2 py-1.5 text-center">MP</th>
            <th className="px-2 py-1.5 text-center">W</th>
            <th className="px-2 py-1.5 text-center">D</th>
            <th className="px-2 py-1.5 text-center">L</th>
            <th className="px-2 py-1.5 text-center">GF</th>
            <th className="px-2 py-1.5 text-center">GA</th>
            <th className="px-2 py-1.5 text-center">GD</th>
            <th className="px-2 py-1.5 text-center font-bold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.rows.map((row) => (
            <tr key={row.team} className={`border-t border-slate-800 ${rowBg(row.qualStatus)}`}>
              <td className="px-3 py-2 text-slate-400 text-xs">{row.position}</td>
              <td className="px-3 py-2 font-medium text-slate-100">
                {row.team}
                {row.provisional && (
                  <span className="ml-2 text-[10px] text-emerald-400 font-bold tracking-wide">
                    LIVE
                  </span>
                )}
                {row.tiedPendingRanking && (
                  <span className="ml-2 text-[10px] text-yellow-400 font-normal">
                    TIE
                  </span>
                )}
              </td>
              <td className="px-2 py-2 text-center text-slate-300">{row.mp}</td>
              <td className="px-2 py-2 text-center text-slate-300">{row.w}</td>
              <td className="px-2 py-2 text-center text-slate-300">{row.d}</td>
              <td className="px-2 py-2 text-center text-slate-300">{row.l}</td>
              <td className="px-2 py-2 text-center text-slate-300">{row.gf}</td>
              <td className="px-2 py-2 text-center text-slate-300">{row.ga}</td>
              <td className="px-2 py-2 text-center text-slate-300">
                {row.gd > 0 ? `+${row.gd}` : row.gd}
              </td>
              <td className="px-2 py-2 text-center font-bold text-slate-100">{row.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
