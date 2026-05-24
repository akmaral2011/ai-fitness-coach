import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
            enrollment,
            ...state.enrollments.filter(e => e.programId !== enrollment.programId),
          ],
        })),
      setEnrollments: enrollments => set({ enrollments }),

      unenroll: programId =>
        set(state => ({
          enrollments: state.enrollments.filter(e => e.programId !== programId),
        })),

      clearEnrollments: () => set({ enrollments: [] }),

      markDayComplete: (programId, dayId) =>
        set(state => ({
          enrollments: state.enrollments.map(e =>
            e.programId === programId && !e.completedDayIds.includes(dayId)
              ? { ...e, completedDayIds: [...e.completedDayIds, dayId] }
              : e
          ),
        })),

      getEnrollment: programId => get().enrollments.find(e => e.programId === programId),

      isDayComplete: (programId, dayId) =>
        get()
          .enrollments.find(e => e.programId === programId)
          ?.completedDayIds.includes(dayId) ?? false,

      getCompletedCount: programId =>
        get().enrollments.find(e => e.programId === programId)?.completedDayIds.length ?? 0,
    }),
    { name: 'program-enrollments' }
  )
);
