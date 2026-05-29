import type { Exercise, ExerciseRule } from '@prisma/client';

import { apiCategory, apiDifficulty } from './exercise.maps.js';

export function publicExercise(exercise: Exercise) {
  return {
    id: exercise.id,
    slug: exercise.slug,
    name: exercise.name,
    description: exercise.description,
    category: apiCategory(exercise.category),
    difficulty: apiDifficulty(exercise.difficulty),
    primaryMuscles: exercise.primaryMuscles,
    secondaryMuscles: exercise.secondaryMuscles,
    equipment: exercise.equipment,
    sets: exercise.sets,
    reps: exercise.reps,
    estimatedSeconds: exercise.estimatedSeconds,
    videoUrl: exercise.videoUrl,
    thumbnailUrl: exercise.thumbnailUrl,
    rulesConfig: exercise.rulesConfig,
    commonErrors: exercise.commonErrors,
    modifications: exercise.modifications,
  };
}

export function publicExerciseRule(rule: ExerciseRule) {
  return {
    id: rule.id,
    code: rule.code,
    phase: rule.phase,
    joint: rule.joint,
    landmarks: rule.landmarks,
    angleMin: rule.angleMin,
    angleMax: rule.angleMax,
    severity: rule.severity,
    feedback: rule.feedback,
    order: rule.order,
  };
}
