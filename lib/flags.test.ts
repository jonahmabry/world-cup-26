import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { GROUPS } from '@/lib/engine/groups';
import { TEAM_CODES, flagCode } from '@/lib/flags';

const allTeams = Object.values(GROUPS).flat();
const flagsDir = join(process.cwd(), 'public', 'flags');

describe('flags', () => {
  it.each(allTeams)('every group-stage team has a flag code: %s', (team) => {
    expect(flagCode(team)).not.toBeNull();
  });

  it('every mapped code has a bundled SVG on disk', () => {
    const missing = Object.values(TEAM_CODES).filter(
      (code) => !existsSync(join(flagsDir, `${code}.svg`)),
    );
    expect(missing).toEqual([]);
  });

  it('returns null for an unmapped name', () => {
    expect(flagCode('Atlantis')).toBeNull();
  });

  it('home nations use distinct sub-region codes', () => {
    expect(flagCode('England')).toBe('gb-eng');
    expect(flagCode('Scotland')).toBe('gb-sct');
    expect(flagCode('Wales')).toBe('gb-wls');
  });
});
