import type { FastifyInstance } from 'fastify';

import { requireUserId } from '../../lib/auth.js';
import { prisma } from '../../lib/prisma.js';
import { calculateCurrentStreak, dayKey, sessionXP, xpData } from '../workouts/workout.stats.js';

function publicWorkout(session: {
  id: string;
  repCount: number;
  averageScore: number;
  durationSeconds: number;
  scoreHistory: number[];
  completedAt: Date;
  exercise: { slug: string; name: string; category: string } | null;
}) {
  const completedAt = session.completedAt.toISOString();

  return {
    id: session.id,
    exerciseId: session.exercise?.slug ?? null,
    exerciseName: session.exercise?.name ?? null,
    category: session.exercise?.category ?? null,
    repCount: session.repCount,
    averageScore: session.averageScore,
    durationSeconds: session.durationSeconds,
    scoreHistory: session.scoreHistory,
    date: completedAt,
    completedAt,
  };
}

export async function progressRoutes(app: FastifyInstance) {
  app.get('/leaderboard', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const users = await prisma.user.findMany({
      include: {
        workouts: {
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    const ranked = users
      .map(user => {
        const totalSessions = user.workouts.length;
        const totalReps = user.workouts.reduce((sum, session) => sum + session.repCount, 0);
        const totalWorkoutSeconds = user.workouts.reduce(
          (sum, session) => sum + session.durationSeconds,
          0
        );
        const averageScore =
          totalSessions === 0
            ? 0
            : Math.round(
                user.workouts.reduce((sum, session) => sum + session.averageScore, 0) /
                  totalSessions
              );
        const totalXP = user.workouts.reduce((sum, session) => sum + sessionXP(session), 0);

        return {
          userId: user.id,
          name: user.name,
          pictureUrl: user.pictureUrl,
          totalXP,
          level: xpData(totalXP).level,
          totalSessions,
          totalReps,
          totalWorkoutSeconds,
          averageScore,
          currentStreak: calculateCurrentStreak(user.workouts.map(session => session.completedAt)),
          lastWorkoutAt: user.workouts[0]?.completedAt.toISOString() ?? null,
        };
      })
      .filter(entry => entry.totalSessions > 0)
      .sort((a, b) => {
        if (b.totalXP !== a.totalXP) return b.totalXP - a.totalXP;
        if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
        return b.totalSessions - a.totalSessions;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isCurrentUser: entry.userId === userId,
      }));

    const currentUser = ranked.find(entry => entry.userId === userId) ?? null;

    return {
      leaderboard: ranked.slice(0, 20),
      currentUser,
      totalCompetitors: ranked.length,
    };
  });

  app.get('/overview', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const [sessions, lessonCount, achievements, enrollments] = await Promise.all([
      prisma.workoutSession.findMany({
        where: { userId },
        include: {
          exercise: {
            select: {
              slug: true,
              name: true,
              category: true,
            },
          },
        },
        orderBy: { completedAt: 'desc' },
      }),
      prisma.lessonProgress.count({ where: { userId } }),
      prisma.achievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' },
      }),
      prisma.programEnrollment.findMany({
        where: { userId },
        include: { program: true },
        orderBy: { startedAt: 'desc' },
      }),
    ]);

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

    const bestByExercise = new Map<string, (typeof sessions)[number]>();
    for (const session of sessions) {
      const slug = session.exercise?.slug;
      if (!slug) continue;

      const currentBest = bestByExercise.get(slug);
      if (
        !currentBest ||
        session.averageScore > currentBest.averageScore ||
        (session.averageScore === currentBest.averageScore &&
          session.repCount > currentBest.repCount)
      ) {
        bestByExercise.set(slug, session);
      }
    }

    const activityDays = [...new Set(sessions.map(session => dayKey(session.completedAt)))].map(
      date => ({
        date,
        sessions: sessions.filter(session => dayKey(session.completedAt) === date).length,
      })
    );

    return {
      summary: {
        totalSessions,
        totalReps,
        totalWorkoutSeconds,
        averageScore,
        currentStreak: calculateCurrentStreak(sessions.map(session => session.completedAt)),
      },
      xp: xpData(totalXP),
      recentWorkouts: sessions.slice(0, 10).map(publicWorkout),
      personalBests: [...bestByExercise.values()].map(publicWorkout),
      activityDays,
      lessonsCompleted: lessonCount,
      achievements: achievements.map(achievement => ({
        id: achievement.id,
        type: achievement.type,
        unlockedAt: achievement.unlockedAt.toISOString(),
        metadata: achievement.metadata,
      })),
      activePrograms: enrollments.map(enrollment => ({
        id: enrollment.id,
        programId: enrollment.programId,
        programName: enrollment.program.name,
        completedDayIds: enrollment.completedDayIds,
        startedAt: enrollment.startedAt.toISOString(),
      })),
    };
  });
}
