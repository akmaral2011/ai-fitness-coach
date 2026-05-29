export type WorkoutWithExerciseSlug = {
  id: string;
  exerciseId: string;
  exercise?: { slug: string } | null;
  repCount: number;
  averageScore: number;
  durationSeconds: number;
  scoreHistory: number[];
  completedAt: Date;
};

export function publicWorkout(session: WorkoutWithExerciseSlug) {
  const date = session.completedAt.toISOString();
  return {
    id: session.id,
    exerciseId: session.exercise?.slug ?? session.exerciseId,
    repCount: session.repCount,
    averageScore: session.averageScore,
    durationSeconds: session.durationSeconds,
    scoreHistory: session.scoreHistory,
    date,
    completedAt: date,
  };
}
