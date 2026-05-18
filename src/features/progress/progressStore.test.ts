import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useProgressStore } from '@/features/progress/progressStore';
import type { CompletedSession } from '@/features/workout/types';

function makeSession(overrides: Partial<CompletedSession> = {}): CompletedSession {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    exerciseId: overrides.exerciseId ?? 'squat',
    date: overrides.date ?? new Date().toISOString(),
    repCount: overrides.repCount ?? 10,
    averageScore: overrides.averageScore ?? 80,
    durationSeconds: overrides.durationSeconds ?? 60,
    scoreHistory: overrides.scoreHistory ?? [80],
  };
}

describe('progressStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useProgressStore.getState().clearSessions();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-18T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates progress summary and current streak', () => {
    const store = useProgressStore.getState();

    store.addSession(
      makeSession({
        id: 'today',
        date: '2026-05-18T12:00:00.000Z',
        repCount: 12,
        averageScore: 90,
        durationSeconds: 120,
      })
    );
    store.addSession(
      makeSession({
        id: 'yesterday',
        date: '2026-05-17T12:00:00.000Z',
        repCount: 8,
        averageScore: 80,
        durationSeconds: 60,
      })
    );
    store.addSession(
      makeSession({
        id: 'two-days-ago',
        date: '2026-05-16T12:00:00.000Z',
        repCount: 10,
        averageScore: 70,
        durationSeconds: 90,
      })
    );

    expect(useProgressStore.getState().getSummary()).toEqual({
      totalSessions: 3,
      totalReps: 30,
      totalWorkoutSeconds: 270,
      averageScore: 80,
      currentStreak: 3,
    });
  });

  it('keeps recent sessions sorted newest first', () => {
    const store = useProgressStore.getState();

    store.addSession(makeSession({ id: 'older', date: '2026-05-16T12:00:00.000Z' }));
    store.addSession(makeSession({ id: 'newer', date: '2026-05-18T12:00:00.000Z' }));
    store.addSession(makeSession({ id: 'middle', date: '2026-05-17T12:00:00.000Z' }));

    expect(
      useProgressStore
        .getState()
        .getRecentSessions()
        .map(session => session.id)
    ).toEqual(['newer', 'middle', 'older']);
  });

  it('selects personal best by score, reps, then shorter duration', () => {
    const store = useProgressStore.getState();

    store.addSession(
      makeSession({
        id: 'lower-score',
        exerciseId: 'squat',
        averageScore: 80,
        repCount: 20,
        durationSeconds: 30,
      })
    );
    store.addSession(
      makeSession({
        id: 'same-score-fewer-reps',
        exerciseId: 'squat',
        averageScore: 90,
        repCount: 8,
        durationSeconds: 30,
      })
    );
    store.addSession(
      makeSession({
        id: 'best',
        exerciseId: 'squat',
        averageScore: 90,
        repCount: 12,
        durationSeconds: 45,
      })
    );
    store.addSession(
      makeSession({
        id: 'same-score-reps-slower',
        exerciseId: 'squat',
        averageScore: 90,
        repCount: 12,
        durationSeconds: 90,
      })
    );

    expect(useProgressStore.getState().getExercisePersonalBest('squat')?.id).toBe('best');
  });
});
