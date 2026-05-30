import type { FastifyInstance } from 'fastify';

import { requireUserId } from '../../lib/auth.js';
import { publicEnrollment, publicProgram } from './program.presenter.js';
import { completeProgramDayParamsSchema, programIdParamsSchema } from './program.schemas.js';
import {
  completeProgramDay,
  enrollInProgram,
  findProgramById,
  leaveProgram,
  listProgramEnrollments,
  listPrograms,
} from './program.service.js';

export async function programRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const programs = await listPrograms();
    return { programs: programs.map(publicProgram) };
  });

  app.get('/enrollments/me', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const enrollments = await listProgramEnrollments(userId);
    return { enrollments: enrollments.map(publicEnrollment) };
  });

  app.get('/:id', async (request, reply) => {
    const params = programIdParamsSchema.safeParse(request.params);
    if (!params.success) return reply.status(400).send({ message: 'Invalid program id' });

    const program = await findProgramById(params.data.id);
    if (!program) return reply.status(404).send({ message: 'Program not found' });

    return { program: publicProgram(program) };
  });

  app.post('/:id/enroll', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;
    const params = programIdParamsSchema.safeParse(request.params);
    if (!params.success) return reply.status(400).send({ message: 'Invalid program id' });

    const enrollment = await enrollInProgram(userId, params.data.id);
    if (!enrollment) return reply.status(404).send({ message: 'Program not found' });

    return { enrollment: publicEnrollment(enrollment) };
  });

  app.delete('/:id/enroll', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;
    const params = programIdParamsSchema.safeParse(request.params);
    if (!params.success) return reply.status(400).send({ message: 'Invalid program id' });

    await leaveProgram(userId, params.data.id);
    return { ok: true };
  });

  app.post('/:id/days/:dayId/complete', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;
    const params = completeProgramDayParamsSchema.safeParse(request.params);
    if (!params.success) return reply.status(400).send({ message: 'Invalid params' });

    const result = await completeProgramDay(userId, params.data.id, params.data.dayId);

    if (result.status === 'not_enrolled') {
      return reply.status(404).send({ message: 'Enrollment not found' });
    }
    if (result.status === 'day_not_found') {
      return reply.status(404).send({ message: 'Program workout day not found' });
    }
    if (result.status === 'locked') {
      return reply.status(409).send({
        message: 'Complete previous program days first',
        nextDayId: result.nextDayId,
      });
    }

    return { enrollment: publicEnrollment(result.enrollment) };
  });
}
