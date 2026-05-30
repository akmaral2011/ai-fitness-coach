import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';

import { env } from './config/env.js';
import { achievementRoutes } from './modules/achievements/achievement.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { exerciseRoutes } from './modules/exercises/exercise.routes.js';
import { lessonRoutes } from './modules/lessons/lesson.routes.js';
import { profileRoutes } from './modules/profile/profile.routes.js';
import { programRoutes } from './modules/programs/program.routes.js';
import { progressRoutes } from './modules/progress/progress.routes.js';
import { workoutRoutes } from './modules/workouts/workout.routes.js';

const app = Fastify({
  logger: true,
});

await app.register(helmet, {
  contentSecurityPolicy: false,
});

await app.register(cors, {
  origin: env.frontendUrl ? [env.frontendUrl] : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

await app.register(rateLimit, {
  max: 120,
  timeWindow: '1 minute',
});

await app.register(jwt, {
  secret: env.jwtSecret,
});

await app.register(swagger, {
  openapi: {
    info: {
      title: 'AI Fitness Coach API',
      description:
        'Fastify backend for authentication, profiles, exercises, workouts, programs, lessons, achievements, and progress.',
      version: '1.0.0',
    },
    servers: [
      {
        url: env.backendUrl ?? `http://localhost:${env.port}`,
        description: env.nodeEnv === 'production' ? 'Production API' : 'Local API',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Service health checks' },
      { name: 'Auth', description: 'Registration, login, email verification, password reset' },
      { name: 'Profile', description: 'User profile and onboarding data' },
      { name: 'Exercises', description: 'Exercise catalog and AI technique rules' },
      { name: 'Workouts', description: 'Completed workout sessions' },
      { name: 'Progress', description: 'Progress dashboard aggregates' },
      { name: 'Programs', description: 'Training programs and enrollments' },
      { name: 'Lessons', description: 'Learning hub content and progress' },
      { name: 'Achievements', description: 'Unlocked achievements' },
    ],
  },
});

await app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
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
