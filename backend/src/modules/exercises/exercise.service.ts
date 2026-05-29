import { prisma } from '../../lib/prisma.js';
import { categoryMap, difficultyMap } from './exercise.maps.js';
import type { ListExercisesQuery } from './exercise.schemas.js';

export async function listExercises(query: ListExercisesQuery) {
  return prisma.exercise.findMany({
    where: {
      category: query.category ? categoryMap[query.category] : undefined,
      difficulty: query.difficulty ? difficultyMap[query.difficulty] : undefined,
      OR: query.search
        ? [
            { name: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
      primaryMuscles: query.muscle ? { has: query.muscle } : undefined,
    },
    orderBy: [{ difficulty: 'asc' }, { name: 'asc' }],
  });
}

export async function findExerciseBySlug(slug: string) {
  return prisma.exercise.findUnique({
    where: { slug },
  });
}

export async function findExerciseRulesBySlug(slug: string) {
  return prisma.exercise.findUnique({
    where: { slug },
    include: {
      rules: {
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });
}
