import { useEffect, useMemo, useState } from 'react';

import { EXERCISES } from '@/features/exercises/data';
import type { Category, Difficulty, Exercise } from '@/features/exercises/types';
import { apiRequest } from '@/lib/api';

type ApiExercise = {
  slug: string;
  category: Category;
  difficulty: Difficulty;
  primaryMuscles: Exercise['primaryMuscles'];
  secondaryMuscles: Exercise['secondaryMuscles'];
  sets: number;
  reps: number;
  estimatedSeconds: number;
};

function mergeExercise(apiExercise: ApiExercise): Exercise | null {
  const local = EXERCISES.find(
    item => item.slug === apiExercise.slug || item.id === apiExercise.slug
  );
  if (!local) return null;

  return {
    ...local,
    category: apiExercise.category,
    difficulty: apiExercise.difficulty,
    primaryMuscles: apiExercise.primaryMuscles,
    secondaryMuscles: apiExercise.secondaryMuscles,
    sets: apiExercise.sets,
    reps: apiExercise.reps,
    estimatedDuration: apiExercise.estimatedSeconds,
  };
}

export function useExercises() {
  const [remoteExercises, setRemoteExercises] = useState<Exercise[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadExercises() {
      try {
        const response = await apiRequest<{ exercises: ApiExercise[] }>('/api/exercises');
        if (cancelled) return;

        const merged = response.exercises
          .map(mergeExercise)
          .filter((exercise): exercise is Exercise => exercise !== null);
        setRemoteExercises(merged.length > 0 ? merged : null);
      } catch (error) {
        console.error('Failed to load exercises from backend', error);
        if (!cancelled) setRemoteExercises(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadExercises();

    return () => {
      cancelled = true;
    };
  }, []);

  const exercises = useMemo(() => remoteExercises ?? EXERCISES, [remoteExercises]);

  return {
    exercises,
    loading,
    usingRemoteData: remoteExercises !== null,
  };
}
