export type WorkoutFeedback = {
  ruleId: string;
  feedbackKey: string;
  severity: 'warn' | 'error';
  timestamp: number;
};

export type WorkoutState = {
  exerciseId: string | null;
  phase: 'up' | 'down' | 'hold';
  repCount: number;
  targetReps: number;
  techniqueScore: number;
  scoreHistory: number[];
  feedback: WorkoutFeedback[];
  isRunning: boolean;
  startedAt: number | null;
};

export type CompletedSession = {
  id: string;
  exerciseId: string;
  date: string;
  repCount: number;
  averageScore: number;
  durationSeconds: number;
  scoreHistory: number[];
};
