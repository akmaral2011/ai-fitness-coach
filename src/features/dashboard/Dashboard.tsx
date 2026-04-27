import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import UserAvatar from '@/components/UserAvatar';
import { useAuthStore } from '@/features/auth/authStore';
import { EXERCISES } from '@/features/exercises/data';
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
      className="flex flex-col items-center justify-center bg-card border border-border rounded-2xl p-4 gap-1 animate-in fade-in slide-in-from-bottom-3 duration-300 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const { getSummary, getRecentSessions } = useProgressStore();

  const summary = getSummary();
  const recent = getRecentSessions(5);
  const { getEnrollment, getCompletedCount } = useProgramStore();
  const enrolledPrograms = PROGRAMS.filter(p => getEnrollment(p.id));

  const firstName = user?.name?.split(' ')[0] ?? null;
  const greeting = firstName
    ? t('dashboard.greeting', { name: firstName })
    : t('dashboard.greetingDefault');

  const quickStart = EXERCISES.slice(0, 4);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <UserAvatar
          picture={user?.picture}
          name={user?.name}
          className="w-10 h-10"
          textClassName="text-sm"
        />
        <div>
          <h1 className="text-xl font-bold text-foreground">{greeting}</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label={t('dashboard.streak')} value={`${summary.currentStreak} 🔥`} delay={0} />
        <StatCard label={t('dashboard.totalWorkouts')} value={summary.totalSessions} delay={60} />
        <StatCard label={t('dashboard.avgScore')} value={`${summary.averageScore}%`} delay={120} />
        <StatCard label={t('dashboard.totalReps')} value={summary.totalReps} delay={180} />
      </div>

      {enrolledPrograms.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {t('programs.title')}
            </h2>
            <button
              onClick={() => navigate('/app/programs')}
              className="text-xs text-emerald-500 font-medium"
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
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl text-left hover:border-emerald-500/50 transition-colors"
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t(p.nameKey)}</p>
                    <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t('dashboard.quickStart')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {quickStart.map(ex => (
            <button
              key={ex.id}
              onClick={() => navigate(`/app/exercise/${ex.id}`)}
              className="flex flex-col items-start gap-2 p-4 bg-card border border-border rounded-2xl hover:border-emerald-500/60 transition-colors text-left"
            >
              <span className="text-3xl">{ex.thumbnailEmoji}</span>
              <span className="text-sm font-medium text-foreground">{t(ex.nameKey)}</span>
              <span className="text-xs text-muted-foreground">
                {ex.sets} × {ex.reps} {t('catalog.detail.reps')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t('dashboard.recentActivity')}
          </h2>
          <div className="flex flex-col gap-2">
            {recent.map(session => {
              const ex = EXERCISES.find(e => e.id === session.exerciseId);
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
                >
                  <span className="text-2xl">{ex?.thumbnailEmoji ?? '🏋️'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {ex ? t(ex.nameKey) : session.exerciseId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.repCount} {t('dashboard.reps')} ·{' '}
                      {formatDuration(session.durationSeconds, t)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-500">{session.averageScore}%</p>
                    <p className="text-xs text-muted-foreground">{t('dashboard.score')}</p>
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
            className="mt-4 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
          >
            {t('dashboard.startWorkout')}
          </button>
        </div>
      )}
    </div>
  );
}
