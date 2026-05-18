import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useProgramStore } from '@/features/programs/programStore';

describe('programStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useProgramStore.getState().clearEnrollments();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-18T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('enrolls in a program only once', () => {
    const store = useProgramStore.getState();

    store.enroll('beginner-strength');
    store.enroll('beginner-strength');

    expect(useProgramStore.getState().enrollments).toEqual([
      {
        programId: 'beginner-strength',
        startedAt: '2026-05-18T12:00:00.000Z',
        completedDayIds: [],
      },
    ]);
  });

  it('marks a program day complete only once', () => {
    const store = useProgramStore.getState();

    store.enroll('beginner-strength');
    store.markDayComplete('beginner-strength', 'week-1-day-1');
    store.markDayComplete('beginner-strength', 'week-1-day-1');

    expect(useProgramStore.getState().isDayComplete('beginner-strength', 'week-1-day-1')).toBe(
      true
    );
    expect(useProgramStore.getState().getCompletedCount('beginner-strength')).toBe(1);
  });

  it('clears enrollments for demo login reset', () => {
    const store = useProgramStore.getState();

    store.enroll('beginner-strength');
    store.markDayComplete('beginner-strength', 'week-1-day-1');
    store.clearEnrollments();

    expect(useProgramStore.getState().enrollments).toEqual([]);
  });
});
