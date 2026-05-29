import type { FastifyInstance } from 'fastify';

import { requireUserId } from '../lib/auth.js';
import { publicWorkout } from '../modules/workouts/workout.presenter.js';
import {
  createWorkoutSchema,
  workoutListQuerySchema,
} from '../modules/workouts/workout.schemas.js';
import {
  createWorkoutSession,
  getWorkoutSummary,
  listWorkoutSessions,
} from '../modules/workouts/workout.service.js';

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

    const session = await createWorkoutSession(userId, parsed.data);
    if (!session) {
      return reply.status(404).send({ message: 'Exercise not found' });
    }

    return reply.status(201).send({ workout: publicWorkout(session) });
  });

  app.get('/', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const query = workoutListQuerySchema.safeParse(request.query);
    const limit = query.success ? query.data.limit : 20;
    const sessions = await listWorkoutSessions(userId, limit);

    return { workouts: sessions.map(publicWorkout) };
  });

  app.get('/summary', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    return getWorkoutSummary(userId);
  });
}
