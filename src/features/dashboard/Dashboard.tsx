import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  Activity,
  BookOpen,
  Brain,
  CheckCircle2,
  Dumbbell,
  ListChecks,
  Trophy,
} from 'lucide-react';

import UserAvatar from '@/components/UserAvatar';
import { useAuthStore } from '@/features/auth/authStore';
import { EXERCISES } from '@/features/exercises/data';
import { LESSONS } from '@/features/learn/data';
import { useLearnStore } from '@/features/learn/learnStore';
import { PROGRAMS } from '@/features/programs/data';
import { useProgramStore } from '@/features/programs/programStore';
import { useProgressStore } from '@/features/progress/progressStore';
import { formatDuration } from '@/lib/utils';

function StatCard({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: string | number;
  delay?: number;
}) {
  return (
    <div
      className="app-card app-card-hover flex flex-col items-center justify-center gap-1 p-4 animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="app-metric-value text-xl">{value}</span>
      <span className="app-metric-label text-center">{label}</span>
    </div>
  );
}

function ActionButton({
  title,
  subtitle,
  icon,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="app-card app-card-hover flex items-center gap-3 p-3 text-left"
    >
      <span className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="app-card-title block truncate">{title}</span>
        <span className="app-card-meta block truncate">{subtitle}</span>
      </span>
    </button>
  );
}

function CoachMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="app-metric-tile">
      <div className="mb-2 text-emerald-500">{icon}</div>
      <p className="app-metric-value">{value}</p>
      <p className="app-metric-label">{label}</p>
    </div>
  );
}

