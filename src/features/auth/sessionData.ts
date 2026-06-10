import { useFavoriteExercisesStore } from '@/features/exercises/useFavoriteExercisesStore';
import { useLearnStore } from '@/features/learn/learnStore';
import { useAchievementStore } from '@/features/profile/achievementStore';
import { useProfileStore } from '@/features/profile/profileStore';
import { useProgramStore } from '@/features/programs/programStore';
import { useProgramWorkoutSessionStore } from '@/features/programs/programWorkoutSessionStore';
import { useProgressStore } from '@/features/progress/progressStore';
import { useWorkoutStore } from '@/features/workout/workoutStore';
import { useWorkoutSyncStore } from '@/features/workout/workoutSyncStore';

export function clearSessionData() {
  useProfileStore.getState().clearProfile();
  useProgressStore.getState().clearSessions();
  useProgramStore.getState().clearEnrollments();
  useLearnStore.getState().setCompletedIds([]);
  useAchievementStore.getState().clearAchievements();
  useWorkoutStore.getState().resetWorkout();
  useFavoriteExercisesStore.getState().clearFavorites();
  useProgramWorkoutSessionStore.getState().clearAllSessions();
  useWorkoutSyncStore.getState().clearQueue();
}
