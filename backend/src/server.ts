import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import Fastify from 'fastify';

import { env } from './config/env.js';
import { achievementRoutes } from './routes/achievements.js';
import { authRoutes } from './routes/auth.js';
import { exerciseRoutes } from './routes/exercises.js';
import { lessonRoutes } from './routes/lessons.js';
import { profileRoutes } from './routes/profile.js';
import { progressRoutes } from './routes/progress.js';
import { programRoutes } from './routes/programs.js';
import { workoutRoutes } from './routes/workouts.js';

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: env.frontendUrl ? [env.frontendUrl] : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

await app.register(jwt, {
  secret: env.jwtSecret,
});

app.get('/health', async () => {
  return { status: 'ok' };
});

app.get('/', async () => {
  return {
    name: 'AI Fitness Coach API',
    status: 'running',
  };
});

await app.register(authRoutes, { prefix: '/api/auth' });
await app.register(profileRoutes, { prefix: '/api/profile' });
await app.register(exerciseRoutes, { prefix: '/api/exercises' });
await app.register(workoutRoutes, { prefix: '/api/workouts' });
await app.register(progressRoutes, { prefix: '/api/progress' });
await app.register(programRoutes, { prefix: '/api/programs' });
await app.register(lessonRoutes, { prefix: '/api/lessons' });
await app.register(achievementRoutes, { prefix: '/api/achievements' });

try {
  await app.listen({ port: env.port, host: '0.0.0.0' });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
