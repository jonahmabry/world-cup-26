import { describe, it, expect } from 'vitest';
import { computeSweepStart } from './pipeline';

const TOURNAMENT_START = '20260611';

describe('computeSweepStart', () => {
  it('starts at the tournament start when there is no watermark', () => {
    expect(computeSweepStart(null)).toBe(TOURNAMENT_START);
  });

  it('looks back before the watermark rather than starting at watermark+1', () => {
    // Lookback of 2 days => sweep begins one day BEFORE the watermark, not after it.
    expect(computeSweepStart('20260616')).toBe('20260615');
  });

  it('clamps the lookback to the tournament start', () => {
    // Watermark on the opening day would otherwise sweep from before the tournament.
    expect(computeSweepStart('20260611')).toBe(TOURNAMENT_START);
  });

  it('handles month boundaries with UTC date math', () => {
    expect(computeSweepStart('20260701')).toBe('20260630');
  });

  // Regression: ESPN files matches by US-Eastern date, but the watermark advances by
  // UTC date. A late kickoff (~00:00–05:00 UTC) lands under an Eastern date one day
  // earlier than its UTC date. Iran v New Zealand (760427) kicked off 2026-06-16T01:00Z
  // — UTC date 06-16, but ESPN serves it under dates=20260615. Once the watermark
  // advanced to UTC 06-16, a strict watermark+1 sweep (starting 06-17) never re-queried
  // the 06-15 Eastern label, orphaning the match. The lookback must keep the sweep
  // start at or before that Eastern label so the match is eventually fetched.
  it('re-queries the Eastern date label of a late UTC-boundary match', () => {
    const espnEasternLabelForLateMatch = '20260615'; // 760427: Iran v New Zealand
    const watermarkAfterMatchUtcDate = '20260616'; // UTC date the watermark sees

    const sweepStart = computeSweepStart(watermarkAfterMatchUtcDate);

    // Sweep must reach back to (or before) the Eastern label, otherwise the match
    // ESPN only serves under that label is never fetched again.
    expect(sweepStart <= espnEasternLabelForLateMatch).toBe(true);
  });
});
