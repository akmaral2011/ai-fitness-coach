import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AchievementStore = {
  unlockedIds: string[];
  setUnlockedIds: (ids: string[]) => void;
  addUnlockedId: (id: string) => void;
  clearAchievements: () => void;
};

export const useAchievementStore = create<AchievementStore>()(
  persist(
    set => ({
      unlockedIds: [],
      setUnlockedIds: ids => set({ unlockedIds: ids }),
      addUnlockedId: id =>
        set(state => ({
          unlockedIds: state.unlockedIds.includes(id)
            ? state.unlockedIds
            : [...state.unlockedIds, id],
        })),
      clearAchievements: () => set({ unlockedIds: [] }),
    }),
    { name: 'profile-achievements' }
  )
);
