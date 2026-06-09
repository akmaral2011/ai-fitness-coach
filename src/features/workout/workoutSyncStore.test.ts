import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CompletedSession } from '@/features/workout/types';
import {
  type WorkoutSyncPayload,
  syncPendingWorkouts,
  useWorkoutSyncStore,
} from '@/features/workout/workoutSyncStore';

function makeSession(overrides: Partial<CompletedSession> = {}): CompletedSession {
  return {
    id: overrides.id ?? 'session-1',
    exerciseId: overrides.exerciseId ?? 'squat',
    date: overrides.date ?? '2026-06-03T07:00:00.000Z',
    repCount: overrides.repCount ?? 12,
    averageScore: overrides.averageScore ?? 88,
    durationSeconds: overrides.durationSeconds ?? 75,
    scoreHistory: overrides.scoreHistory ?? [85, 88, 90],
  };
}

describe('workoutSyncStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useWorkoutSyncStore.getState().clearQueue();
    Object.defineProperty(globalThis.navigator, 'onLine', {
      value: true,
      configurable: true,
    });
  });

  it('queues completed workouts as pending sync items', () => {
    const item = useWorkoutSyncStore.getState().enqueueWorkout(makeSession());

    expect(item.status).toBe('pending');
    expect(item.payload).toMatchObject({
      clientMutationId: 'session-1',
      exerciseSlug: 'squat',
      repCount: 12,
      averageScore: 88,
    });
    expect(useWorkoutSyncStore.getState().getCounts()).toEqual({
      pending: 1,
      failed: 0,
      synced: 0,
    });
  });

  it('does not create duplicates for the same workout session', () => {
    const store = useWorkoutSyncStore.getState();

    store.enqueueWorkout(makeSession({ id: 'same-session', repCount: 8 }));
    store.enqueueWorkout(makeSession({ id: 'same-session', repCount: 10 }));

    expect(useWorkoutSyncStore.getState().items).toHaveLength(1);
    expect(useWorkoutSyncStore.getState().items[0].payload.repCount).toBe(10);
  });

  it('marks failed workouts and retries them when sync succeeds', async () => {
    useWorkoutSyncStore.getState().enqueueWorkout(makeSession());
    const failingRequest = vi.fn().mockRejectedValue(new Error('Backend unavailable'));

    await syncPendingWorkouts('token', failingRequest);

    expect(useWorkoutSyncStore.getState().items[0]).toMatchObject({
      status: 'failed',
      attempts: 1,
      lastError: 'Backend unavailable',
    });

    const successfulRequest = vi.fn(
      async (_path: string, options?: RequestInit & { token?: string | null }) => {
        const payload = JSON.parse(String(options?.body)) as WorkoutSyncPayload;
        return { workout: { id: payload.clientMutationId } };
      }
    );

    await syncPendingWorkouts('token', successfulRequest);

    expect(successfulRequest).toHaveBeenCalledTimes(1);
    expect(useWorkoutSyncStore.getState().items[0].status).toBe('synced');
  });

  it('stops retrying workouts after three failed sync attempts', async () => {
    useWorkoutSyncStore.getState().enqueueWorkout(makeSession());
    const failingRequest = vi.fn().mockRejectedValue(new Error('Backend unavailable'));

    await syncPendingWorkouts('token', failingRequest);
    await syncPendingWorkouts('token', failingRequest);
    await syncPendingWorkouts('token', failingRequest);
    await syncPendingWorkouts('token', failingRequest);

    expect(failingRequest).toHaveBeenCalledTimes(3);
    expect(useWorkoutSyncStore.getState().items[0]).toMatchObject({
      status: 'failed',
      attempts: 3,
    });
  });

  it('allows failed workouts to be retried manually after reaching the attempt limit', async () => {
    useWorkoutSyncStore.getState().enqueueWorkout(makeSession());
    const failingRequest = vi.fn().mockRejectedValue(new Error('Backend unavailable'));

    await syncPendingWorkouts('token', failingRequest);
    await syncPendingWorkouts('token', failingRequest);
    await syncPendingWorkouts('token', failingRequest);

    useWorkoutSyncStore.getState().retryFailed();
    const successfulRequest = vi.fn().mockResolvedValue({ workout: { id: 'session-1' } });
    await syncPendingWorkouts('token', successfulRequest);

    expect(successfulRequest).toHaveBeenCalledTimes(1);
    expect(useWorkoutSyncStore.getState().items[0]).toMatchObject({
      status: 'synced',
      attempts: 0,
    });
  });

  it('waits while the browser is offline', async () => {
    useWorkoutSyncStore.getState().enqueueWorkout(makeSession());
    Object.defineProperty(globalThis.navigator, 'onLine', {
      value: false,
      configurable: true,
    });
    const request = vi.fn();

    await syncPendingWorkouts('token', request);

    expect(request).not.toHaveBeenCalled();
    expect(useWorkoutSyncStore.getState().items[0].status).toBe('pending');
  });
});
