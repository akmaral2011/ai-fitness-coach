import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Activity, Clock3, Target, TrendingUp } from 'lucide-react';

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
import { formatDuration } from '@/lib/utils';

function AnalyticsTile({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="app-metric-tile">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-emerald-500">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-lg font-black text-foreground">{value}</p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

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
  const analytics = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
    const firstScore = sorted[0]?.averageScore ?? 0;
    const latestScore = sorted[sorted.length - 1]?.averageScore ?? 0;
    const scoreDelta = sorted.length > 1 ? latestScore - firstScore : 0;
    const trainedDays = new Set(
      filtered.map(session => new Date(session.date).toLocaleDateString('en-CA'))
    );
    const exerciseCounts = filtered.reduce<Record<string, number>>((acc, session) => {
      acc[session.exerciseId] = (acc[session.exerciseId] ?? 0) + 1;
      return acc;
    }, {});
    const topExerciseId =
      Object.entries(exerciseCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
    const topExercise = topExerciseId
      ? EXERCISES.find(exercise => exercise.id === topExerciseId)
      : null;

    return {
      scoreDelta,
      trainedDays: trainedDays.size,
      totalSeconds: filtered.reduce((sum, session) => sum + session.durationSeconds, 0),
      topExercise,
    };
  }, [filtered]);

  const hasData = sessions.length > 0;
  const hasPeriodData = filtered.length > 0;
  const exercisesWithSessions = EXERCISES.filter(ex => sessions.some(s => s.exerciseId === ex.id));

  return (
    <div className="app-page app-page-flow">
      <h1 className="text-2xl font-bold text-foreground mb-5">{t('progress.title')}</h1>

      <PeriodSelector period={period} onChange={setPeriod} />

      <div className="app-hero-panel mb-6">
        <div className="relative p-4">
          <div className="relative">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-500">
              {t('progress.analytics.title')}
            </p>
            <h2 className="mb-1 text-xl font-black text-foreground">
              {hasData
                ? t('progress.analytics.headlineActive')
                : t('progress.analytics.headlineEmpty')}
            </h2>
            <p className="mb-4 text-sm leading-6 text-muted-foreground">
              {hasData
                ? t('progress.analytics.descriptionActive')
                : t('progress.analytics.descriptionEmpty')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <AnalyticsTile
                icon={<TrendingUp size={17} />}
                label={t('progress.analytics.trend')}
                value={
                  analytics.scoreDelta === 0
                    ? '0%'
                    : `${analytics.scoreDelta > 0 ? '+' : ''}${analytics.scoreDelta}%`
                }
                helper={t('progress.analytics.scoreChange')}
              />
              <AnalyticsTile
                icon={<Activity size={17} />}
                label={t('progress.analytics.consistency')}
                value={analytics.trainedDays}
                helper={t('progress.analytics.trainedDays')}
              />
              <AnalyticsTile
                icon={<Clock3 size={17} />}
                label={t('progress.analytics.time')}
                value={formatDuration(analytics.totalSeconds, t)}
                helper={t('progress.analytics.selectedPeriod')}
              />
              <AnalyticsTile
                icon={<Target size={17} />}
                label={t('progress.analytics.topExercise')}
                value={analytics.topExercise ? t(analytics.topExercise.nameKey) : '-'}
                helper={t('progress.analytics.mostTrained')}
              />
            </div>
          </div>
        </div>
      </div>

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

      <div className="app-card mb-6 p-4">
        <ActivityCalendar sessions={sessions} />
      </div>

      {hasPeriodData && (
        <div className="app-card mb-6 flex flex-col gap-6 p-4">
          <ScoreTrend sessions={sessions} />
          <ScoreBarChart data={bars} />
          <VolumeBarChart data={bars} />
        </div>
      )}

      <div className="app-card mb-6 p-4">
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
