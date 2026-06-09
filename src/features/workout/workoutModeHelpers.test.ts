import { describe, expect, it } from 'vitest';

import { HOLD_DURATION, hasCompletedWorkoutActivity } from '@/features/workout/workoutModeHelpers';

describe('hasCompletedWorkoutActivity', () => {
  it('does not count a dynamic workout without repetitions', () => {
    expect(hasCompletedWorkoutActivity(false, 0, 0)).toBe(false);
  });

  it('counts a dynamic workout after a repetition', () => {
    expect(hasCompletedWorkoutActivity(false, 1, 0)).toBe(true);
  });

  it('only counts a static workout after the full hold duration', () => {
    expect(hasCompletedWorkoutActivity(true, 0, HOLD_DURATION - 1)).toBe(false);
    expect(hasCompletedWorkoutActivity(true, 0, HOLD_DURATION)).toBe(true);
  });
});
