import { ExerciseCategory, ExerciseDifficulty } from '@prisma/client';

export const categoryMap = {
  strength: ExerciseCategory.STRENGTH,
  cardio: ExerciseCategory.CARDIO,
  mobility: ExerciseCategory.MOBILITY,
  hiit: ExerciseCategory.HIIT,
} as const;

export const difficultyMap = {
  beginner: ExerciseDifficulty.BEGINNER,
  intermediate: ExerciseDifficulty.INTERMEDIATE,
  advanced: ExerciseDifficulty.ADVANCED,
} as const;

export function apiCategory(category: ExerciseCategory) {
  const entry = Object.entries(categoryMap).find(([, value]) => value === category);
  return entry?.[0] ?? 'strength';
}

export function apiDifficulty(difficulty: ExerciseDifficulty) {
  const entry = Object.entries(difficultyMap).find(([, value]) => value === difficulty);
  return entry?.[0] ?? 'beginner';
}
