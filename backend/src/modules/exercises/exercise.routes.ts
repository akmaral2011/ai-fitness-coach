import type { FastifyInstance } from 'fastify';

import { publicExercise, publicExerciseRule } from './exercise.presenter.js';
import { exerciseSlugParamsSchema, listExercisesQuerySchema } from './exercise.schemas.js';
import { findExerciseBySlug, findExerciseRulesBySlug, listExercises } from './exercise.service.js';

export async function exerciseRoutes(app: FastifyInstance) {
  app.get('/', async request => {
    const parsed = listExercisesQuerySchema.safeParse(request.query);
    const query = parsed.success ? parsed.data : {};

    const exercises = await listExercises(query);

    return {
      exercises: exercises.map(publicExercise),
    };
  });

  app.get('/:slug/rules', async (request, reply) => {
    const params = exerciseSlugParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ message: 'Invalid exercise slug' });
    }

    const exercise = await findExerciseRulesBySlug(params.data.slug);

    if (!exercise) {
      return reply.status(404).send({ message: 'Exercise not found' });
    }

    return {
      exercise: publicExercise(exercise),
      rules: exercise.rules.map(publicExerciseRule),
    };
  });

  app.get('/:slug', async (request, reply) => {
    const params = exerciseSlugParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ message: 'Invalid exercise slug' });
    }

    const exercise = await findExerciseBySlug(params.data.slug);

    if (!exercise) {
      return reply.status(404).send({ message: 'Exercise not found' });
    }

    return { exercise: publicExercise(exercise) };
  });
}
