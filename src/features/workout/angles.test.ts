import { describe, expect, it } from 'vitest';

import { averageScore, rollingAverage } from '@/features/workout/angles';

describe('score averages', () => {
  it('returns zero when no movement score has been recorded', () => {
    expect(averageScore([])).toBe(0);
    expect(rollingAverage([])).toBe(0);
  });

  it('calculates recorded movement scores', () => {
    expect(averageScore([60, 80])).toBe(70);
    expect(rollingAverage([60, 80], 0.5)).toBe(70);
  });
});
