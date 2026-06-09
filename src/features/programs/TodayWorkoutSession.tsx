import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import { CheckCircle2 } from 'lucide-react';

import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import { useAuthStore } from '@/features/auth/authStore';
import { getExercise } from '@/features/exercises/data';
import { getProgram } from '@/features/programs/data';
import { getWorkoutDays } from '@/features/programs/programProgress';
import { type ProgramEnrollment, useProgramStore } from '@/features/programs/programStore';
import { useProgramWorkoutSessionStore } from '@/features/programs/programWorkoutSessionStore';
import type { ProgramDay } from '@/features/programs/types';
import { useProgressStore } from '@/features/progress/progressStore';
import { syncPendingWorkouts, useWorkoutSyncStore } from '@/features/workout/workoutSyncStore';
import { ApiError, apiRequest } from '@/lib/api';

function findWorkoutDay(programId: string, dayId: string): ProgramDay | null {
  const program = getProgram(programId);
  if (!program) return null;
  return getWorkoutDays(program).find(day => day.id === dayId) ?? null;
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainder}s` : `${seconds}s`;
}

function buildScorePath(scores: number[]) {
  if (scores.length === 0) return '';

  const width = 280;
  const height = 96;
  const step = scores.length > 1 ? width / (scores.length - 1) : width;

  return scores
    .map((score, index) => {
      const x = index * step;
      const y = height - (Math.max(0, Math.min(100, score)) / 100) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

function getMissingExerciseIds(error: ApiError): string[] {
  if (!error.details || typeof error.details !== 'object') return [];

  const missingExerciseIds = Reflect.get(error.details, 'missingExerciseIds');
  return Array.isArray(missingExerciseIds)
    ? missingExerciseIds.filter((id): id is string => typeof id === 'string')
    : [];
}

export default function TodayWorkoutSession() {
  const { programId, dayId } = useParams<{ programId: string; dayId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore(s => s.token);
  const { getEnrollment, markDayComplete, setEnrollment, isDayComplete } = useProgramStore();
  const completeExercise = useProgramWorkoutSessionStore(s => s.completeExercise);
  const resetSession = useProgramWorkoutSessionStore(s => s.resetSession);
  const skipRest = useProgramWorkoutSessionStore(s => s.skipRest);
  const workoutSessions = useProgressStore(s => s.sessions);
  const retryFailedWorkouts = useWorkoutSyncStore(s => s.retryFailed);
  const session = useProgramWorkoutSessionStore(s =>
    programId && dayId
      ? s.getSession(programId, dayId)
      : { completedExerciseIds: [], restUntil: null, startedAt: 0 }
  );
  const [submitting, setSubmitting] = useState(false);
  const [dayCelebrating, setDayCelebrating] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const program = programId ? getProgram(programId) : undefined;
  const day = programId && dayId ? findWorkoutDay(programId, dayId) : null;
  const enrollment = programId ? getEnrollment(programId) : undefined;
  const completedDay = programId && dayId ? isDayComplete(programId, dayId) : false;
  const completedSet = useMemo(
    () => new Set(session.completedExerciseIds),
    [session.completedExerciseIds]
  );
  const completedCount = day
    ? day.exercises.filter(item => completedSet.has(item.exerciseId)).length
    : 0;
  const totalCount = day?.exercises.length ?? 0;
  const isFinished = totalCount > 0 && completedCount >= totalCount;
  const nextExercise = day?.exercises.find(item => !completedSet.has(item.exerciseId)) ?? null;
  const restRemaining = Math.max(0, Math.ceil(((session.restUntil ?? 0) - now) / 1000));
  const isResting = restRemaining > 0 && !isFinished;
  const dayWorkoutSessions = useMemo(() => {
    if (!day) return [];

    return day.exercises.flatMap(item => {
      const latestSession = workoutSessions.find(
        workoutSession =>
          workoutSession.exerciseId === item.exerciseId &&
          completedSet.has(workoutSession.exerciseId) &&
          new Date(workoutSession.date).getTime() >= session.startedAt
      );
      return latestSession ? [latestSession] : [];
    });
  }, [completedSet, day, session.startedAt, workoutSessions]);
  const totalReps = dayWorkoutSessions.reduce(
    (sum, workoutSession) => sum + workoutSession.repCount,
    0
  );
  const totalSeconds = dayWorkoutSessions.reduce(
    (sum, workoutSession) => sum + workoutSession.durationSeconds,
    0
  );
  const averageScore =
    dayWorkoutSessions.length > 0
      ? Math.round(
          dayWorkoutSessions.reduce((sum, workoutSession) => sum + workoutSession.averageScore, 0) /
            dayWorkoutSessions.length
        )
      : 0;
  const earnedXP = dayWorkoutSessions.reduce(
    (sum, workoutSession) =>
      sum + workoutSession.repCount * 2 + Math.round(workoutSession.averageScore / 5),
    0
  );
  const scoreHistory = dayWorkoutSessions.flatMap(workoutSession => workoutSession.scoreHistory);
  const chartScores =
    scoreHistory.length > 0
      ? scoreHistory
      : dayWorkoutSessions.map(workoutSession => workoutSession.averageScore);
  const chartPath = buildScorePath(chartScores);
  const bestWorkoutSession = [...dayWorkoutSessions].sort(
    (a, b) => b.averageScore - a.averageScore
  )[0];
  const improvementWorkoutSession = [...dayWorkoutSessions].sort(
    (a, b) => a.averageScore - b.averageScore
  )[0];
  const bestExercise = bestWorkoutSession ? getExercise(bestWorkoutSession.exerciseId) : undefined;
  const improvementExercise = improvementWorkoutSession
    ? getExercise(improvementWorkoutSession.exerciseId)
    : undefined;

  useEffect(() => {
    if (!programId || !dayId || !day) return;

    const completedExerciseId = searchParams.get('completed');
    if (!completedExerciseId) return;

    const completedItem = day.exercises.find(item => item.exerciseId === completedExerciseId);
    if (completedItem) {
      completeExercise(programId, dayId, completedExerciseId, completedItem.restSeconds);
    }

    setSearchParams({}, { replace: true });
  }, [completeExercise, day, dayId, programId, searchParams, setSearchParams]);

  useEffect(() => {
    if (!session.restUntil) return;

    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, [session.restUntil]);

  async function handleCompleteDay(destination = `/app/programs/${programId}`) {
    if (!programId || !dayId || submitting) return;

    if (completedDay) {
      resetSession(programId, dayId);
      navigate(destination);
      return;
    }

    setCompleteError(null);
    setSubmitting(true);
    try {
      if (token) {
        retryFailedWorkouts();
        await syncPendingWorkouts(token);
        const response = await apiRequest<{ enrollment: ProgramEnrollment }>(
          `/api/programs/${programId}/days/${dayId}/complete`,
          { method: 'POST', token }
        );
        setEnrollment(response.enrollment);
      } else {
        markDayComplete(programId, dayId);
      }
      setDayCelebrating(true);
      await new Promise(resolve => window.setTimeout(resolve, 700));
      resetSession(programId, dayId);
      navigate(destination);
    } catch (error) {
      console.error('Failed to complete guided program day', error);
      const missingExerciseIds = error instanceof ApiError ? getMissingExerciseIds(error) : [];
      const missingExerciseNames = missingExerciseIds.map(id => {
        const exercise = getExercise(id);
        return exercise ? t(exercise.nameKey) : id;
      });

      setCompleteError(
        missingExerciseNames.length > 0
          ? t('programs.session.completeMissingSpecificError', {
              exercises: missingExerciseNames.join(', '),
            })
          : t('programs.session.completeError')
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!program || !programId || !day || !dayId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        {t('programs.session.notFound')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-8 app-page-flow">
      {dayCelebrating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 backdrop-blur-sm">
          <div className="app-day-complete flex flex-col items-center gap-3 text-center">
            <div className="app-day-complete-icon flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/25">
              <CheckCircle2 size={42} strokeWidth={2.5} />
            </div>
            <p className="app-detail-title">{t('programs.session.dayComplete')}</p>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
        <button
          onClick={() => navigate(`/app/programs/${programId}`)}
          className="-ml-2 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="app-card-title truncate">{t('programs.session.title')}</h1>
      </div>

      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="app-hero-panel mb-5 p-5">
          <p className="app-hero-eyebrow">{t(program.nameKey)}</p>
          <h2 className="app-hero-title">{t('programs.session.todayWorkout')}</h2>
          <p className="app-hero-body mt-1">
            {t('programs.session.progress', { done: completedCount, total: totalCount })}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="app-progress-fill"
              style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {!enrollment && (
          <div className="app-card mb-5 p-4 text-sm text-muted-foreground">
            {t('programs.startProgramFirst')}
          </div>
        )}

        <div className="mb-5">
          <h3 className="app-section-title">{t('programs.session.exerciseList')}</h3>
          <div className="flex flex-col gap-2">
            {day.exercises.map((item, index) => {
              const exercise = getExercise(item.exerciseId);
              const done = completedSet.has(item.exerciseId);
              return (
                <div
                  key={`${item.exerciseId}-${index}`}
                  className={`app-card flex items-center gap-3 p-3 ${
                    done ? 'app-complete-pop border-emerald-500/30 bg-emerald-500/5' : ''
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors duration-300 ${
                      done ? 'bg-emerald-500 text-white' : 'bg-muted'
                    }`}
                  >
                    {done ? '✓' : index + 1}
                  </span>
                  <span className="text-2xl">{exercise?.thumbnailEmoji ?? '🏋️'}</span>
                  <span className="min-w-0 flex-1">
                    <span className="app-card-title block truncate">
                      {exercise ? t(exercise.nameKey) : item.exerciseId}
                    </span>
                    <span className="app-card-meta block">
                      {item.sets}×{item.reps} · {item.restSeconds}s {t('programs.session.rest')}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {isFinished ? (
          <div className="app-summary-enter flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { value: `${averageScore}%`, label: t('workout.summary.score') },
                { value: totalReps, label: t('workout.summary.totalReps') },
                { value: formatDuration(totalSeconds), label: t('workout.summary.duration') },
                { value: `+${earnedXP}`, label: t('workout.summary.xp') },
              ].map(metric => (
                <div
                  key={metric.label}
                  className="app-card flex flex-col items-center gap-1 p-4 text-center"
                >
                  <span className="text-xl font-bold text-foreground">{metric.value}</span>
                  <span className="app-card-meta">{metric.label}</span>
                </div>
              ))}
            </div>

            <div className="app-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="app-card-title">{t('workout.summary.scoreTrend')}</p>
                <span className="text-sm font-bold text-emerald-500">
                  {chartScores[chartScores.length - 1] ?? averageScore}%
                </span>
              </div>
              <div className="h-32 rounded-xl bg-muted/50 p-3">
                {chartPath ? (
                  <svg viewBox="0 0 280 96" className="h-full w-full overflow-visible">
                    {[19.2, 48, 76.8].map(y => (
                      <line
                        key={y}
                        x1="0"
                        y1={y}
                        x2="280"
                        y2={y}
                        stroke="currentColor"
                        className="text-border"
                        strokeDasharray="4 4"
                      />
                    ))}
                    <path
                      d={chartPath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="app-chart-draw text-emerald-500"
                    />
                  </svg>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {t('workout.summary.noScoreData')}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="app-card p-4">
                <p className="app-card-title mb-3">{t('workout.summary.whatWentWell')}</p>
                <div className="space-y-2">
                  <p className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-emerald-500">✓</span>
                    <span>
                      {bestWorkoutSession && bestExercise
                        ? t('programs.session.summary.bestExercise', {
                            name: t(bestExercise.nameKey),
                            score: bestWorkoutSession.averageScore,
                          })
                        : t('workout.summary.wins.completed')}
                    </span>
                  </p>
                  <p className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-emerald-500">✓</span>
                    <span>{t('programs.session.summary.completedAll')}</span>
                  </p>
                </div>
              </div>

              <div className="app-card p-4">
                <p className="app-card-title mb-3">{t('workout.summary.improveNext')}</p>
                <div className="space-y-2">
                  <p className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-yellow-500">•</span>
                    <span>
                      {improvementWorkoutSession && improvementExercise
                        ? t('programs.session.summary.improveExercise', {
                            name: t(improvementExercise.nameKey),
                            score: improvementWorkoutSession.averageScore,
                          })
                        : t('workout.summary.improvements.slowDown')}
                    </span>
                  </p>
                  <p className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-yellow-500">•</span>
                    <span>{t('programs.session.summary.recover')}</span>
                  </p>
                </div>
              </div>
            </div>

            <button
              disabled={submitting || completedDay}
              onClick={() => void handleCompleteDay()}
              className="app-primary-action w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {completedDay
                ? t('programs.completed')
                : submitting
                  ? t('common.loading')
                  : t('programs.session.finishDay')}
            </button>

            {completeError && (
              <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                {completeError}
              </p>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                onClick={() => resetSession(programId, dayId)}
                className="rounded-xl border border-border px-3 py-3 text-sm font-semibold transition-colors hover:bg-muted"
              >
                {t('workout.summary.tryAgain')}
              </button>
              <button
                disabled={submitting}
                onClick={() => void handleCompleteDay('/app/catalog')}
                className="rounded-xl border border-border px-3 py-3 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-60"
              >
                {t('workout.summary.chooseAnother')}
              </button>
              <button
                disabled={submitting}
                onClick={() => void handleCompleteDay('/app/progress')}
                className="rounded-xl border border-border px-3 py-3 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-60"
              >
                {t('workout.summary.goToProgress')}
              </button>
            </div>
          </div>
        ) : (
          <div className="app-card p-4">
            {isResting ? (
              <div className="text-center">
                <p className="app-card-meta">{t('programs.session.restTimer')}</p>
                <p className="app-rest-pulse mt-1 text-4xl font-black text-emerald-500">
                  {formatTimer(restRemaining)}
                </p>
                <button
                  type="button"
                  onClick={() => skipRest(programId, dayId)}
                  className="mt-4 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  {t('programs.session.skipRest')}
                </button>
              </div>
            ) : (
              <button
                disabled={!enrollment || !nextExercise}
                onClick={() => {
                  if (!nextExercise) return;
                  navigate(
                    `/app/workout/${nextExercise.exerciseId}?programId=${programId}&dayId=${dayId}`
                  );
                }}
                className="app-primary-action w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('programs.session.startNext')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
