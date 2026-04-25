import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import ChevronDownIcon from '@/components/icons/ChevronDownIcon';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import { EXERCISES } from '@/features/exercises/data';
import { DifficultyBadge, ProgressBar } from '@/features/programs/Programs';
import { getProgram } from '@/features/programs/data';
import { useProgramStore } from '@/features/programs/programStore';
import type { ProgramDay, ProgramWeek } from '@/features/programs/types';

function WorkoutDayCard({
  day,
  dayNumber,
  programId,
}: {
  day: ProgramDay;
  dayNumber: number;
  programId: string;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDayComplete, markDayComplete } = useProgramStore();
  const complete = isDayComplete(programId, day.id);

  if (day.type === 'rest') {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/40 border border-border rounded-xl opacity-60">
        <span className="text-xl">😴</span>
        <div>
          <p className="text-sm font-medium text-foreground">
            {t('programs.dayLabel', { n: dayNumber })}
          </p>
          <p className="text-xs text-muted-foreground">{t('programs.restDay')}</p>
        </div>
      </div>
    );
  }

  if (day.type === 'active_recovery') {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/40 border border-border rounded-xl opacity-70">
        <span className="text-xl">🧘</span>
        <div>
          <p className="text-sm font-medium text-foreground">
            {t('programs.dayLabel', { n: dayNumber })}
          </p>
          <p className="text-xs text-muted-foreground">{t('programs.recoveryDay')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-colors ${complete ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-card'}`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{complete ? '✅' : '💪'}</span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {t('programs.dayLabel', { n: dayNumber })}
              </p>
              <p className="text-xs text-muted-foreground">{t('programs.workoutDay')}</p>
            </div>
          </div>
          {complete && (
            <span className="text-xs font-medium text-emerald-500">{t('programs.completed')}</span>
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
                  <span className="text-sm text-foreground">
                    {ex ? t(ex.nameKey) : pe.exerciseId}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {pe.sets}×{pe.reps}
                </span>
              </button>
            );
          })}
        </div>

        {!complete && (
          <button
            onClick={() => markDayComplete(programId, day.id)}
            className="w-full py-2 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
          >
            {t('programs.completed')} ✓
          </button>
        )}
      </div>
    </div>
  );
}

function WeekAccordion({
  week,
  programId,
  defaultOpen,
}: {
  week: ProgramWeek;
  programId: string;
  defaultOpen: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);
  const { isDayComplete } = useProgramStore();

  const workoutDays = week.days.filter(d => d.type === 'workout');
  const completedInWeek = workoutDays.filter(d => isDayComplete(programId, d.id)).length;

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t('programs.weekOf', { current: week.number, total: 4 })}
            </p>
            <p className="text-xs text-muted-foreground">{t(week.themeKey)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
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
              <WorkoutDayCard day={day} dayNumber={i + 1} programId={programId} />
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
  const { getEnrollment, getCompletedCount, enroll, unenroll } = useProgramStore();

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
  const totalWorkoutDays = program.weeks.reduce(
    (acc, w) => acc + w.days.filter(d => d.type === 'workout').length,
    0
  );
  const completedCount = getCompletedCount(programId);
  const progressPct = totalWorkoutDays > 0 ? (completedCount / totalWorkoutDays) * 100 : 0;

  function handleEnrollToggle() {
    if (enrollment) {
      if (window.confirm(t('programs.unenrollConfirm'))) {
        unenroll(programId);
        navigate('/app/programs');
      }
    } else {
      enroll(programId);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-8">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => navigate('/app/programs')}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="font-semibold text-foreground truncate">{t(program.nameKey)}</h1>
      </div>

      <div className="px-4 max-w-lg mx-auto">
        <div className="pt-6 pb-5">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-5xl leading-none">{program.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-foreground">{t(program.nameKey)}</h2>
                <DifficultyBadge difficulty={program.difficulty} />
              </div>
              <p className="text-sm text-muted-foreground">{t(program.descriptionKey)}</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-5">
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
              {t('programs.durationWeeks', { n: program.durationWeeks })}
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
              {t('programs.sessionsPerWeek', { n: program.sessionsPerWeek })}
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
              {t('programs.minutesPerSession', { n: program.estimatedMinutesPerSession })}
            </span>
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {t('programs.goals')}
            </p>
            <ul className="flex flex-col gap-1.5">
              {program.goalKeys.map(key => (
                <li key={key} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="text-emerald-500">✓</span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          {enrollment && (
            <div className="mb-5">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>
                  {t('programs.sessionsDone', { done: completedCount, total: totalWorkoutDays })}
                </span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <ProgressBar value={progressPct} />
            </div>
          )}

          <button
            onClick={handleEnrollToggle}
            className={`w-full py-3 rounded-xl font-semibold transition-colors ${
              enrollment
                ? 'bg-muted text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            {enrollment ? t('programs.leaveProgram') : t('programs.startProgram')}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {program.weeks.map((week, i) => (
            <WeekAccordion
              key={week.number}
              week={week}
              programId={program.id}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
