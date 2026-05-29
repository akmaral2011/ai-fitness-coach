import bcrypt from 'bcryptjs';

import { sendPasswordResetEmail, sendVerificationEmail } from '../../lib/email.js';
import { prisma } from '../../lib/prisma.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schemas.js';
import {
  createEmailVerificationToken,
  createPasswordResetToken,
  hashToken,
} from './auth.tokens.js';
import { verifyGoogleCredential } from './google.service.js';

type EmailErrorHandler = (error: unknown) => void;

export async function registerWithEmail(input: RegisterInput, onEmailError?: EmailErrorHandler) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    return { status: 'email_taken' as const };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash,
    },
  });

  const verificationToken = await createEmailVerificationToken(user.id);
  let emailSent = false;
  try {
    emailSent = await sendVerificationEmail(user.email, user.name, verificationToken);
  } catch (error) {
    onEmailError?.(error);
  }

  return {
    status: 'created' as const,
    user,
    verificationToken,
    emailDelivery: emailSent ? ('sent' as const) : ('dev' as const),
  };
}

export async function loginWithEmail(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user?.passwordHash) return null;

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) return null;

  return user;
}

export async function loginWithGoogle(credential: string) {
  const googleUser = await verifyGoogleCredential(credential);
  if (!googleUser) return null;

  return prisma.user.upsert({
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
}

export async function verifyEmailToken(token: string) {
  const tokenHash = hashToken(token);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) return null;

  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: new Date() },
  });
  await prisma.emailVerificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return user;
}

export async function requestPasswordReset(
  input: ForgotPasswordInput,
  onEmailError?: EmailErrorHandler
) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    return { userFound: false as const };
  }

  const resetToken = await createPasswordResetToken(user.id);
  let emailSent = false;
  try {
    emailSent = await sendPasswordResetEmail(user.email, resetToken);
  } catch (error) {
    onEmailError?.(error);
  }

  return {
    userFound: true as const,
    resetToken,
    emailDelivery: emailSent ? ('sent' as const) : ('dev' as const),
  };
}

export async function resetPassword(input: ResetPasswordInput) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) return false;

  const passwordHash = await bcrypt.hash(input.password, 12);
  await prisma.user.update({
    where: { id: record.userId },
    data: { passwordHash },
  });
  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return true;
}

export async function findUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}
