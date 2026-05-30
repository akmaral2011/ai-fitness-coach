import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { PROGRAMS } from '@/features/programs/data';
import { getProgramProgressCount, getWorkoutDays } from '@/features/programs/programProgress';

export type ProgramEnrollment = {
  programId: string;
  startedAt: string;
  completedDayIds: string[];
};

type ProgramStore = {
  enrollments: ProgramEnrollment[];
  enroll: (programId: string) => void;
  setEnrollment: (enrollment: ProgramEnrollment) => void;
  setEnrollments: (enrollments: ProgramEnrollment[]) => void;
  unenroll: (programId: string) => void;
  clearEnrollments: () => void;
  markDayComplete: (programId: string, dayId: string) => void;
  getEnrollment: (programId: string) => ProgramEnrollment | undefined;
  isDayComplete: (programId: string, dayId: string) => boolean;
  getCompletedCount: (programId: string) => number;
};

function getWorkoutDayOrder(programId: string) {
  const program = PROGRAMS.find(item => item.id === programId);
  return program ? getWorkoutDays(program).map(day => day.id) : undefined;
}

function normalizeCompletedDayIds(programId: string, completedDayIds: string[]) {
  const workoutDayOrder = getWorkoutDayOrder(programId);
  if (!workoutDayOrder) return completedDayIds;

  const completed = new Set(completedDayIds);
  const normalized: string[] = [];

  for (const dayId of workoutDayOrder) {
    if (!completed.has(dayId)) break;
    normalized.push(dayId);
  }

  return normalized;
}

function normalizeEnrollment(enrollment: ProgramEnrollment): ProgramEnrollment {
  return {
    ...enrollment,
    completedDayIds: normalizeCompletedDayIds(enrollment.programId, enrollment.completedDayIds),
  };
}

export const useProgramStore = create<ProgramStore>()(
  persist(
    (set, get) => ({
      enrollments: [],

      enroll: programId => {
        const existing = get().enrollments.find(e => e.programId === programId);
        if (existing) return;
        set(state => ({
          enrollments: [
            ...state.enrollments,
            { programId, startedAt: new Date().toISOString(), completedDayIds: [] },
          ],
        }));
      },
      setEnrollment: enrollment =>
        set(state => ({
          enrollments: [
            normalizeEnrollment(enrollment),
            ...state.enrollments.filter(e => e.programId !== enrollment.programId),
          ],
        })),
      setEnrollments: enrollments => set({ enrollments: enrollments.map(normalizeEnrollment) }),

      unenroll: programId =>
        set(state => ({
          enrollments: state.enrollments.filter(e => e.programId !== programId),
        })),

      clearEnrollments: () => set({ enrollments: [] }),

      markDayComplete: (programId, dayId) => {
        const workoutDayOrder = getWorkoutDayOrder(programId);

        set(state => ({
          enrollments: state.enrollments.map(enrollment => {
            if (enrollment.programId !== programId || enrollment.completedDayIds.includes(dayId)) {
              return enrollment;
            }

            if (!workoutDayOrder) {
              return { ...enrollment, completedDayIds: [...enrollment.completedDayIds, dayId] };
            }

            const normalizedCompletedDayIds = normalizeCompletedDayIds(
              programId,
              enrollment.completedDayIds
            );
            const nextDayId =
              workoutDayOrder.find(item => !normalizedCompletedDayIds.includes(item)) ?? null;

            if (nextDayId !== dayId) {
              return { ...enrollment, completedDayIds: normalizedCompletedDayIds };
            }

            return {
              ...enrollment,
              completedDayIds: [...normalizedCompletedDayIds, dayId],
            };
          }),
        }));
      },

      getEnrollment: programId => {
        const enrollment = get().enrollments.find(e => e.programId === programId);
        return enrollment ? normalizeEnrollment(enrollment) : undefined;
      },

      isDayComplete: (programId, dayId) =>
        normalizeCompletedDayIds(
          programId,
          get().enrollments.find(e => e.programId === programId)?.completedDayIds ?? []
        ).includes(dayId),

      getCompletedCount: programId =>
        getProgramProgressCount(
          programId,
          get().enrollments.find(e => e.programId === programId)?.completedDayIds ?? []
        ),
    }),
    { name: 'program-enrollments' }
  )
);
