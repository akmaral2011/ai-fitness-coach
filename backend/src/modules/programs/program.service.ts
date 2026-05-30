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

export type CompleteProgramDayResult =
  | { status: 'completed'; enrollment: ProgramEnrollment }
  | { status: 'already_completed'; enrollment: ProgramEnrollment }
  | { status: 'not_enrolled' }
  | { status: 'day_not_found' }
  | { status: 'locked'; nextDayId: string | null };

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

  const updated = await prisma.programEnrollment.update({
    where: { id: enrollment.id },
    data: { completedDayIds: [...enrollment.completedDayIds, dayId] },
  });

  return { status: 'completed', enrollment: updated };
}
