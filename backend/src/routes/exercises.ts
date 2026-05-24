import type { FastifyInstance } from 'fastify';
import { ExerciseCategory, ExerciseDifficulty } from '@prisma/client';
import { z } from 'zod';

import { prisma } from '../lib/prisma.js';

const categoryMap = {
  strength: ExerciseCategory.STRENGTH,
  cardio: ExerciseCategory.CARDIO,
  mobility: ExerciseCategory.MOBILITY,
  hiit: ExerciseCategory.HIIT,
} as const;

const difficultyMap = {
  beginner: ExerciseDifficulty.BEGINNER,
  intermediate: ExerciseDifficulty.INTERMEDIATE,
  advanced: ExerciseDifficulty.ADVANCED,
} as const;

const listQuerySchema = z.object({
  category: z.enum(['strength', 'cardio', 'mobility', 'hiit']).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  muscle: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});

function apiCategory(category: ExerciseCategory) {
  const entry = Object.entries(categoryMap).find(([, value]) => value === category);
  return entry?.[0] ?? 'strength';
}

function apiDifficulty(difficulty: ExerciseDifficulty) {
  const entry = Object.entries(difficultyMap).find(([, value]) => value === difficulty);
  return entry?.[0] ?? 'beginner';
}

function publicExercise(exercise: Awaited<ReturnType<typeof prisma.exercise.findFirstOrThrow>>) {
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

function publicExerciseRule(rule: {
  id: string;
  code: string;
  phase: string;
  joint: string;
  landmarks: unknown;
  angleMin: number;
  angleMax: number;
  severity: string;
  feedback: string;
  order: number;
}) {
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

export async function exerciseRoutes(app: FastifyInstance) {
  app.get('/', async request => {
    const parsed = listQuerySchema.safeParse(request.query);
    const query = parsed.success ? parsed.data : {};

    const exercises = await prisma.exercise.findMany({
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

    return {
      exercises: exercises.map(publicExercise),
    };
  });

  app.get('/:slug/rules', async (request, reply) => {
    const params = z.object({ slug: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ message: 'Invalid exercise slug' });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { slug: params.data.slug },
      include: {
        rules: {
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!exercise) {
      return reply.status(404).send({ message: 'Exercise not found' });
    }

    return {
      exercise: publicExercise(exercise),
      rules: exercise.rules.map(publicExerciseRule),
    };
  });

  app.get('/:slug', async (request, reply) => {
    const params = z.object({ slug: z.string().min(1) }).safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ message: 'Invalid exercise slug' });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { slug: params.data.slug },
    });

    if (!exercise) {
      return reply.status(404).send({ message: 'Exercise not found' });
    }

    return { exercise: publicExercise(exercise) };
  });
}
