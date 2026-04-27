import { EXERCISES } from '@/features/exercises/data';
import type { CompletedSession } from '@/features/workout/types';

export type Period = '7d' | '30d' | 'all';
export type BarData = {
  label: string;
  avgScore: number;
  totalReps: number;
  count: number;
};
export type MuscleIntensities = Record<string, number>;

const muscleMap: Record<string, string[]> = {
  chest: ['chest'],
  shoulders: ['shoulders_f', 'shoulders_b'],
  arms: ['biceps', 'triceps', 'forearms'],
  core: ['abs', 'lower_back'],
  legs: ['quads', 'hamstrings', 'calves'],
  glutes: ['glutes'],
  back: ['lats', 'traps', 'lower_back'],
  fullbody: [
    'chest',
    'shoulders_f',
    'shoulders_b',
    'biceps',
    'triceps',
    'abs',
    'quads',
    'glutes',
    'lats',
    'traps',
    'hamstrings',
  ],
};

export function filterByPeriod(sessions: CompletedSession[], period: Period): CompletedSession[] {
  if (period === 'all') return sessions;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (period === '7d' ? 7 : 30));
  return sessions.filter(session => new Date(session.date) >= cutoff);
}

function dailyBars(sessions: CompletedSession[], days: number): BarData[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    const key = date.toLocaleDateString('en-CA');
    const daySessions = sessions.filter(
      session => new Date(session.date).toLocaleDateString('en-CA') === key
    );

    return {
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      avgScore: daySessions.length
        ? Math.round(
            daySessions.reduce((sum, session) => sum + session.averageScore, 0) / daySessions.length
          )
        : 0,
      totalReps: daySessions.reduce((sum, session) => sum + session.repCount, 0),
      count: daySessions.length,
    };
  });
}

function weeklyBars(sessions: CompletedSession[], weeks: number): BarData[] {
  return Array.from({ length: weeks }, (_, index) => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - index * 7);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weekSessions = sessions.filter(session => {
      const date = new Date(session.date);
      return date >= weekStart && date <= weekEnd;
    });

    return {
      label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgScore: weekSessions.length
        ? Math.round(
            weekSessions.reduce((sum, session) => sum + session.averageScore, 0) /
              weekSessions.length
          )
        : 0,
      totalReps: weekSessions.reduce((sum, session) => sum + session.repCount, 0),
      count: weekSessions.length,
    };
  }).reverse();
}

export function getChartBars(sessions: CompletedSession[], period: Period): BarData[] {
  if (period === '7d') return dailyBars(sessions, 7);
  if (period === '30d') return weeklyBars(sessions, 4);
  return weeklyBars(sessions, 12);
}

export function calcMuscleIntensity(sessions: CompletedSession[]): MuscleIntensities {
  const raw: Record<string, number> = {};

  for (const session of sessions) {
    const exercise = EXERCISES.find(item => item.id === session.exerciseId);
    if (!exercise) continue;

    for (const group of exercise.primaryMuscles) {
      for (const muscleId of muscleMap[group] ?? []) {
        raw[muscleId] = (raw[muscleId] ?? 0) + session.repCount;
      }
    }

    for (const group of exercise.secondaryMuscles) {
      for (const muscleId of muscleMap[group] ?? []) {
        raw[muscleId] = (raw[muscleId] ?? 0) + session.repCount * 0.4;
      }
    }
  }

  const max = Math.max(...Object.values(raw), 1);
  return Object.fromEntries(Object.entries(raw).map(([id, value]) => [id, value / max]));
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}
