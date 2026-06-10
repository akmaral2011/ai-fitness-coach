import { describe, expect, it } from 'vitest';

import {
  HOLD_DURATION,
  hasMetWorkoutCompletionRequirement,
} from '@/features/workout/workoutModeHelpers';

function hasMetRequirement({
  isStatic = false,
  completedSets = [],
  currentRepCount = 0,
  targetReps = 10,
  currentHoldSeconds = 0,
  totalSets = 1,
}: Partial<Parameters<typeof hasMetWorkoutCompletionRequirement>[0]> = {}) {
  return hasMetWorkoutCompletionRequirement({
    isStatic,
    completedSets,
    currentRepCount,
    targetReps,
    currentHoldSeconds,
    totalSets,
  });
}

describe('hasMetWorkoutCompletionRequirement', () => {
  it('requires 80% of dynamic exercise repetitions', () => {
    expect(hasMetRequirement({ currentRepCount: 7 })).toBe(false);
    expect(hasMetRequirement({ currentRepCount: 8 })).toBe(true);
  });

  it('includes previously completed dynamic sets', () => {
    const completedSets = [
      { repCount: 10, averageScore: 80, durationSeconds: 30, scoreHistory: [80] },
      { repCount: 10, averageScore: 82, durationSeconds: 30, scoreHistory: [82] },
    ];

    expect(hasMetRequirement({ completedSets, currentRepCount: 3, totalSets: 3 })).toBe(false);
    expect(hasMetRequirement({ completedSets, currentRepCount: 4, totalSets: 3 })).toBe(true);
  });

  it('requires 80% of static exercise hold time', () => {
    expect(hasMetRequirement({ isStatic: true, currentHoldSeconds: 23 })).toBe(false);
    expect(hasMetRequirement({ isStatic: true, currentHoldSeconds: 24 })).toBe(true);
  });

  it('includes previously completed static sets', () => {
    const completedSets = [
      {
        repCount: 0,
        averageScore: 80,
        durationSeconds: HOLD_DURATION,
        scoreHistory: [80],
        holdSeconds: HOLD_DURATION,
      },
    ];

    expect(
      hasMetRequirement({ isStatic: true, completedSets, currentHoldSeconds: 17, totalSets: 2 })
    ).toBe(false);
    expect(
      hasMetRequirement({ isStatic: true, completedSets, currentHoldSeconds: 18, totalSets: 2 })
    ).toBe(true);
  });
});
