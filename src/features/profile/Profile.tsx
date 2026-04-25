import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuthStore } from '@/features/auth/authStore';
import { useProfileStore } from '@/features/profile/profileStore';
import { useProgressStore } from '@/features/progress/progressStore';

type Achievement = {
  id: string;
  titleKey: string;
  descKey: string;
  emoji: string;
  check: (sessions: number, streak: number, maxScore: number, totalReps: number) => boolean;
};

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_workout',
    titleKey: 'profile.achievementList.first_workout',
    descKey: 'profile.achievementList.first_workout_desc',
    emoji: '🎯',
    check: sessions => sessions >= 1,
  },
  {
    id: 'streak_3',
    titleKey: 'profile.achievementList.streak_3',
    descKey: 'profile.achievementList.streak_3_desc',
    emoji: '🔥',
    check: (_sessions, streak) => streak >= 3,
  },
  {
    id: 'streak_7',
    titleKey: 'profile.achievementList.streak_7',
    descKey: 'profile.achievementList.streak_7_desc',
    emoji: '⚡',
    check: (_sessions, streak) => streak >= 7,
  },
  {
    id: 'perfect_score',
    titleKey: 'profile.achievementList.perfect_score',
    descKey: 'profile.achievementList.perfect_score_desc',
    emoji: '💎',
    check: (_sessions, _streak, maxScore) => maxScore >= 100,
  },
  {
    id: 'hundred_reps',
    titleKey: 'profile.achievementList.hundred_reps',
    descKey: 'profile.achievementList.hundred_reps_desc',
    emoji: '💪',
    check: (_sessions, _streak, _score, totalReps) => totalReps >= 100,
  },
];

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { profile } = useProfileStore();
  const { getSummary, sessions } = useProgressStore();
  const summary = getSummary();

  const maxScore = sessions.length > 0 ? Math.max(...sessions.map(s => s.averageScore)) : 0;
  const unlockedIds = new Set(
    ACHIEVEMENTS.filter(a =>
      a.check(summary.totalSessions, summary.currentStreak, maxScore, summary.totalReps)
    ).map(a => a.id)
  );

  function handleSignOut() {
    signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-5">{t('profile.title')}</h1>

      <div className="flex flex-col items-center mb-6 p-5 bg-card border border-border rounded-2xl">
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name ?? ''}
            width={80}
            height={80}
            loading="lazy"
            className="w-20 h-20 rounded-full mb-3 object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
            <span className="text-3xl">👤</span>
          </div>
        )}
        <h2 className="text-lg font-bold text-foreground">{user?.name ?? '—'}</h2>
        <p className="text-sm text-muted-foreground">{user?.email ?? ''}</p>
      </div>

      {profile && (
        <div className="mb-5 p-4 bg-card border border-border rounded-2xl">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {t('profile.editProfile')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label={t('profile.goal')} value={t(`profile.goals.${profile.goal}`)} />
            <InfoRow
              label={t('profile.fitnessLevel')}
              value={t(`profile.levels.${profile.fitnessLevel}`)}
            />
            <InfoRow label={t('profile.height')} value={`${profile.heightCm} cm`} />
            <InfoRow label={t('profile.weight')} value={`${profile.weightKg} kg`} />
            <InfoRow label={t('profile.age')} value={`${profile.ageYears}`} />
          </div>
        </div>
      )}

      <div className="mb-5 p-4 bg-card border border-border rounded-2xl">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {t('profile.achievements')}
        </h3>
        {ACHIEVEMENTS.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('profile.noAchievements')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {ACHIEVEMENTS.map(a => {
              const unlocked = unlockedIds.has(a.id);
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    unlocked
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'bg-muted opacity-40'
                  }`}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t(a.titleKey)}</p>
                    <p className="text-xs text-muted-foreground">{t(a.descKey)}</p>
                  </div>
                  {unlocked && <span className="ml-auto text-emerald-500">✓</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mb-5 p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Theme</span>
        <ThemeToggle />
      </div>

      <div className="mb-5 p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Language</span>
        <LanguageSwitcher />
      </div>

      <button
        onClick={handleSignOut}
        className="w-full py-3.5 border border-red-500/40 text-red-500 rounded-2xl font-semibold hover:bg-red-500/10 transition-colors"
      >
        {t('profile.signOut')}
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
