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

    store.enroll('foundation-4w');
    store.enroll('foundation-4w');

    expect(useProgramStore.getState().enrollments).toEqual([
      {
        programId: 'foundation-4w',
        startedAt: '2026-05-18T12:00:00.000Z',
        completedDayIds: [],
      },
    ]);
  });

  it('marks a program day complete only once', () => {
    const store = useProgramStore.getState();

    store.enroll('foundation-4w');
    store.markDayComplete('foundation-4w', 'w1d1');
    store.markDayComplete('foundation-4w', 'w1d1');

    expect(useProgramStore.getState().isDayComplete('foundation-4w', 'w1d1')).toBe(true);
    expect(useProgramStore.getState().getCompletedCount('foundation-4w')).toBe(1);
  });

  it('does not complete program days out of order', () => {
    const store = useProgramStore.getState();

    store.enroll('foundation-4w');
    store.markDayComplete('foundation-4w', 'w1d3');

    expect(useProgramStore.getState().isDayComplete('foundation-4w', 'w1d3')).toBe(false);
    expect(useProgramStore.getState().getCompletedCount('foundation-4w')).toBe(0);
  });

  it('normalizes stale out-of-order progress from storage or backend', () => {
    const store = useProgramStore.getState();

    store.setEnrollment({
      programId: 'foundation-4w',
      startedAt: '2026-05-18T12:00:00.000Z',
      completedDayIds: ['w1d3'],
    });

    expect(useProgramStore.getState().isDayComplete('foundation-4w', 'w1d3')).toBe(false);
    expect(useProgramStore.getState().getCompletedCount('foundation-4w')).toBe(0);
  });

  it('clears enrollments for account switch reset', () => {
    const store = useProgramStore.getState();

    store.enroll('foundation-4w');
    store.markDayComplete('foundation-4w', 'w1d1');
    store.clearEnrollments();

    expect(useProgramStore.getState().enrollments).toEqual([]);
  });
});
