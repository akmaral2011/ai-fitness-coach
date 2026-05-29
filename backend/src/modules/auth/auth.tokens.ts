import crypto from 'node:crypto';

import { prisma } from '../../lib/prisma.js';

function randomToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function addMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

export async function createEmailVerificationToken(userId: string) {
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

export async function createPasswordResetToken(userId: string) {
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
