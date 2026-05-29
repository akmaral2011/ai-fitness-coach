import { prisma } from '../../lib/prisma.js';
import type { CreateWorkoutInput } from './workout.schemas.js';
import { calculateCurrentStreak, sessionXP, xpData } from './workout.stats.js';

export async function createWorkoutSession(userId: string, input: CreateWorkoutInput) {
  const exercise = input.exerciseId
    ? await prisma.exercise.findUnique({ where: { id: input.exerciseId } })
    : await prisma.exercise.findUnique({ where: { slug: input.exerciseSlug } });

  if (!exercise) return null;

  const session = await prisma.workoutSession.create({
    data: {
      userId,
      exerciseId: exercise.id,
      repCount: input.repCount,
      averageScore: input.averageScore,
      durationSeconds: input.durationSeconds,
      scoreHistory: input.scoreHistory,
      completedAt: input.completedAt ? new Date(input.completedAt) : new Date(),
    },
  });

  return { ...session, exercise };
}

export async function listWorkoutSessions(userId: string, limit: number) {
  return prisma.workoutSession.findMany({
    where: { userId },
    include: { exercise: { select: { slug: true } } },
    orderBy: { completedAt: 'desc' },
    take: limit,
  });
}

export async function getWorkoutSummary(userId: string) {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    orderBy: { completedAt: 'desc' },
  });

  const totalSessions = sessions.length;
  const totalReps = sessions.reduce((sum, session) => sum + session.repCount, 0);
  const totalWorkoutSeconds = sessions.reduce((sum, session) => sum + session.durationSeconds, 0);
  const averageScore =
    totalSessions === 0
      ? 0
      : Math.round(
          sessions.reduce((sum, session) => sum + session.averageScore, 0) / totalSessions
        );
  const totalXP = sessions.reduce((sum, session) => sum + sessionXP(session), 0);

  return {
    summary: {
      totalSessions,
      totalReps,
      totalWorkoutSeconds,
      averageScore,
      currentStreak: calculateCurrentStreak(sessions.map(session => session.completedAt)),
    },
    xp: xpData(totalXP),
  };
}
