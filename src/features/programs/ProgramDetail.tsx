import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import ChevronDownIcon from '@/components/icons/ChevronDownIcon';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import { useAuthStore } from '@/features/auth/authStore';
import { EXERCISES } from '@/features/exercises/data';
import { DifficultyBadge, ProgressBar } from '@/features/programs/Programs';
import { getProgram } from '@/features/programs/data';
import {
  getMissingExerciseIdsForDay,
  getRequiredPreviousProgramId,
  getWorkoutDays,
  isProgramUnlocked,
} from '@/features/programs/programProgress';
import { type ProgramEnrollment, useProgramStore } from '@/features/programs/programStore';
import type { ProgramDay, ProgramWeek } from '@/features/programs/types';
import { useProgressStore } from '@/features/progress/progressStore';
import { apiRequest } from '@/lib/api';

function WorkoutDayCard({
  day,
  dayNumber,
  programId,
  canComplete,
  disabledReasonKey,
  missingExerciseIds,
}: {
  day: ProgramDay;
  dayNumber: number;
  programId: string;
  canComplete: boolean;
  disabledReasonKey?: string;
  missingExerciseIds: string[];
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDayComplete, markDayComplete, setEnrollment } = useProgramStore();
  const token = useAuthStore(s => s.token);
  const [submitting, setSubmitting] = useState(false);
  const complete = isDayComplete(programId, day.id);

  if (day.type === 'rest') {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/40 border border-border rounded-xl opacity-60">
        <span className="text-xl">😴</span>
        <div>
          <p className="app-card-title">{t('programs.dayLabel', { n: dayNumber })}</p>
          <p className="app-card-meta">{t('programs.restDay')}</p>
        </div>
      </div>
    );
  }

  if (day.type === 'active_recovery') {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/40 border border-border rounded-xl opacity-70">
        <span className="text-xl">🧘</span>
        <div>
          <p className="app-card-title">{t('programs.dayLabel', { n: dayNumber })}</p>
          <p className="app-card-meta">{t('programs.recoveryDay')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors ${complete ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-card shadow-sm shadow-black/5'} app-card-hover`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{complete ? '✅' : '💪'}</span>
            <div>
              <p className="app-card-title">{t('programs.dayLabel', { n: dayNumber })}</p>
              <p className="app-card-meta">{t('programs.workoutDay')}</p>
            </div>
          </div>
          {complete && (
            <span className="app-chip-label text-emerald-500">{t('programs.completed')}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 mb-3">
          {day.exercises.map(pe => {
            const ex = EXERCISES.find(e => e.id === pe.exerciseId);
            return (
              <button
                key={pe.exerciseId}
                onClick={() => navigate(`/app/exercise/${pe.exerciseId}`)}
                className="flex items-center justify-between text-left hover:bg-muted/50 rounded-lg px-2 py-1.5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{ex?.thumbnailEmoji ?? '🏋️'}</span>
                  <span className="app-card-title font-medium">
                    {ex ? t(ex.nameKey) : pe.exerciseId}
                  </span>
                </div>
                <span className="app-card-meta">
                  {pe.sets}×{pe.reps}
                </span>
              </button>
            );
          })}
        </div>

        {!complete && (
          <>
            {missingExerciseIds.length > 0 && (
              <p className="app-card-meta mb-2">
                {t('programs.missingExercises', {
                  count: missingExerciseIds.length,
                })}
              </p>
            )}
            <button
              disabled={!canComplete || submitting}
              onClick={async () => {
                if (!canComplete || submitting) return;

                if (token) {
                  setSubmitting(true);
                  try {
                    const response = await apiRequest<{ enrollment: ProgramEnrollment }>(
                      `/api/programs/${programId}/days/${day.id}/complete`,
                      {
                        method: 'POST',
                        token,
                      }
                    );
                    setEnrollment(response.enrollment);
                  } catch (error) {
                    console.error('Failed to mark program day complete', error);
                  } finally {
                    setSubmitting(false);
                  }
                } else {
                  markDayComplete(programId, day.id);
                }
              }}
              className={`w-full rounded-xl py-2 text-sm font-semibold transition-colors ${
                canComplete
                  ? 'app-primary-action'
                  : 'cursor-not-allowed bg-muted text-muted-foreground'
              }`}
            >
              {canComplete
                ? submitting
                  ? t('common.loading')
                  : `${t('programs.completed')} ✓`
                : t(disabledReasonKey ?? 'programs.completePrevious')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function WeekAccordion({
  week,
  programId,
  defaultOpen,
  nextWorkoutDayId,
  isEnrolled,
  enrollmentStartedAt,
  sessions,
  isProgramLocked,
}: {
  week: ProgramWeek;
  programId: string;
  defaultOpen: boolean;
  nextWorkoutDayId: string | null;
  isEnrolled: boolean;
  enrollmentStartedAt?: string;
  sessions: ReturnType<typeof useProgressStore.getState>['sessions'];
  isProgramLocked: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);
  const { isDayComplete } = useProgramStore();

  const workoutDays = week.days.filter(d => d.type === 'workout');
  const completedInWeek = workoutDays.filter(d => isDayComplete(programId, d.id)).length;

  return (
    <div className="app-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div>
            <p className="app-card-title">
              {t('programs.weekOf', { current: week.number, total: 4 })}
            </p>
            <p className="app-card-meta">{t(week.themeKey)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="app-card-meta">
            {completedInWeek}/{workoutDays.length}
          </span>
          <ChevronDownIcon
            size={16}
            className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-border bg-background">
          {week.days.map((day, i) => (
            <div key={day.id} className="mt-2">
              {(() => {
                const missingExerciseIds = getMissingExerciseIdsForDay(
                  day,
                  sessions,
                  enrollmentStartedAt
                );
                const exercisesDone = day.type !== 'workout' || missingExerciseIds.length === 0;
                return (
                  <WorkoutDayCard
                    day={day}
                    dayNumber={i + 1}
                    programId={programId}
                    canComplete={
                      !isProgramLocked && isEnrolled && day.id === nextWorkoutDayId && exercisesDone
                    }
                    disabledReasonKey={
                      isProgramLocked
                        ? 'programs.lockedByPreviousProgram'
                        : !isEnrolled
                          ? 'programs.startProgramFirst'
                          : !exercisesDone
                            ? 'programs.completeExercisesFirst'
                            : 'programs.completePrevious'
                    }
                    missingExerciseIds={missingExerciseIds}
                  />
                );
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getEnrollment, getCompletedCount, enroll, setEnrollment, unenroll } = useProgramStore();
  const sessions = useProgressStore(s => s.sessions);
  const token = useAuthStore(s => s.token);

  const program = id ? getProgram(id) : undefined;

  if (!program) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <p className="text-muted-foreground">Program not found.</p>
      </div>
    );
  }

  const programId = program.id;
  const enrollment = getEnrollment(programId);
  const totalWorkoutDays = getWorkoutDays(program).length;
  const completedCount = getCompletedCount(programId);
  const progressPct = totalWorkoutDays > 0 ? (completedCount / totalWorkoutDays) * 100 : 0;
  const workoutDayIds = getWorkoutDays(program).map(day => day.id);
  const completedDayIds = enrollment?.completedDayIds ?? [];
  const nextWorkoutDayId = workoutDayIds.find(dayId => !completedDayIds.includes(dayId)) ?? null;
  const unlocked = isProgramUnlocked(
    programId,
    candidateProgramId => getEnrollment(candidateProgramId)?.completedDayIds ?? []
  );
  const previousProgramId = getRequiredPreviousProgramId(programId);
  const previousProgram = previousProgramId ? getProgram(previousProgramId) : null;

  function handleEnrollToggle() {
    if (!unlocked) return;

    if (enrollment) {
      if (window.confirm(t('programs.unenrollConfirm'))) {
        unenroll(programId);
        if (token) {
          void apiRequest(`/api/programs/${programId}/enroll`, {
            method: 'DELETE',
            token,
          }).catch(error => {
            console.error('Failed to leave program', error);
          });
        }
        navigate('/app/programs');
      }
    } else {
      enroll(programId);
      if (token) {
        void apiRequest<{ enrollment: ProgramEnrollment }>(`/api/programs/${programId}/enroll`, {
          method: 'POST',
          token,
        })
          .then(response => setEnrollment(response.enrollment))
          .catch(error => {
            console.error('Failed to enroll in program', error);
          });
      }
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-8 app-page-flow">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => navigate('/app/programs')}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="app-card-title truncate">{t(program.nameKey)}</h1>
      </div>

      <div className="px-4 max-w-lg mx-auto">
        <div className="pt-6 pb-5">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-5xl leading-none">{program.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="app-detail-title">{t(program.nameKey)}</h2>
                <DifficultyBadge difficulty={program.difficulty} />
              </div>
              <p className="app-body-text">{t(program.descriptionKey)}</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-5">
            <span className="app-card-meta bg-muted px-2.5 py-1 rounded-lg">
              {t('programs.durationWeeks', { n: program.durationWeeks })}
            </span>
            <span className="app-card-meta bg-muted px-2.5 py-1 rounded-lg">
              {t('programs.sessionsPerWeek', { n: program.sessionsPerWeek })}
            </span>
            <span className="app-card-meta bg-muted px-2.5 py-1 rounded-lg">
              {t('programs.minutesPerSession', { n: program.estimatedMinutesPerSession })}
            </span>
          </div>

          <div className="mb-5">
            <p className="app-section-title mb-2">{t('programs.goals')}</p>
            <ul className="flex flex-col gap-1.5">
              {program.goalKeys.map(key => (
                <li key={key} className="flex items-center gap-2 app-card-title font-medium">
                  <span className="text-emerald-500">✓</span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          {enrollment && (
            <div className="mb-5">
              <div className="app-card-meta flex justify-between mb-1.5">
                <span>
                  {t('programs.sessionsDone', { done: completedCount, total: totalWorkoutDays })}
                </span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <ProgressBar value={progressPct} />
            </div>
          )}

          {!unlocked && previousProgram && (
            <p className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
              {t('programs.completePreviousProgram', { name: t(previousProgram.nameKey) })}
            </p>
          )}

          <button
            disabled={!unlocked}
            onClick={handleEnrollToggle}
            className={`w-full py-3 rounded-xl font-semibold transition-colors ${
              !unlocked
                ? 'cursor-not-allowed bg-muted text-muted-foreground'
                : enrollment
                  ? 'bg-muted text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500'
                  : 'app-primary-action'
            }`}
          >
            {!unlocked
              ? t('programs.locked')
              : enrollment
                ? t('programs.leaveProgram')
                : t('programs.startProgram')}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {program.weeks.map((week, i) => (
            <WeekAccordion
              key={week.number}
              week={week}
              programId={program.id}
              defaultOpen={i === 0}
              nextWorkoutDayId={nextWorkoutDayId}
              isEnrolled={Boolean(enrollment)}
              enrollmentStartedAt={enrollment?.startedAt}
              sessions={sessions}
              isProgramLocked={!unlocked}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
