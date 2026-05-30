function apiDifficulty(difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') {
  return difficulty.toLowerCase();
}

export function publicProgram(program: {
  id: string;
  name: string;
  description: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  durationWeeks: number;
  sessionsPerWeek: number;
  estimatedMinutesPerSession: number;
  emoji: string;
  goals: string[];
  weeks: unknown;
}) {
  return {
    id: program.id,
    name: program.name,
    description: program.description,
    difficulty: apiDifficulty(program.difficulty),
    durationWeeks: program.durationWeeks,
    sessionsPerWeek: program.sessionsPerWeek,
    estimatedMinutesPerSession: program.estimatedMinutesPerSession,
    emoji: program.emoji,
    goals: program.goals,
    weeks: program.weeks,
  };
}

export function publicEnrollment(enrollment: {
  programId: string;
  startedAt: Date;
  completedDayIds: string[];
}) {
  return {
    programId: enrollment.programId,
    startedAt: enrollment.startedAt.toISOString(),
    completedDayIds: enrollment.completedDayIds,
  };
}
