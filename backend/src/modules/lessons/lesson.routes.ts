import { LessonCategory, LessonType } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { requireUserId } from '../../lib/auth.js';
import { prisma } from '../../lib/prisma.js';

function apiType(type: LessonType) {
  return type.toLowerCase();
}

function apiCategory(category: LessonCategory) {
  return category.toLowerCase();
}

function publicLesson(lesson: {
  id: string;
  type: LessonType;
  category: LessonCategory;
  emoji: string;
  title: string;
  summary: string;
  body: string[];
  keyTakeaways: string[];
  readMinutes: number | null;
  durationMinutes: number | null;
  youtubeVideoId: string | null;
  linkedExerciseId: string | null;
}) {
  return {
    id: lesson.id,
    type: apiType(lesson.type),
    category: apiCategory(lesson.category),
    emoji: lesson.emoji,
    title: lesson.title,
    summary: lesson.summary,
    body: lesson.body,
    keyTakeaways: lesson.keyTakeaways,
    readMinutes: lesson.readMinutes,
    durationMinutes: lesson.durationMinutes,
    videoId: lesson.youtubeVideoId,
    linkedExerciseId: lesson.linkedExerciseId,
  };
}

export async function lessonRoutes(app: FastifyInstance) {
  app.get('/', async request => {
    const query = z
      .object({
        type: z.enum(['article', 'video']).optional(),
        category: z.enum(['technique', 'training', 'recovery', 'beginner']).optional(),
      })
      .safeParse(request.query);

    const type = query.success && query.data.type ? query.data.type.toUpperCase() : undefined;
    const category =
      query.success && query.data.category ? query.data.category.toUpperCase() : undefined;

    const lessons = await prisma.lesson.findMany({
      where: {
        type: type as LessonType | undefined,
        category: category as LessonCategory | undefined,
      },
      orderBy: { order: 'asc' },
    });

    return { lessons: lessons.map(publicLesson) };
  });

  app.get('/progress/me', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const progress = await prisma.lessonProgress.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });

    return {
      completedIds: progress.map(item => item.lessonId),
    };
  });

  app.get('/:id', async (request, reply) => {
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) return reply.status(400).send({ message: 'Invalid lesson id' });

    const lesson = await prisma.lesson.findUnique({ where: { id: params.data.id } });
    if (!lesson) return reply.status(404).send({ message: 'Lesson not found' });

    return { lesson: publicLesson(lesson) };
  });

  app.post('/:id/complete', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;
    const params = z.object({ id: z.string().min(1) }).safeParse(request.params);
    if (!params.success) return reply.status(400).send({ message: 'Invalid lesson id' });

    const lesson = await prisma.lesson.findUnique({ where: { id: params.data.id } });
    if (!lesson) return reply.status(404).send({ message: 'Lesson not found' });

    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
      create: { userId, lessonId: lesson.id },
      update: {},
    });

    return { ok: true, lessonId: lesson.id };
  });
}
