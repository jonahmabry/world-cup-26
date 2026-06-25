import type { ClinchStatus } from '@/lib/types';

// Mathematically clinched indicator shown next to a team name. Distinct from the
// position-based row colouring: this only appears once advancement/elimination is
// guaranteed. Styled like the existing LIVE tag.
export function ClinchBadge({ clinch }: { clinch: ClinchStatus }) {
  if (clinch === 'through') {
    return (
      <span className="shrink-0 text-[10px] text-emerald-400 font-bold tracking-wide">
        ✓ THROUGH
      </span>
    );
  }
  if (clinch === 'out') {
    return (
      <span className="shrink-0 text-[10px] text-red-400 font-bold tracking-wide">
        ✗ OUT
      </span>
    );
  }
  return null;
}
