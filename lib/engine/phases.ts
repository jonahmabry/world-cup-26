import type { Phase } from '@/lib/types';

export const PHASES: Phase[] = [
  { key: 'MD1',        label: 'Matchday 1',    startDate: '2026-06-11', endDate: '2026-06-17' },
  { key: 'MD2',        label: 'Matchday 2',    startDate: '2026-06-18', endDate: '2026-06-23' },
  { key: 'MD3',        label: 'Matchday 3',    startDate: '2026-06-24', endDate: '2026-06-27' },
  { key: 'R32',        label: 'Round of 32',   startDate: '2026-06-28', endDate: '2026-07-03' },
  { key: 'R16',        label: 'Round of 16',   startDate: '2026-07-04', endDate: '2026-07-07' },
  { key: 'QF',         label: 'Quarter-finals', startDate: '2026-07-09', endDate: '2026-07-11' },
  { key: 'SF',         label: 'Semi-finals',   startDate: '2026-07-14', endDate: '2026-07-15' },
  { key: 'ThirdPlace', label: 'Third place',   startDate: '2026-07-18', endDate: '2026-07-18' },
  { key: 'Final',      label: 'Final',         startDate: '2026-07-19', endDate: '2026-07-19' },
];

// Returns today's date in CT as a YYYY-MM-DD string.
// CT = CDT (UTC-5) during the tournament (all summer, no switch).
function todayInCT(): string {
  const now = new Date();
  // Subtract 5 hours for CDT (UTC-5)
  const ctMs = now.getTime() - 5 * 60 * 60 * 1000;
  const ct = new Date(ctMs);
  const y = ct.getUTCFullYear();
  const m = String(ct.getUTCMonth() + 1).padStart(2, '0');
  const d = String(ct.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function currentPhase(now: Date = new Date()): Phase {
  // Convert now to CT date string for comparison
  const ctMs = now.getTime() - 5 * 60 * 60 * 1000;
  const ct = new Date(ctMs);
  const y = ct.getUTCFullYear();
  const m = String(ct.getUTCMonth() + 1).padStart(2, '0');
  const d = String(ct.getUTCDate()).padStart(2, '0');
  const today = `${y}-${m}-${d}`;

  // Find the phase whose window contains today
  for (const phase of PHASES) {
    if (today >= phase.startDate && today <= phase.endDate) {
      return phase;
    }
  }

  // Today is in a gap — find the next upcoming phase
  for (const phase of PHASES) {
    if (today < phase.startDate) return phase;
  }

  // After the Final — return the Final
  return PHASES[PHASES.length - 1];
}

export function resolvePhase(dateParam: string | undefined, now: Date = new Date()): Phase {
  if (!dateParam) return currentPhase(now);
  const match = PHASES.find((p) => p.startDate === dateParam);
  return match ?? currentPhase(now);
}

export function phaseWindow(phase: Phase): Phase[] {
  const idx = PHASES.findIndex((p) => p.key === phase.key);
  const start = Math.max(0, idx - 1);
  const end = Math.min(PHASES.length - 1, idx + 1);
  return PHASES.slice(start, end + 1);
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Formats "2026-06-18" → "THU, JUN 18".
// Uses UTC-noon to avoid timezone off-by-one at date boundaries.
export function formatDayHeader(isoDate: string): string {
  const [y, mo, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
  const weekday = WEEKDAYS[date.getUTCDay()];
  const month = MONTHS[date.getUTCMonth()];
  const day = date.getUTCDate();
  return `${weekday}, ${month} ${day}`;
}

export interface DayGroup<T> {
  isoDate: string;
  header: string;
  items: T[];
}

export function groupByDay<T extends { isoDate: string }>(items: T[]): DayGroup<T>[] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const existing = map.get(item.isoDate);
    if (existing) {
      existing.push(item);
    } else {
      map.set(item.isoDate, [item]);
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([isoDate, groupItems]) => ({
      isoDate,
      header: formatDayHeader(isoDate),
      items: groupItems,
    }));
}
