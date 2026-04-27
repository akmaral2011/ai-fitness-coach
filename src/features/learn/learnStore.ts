import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LearnStore = {
  completedIds: string[];
  markComplete: (id: string) => void;
};

export const useLearnStore = create<LearnStore>()(
  persist(
    set => ({
      completedIds: [],
      markComplete: id =>
        set(s => ({
          completedIds: s.completedIds.includes(id) ? s.completedIds : [...s.completedIds, id],
        })),
    }),
    { name: 'learn-progress' }
  )
);
