import { describe, expect, it } from 'vitest';

import {
  EXERCISES,
  POPULAR_EXERCISE_ORDER,
  sortExercisesByPopularity,
} from '@/features/exercises/data';
import type { Exercise } from '@/features/exercises/types';
import { LESSONS } from '@/features/learn/data';

function findExercise(id: string): Exercise {
  const exercise = EXERCISES.find(item => item.id === id);
  if (!exercise) throw new Error(`Missing exercise fixture: ${id}`);
  return exercise;
}

describe('exercise catalog', () => {
  it('keeps every difficulty filter populated', () => {
    const difficulties = new Set(EXERCISES.map(exercise => exercise.difficulty));

    expect(difficulties).toEqual(new Set(['beginner', 'intermediate', 'advanced']));
  });

  it('keeps advanced exercises available for the advanced filter', () => {
    const advancedExerciseIds = EXERCISES.filter(
      exercise => exercise.difficulty === 'advanced'
    ).map(exercise => exercise.id);

    expect(new Set(advancedExerciseIds)).toEqual(
      new Set(['deadlift', 'mountain-climber', 'burpee'])
    );
  });

  it('sorts exercises by curated popularity order', () => {
    const unordered = [findExercise('burpee'), findExercise('squat'), findExercise('bicep-curl')];

    expect(sortExercisesByPopularity(unordered).map(exercise => exercise.id)).toEqual([
      'squat',
      'bicep-curl',
      'burpee',
    ]);
  });

  it('has a video lesson for every exercise', () => {
    const videoExerciseIds = new Set(
      LESSONS.filter(lesson => lesson.type === 'video' && lesson.linkedExerciseId).map(
        lesson => lesson.linkedExerciseId
      )
    );

    expect(EXERCISES.map(exercise => exercise.id)).toEqual(
      expect.arrayContaining(Array.from(videoExerciseIds))
    );
    expect(videoExerciseIds.size).toBeGreaterThanOrEqual(EXERCISES.length);
  });

  it('keeps the popularity list in sync with the exercise catalog', () => {
    expect(POPULAR_EXERCISE_ORDER).toHaveLength(EXERCISES.length);
    expect(new Set(POPULAR_EXERCISE_ORDER)).toEqual(
      new Set(EXERCISES.map(exercise => exercise.id))
    );
  });
});
