import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EXERCISES } from '@/features/exercises/data';
import { type Period, filterByPeriod, getChartBars } from '@/features/progress/progressHelpers';
import {
  ActivityCalendar,
  EmptyProgressState,
  MuscleHeatmap,
  PeriodSelector,
  PersonalBests,
  ScoreBarChart,
  ScoreTrend,
  SessionHistory,
  StatCard,
  StreakValue,
  VolumeBarChart,
} from '@/features/progress/progressSections';
import { useProgressStore } from '@/features/progress/progressStore';

export default function Progress() {
  const { t } = useTranslation();
  const { sessions, getSummary, getExercisePersonalBest } = useProgressStore();
  const [period, setPeriod] = useState<Period>('7d');

  const filtered = useMemo(() => filterByPeriod(sessions, period), [sessions, period]);
  const bars = useMemo(() => getChartBars(filtered, period), [filtered, period]);
  const fullSummary = getSummary();

  const periodStats = useMemo(
    () => ({
      totalSessions: filtered.length,
      totalReps: filtered.reduce((a, s) => a + s.repCount, 0),
      averageScore: filtered.length
        ? Math.round(filtered.reduce((a, s) => a + s.averageScore, 0) / filtered.length)
        : 0,
    }),
    [filtered]
  );

  const hasData = sessions.length > 0;
  const hasPeriodData = filtered.length > 0;
  const exercisesWithSessions = EXERCISES.filter(ex => sessions.some(s => s.exerciseId === ex.id));

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-5">{t('progress.title')}</h1>

      <PeriodSelector period={period} onChange={setPeriod} />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          label={t('progress.summary.sessions')}
          value={periodStats.totalSessions}
          color="text-emerald-500"
        />
        <StatCard
          label={t('progress.summary.streak')}
          value={<StreakValue streak={fullSummary.currentStreak} />}
          color="text-orange-500"
        />
        <StatCard
          label={t('progress.summary.reps')}
          value={periodStats.totalReps}
          color="text-blue-500"
        />
        <StatCard
          label={t('progress.summary.avgScore')}
          value={`${periodStats.averageScore}%`}
          color={periodStats.averageScore >= 80 ? 'text-emerald-500' : 'text-yellow-500'}
        />
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <ActivityCalendar sessions={sessions} />
      </div>

      {hasPeriodData && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col gap-6">
          <ScoreTrend sessions={sessions} />
          <ScoreBarChart data={bars} />
          <VolumeBarChart data={bars} />
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <MuscleHeatmap sessions={filtered} />
      </div>

      <PersonalBests
        exerciseIds={exercisesWithSessions.map(exercise => exercise.id)}
        getExercisePersonalBest={getExercisePersonalBest}
      />

      {hasData ? <SessionHistory sessions={sessions} /> : <EmptyProgressState />}
    </div>
  );
}
