export type Stage =
  | 'intro'
  | 'loading'
  | 'error'
  | 'ready'
  | 'countdown'
  | 'active'
  | 'paused'
  | 'rest'
  | 'summary';

export type SetResult = {
  repCount: number;
  averageScore: number;
  durationSeconds: number;
  holdSeconds?: number;
};

export const REST_DURATION = 30;
export const HOLD_DURATION = 30;

export function getGrade(score: number) {
  if (score >= 90) return { label: 'A+', color: 'text-emerald-400' };
  if (score >= 80) return { label: 'A', color: 'text-emerald-400' };
  if (score >= 70) return { label: 'B', color: 'text-yellow-400' };
  if (score >= 60) return { label: 'C', color: 'text-orange-400' };
  return { label: 'D', color: 'text-red-400' };
}

export function getMessage(score: number, t: (key: string) => string) {
  if (score >= 90) return t('workout.summary.message.excellent');
  if (score >= 70) return t('workout.summary.message.good');
  if (score >= 50) return t('workout.summary.message.ok');
  return t('workout.summary.message.needsWork');
}

export function fmtTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${seconds}s`;
}
