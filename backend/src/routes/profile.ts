import type { FastifyInstance } from 'fastify';
import {
  FitnessGoal,
  FitnessLevel,
  type Profile,
} from '@prisma/client';
import { z } from 'zod';

import { requireUserId } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';

const goalMap = {
  lose_weight: FitnessGoal.LOSE_WEIGHT,
  build_muscle: FitnessGoal.BUILD_MUSCLE,
  improve_technique: FitnessGoal.IMPROVE_TECHNIQUE,
  stay_active: FitnessGoal.STAY_ACTIVE,
  rehabilitation: FitnessGoal.REHABILITATION,
} as const;

const levelMap = {
  beginner: FitnessLevel.BEGINNER,
  intermediate: FitnessLevel.INTERMEDIATE,
  advanced: FitnessLevel.ADVANCED,
} as const;

const profileSchema = z.object({
  heightCm: z.number().int().min(80).max(250),
  weightKg: z.number().min(25).max(350),
  ageYears: z.number().int().min(10).max(100),
  gender: z.enum(['male', 'female', 'other']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  injuries: z.array(
    z.enum(['lower_back', 'knees', 'shoulders', 'wrists', 'neck', 'ankles', 'hips', 'none'])
  ),
  goal: z.enum(['lose_weight', 'build_muscle', 'improve_technique', 'stay_active', 'rehabilitation']),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
});

function apiGoal(goal: FitnessGoal) {
  const entry = Object.entries(goalMap).find(([, value]) => value === goal);
  return entry?.[0] ?? 'stay_active';
}

function apiLevel(level: FitnessLevel) {
  const entry = Object.entries(levelMap).find(([, value]) => value === level);
  return entry?.[0] ?? 'beginner';
}

function publicProfile(profile: Profile) {
  return {
    userId: profile.userId,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    ageYears: profile.age,
    gender: profile.gender,
    activityLevel: profile.activityLevel,
    injuries: profile.injuries,
    goal: apiGoal(profile.goal),
    fitnessLevel: apiLevel(profile.level),
    isOnboardingComplete: profile.isOnboardingComplete,
    completedAt: profile.completedAt?.toISOString() ?? null,
  };
}

export async function profileRoutes(app: FastifyInstance) {
  app.get('/me', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    return { profile: profile ? publicProfile(profile) : null };
  });

  app.put('/me', async (request, reply) => {
    const userId = await requireUserId(request, reply);
    if (!userId) return;

    const parsed = profileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        message: 'Invalid request body',
        issues: parsed.error.flatten().fieldErrors,
      });
    }

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        heightCm: parsed.data.heightCm,
        weightKg: parsed.data.weightKg,
        age: parsed.data.ageYears,
        gender: parsed.data.gender,
        activityLevel: parsed.data.activityLevel,
        injuries: parsed.data.injuries,
        goal: goalMap[parsed.data.goal],
        level: levelMap[parsed.data.fitnessLevel],
        isOnboardingComplete: true,
        completedAt: new Date(),
      },
      update: {
        heightCm: parsed.data.heightCm,
        weightKg: parsed.data.weightKg,
        age: parsed.data.ageYears,
        gender: parsed.data.gender,
        activityLevel: parsed.data.activityLevel,
        injuries: parsed.data.injuries,
        goal: goalMap[parsed.data.goal],
        level: levelMap[parsed.data.fitnessLevel],
        isOnboardingComplete: true,
        completedAt: new Date(),
      },
    });

    return { profile: publicProfile(profile) };
  });
}
