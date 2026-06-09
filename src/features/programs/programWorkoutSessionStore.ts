import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ProgramWorkoutSession = {
  completedExerciseIds: string[];
  restUntil: number | null;
  startedAt: number;
};

type ProgramWorkoutSessionStore = {
  sessions: Record<string, ProgramWorkoutSession>;
  completeExercise: (
    programId: string,
    dayId: string,
    exerciseId: string,
    restSeconds: number
  ) => void;
  resetSession: (programId: string, dayId: string) => void;
  skipRest: (programId: string, dayId: string) => void;
  clearProgramSessions: (programId: string) => void;
  getSession: (programId: string, dayId: string) => ProgramWorkoutSession;
};

function createEmptySession(): ProgramWorkoutSession {
  return {
    completedExerciseIds: [],
    restUntil: null,
    startedAt: Date.now(),
  };
}

const emptySession: ProgramWorkoutSession = {
  completedExerciseIds: [],
  restUntil: null,
  startedAt: 0,
};

function sessionKey(programId: string, dayId: string) {
  return `${programId}:${dayId}`;
}

export const useProgramWorkoutSessionStore = create<ProgramWorkoutSessionStore>()(
  persist(
    (set, get) => ({
      sessions: {},

      completeExercise: (programId, dayId, exerciseId, restSeconds) =>
        set(state => {
          const key = sessionKey(programId, dayId);
          const storedSession = state.sessions[key];
          const current = storedSession?.startedAt ? storedSession : createEmptySession();

          if (current.completedExerciseIds.includes(exerciseId)) {
            return state;
          }

          return {
            sessions: {
              ...state.sessions,
              [key]: {
                completedExerciseIds: [...current.completedExerciseIds, exerciseId],
                restUntil: Date.now() + restSeconds * 1000,
                startedAt: current.startedAt,
              },
            },
          };
        }),

      resetSession: (programId, dayId) =>
        set(state => {
          const keyToRemove = sessionKey(programId, dayId);
          return {
            sessions: Object.fromEntries(
              Object.entries(state.sessions).filter(([key]) => key !== keyToRemove)
            ),
          };
        }),

      skipRest: (programId, dayId) =>
        set(state => {
          const key = sessionKey(programId, dayId);
          const current = state.sessions[key];

          if (!current) return state;

          return {
            sessions: {
              ...state.sessions,
              [key]: {
                ...current,
                restUntil: null,
              },
            },
          };
        }),

      clearProgramSessions: programId =>
        set(state => ({
          sessions: Object.fromEntries(
            Object.entries(state.sessions).filter(([key]) => !key.startsWith(`${programId}:`))
          ),
        })),

      getSession: (programId, dayId) =>
        get().sessions[sessionKey(programId, dayId)]?.startedAt
          ? get().sessions[sessionKey(programId, dayId)]
          : emptySession,
    }),
    { name: 'program-workout-sessions' }
  )
);
