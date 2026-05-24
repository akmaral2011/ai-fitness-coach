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

if (
  parsedEnv.data.NODE_ENV === 'production' &&
  parsedEnv.data.JWT_SECRET === 'local-dev-secret-change-before-production'
) {
  console.error('JWT_SECRET must be changed before running in production');
  process.exit(1);
}

export const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  googleClientId: parsedEnv.data.GOOGLE_CLIENT_ID,
  frontendUrl: parsedEnv.data.FRONTEND_URL,
};