function isThisWeek(date: string) {
  const now = new Date();
  const sessionDate = new Date(date);
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return sessionDate >= startOfWeek && sessionDate <= now;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { getSummary, getXPData, getRecentSessions } = useProgressStore();
  const allSessions = useProgressStore(s => s.sessions);
  const token = useAuthStore(s => s.token);

  const summary = getSummary();
  const xp = getXPData();
  const recent = getRecentSessions(5);
  const weeklySessions = allSessions.filter(session => isThisWeek(session.date));
  const bestScore = allSessions.reduce(
    (best, session) => Math.max(best, session.averageScore),
    summary.averageScore
  );
  const { getEnrollment, getCompletedCount } = useProgramStore();
  const completedLessonIds = useLearnStore(s => s.completedIds);
  const enrolledPrograms = PROGRAMS.filter(p => getEnrollment(p.id));

  const firstName = user?.name?.split(' ')[0] ?? null;
  const greeting = firstName
    ? t('dashboard.greeting', { name: firstName })
    : t('dashboard.greetingDefault');

  const quickStart = EXERCISES.slice(0, 4);
  const nextLesson = LESSONS.find(lesson => !completedLessonIds.includes(lesson.id)) ?? LESSONS[0];

  const primaryExercise = recent[0]
    ? (EXERCISES.find(exercise => exercise.id === recent[0].exerciseId) ?? EXERCISES[0])
    : EXERCISES[0];
  const coachMessage =
    summary.totalSessions === 0
      ? t('dashboard.coach.empty')
      : summary.averageScore >= 85
        ? t('dashboard.coach.strong')
        : t('dashboard.coach.improve');

  return (
    <div className="app-page app-page-flow">
      <div className="flex items-center gap-3 mb-6">
        <UserAvatar
          picture={user?.picture}
          name={user?.name}
          className="w-10 h-10"
          textClassName="text-sm"
        />
        <div>
          <h1 className="app-page-title">{greeting}</h1>
        </div>
      </div>

      <div className="app-hero-panel mb-5">
        <div className="relative p-4">
          <div className="relative">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="app-hero-eyebrow">{t('dashboard.coach.title')}</p>
                <h2 className="app-hero-title">{t(primaryExercise.nameKey)}</h2>
                <p className="app-hero-body mt-1">{coachMessage}</p>
              </div>
              <span
                className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  token ? 'bg-emerald-500/15 text-emerald-500' : 'bg-yellow-500/15 text-yellow-500'
                }`}
              >
                <CheckCircle2 size={13} />
                {token ? t('dashboard.coach.synced') : t('dashboard.coach.local')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <CoachMetric
                icon={<Activity size={17} />}
                label={t('dashboard.coach.thisWeek')}
                value={weeklySessions.length}
              />
              <CoachMetric
                icon={<Trophy size={17} />}
                label={t('dashboard.coach.bestScore')}
                value={`${bestScore}%`}
              />
              <CoachMetric
                icon={<Brain size={17} />}
                label={t('dashboard.coach.aiRules')}
                value="22"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="app-card mb-5 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="app-card-title">{t('dashboard.level', { level: xp.level })}</span>
          <span className="app-card-meta">
            {xp.xpInCurrentLevel} / {xp.xpPerLevel} XP
          </span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div className="app-progress-fill" style={{ width: `${xp.progressPercent}%` }} />
        </div>
        <p className="app-card-meta mt-1.5">
          {t('dashboard.xpToNext', { xp: xp.xpPerLevel - xp.xpInCurrentLevel, next: xp.level + 1 })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label={t('dashboard.streak')} value={`${summary.currentStreak} 🔥`} delay={0} />
        <StatCard label={t('dashboard.totalWorkouts')} value={summary.totalSessions} delay={60} />
        <StatCard label={t('dashboard.avgScore')} value={`${summary.averageScore}%`} delay={120} />
        <StatCard label={t('dashboard.totalReps')} value={summary.totalReps} delay={180} />
      </div>

      <div className="mb-6">
        <h2 className="app-section-title">{t('dashboard.nextSteps')}</h2>
        <div className="grid gap-2">
          <ActionButton
            title={
              summary.totalSessions === 0
                ? t('dashboard.actions.firstWorkout')
                : t('dashboard.actions.trainAgain')
            }
            subtitle={t(primaryExercise.nameKey)}
            icon={<Dumbbell className="w-4 h-4" />}
            onClick={() => navigate(`/app/exercise/${primaryExercise.id}`)}
          />
          <ActionButton
            title={
              enrolledPrograms.length > 0
                ? t('dashboard.actions.continueProgram')
                : t('dashboard.actions.chooseProgram')
            }
            subtitle={enrolledPrograms[0] ? t(enrolledPrograms[0].nameKey) : t('programs.title')}
            icon={<ListChecks className="w-4 h-4" />}
            onClick={() =>
              navigate(
                enrolledPrograms[0] ? `/app/programs/${enrolledPrograms[0].id}` : '/app/programs'
              )
            }
          />
          <ActionButton
            title={t('dashboard.actions.learnTechnique')}
            subtitle={nextLesson ? t(nextLesson.titleKey) : t('learn.title')}
            icon={<BookOpen className="w-4 h-4" />}
            onClick={() => navigate(nextLesson ? `/app/learn/${nextLesson.id}` : '/app/learn')}
          />
        </div>
      </div>

      {enrolledPrograms.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="app-section-title mb-0">{t('programs.title')}</h2>
            <button
              onClick={() => navigate('/app/programs')}
              className="text-xs font-semibold text-emerald-500"
            >
              {t('programs.allPrograms')}
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {enrolledPrograms.map(p => {
              const totalWorkoutDays = p.weeks.reduce(
                (acc, w) => acc + w.days.filter(d => d.type === 'workout').length,
                0
              );
              const done = getCompletedCount(p.id);
              const pct = totalWorkoutDays > 0 ? Math.round((done / totalWorkoutDays) * 100) : 0;
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(`/app/programs/${p.id}`)}
                  className="app-card app-card-hover flex items-center gap-3 p-3 text-left"
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="app-card-title truncate">{t(p.nameKey)}</p>
                    <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="app-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="app-card-meta shrink-0">{pct}%</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="app-section-title">{t('dashboard.quickStart')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickStart.map(ex => (
            <button
              key={ex.id}
              onClick={() => navigate(`/app/exercise/${ex.id}`)}
              className="app-card app-card-hover flex flex-col items-start gap-2 p-4 text-left"
            >
              <span className="text-3xl">{ex.thumbnailEmoji}</span>
              <span className="app-card-title">{t(ex.nameKey)}</span>
              <span className="app-card-meta">
                {ex.sets} × {ex.reps} {t('catalog.detail.reps')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <h2 className="app-section-title">{t('dashboard.recentActivity')}</h2>
          <div className="flex flex-col gap-2">
            {recent.map(session => {
              const ex = EXERCISES.find(e => e.id === session.exerciseId);
              return (
                <div key={session.id} className="app-card flex items-center gap-3 p-3">
                  <span className="text-2xl">{ex?.thumbnailEmoji ?? '🏋️'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="app-card-title truncate">
                      {ex ? t(ex.nameKey) : session.exerciseId}
                    </p>
                    <p className="app-card-meta">
                      {session.repCount} {t('dashboard.reps')} ·{' '}
                      {formatDuration(session.durationSeconds, t)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="app-card-title text-emerald-500">{session.averageScore}%</p>
                    <p className="app-card-meta">{t('dashboard.score')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recent.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🏋️</p>
          <p className="text-muted-foreground">{t('dashboard.noActivity')}</p>
          <button
            onClick={() => navigate('/app/catalog')}
            className="app-primary-action mt-4 px-6 py-2.5"
          >
            {t('dashboard.startWorkout')}
          </button>
        </div>
      )}
    </div>
  );
}
