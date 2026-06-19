import { describe, it, expect } from 'vitest';
import { currentPhase, resolvePhase, phaseWindow, formatDayHeader, PHASES } from './phases';

// Helper: create a Date in CT (UTC-5) for a given YYYY-MM-DD
function ctDate(isoDate: string): Date {
  // Noon CT = 17:00 UTC
  return new Date(`${isoDate}T17:00:00Z`);
}

describe('currentPhase', () => {
  it('returns the phase whose window contains today', () => {
    const phase = currentPhase(ctDate('2026-06-18'));
    expect(phase.key).toBe('MD2');
  });

  it('falls through to the next phase during a gap day (e.g., Jul 8)', () => {
    // Jul 8 is between R16 (ends Jul 7) and QF (starts Jul 9)
    const phase = currentPhase(ctDate('2026-07-08'));
    expect(phase.key).toBe('QF');
  });

  it('returns MD1 before the tournament starts', () => {
    const phase = currentPhase(ctDate('2026-06-01'));
    expect(phase.key).toBe('MD1');
  });

  it('returns the Final after the tournament ends', () => {
    const phase = currentPhase(ctDate('2026-07-25'));
    expect(phase.key).toBe('Final');
  });

  it('returns MD3 when in MD3 window', () => {
    const phase = currentPhase(ctDate('2026-06-25'));
    expect(phase.key).toBe('MD3');
  });
});

describe('resolvePhase', () => {
  it('resolves to the phase matching the start date', () => {
    const phase = resolvePhase('2026-06-18', ctDate('2026-06-11'));
    expect(phase.key).toBe('MD2');
  });

  it('falls back to currentPhase for an unknown date', () => {
    const phase = resolvePhase('2026-01-01', ctDate('2026-06-18'));
    expect(phase.key).toBe('MD2');
  });

  it('falls back to currentPhase when undefined', () => {
    const phase = resolvePhase(undefined, ctDate('2026-06-18'));
    expect(phase.key).toBe('MD2');
  });

  it('falls back to currentPhase for a malformed value', () => {
    const phase = resolvePhase('not-a-date', ctDate('2026-06-18'));
    expect(phase.key).toBe('MD2');
  });
});

describe('phaseWindow', () => {
  it('returns 3 phases in the middle of the sequence', () => {
    const md2 = PHASES.find((p) => p.key === 'MD2')!;
    const window = phaseWindow(md2);
    expect(window.map((p) => p.key)).toEqual(['MD1', 'MD2', 'MD3']);
  });

  it('returns only 2 phases at the start (MD1)', () => {
    const md1 = PHASES[0];
    const window = phaseWindow(md1);
    expect(window.map((p) => p.key)).toEqual(['MD1', 'MD2']);
  });

  it('returns only 2 phases at the end (Final)', () => {
    const final = PHASES[PHASES.length - 1];
    const window = phaseWindow(final);
    expect(window.map((p) => p.key)).toEqual(['ThirdPlace', 'Final']);
  });

  it('returns correct window for QF', () => {
    const qf = PHASES.find((p) => p.key === 'QF')!;
    const window = phaseWindow(qf);
    expect(window.map((p) => p.key)).toEqual(['R16', 'QF', 'SF']);
  });
});

describe('formatDayHeader', () => {
  it('formats 2026-06-18 as THU, JUN 18', () => {
    expect(formatDayHeader('2026-06-18')).toBe('THU, JUN 18');
  });

  it('formats 2026-07-04 as SAT, JUL 4', () => {
    expect(formatDayHeader('2026-07-04')).toBe('SAT, JUL 4');
  });

  it('formats 2026-06-11 as THU, JUN 11', () => {
    expect(formatDayHeader('2026-06-11')).toBe('THU, JUN 11');
  });
});
