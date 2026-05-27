import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  JWT_SECRET: z.string().min(24, 'JWT_SECRET must be at least 24 characters'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  FRONTEND_URL: z.string().url().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid backend environment variables', parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

const envData = parsedEnv.data;

if (
  envData.NODE_ENV === 'production' &&
  envData.JWT_SECRET === 'local-dev-secret-change-before-production'
) {
  console.error('JWT_SECRET must be changed before running in production');
  process.exit(1);
}

export const env = {
  nodeEnv: envData.NODE_ENV,
  port: envData.PORT,
  jwtSecret: envData.JWT_SECRET,
  googleClientId: envData.GOOGLE_CLIENT_ID,
  frontendUrl: envData.FRONTEND_URL,
};
