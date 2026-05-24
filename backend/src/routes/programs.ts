import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { requireUserId } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

function apiDifficulty(difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') {
  return difficulty.toLowerCase();
}

function publicProgram(program: {
  id: string;
  name: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  durationWeeks: number;
  sessionsPerWeek: number;
  estimatedMinutesPerSession: number;
  emoji: string;
  goals: string[];
  weeks: unknown;
}) {
  return {
    id: program.id,
    name: program.name,
    description: program.description,
    difficulty: apiDifficulty(program.difficulty),
    durationWeeks: program.durationWeeks,
    sessionsPerWeek: program.sessionsPerWeek,
    estimatedMinutesPerSession: program.estimatedMinutesPerSession,
    emoji: program.emoji,
    goals: program.goals,
    weeks: program.weeks,
  };
}

function publicEnrollment(enrollment: {
  programId: string;
  startedAt: Date;
  completedDayIds: string[];
}) {
  return {
    programId: enrollment.programId,
    startedAt: enrollment.startedAt.toISOString(),
    completedDayIds: enrollment.completedDayIds,
  };
}

export async function programRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const programs = await prisma.program.findMany({
      orderBy: [{ difficulty: 'asc' }, { name: 'asc' }],
    });
    return { programs: programs.map(publicProgram) };
  });

  app.get('/enrollments/me', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const enrollments = await prisma.programEnrollment.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });
    return { enrollments: enrollments.map(publicEnrollment) };
  });

  app.get('/:id', async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) return reply.status(400).send({ message: 'Invalid program id' });

    const program = await prisma.program.findUnique({ where: { id: params.data.id } });
    if (!program) return reply.status(404).send({ message: 'Program not found' });

    return { program: publicProgram(program) };
  });

  app.post('/:id/enroll', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) return reply.status(400).send({ message: 'Invalid program id' });

    const program = await prisma.program.findUnique({ where: { id: params.data.id } });
    if (!program) return reply.status(404).send({ message: 'Program not found' });

    const enrollment = await prisma.programEnrollment.upsert({
      where: { userId_programId: { userId, programId: program.id } },
      create: { userId, programId: program.id },
      update: {},
    });
    return { enrollment: publicEnrollment(enrollment) };
  });

  app.delete('/:id/enroll', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) return reply.status(400).send({ message: 'Invalid program id' });

    await prisma.programEnrollment.deleteMany({
      where: { userId, programId: params.data.id },
    });
    return { ok: true };
  });

  app.post('/:id/days/:dayId/complete', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;
    const params = z
      .object({ id: z.string().min(1), dayId: z.string().min(1) })
      .safeParse(request.params);
    if (!params.success) return reply.status(400).send({ message: 'Invalid params' });

    const enrollment = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId: params.data.id } },
    });
    if (!enrollment) return reply.status(404).send({ message: 'Enrollment not found' });

    const completedDayIds = enrollment.completedDayIds.includes(params.data.dayId)
      ? enrollment.completedDayIds
      : [...enrollment.completedDayIds, params.data.dayId];

    const updated = await prisma.programEnrollment.update({
      where: { id: enrollment.id },
      data: { completedDayIds },
    });

    return { enrollment: publicEnrollment(updated) };
  });
}
