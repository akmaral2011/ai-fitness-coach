import { Prisma } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { requireUserId } from '../../lib/auth.js';
import { prisma } from '../../lib/prisma.js';

const unlockSchema = z.object({
  type: z.string().min(1).max(80),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

function publicAchievement(achievement: { type: string; unlockedAt: Date; metadata: unknown }) {
  return {
    type: achievement.type,
    unlockedAt: achievement.unlockedAt.toISOString(),
    metadata: achievement.metadata,
  };
}

export async function achievementRoutes(app: FastifyInstance) {
  app.get('/me', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' },
    });

    return { achievements: achievements.map(publicAchievement) };
  });

  app.post('/unlock', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const parsed = unlockSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: parsed.error.flatten().fieldErrors,
      });
    }

    const achievement = await prisma.achievement.upsert({
      where: { userId_type: { userId, type: parsed.data.type } },
      create: {
        userId,
        type: parsed.data.type,
        metadata: parsed.data.metadata as Prisma.InputJsonValue | undefined,
      },
      update: {
        metadata: parsed.data.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    return { achievement: publicAchievement(achievement) };
  });
}
