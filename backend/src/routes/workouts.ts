import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { requireUserId } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

const XP_PER_LEVEL = 300;

const createWorkoutSchema = z.object({
  exerciseId: z.string().min(1).optional(),
  exerciseSlug: z.string().min(1).optional(),
  repCount: z.number().int().min(0),
  averageScore: z.number().int().min(0).max(100),
  durationSeconds: z.number().int().min(1),
  scoreHistory: z.array(z.number().int().min(0).max(100)).default([]),
  completedAt: z.string().datetime().optional(),
});

type WorkoutWithExercise = {
  id: string;
  exerciseId: string;
  exercise?: { slug: string } | null;
  repCount: number;
  averageScore: number;
  durationSeconds: number;
  scoreHistory: number[];
  completedAt: Date;
};

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function calculateCurrentStreak(dates: Date[]) {
  if (dates.length === 0) return 0;

  const uniqueDays = [...new Set(dates.map(dayKey))].sort((a, b) => b.localeCompare(a));
  const today = dayKey(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dayKey(yesterdayDate);

  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0;

  let streak = 1;
  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previousDate = new Date(`${uniqueDays[index - 1]}T00:00:00.000Z`);
    previousDate.setDate(previousDate.getDate() - 1);
    const expected = dayKey(previousDate);
    if (uniqueDays[index] !== expected) break;
    streak += 1;
  }

  return streak;
}

function sessionXP(session: { repCount: number; averageScore: number }) {
  return session.repCount * 2 + Math.round(session.averageScore / 5);
}

function publicWorkout(session: WorkoutWithExercise) {
  const date = session.completedAt.toISOString();
  return {
    id: session.id,
    exerciseId: session.exercise?.slug ?? session.exerciseId,
    repCount: session.repCount,
    averageScore: session.averageScore,
    durationSeconds: session.durationSeconds,
    scoreHistory: session.scoreHistory,
    date,
    completedAt: date,
  };
}

export async function workoutRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const parsed = createWorkoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: parsed.error.flatten().fieldErrors,
      });
    }

    if (!parsed.data.exerciseId && !parsed.data.exerciseSlug) {
      return reply.status(400).send({ message: 'exerciseId or exerciseSlug is required' });
    }

    const exercise = parsed.data.exerciseId
      ? await prisma.exercise.findUnique({ where: { id: parsed.data.exerciseId } })
      : await prisma.exercise.findUnique({ where: { slug: parsed.data.exerciseSlug } });

    if (!exercise) {
      return reply.status(404).send({ message: 'Exercise not found' });
    }

    const session = await prisma.workoutSession.create({
      data: {
        userId,
        exerciseId: exercise.id,
        repCount: parsed.data.repCount,
        averageScore: parsed.data.averageScore,
        durationSeconds: parsed.data.durationSeconds,
        scoreHistory: parsed.data.scoreHistory,
        completedAt: parsed.data.completedAt ? new Date(parsed.data.completedAt) : new Date(),
      },
    });

    return reply.status(201).send({ workout: publicWorkout({ ...session, exercise }) });
  });

  app.get('/', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const query = z
      .object({
        limit: z.coerce.number().int().min(1).max(100).default(20),
      })
      .safeParse(request.query);

    const limit = query.success ? query.data.limit : 20;
    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      include: { exercise: { select: { slug: true } } },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });

    return { workouts: sessions.map(publicWorkout) };
  });

  app.get('/summary', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });

    const totalSessions = sessions.length;
    const totalReps = sessions.reduce((sum, session) => sum + session.repCount, 0);
    const totalWorkoutSeconds = sessions.reduce(
      (sum, session) => sum + session.durationSeconds,
      0
    );
    const averageScore =
      totalSessions === 0
        ? 0
        : Math.round(
            sessions.reduce((sum, session) => sum + session.averageScore, 0) / totalSessions
          );
    const totalXP = sessions.reduce((sum, session) => sum + sessionXP(session), 0);
    const xpInCurrentLevel = totalXP % XP_PER_LEVEL;

    return {
      summary: {
        totalSessions,
        totalReps,
        totalWorkoutSeconds,
        averageScore,
        currentStreak: calculateCurrentStreak(sessions.map(session => session.completedAt)),
      },
      xp: {
        totalXP,
        level: Math.floor(totalXP / XP_PER_LEVEL) + 1,
        xpInCurrentLevel,
        xpPerLevel: XP_PER_LEVEL,
        progressPercent: Math.round((xpInCurrentLevel / XP_PER_LEVEL) * 100),
      },
    };
  });
}
