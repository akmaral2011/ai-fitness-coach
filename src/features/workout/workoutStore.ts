import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { getExercise } from '@/features/exercises/data';
import { rollingAverage } from '@/features/workout/angles';
import type { CompletedSession, WorkoutFeedback, WorkoutState } from '@/features/workout/types';

type WorkoutPhase = WorkoutState['phase'];

type WorkoutStore = WorkoutState & {
  endedAt: number | null;
  initializeWorkout: (exerciseId: string, targetReps?: number) => void;
  startWorkout: () => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  finishWorkout: () => void;
  resetWorkout: () => void;
  resetForNewSet: () => void;
  setPhase: (phase: WorkoutPhase) => void;
  setTargetReps: (targetReps: number) => void;
  setRepCount: (repCount: number) => void;
  incrementRep: (amount?: number) => void;
  setTechniqueScore: (score: number) => void;
  pushScore: (score: number) => void;
  addFeedback: (feedback: Omit<WorkoutFeedback, 'timestamp'> & { timestamp?: number }) => void;
  clearFeedback: (ruleId?: string) => void;
  buildCompletedSession: () => CompletedSession | null;
};

const InitialWorkoutState: Pick<
  WorkoutStore,
  | 'exerciseId'
  | 'phase'
  | 'repCount'
  | 'targetReps'
  | 'techniqueScore'
  | 'scoreHistory'
  | 'feedback'
  | 'isRunning'
  | 'startedAt'
  | 'endedAt'
> = {
  exerciseId: null,
  phase: 'down',
  repCount: 0,
  targetReps: 0,
  techniqueScore: 100,
  scoreHistory: [],
  feedback: [],
  isRunning: false,
  startedAt: null,
  endedAt: null,
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function buildInitialState(
  exerciseId: string,
  targetReps?: number
): Pick<
  WorkoutStore,
  | 'exerciseId'
  | 'phase'
  | 'repCount'
  | 'targetReps'
  | 'techniqueScore'
  | 'scoreHistory'
  | 'feedback'
  | 'isRunning'
  | 'startedAt'
  | 'endedAt'
> {
  const exercise = getExercise(exerciseId);

  return {
    ...InitialWorkoutState,
    exerciseId,
    phase: exercise?.rules.some(rule => rule.phase === 'hold') ? 'hold' : 'down',
    targetReps: targetReps ?? exercise?.reps ?? 0,
  };
}

function buildSessionFromState(state: WorkoutStore): CompletedSession | null {
  if (!state.exerciseId || !state.startedAt) return null;

  const finishedAt = state.endedAt ?? Date.now();
  const durationSeconds = Math.max(1, Math.round((finishedAt - state.startedAt) / 1000));
  const averageScore = clampScore(
    state.scoreHistory.length === 0 ? state.techniqueScore : rollingAverage(state.scoreHistory)
  );

  return {
    id: globalThis.crypto.randomUUID(),
    exerciseId: state.exerciseId,
    date: new Date(finishedAt).toISOString(),
    repCount: state.repCount,
    averageScore,
    durationSeconds,
    scoreHistory: [...state.scoreHistory],
  };
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      ...InitialWorkoutState,
      initializeWorkout: (exerciseId, targetReps) => set(buildInitialState(exerciseId, targetReps)),
      startWorkout: () =>
        set(state => ({
          isRunning: true,
          startedAt: state.startedAt ?? Date.now(),
          endedAt: null,
        })),
      pauseWorkout: () => set({ isRunning: false }),
      resumeWorkout: () =>
        set(state => ({
          isRunning: true,
          startedAt: state.startedAt ?? Date.now(),
          endedAt: null,
        })),
      finishWorkout: () =>
        set(state => ({
          isRunning: false,
          endedAt: state.endedAt ?? Date.now(),
        })),
      resetWorkout: () => set(InitialWorkoutState),
      resetForNewSet: () =>
        set(state => {
          const exercise = state.exerciseId ? getExercise(state.exerciseId) : null;
          return {
            repCount: 0,
            scoreHistory: [],
            feedback: [],
            startedAt: null,
            endedAt: null,
            isRunning: false,
            phase: exercise?.rules.some(r => r.phase === 'hold') ? 'hold' : 'down',
          };
        }),
      setPhase: phase => set({ phase }),
      setTargetReps: targetReps => set({ targetReps: Math.max(0, Math.round(targetReps)) }),
      setRepCount: repCount => set({ repCount: Math.max(0, Math.round(repCount)) }),
      incrementRep: (amount = 1) =>
        set(state => ({
          repCount: Math.max(0, state.repCount + Math.round(amount)),
        })),
      setTechniqueScore: score => set({ techniqueScore: clampScore(score) }),
      pushScore: score =>
        set(state => {
          const nextHistory = [...state.scoreHistory, clampScore(score)].slice(-120);
          return {
            scoreHistory: nextHistory,
            techniqueScore: clampScore(rollingAverage(nextHistory)),
          };
        }),
      addFeedback: feedback =>
        set(state => ({
          feedback: [
            ...state.feedback.filter(item => item.ruleId !== feedback.ruleId),
            {
              ...feedback,
              timestamp: feedback.timestamp ?? Date.now(),
            },
          ].slice(-8),
        })),
      clearFeedback: ruleId =>
        set(state => ({
          feedback: ruleId ? state.feedback.filter(item => item.ruleId !== ruleId) : [],
        })),
      buildCompletedSession: () => buildSessionFromState(get()),
    }),
    {
      name: 'active-workout',
      partialize: state => ({
        exerciseId: state.exerciseId,
        phase: state.phase,
        repCount: state.repCount,
        targetReps: state.targetReps,
        techniqueScore: state.techniqueScore,
        scoreHistory: state.scoreHistory,
        isRunning: state.isRunning,
        startedAt: state.startedAt,
        endedAt: state.endedAt,
      }),
    }
  )
);
