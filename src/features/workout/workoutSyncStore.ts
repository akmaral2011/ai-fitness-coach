import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CompletedSession } from '@/features/workout/types';
import { apiRequest } from '@/lib/api';

const MAX_SYNC_ATTEMPTS = 3;

export type WorkoutSyncStatus = 'pending' | 'failed' | 'synced';

export type WorkoutSyncPayload = {
  clientMutationId: string;
  exerciseSlug: string;
  repCount: number;
  averageScore: number;
  durationSeconds: number;
  scoreHistory: number[];
  completedAt: string;
};

export type WorkoutSyncItem = {
  clientMutationId: string;
  payload: WorkoutSyncPayload;
  status: WorkoutSyncStatus;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
  syncedAt?: string;
};

type WorkoutSyncState = {
  items: WorkoutSyncItem[];
  enqueueWorkout: (session: CompletedSession) => WorkoutSyncItem;
  markPending: (clientMutationId: string) => void;
  markSynced: (clientMutationId: string) => void;
  markFailed: (clientMutationId: string, error: unknown) => void;
  clearSynced: () => void;
  clearQueue: () => void;
  getCounts: () => Record<WorkoutSyncStatus, number>;
};

type RequestFn = (
  path: string,
  options?: RequestInit & { token?: string | null }
) => Promise<unknown>;

export function buildWorkoutSyncPayload(session: CompletedSession): WorkoutSyncPayload {
  return {
    clientMutationId: session.id,
    exerciseSlug: session.exerciseId,
    repCount: session.repCount,
    averageScore: session.averageScore,
    durationSeconds: session.durationSeconds,
    scoreHistory: session.scoreHistory,
    completedAt: session.date,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Sync failed';
}

function now() {
  return new Date().toISOString();
}

export const useWorkoutSyncStore = create<WorkoutSyncState>()(
  persist(
    (set, get) => ({
      items: [],
      enqueueWorkout: session => {
        const payload = buildWorkoutSyncPayload(session);
        const existing = get().items.find(
          item => item.clientMutationId === payload.clientMutationId
        );

        if (existing) {
          if (existing.status === 'synced') return existing;

          const updated: WorkoutSyncItem = {
            ...existing,
            payload,
            status: 'pending',
            updatedAt: now(),
            lastError: undefined,
          };
          set(state => ({
            items: state.items.map(item =>
              item.clientMutationId === updated.clientMutationId ? updated : item
            ),
          }));
          return updated;
        }

        const item: WorkoutSyncItem = {
          clientMutationId: payload.clientMutationId,
          payload,
          status: 'pending',
          attempts: 0,
          createdAt: now(),
          updatedAt: now(),
        };

        set(state => ({ items: [item, ...state.items] }));
        return item;
      },
      markPending: clientMutationId =>
        set(state => ({
          items: state.items.map(item =>
            item.clientMutationId === clientMutationId
              ? { ...item, status: 'pending', updatedAt: now(), lastError: undefined }
              : item
          ),
        })),
      markSynced: clientMutationId =>
        set(state => ({
          items: state.items.map(item =>
            item.clientMutationId === clientMutationId
              ? {
                  ...item,
                  status: 'synced',
                  updatedAt: now(),
                  syncedAt: now(),
                  lastError: undefined,
                }
              : item
          ),
        })),
      markFailed: (clientMutationId, error) =>
        set(state => ({
          items: state.items.map(item =>
            item.clientMutationId === clientMutationId
              ? {
                  ...item,
                  status: 'failed',
                  attempts: (item.attempts ?? 0) + 1,
                  updatedAt: now(),
                  lastError: errorMessage(error),
                }
              : item
          ),
        })),
      clearSynced: () =>
        set(state => ({
          items: state.items.filter(item => item.status !== 'synced'),
        })),
      clearQueue: () => set({ items: [] }),
      getCounts: () =>
        get().items.reduce<Record<WorkoutSyncStatus, number>>(
          (counts, item) => {
            counts[item.status] += 1;
            return counts;
          },
          { pending: 0, failed: 0, synced: 0 }
        ),
    }),
    {
      name: 'workout-sync-queue',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export async function syncPendingWorkouts(token: string, request: RequestFn = apiRequest) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  const items = useWorkoutSyncStore
    .getState()
    .items.filter(
      item =>
        (item.status === 'pending' || item.status === 'failed') &&
        (item.attempts ?? 0) < MAX_SYNC_ATTEMPTS
    );

  for (const item of items) {
    try {
      useWorkoutSyncStore.getState().markPending(item.clientMutationId);
      await request('/api/workouts', {
        method: 'POST',
        token,
        body: JSON.stringify(item.payload),
      });
      useWorkoutSyncStore.getState().markSynced(item.clientMutationId);
    } catch (error) {
      useWorkoutSyncStore.getState().markFailed(item.clientMutationId, error);
    }
  }
}
