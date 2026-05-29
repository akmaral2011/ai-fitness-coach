import type { FastifyInstance } from 'fastify';

import { env } from '../config/env.js';
import { getBearerUserId, publicUser } from '../lib/auth.js';
import {
  forgotPasswordSchema,
  googleSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  tokenParamsSchema,
  verifyEmailSchema,
} from '../modules/auth/auth.schemas.js';
import {
  findUserById,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  requestPasswordReset,
  resetPassword,
  verifyEmailToken,
} from '../modules/auth/auth.service.js';

const genericResetMessage = 'If the email exists, a reset link has been prepared';

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/register',
    {
      config: {
        rateLimit: {
          max: 8,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const parsed = registerSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          message: 'Invalid request body',
          issues: parsed.error.flatten().fieldErrors,
        });
      }

      const result = await registerWithEmail(parsed.data, error => {
        app.log.warn({ error }, 'Failed to send verification email');
      });

      if (result.status === 'email_taken') {
        return reply.status(409).send({ message: 'Email is already registered' });
      }

      const token = app.jwt.sign({ sub: result.user.id }, { expiresIn: '7d' });

      return reply.status(201).send({
        token,
        user: publicUser(result.user),
        emailDelivery: result.emailDelivery,
        ...(result.emailDelivery !== 'sent' && env.nodeEnv !== 'production'
          ? { verificationToken: result.verificationToken }
          : {}),
      });
    }
  );

  app.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const parsed = loginSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          message: 'Invalid request body',
          issues: parsed.error.flatten().fieldErrors,
        });
      }

      const user = await loginWithEmail(parsed.data);
      if (!user) {
        return reply.status(401).send({ message: 'Invalid email or password' });
      }

      const token = app.jwt.sign({ sub: user.id }, { expiresIn: '7d' });
      return { token, user: publicUser(user) };
    }
  );

  app.post('/google', async (request, reply) => {
    const parsed = googleSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid request body' });
    }

    const user = await loginWithGoogle(parsed.data.credential);
    if (!user) {
      return reply.status(401).send({ message: 'Invalid Google credential' });
    }

    const token = app.jwt.sign({ sub: user.id }, { expiresIn: '7d' });
    return { token, user: publicUser(user) };
  });

  app.post('/verify-email', async (request, reply) => {
    const parsed = verifyEmailSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid request body' });
    }

    const user = await verifyEmailToken(parsed.data.token);
    if (!user) {
      return reply.status(400).send({ message: 'Invalid or expired verification token' });
    }

    return { user: publicUser(user) };
  });

  app.get('/verify-email/:token', async (request, reply) => {
    const params = tokenParamsSchema.safeParse(request.params);
    if (!params.success) return reply.status(400).send({ message: 'Invalid verification token' });

    const user = await verifyEmailToken(params.data.token);
    if (!user) {
      return reply.status(400).send({ message: 'Invalid or expired verification token' });
    }

    return reply.redirect(env.frontendUrl ?? '/');
  });

  app.post(
    '/forgot-password',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
    },
    async (request, reply) => {
      const parsed = forgotPasswordSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ message: 'Invalid request body' });
      }

      const result = await requestPasswordReset(parsed.data, error => {
        app.log.warn({ error }, 'Failed to send password reset email');
      });

      if (!result.userFound) {
        return { message: genericResetMessage };
      }

      return {
        message: genericResetMessage,
        emailDelivery: result.emailDelivery,
        ...(result.emailDelivery !== 'sent' && env.nodeEnv !== 'production'
          ? { resetToken: result.resetToken }
          : {}),
      };
    }
  );

  app.post('/reset-password', async (request, reply) => {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: parsed.error.flatten().fieldErrors,
      });
    }

    const isReset = await resetPassword(parsed.data);
    if (!isReset) {
      return reply.status(400).send({ message: 'Invalid or expired reset token' });
    }

    return { message: 'Password has been reset' };
  });

  app.get('/me', async (request, reply) => {
    const userId = await getBearerUserId(request);
    if (!userId) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const user = await findUserById(userId);
    if (!user) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    return { user: publicUser(user) };
  });
}
