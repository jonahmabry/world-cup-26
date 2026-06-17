import { flagCode } from '@/lib/flags';

// Bundled SVG country flag for a team. Renders nothing for an unmapped name (no broken
// image). Decorative — the team name sits beside it as text — so alt="" / aria-hidden.
// Fixed 20×15 (4:3) to avoid layout shift next to badges and the points column.
export function Flag({ name, className = '' }: { name: string; className?: string }) {
  const code = flagCode(name);
  if (!code) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static asset; next/image adds no value here
    <img
      src={`/flags/${code}.svg`}
      alt=""
      aria-hidden
      width={20}
      height={15}
      className={`shrink-0 rounded-[2px] ${className}`}
    />
  );
}
