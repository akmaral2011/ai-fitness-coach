import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CompletedSession } from '@/features/workout/types';

type SessionPayload = Omit<CompletedSession, 'id' | 'date'> & {
  id?: string;
  date?: string;
};

type ProgressSummary = {
  totalSessions: number;
  totalReps: number;
  totalWorkoutSeconds: number;
  averageScore: number;
  currentStreak: number;
};

type ProgressState = {
  sessions: CompletedSession[];
  addSession: (session: SessionPayload | CompletedSession) => CompletedSession;
  removeSession: (sessionId: string) => void;
  clearSessions: () => void;
  getSummary: () => ProgressSummary;
  getRecentSessions: (limit?: number) => CompletedSession[];
  getSessionsByExercise: (exerciseId: string) => CompletedSession[];
  getExercisePersonalBest: (exerciseId: string) => CompletedSession | null;
};

function normalizeSession(session: SessionPayload | CompletedSession): CompletedSession {
  return {
    ...session,
    id: session.id ?? globalThis.crypto.randomUUID(),
    date: session.date ?? new Date().toISOString(),
  };
}

function toLocalDayKey(value: string): string {
  return new Date(value).toLocaleDateString('en-CA');
}

function calculateCurrentStreak(sessions: CompletedSession[]): number {
  if (sessions.length === 0) return 0;

  const uniqueDays = [...new Set(sessions.map(session => toLocalDayKey(session.date)))].sort(
    (a, b) => b.localeCompare(a)
  );

  const todayKey = toLocalDayKey(new Date().toISOString());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toLocalDayKey(yesterday.toISOString());

  if (uniqueDays[0] !== todayKey && uniqueDays[0] !== yesterdayKey) {
    return 0;
  }

  let streak = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previousDate = new Date(uniqueDays[index - 1]);
    previousDate.setDate(previousDate.getDate() - 1);
    const expectedKey = toLocalDayKey(previousDate.toISOString());

    if (uniqueDays[index] !== expectedKey) break;
    streak += 1;
  }

  return streak;
}

function calculateSummary(sessions: CompletedSession[]): ProgressSummary {
  const totalSessions = sessions.length;
  const totalReps = sessions.reduce((sum, session) => sum + session.repCount, 0);
  const totalWorkoutSeconds = sessions.reduce((sum, session) => sum + session.durationSeconds, 0);
  const averageScore =
    totalSessions === 0
      ? 0
      : Math.round(
          sessions.reduce((sum, session) => sum + session.averageScore, 0) / totalSessions
        );

  return {
    totalSessions,
    totalReps,
    totalWorkoutSeconds,
    averageScore,
    currentStreak: calculateCurrentStreak(sessions),
  };
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      sessions: [],
      addSession: session => {
        const nextSession = normalizeSession(session);
        set(state => ({
          sessions: [nextSession, ...state.sessions].sort((a, b) => b.date.localeCompare(a.date)),
        }));
        return nextSession;
      },
      removeSession: sessionId =>
        set(state => ({
          sessions: state.sessions.filter(session => session.id !== sessionId),
        })),
      clearSessions: () => set({ sessions: [] }),
      getSummary: () => calculateSummary(get().sessions),
      getRecentSessions: (limit = 7) => get().sessions.slice(0, limit),
      getSessionsByExercise: exerciseId =>
        get().sessions.filter(session => session.exerciseId === exerciseId),
      getExercisePersonalBest: exerciseId => {
        const sessions = get().sessions.filter(session => session.exerciseId === exerciseId);
        if (sessions.length === 0) return null;

        return [...sessions].sort((a, b) => {
          if (b.averageScore !== a.averageScore) {
            return b.averageScore - a.averageScore;
          }

          if (b.repCount !== a.repCount) {
            return b.repCount - a.repCount;
          }

          return a.durationSeconds - b.durationSeconds;
        })[0];
      },
    }),
    {
      name: 'fitness-progress',
    }
  )
);
