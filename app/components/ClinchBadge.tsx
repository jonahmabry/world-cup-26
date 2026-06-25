import type { ClinchStatus } from '@/lib/types';

// Mathematically clinched indicator shown next to a team name. Distinct from the
// position-based row colouring: this only appears once advancement/elimination is
// guaranteed. Styled like the existing LIVE tag.
//
// `iconOnly` renders just a colored ✓/✗ glyph (with a tooltip) for cramped layouts
// like the 3-up group tables, where the full text would truncate the team name.
export function ClinchBadge({ clinch, iconOnly = false }: { clinch: ClinchStatus; iconOnly?: boolean }) {
  if (clinch === 'through') {
    const label = 'Clinched — through to the Round of 32';
    return (
      <span
        className="shrink-0 text-[10px] text-emerald-400 font-bold tracking-wide"
        title={label}
        aria-label={label}
      >
        {iconOnly ? '✓' : '✓ THROUGH'}
      </span>
    );
  }
  if (clinch === 'out') {
    const label = 'Eliminated';
    return (
      <span
        className="shrink-0 text-[10px] text-red-400 font-bold tracking-wide"
        title={label}
        aria-label={label}
      >
        {iconOnly ? '✗' : '✗ OUT'}
      </span>
    );
  }
  return null;
}
