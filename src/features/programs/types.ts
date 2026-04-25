export type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';

export const DIFFICULTY_COLOR: Record<ProgramDifficulty, string> = {
  beginner: 'bg-emerald-500/15 text-emerald-500',
  intermediate: 'bg-amber-500/15 text-amber-500',
  advanced: 'bg-rose-500/15 text-rose-500',
};

export type ProgramExercise = {
  exerciseId: string;
  sets: number;
  reps: number;
  restSeconds: number;
};

export type ProgramDay = {
  id: string;
  type: 'workout' | 'rest' | 'active_recovery';
  exercises: ProgramExercise[];
};

export type ProgramWeek = {
  number: number;
  themeKey: string;
  days: ProgramDay[];
};

export type Program = {
  id: string;
  nameKey: string;
  descriptionKey: string;
  difficulty: ProgramDifficulty;
  durationWeeks: number;
  sessionsPerWeek: number;
  estimatedMinutesPerSession: number;
  emoji: string;
  goalKeys: string[];
  weeks: ProgramWeek[];
};
