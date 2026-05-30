import type { ProgramEnrollment } from '@prisma/client';

import { prisma } from '../../lib/prisma.js';

type ProgramDayShape = {
  id?: unknown;
  type?: unknown;
};

type ProgramWeekShape = {
  days?: unknown;
};

const canonicalWorkoutDayOrder: Record<string, string[]> = {
  'foundation-4w': [
    'w1d1',
    'w1d3',
    'w1d5',
    'w2d1',
    'w2d3',
    'w2d5',
    'w3d1',
    'w3d3',
    'w3d5',
    'w4d1',
    'w4d3',
    'w4d5',
  ],
  'build-4w': [
    'w1d1',
    'w1d2',
    'w1d4',
    'w1d5',
    'w2d1',
    'w2d2',
    'w2d4',
    'w2d5',
    'w3d1',
    'w3d2',
    'w3d4',
    'w3d5',
    'w4d1',
    'w4d2',
    'w4d4',
    'w4d5',
  ],
  'athlete-4w': [
    'w1d1',
    'w1d2',
    'w1d3',
    'w1d5',
    'w1d6',
    'w2d1',
    'w2d2',
    'w2d3',
    'w2d5',
    'w2d6',
    'w3d1',
    'w3d2',
    'w3d3',
    'w3d5',
    'w3d6',
    'w4d1',
    'w4d2',
    'w4d3',
    'w4d5',
    'w4d6',
  ],
};

const previousProgramByProgramId: Record<string, string | null> = {
  'foundation-4w': null,
  'build-4w': 'foundation-4w',
  'athlete-4w': 'build-4w',
};

const canonicalProgramDayRequirements: Record<string, Record<string, string[]>> = {
  'foundation-4w': {
    w1d1: ['squat', 'pushup', 'plank'],
    w1d3: ['lunge', 'glute-bridge', 'calf-raise'],
    w1d5: ['squat', 'pushup', 'plank', 'calf-raise'],
    w2d1: ['squat', 'pushup', 'glute-bridge'],
    w2d3: ['lunge', 'wall-sit', 'calf-raise'],
    w2d5: ['squat', 'pushup', 'plank', 'glute-bridge'],
    w3d1: ['squat', 'pushup', 'glute-bridge'],
    w3d3: ['reverse-lunge', 'wall-sit', 'plank'],
    w3d5: ['squat', 'lunge', 'pushup', 'calf-raise'],
    w4d1: ['squat', 'pushup', 'plank', 'glute-bridge'],
    w4d3: ['reverse-lunge', 'wall-sit', 'calf-raise'],
    w4d5: ['squat', 'pushup', 'lunge', 'plank', 'glute-bridge'],
  },
  'build-4w': {
    w1d1: ['squat', 'deadlift', 'glute-bridge', 'calf-raise'],
    w1d2: ['pushup', 'shoulder-press', 'lateral-raise', 'tricep-dip'],
    w1d4: ['lunge', 'reverse-lunge', 'wall-sit', 'plank'],
    w1d5: ['bicep-curl', 'tricep-extension', 'shoulder-press', 'lateral-raise'],
    w2d1: ['squat', 'deadlift', 'glute-bridge', 'calf-raise'],
    w2d2: ['pushup', 'shoulder-press', 'tricep-dip', 'lateral-raise'],
    w2d4: ['lunge', 'side-lunge', 'wall-sit', 'plank'],
    w2d5: ['bicep-curl', 'tricep-extension', 'shoulder-press', 'lateral-raise'],
    w3d1: ['squat', 'deadlift', 'reverse-lunge', 'calf-raise'],
    w3d2: ['pushup', 'tricep-dip', 'shoulder-press', 'tricep-extension'],
    w3d4: ['lunge', 'side-lunge', 'glute-bridge', 'plank'],
    w3d5: ['bicep-curl', 'tricep-extension', 'lateral-raise', 'shoulder-press'],
    w4d1: ['squat', 'deadlift', 'glute-bridge', 'calf-raise'],
    w4d2: ['pushup', 'tricep-dip', 'shoulder-press', 'lateral-raise'],
    w4d4: ['lunge', 'reverse-lunge', 'wall-sit', 'plank'],
    w4d5: ['bicep-curl', 'tricep-extension', 'shoulder-press', 'lateral-raise'],
  },
  'athlete-4w': {
    w1d1: ['squat', 'deadlift', 'reverse-lunge', 'glute-bridge'],
    w1d2: ['burpee', 'mountain-climber', 'high-knees', 'jumping-jack'],
    w1d3: ['pushup', 'shoulder-press', 'tricep-dip', 'lateral-raise'],
    w1d5: ['deadlift', 'squat', 'lunge', 'calf-raise'],
    w1d6: ['bicep-curl', 'tricep-extension', 'plank', 'mountain-climber'],
    w2d1: ['squat', 'deadlift', 'reverse-lunge', 'side-lunge'],
    w2d2: ['burpee', 'high-knees', 'mountain-climber', 'jumping-jack'],
    w2d3: ['pushup', 'tricep-dip', 'shoulder-press', 'tricep-extension'],
    w2d5: ['deadlift', 'squat', 'glute-bridge', 'calf-raise'],
    w2d6: ['bicep-curl', 'lateral-raise', 'plank', 'superman'],
    w3d1: ['squat', 'deadlift', 'lunge', 'wall-sit'],
    w3d2: ['burpee', 'mountain-climber', 'high-knees', 'jumping-jack'],
    w3d3: ['pushup', 'shoulder-press', 'tricep-dip', 'lateral-raise'],
    w3d5: ['deadlift', 'reverse-lunge', 'side-lunge', 'glute-bridge'],
    w3d6: ['bicep-curl', 'tricep-extension', 'plank', 'superman'],
    w4d1: ['squat', 'deadlift', 'lunge', 'glute-bridge'],
    w4d2: ['burpee', 'high-knees', 'mountain-climber', 'jumping-jack'],
    w4d3: ['pushup', 'tricep-dip', 'shoulder-press', 'tricep-extension'],
    w4d5: ['squat', 'deadlift', 'reverse-lunge', 'wall-sit'],
    w4d6: ['bicep-curl', 'lateral-raise', 'plank', 'superman'],
  },
};

