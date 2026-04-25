import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { PROGRAMS } from '@/features/programs/data';
import { useProgramStore } from '@/features/programs/programStore';
import { DIFFICULTY_COLOR } from '@/features/programs/types';
import type { Program, ProgramDifficulty } from '@/features/programs/types';

export function DifficultyBadge({ difficulty }: { difficulty: ProgramDifficulty }) {
  const { t } = useTranslation();
  const colorClass = DIFFICULTY_COLOR[difficulty] ?? 'bg-muted text-muted-foreground';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${colorClass}`}>
      {t(`catalog.difficulty.${difficulty}`)}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-500 rounded-full transition-all"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

function ProgramCard({ program }: { program: Program }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getEnrollment, getCompletedCount, enroll } = useProgramStore();

  const enrollment = getEnrollment(program.id);
  const totalWorkoutDays = program.weeks.reduce(
    (acc, w) => acc + w.days.filter(d => d.type === 'workout').length,
    0
  );
  const completedCount = getCompletedCount(program.id);
  const progressPct = totalWorkoutDays > 0 ? (completedCount / totalWorkoutDays) * 100 : 0;

  function handleAction() {
    if (!enrollment) {
      enroll(program.id);
    }
    navigate(`/app/programs/${program.id}`);
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-4xl leading-none">{program.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-lg font-bold text-foreground">{t(program.nameKey)}</h3>
              <DifficultyBadge difficulty={program.difficulty} />
              {enrollment && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">
                  {t('programs.enrolled')}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {t(program.descriptionKey)}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
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

        {enrollment && (
          <div className="mb-4">
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
          onClick={handleAction}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
            enrollment
              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          {enrollment ? t('programs.continueProgram') : t('programs.startProgram')}
        </button>
      </div>
    </div>
  );
}

export default function Programs() {
  const { t } = useTranslation();

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('programs.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('programs.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-4">
        {PROGRAMS.map(program => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  );
}
