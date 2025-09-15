import { describe, it, expect } from 'vitest';
import { formatScore } from './format';

describe('formatScore', () => {
  it('formats valid scores', () => {
    expect(formatScore(1, 2)).toBe('1-2');
  });

  it('handles missing scores', () => {
    expect(formatScore(undefined, 2)).toBe('TBD');
    expect(formatScore(1, undefined)).toBe('TBD');
    expect(formatScore(undefined, undefined)).toBe('TBD');
  });
});
