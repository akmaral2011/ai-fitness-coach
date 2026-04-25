export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'legs'
  | 'glutes'
  | 'fullbody';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner: 'bg-emerald-500/15 text-emerald-500',
  intermediate: 'bg-yellow-500/15 text-yellow-500',
  advanced: 'bg-red-500/15 text-red-500',
};
export type Category = 'strength' | 'cardio' | 'mobility' | 'hiit';
export type RepPhase = 'up' | 'down' | 'hold';

export type LandmarkTriplet = {
  a: number;
  vertex: number;
  b: number;
};

export type AngleRule = {
  id: string;
  landmarks: LandmarkTriplet;
  phase: RepPhase | 'any';
  minAngle: number;
  maxAngle: number;
  feedbackKey: string;
  severity: 'warn' | 'error';
};

export type Exercise = {
  id: string;
  slug: string;
  nameKey: string;
  descriptionKey: string;
  category: Category;
  difficulty: Difficulty;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  thumbnailEmoji: string;
  repLandmark: number;
  repPhaseThreshold: { down: number; up: number };
  rules: AngleRule[];
  commonErrorKeys: string[];
  modificationKeys: string[];
  estimatedDuration: number;
  sets: number;
  reps: number;
};
