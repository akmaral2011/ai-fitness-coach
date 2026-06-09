import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FavoriteExercisesStore = {
  favoriteIds: string[];
  toggleFavorite: (exerciseId: string) => void;
  clearFavorites: () => void;
};

export const useFavoriteExercisesStore = create<FavoriteExercisesStore>()(
  persist(
    set => ({
      favoriteIds: [],

      toggleFavorite: exerciseId =>
        set(state => ({
          favoriteIds: state.favoriteIds.includes(exerciseId)
            ? state.favoriteIds.filter(id => id !== exerciseId)
            : [...state.favoriteIds, exerciseId],
        })),

      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    {
      name: 'favorite-exercises',
    }
  )
);
