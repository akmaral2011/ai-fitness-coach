import { PROGRAMS } from '@/features/programs/data';
import type { Program, ProgramDay } from '@/features/programs/types';
import type { CompletedSession } from '@/features/workout/types';

export const PROGRAM_ORDER = ['foundation-4w', 'build-4w', 'athlete-4w'] as const;

export function getWorkoutDays(program: Program) {
  return program.weeks.flatMap(week => week.days.filter(day => day.type === 'workout'));
}

export function getProgramProgressCount(programId: string, completedDayIds: string[]) {
  const program = PROGRAMS.find(item => item.id === programId);
  if (!program) return completedDayIds.length;

  const completed = new Set(completedDayIds);
  let count = 0;
  for (const day of getWorkoutDays(program)) {
    if (!completed.has(day.id)) break;
    count += 1;
  }

  return count;
}

export function isProgramComplete(programId: string, completedDayIds: string[]) {
  const program = PROGRAMS.find(item => item.id === programId);
  if (!program) return false;

  return getProgramProgressCount(programId, completedDayIds) >= getWorkoutDays(program).length;
}

export function getRequiredPreviousProgramId(programId: string) {
  const index = PROGRAM_ORDER.findIndex(id => id === programId);
  return index > 0 ? PROGRAM_ORDER[index - 1] : null;
}

export function isProgramUnlocked(
  programId: string,
  getCompletedDayIds: (programId: string) => string[]
) {
  const previousProgramId = getRequiredPreviousProgramId(programId);
  if (!previousProgramId) return true;

  return isProgramComplete(previousProgramId, getCompletedDayIds(previousProgramId));
}

export function getMissingExerciseIdsForDay(
  day: ProgramDay,
  sessions: CompletedSession[],
  startedAt?: string
) {
  if (day.type !== 'workout') return [];

  const startedAtTime = startedAt ? new Date(startedAt).getTime() : 0;
  const completedExerciseIds = new Set(
    sessions
      .filter(session => new Date(session.date).getTime() >= startedAtTime)
      .map(session => session.exerciseId)
  );

  return [...new Set(day.exercises.map(exercise => exercise.exerciseId))].filter(
    exerciseId => !completedExerciseIds.has(exerciseId)
  );
}
