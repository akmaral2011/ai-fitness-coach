import bcrypt from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import { z } from 'zod';

import { env } from '../config/env.js';
import { getBearerUserId, publicUser } from '../lib/auth.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../lib/email.js';
import { prisma } from '../lib/prisma.js';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

const googleSchema = z.object({
  credential: z.string().min(20),
});

const verifyEmailSchema = z.object({
  token: z.string().min(20),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: registerSchema.shape.password,
});

function randomToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function addMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

async function createEmailVerificationToken(userId: string) {
  const token = randomToken();
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: addMinutes(60 * 24),
    },
  });
  return token;
}

async function createPasswordResetToken(userId: string) {
  const token = randomToken();
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: addMinutes(30),
    },
  });
  return token;
}

type GoogleTokenInfo = {
  sub: string;
  email: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  aud: string;
};

async function verifyGoogleCredential(credential: string): Promise<GoogleTokenInfo | null> {
  if (!env.googleClientId) return null;

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );
  if (!response.ok) return null;

  const data = (await response.json()) as Partial<GoogleTokenInfo>;
  const emailVerified = data.email_verified === true || data.email_verified === 'true';

  if (!data.sub || !data.email || data.aud !== env.googleClientId || !emailVerified) {
    return null;
  }

  return {
    sub: data.sub,
    email: data.email.toLowerCase(),
    email_verified: emailVerified,
    name: data.name,
    picture: data.picture,
    aud: data.aud,
  };
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: parsed.error.flatten().fieldErrors,
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existingUser) {
      return reply.status(409).send({ message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
      },
    });
    const verificationToken = await createEmailVerificationToken(user.id);
    let emailSent = false;
    try {
      emailSent = await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (error) {
      app.log.warn({ error }, 'Failed to send verification email');
    }

    const token = app.jwt.sign({ sub: user.id }, { expiresIn: '7d' });

    return reply.status(201).send({
      token,
      user: publicUser(user),
      emailDelivery: emailSent ? 'sent' : 'dev',
      ...(!emailSent && env.nodeEnv !== 'production' ? { verificationToken } : {}),
    });
  });

  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: parsed.error.flatten().fieldErrors,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user?.passwordHash) {
      return reply.status(401).send({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!passwordMatches) {
      return reply.status(401).send({ message: 'Invalid email or password' });
    }

    const token = app.jwt.sign({ sub: user.id }, { expiresIn: '7d' });

    return {
      token,
      user: publicUser(user),
    };
  });

  app.post('/google', async (request, reply) => {
    const parsed = googleSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid request body' });
    }

    const googleUser = await verifyGoogleCredential(parsed.data.credential);
    if (!googleUser) {
      return reply.status(401).send({ message: 'Invalid Google credential' });
    }

    const user = await prisma.user.upsert({
      where: { email: googleUser.email },
      update: {
        googleSubject: googleUser.sub,
        name: googleUser.name ?? undefined,
        pictureUrl: googleUser.picture ?? undefined,
        emailVerifiedAt: new Date(),
      },
      create: {
        email: googleUser.email,
        name: googleUser.name ?? googleUser.email.split('@')[0],
        pictureUrl: googleUser.picture,
        googleSubject: googleUser.sub,
        emailVerifiedAt: new Date(),
      },
    });

    const token = app.jwt.sign({ sub: user.id }, { expiresIn: '7d' });
    return { token, user: publicUser(user) };
  });

  app.post('/verify-email', async (request, reply) => {
    const parsed = verifyEmailSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid request body' });
    }

    const tokenHash = hashToken(parsed.data.token);
    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return reply.status(400).send({ message: 'Invalid or expired verification token' });
    }

    const user = await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    });
    await prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return { user: publicUser(user) };
  });

  app.post('/forgot-password', async (request, reply) => {
    const parsed = forgotPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ message: 'Invalid request body' });
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
      return { message: 'If the email exists, a reset link has been prepared' };
    }

    const resetToken = await createPasswordResetToken(user.id);
    let emailSent = false;
    try {
      emailSent = await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      app.log.warn({ error }, 'Failed to send password reset email');
    }

    return {
      message: 'If the email exists, a reset link has been prepared',
      emailDelivery: emailSent ? 'sent' : 'dev',
      ...(!emailSent && env.nodeEnv !== 'production' ? { resetToken } : {}),
    };
  });

  app.get('/verify-email/:token', async (request, reply) => {
    const params = z.object({ token: z.string().min(20) }).safeParse(request.params);
    if (!params.success) return reply.status(400).send({ message: 'Invalid verification token' });

    const tokenHash = hashToken(params.data.token);
    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return reply.status(400).send({ message: 'Invalid or expired verification token' });
    }

    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    });
    await prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return reply.redirect(env.frontendUrl ?? '/');
  });

  app.post('/reset-password', async (request, reply) => {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: parsed.error.flatten().fieldErrors,
      });
    }

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(parsed.data.token) },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return reply.status(400).send({ message: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return { message: 'Password has been reset' };
  });

  app.get('/me', async (request, reply) => {
    const userId = await getBearerUserId(request);
    if (!userId) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    return { user: publicUser(user) };
  });
}