function getWorkoutDayIds(weeks: unknown) {
  if (!Array.isArray(weeks)) return [];

  return weeks.flatMap((week: ProgramWeekShape) => {
    if (!Array.isArray(week.days)) return [];

    return week.days
      .filter((day: ProgramDayShape) => day.type === 'workout' && typeof day.id === 'string')
      .map((day: ProgramDayShape) => day.id as string);
  });
}

function getProgramWorkoutDayIds(programId: string, weeks: unknown) {
  return canonicalWorkoutDayOrder[programId] ?? getWorkoutDayIds(weeks);
}

function isEnrollmentComplete(programId: string, completedDayIds: string[]) {
  const workoutDayIds = canonicalWorkoutDayOrder[programId];
  if (!workoutDayIds) return false;

  return workoutDayIds.every(dayId => completedDayIds.includes(dayId));
}

async function getMissingExerciseIdsForProgramDay(
  userId: string,
  programId: string,
  dayId: string,
  startedAt: Date
) {
  const requiredExerciseIds = canonicalProgramDayRequirements[programId]?.[dayId] ?? [];
  const missingExerciseIds: string[] = [];

  for (const exerciseId of requiredExerciseIds) {
    const session = await prisma.workoutSession.findFirst({
      where: {
        userId,
        completedAt: { gte: startedAt },
        exercise: { slug: exerciseId },
      },
      select: { id: true },
    });

    if (!session) missingExerciseIds.push(exerciseId);
  }

  return missingExerciseIds;
}

export async function listPrograms() {
  return prisma.program.findMany({
    orderBy: [{ difficulty: 'asc' }, { name: 'asc' }],
  });
}

export async function findProgramById(programId: string) {
  return prisma.program.findUnique({ where: { id: programId } });
}

export async function listProgramEnrollments(userId: string) {
  return prisma.programEnrollment.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
  });
}

export async function enrollInProgram(userId: string, programId: string) {
  const program = await findProgramById(programId);
  if (!program) return null;

  const previousProgramId = previousProgramByProgramId[programId];
  if (previousProgramId) {
    const previousEnrollment = await prisma.programEnrollment.findUnique({
      where: { userId_programId: { userId, programId: previousProgramId } },
    });

    if (
      !previousEnrollment ||
      !isEnrollmentComplete(previousProgramId, previousEnrollment.completedDayIds)
    ) {
      return { lockedByProgramId: previousProgramId } as const;
    }
  }

  return prisma.programEnrollment.upsert({
    where: { userId_programId: { userId, programId: program.id } },
    create: { userId, programId: program.id },
    update: {},
  });
}

export async function leaveProgram(userId: string, programId: string) {
  await prisma.programEnrollment.deleteMany({
    where: { userId, programId },
  });
}

export async function clearProgramEnrollments(userId: string) {
  await prisma.programEnrollment.deleteMany({
    where: { userId },
  });
}

export type CompleteProgramDayResult =
  | { status: 'completed'; enrollment: ProgramEnrollment }
  | { status: 'already_completed'; enrollment: ProgramEnrollment }
  | { status: 'not_enrolled' }
  | { status: 'day_not_found' }
  | { status: 'locked'; nextDayId: string | null }
  | { status: 'missing_exercises'; missingExerciseIds: string[] };

export async function completeProgramDay(
  userId: string,
  programId: string,
  dayId: string
): Promise<CompleteProgramDayResult> {
  const enrollment = await prisma.programEnrollment.findUnique({
    where: { userId_programId: { userId, programId } },
    include: { program: true },
  });
  if (!enrollment) return { status: 'not_enrolled' };

  const workoutDayIds = getProgramWorkoutDayIds(programId, enrollment.program.weeks);
  if (!workoutDayIds.includes(dayId)) return { status: 'day_not_found' };

  if (enrollment.completedDayIds.includes(dayId)) {
    return { status: 'already_completed', enrollment };
  }

  const nextDayId = workoutDayIds.find(id => !enrollment.completedDayIds.includes(id)) ?? null;
  if (nextDayId !== dayId) {
    return { status: 'locked', nextDayId };
  }

  const missingExerciseIds = await getMissingExerciseIdsForProgramDay(
    userId,
    programId,
    dayId,
    enrollment.startedAt
  );
  if (missingExerciseIds.length > 0) {
    return { status: 'missing_exercises', missingExerciseIds };
  }

  const updated = await prisma.programEnrollment.update({
    where: { id: enrollment.id },
    data: { completedDayIds: [...enrollment.completedDayIds, dayId] },
  });

  return { status: 'completed', enrollment: updated };
}
