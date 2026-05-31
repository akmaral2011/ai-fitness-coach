import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { Award, CheckCircle2, Database, Dumbbell } from 'lucide-react';

import { useAuthStore } from '@/features/auth/authStore';
import { clearSessionData } from '@/features/auth/sessionData';
import { useAchievementStore } from '@/features/profile/achievementStore';
import {
  PROFILE_ACHIEVEMENTS,
  getUnlockedAchievementIds,
} from '@/features/profile/profileAchievements';
import {
  AchievementsCard,
  PreferencesCard,
  ProfileDetailsCard,
  ProfileHeaderCard,
} from '@/features/profile/profileSections';
import { useProfileStore } from '@/features/profile/profileStore';
import { useProgressStore } from '@/features/progress/progressStore';
import { apiRequest } from '@/lib/api';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, token, signOut } = useAuthStore();
  const { profile } = useProfileStore();
  const { getSummary, sessions } = useProgressStore();
  const storedAchievementIds = useAchievementStore(s => s.unlockedIds);
  const addUnlockedId = useAchievementStore(s => s.addUnlockedId);
  const summary = getSummary();

  const maxScore = sessions.length > 0 ? Math.max(...sessions.map(s => s.averageScore)) : 0;
  const computedIds = getUnlockedAchievementIds({
    sessions: summary.totalSessions,
    streak: summary.currentStreak,
    maxScore,
    totalReps: summary.totalReps,
  });
  const unlockedIds = new Set([...storedAchievementIds, ...computedIds]);
  const unlockedCount = unlockedIds.size;

  useEffect(() => {
    computedIds.forEach(id => {
      if (!storedAchievementIds.includes(id)) {
        addUnlockedId(id);
        if (token) {
          void apiRequest('/api/achievements/unlock', {
            method: 'POST',
            token,
            body: JSON.stringify({
              type: id,
              metadata: {
                totalSessions: summary.totalSessions,
                currentStreak: summary.currentStreak,
                maxScore,
                totalReps: summary.totalReps,
              },
            }),
          }).catch(error => {
            console.error('Failed to sync achievement', error);
          });
        }
      }
    });
  }, [
    addUnlockedId,
    computedIds,
    maxScore,
    storedAchievementIds,
    summary.currentStreak,
    summary.totalReps,
    summary.totalSessions,
    token,
  ]);

  function handleSignOut() {
    clearSessionData();
    signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="app-page app-page-flow">
      <h1 className="app-page-title mb-5">{t('profile.title')}</h1>

      <ProfileHeaderCard name={user?.name} email={user?.email} picture={user?.picture} />

      <div className="app-hero-panel mb-5">
        <div className="relative p-4">
          <div className="relative">
            <p className="app-hero-eyebrow">{t('profile.accountStatus')}</p>
            <h2 className="app-hero-title mb-1">
              {token ? t('profile.syncedAccount') : t('profile.localAccount')}
            </h2>
            <p className="app-hero-body mb-4">
              {token ? t('profile.syncedDescription') : t('profile.localDescription')}
            </p>

            <div className="grid grid-cols-2 gap-2">
              <AccountMetric
                icon={<Database size={17} />}
                label={t('profile.sync')}
                value={token ? t('profile.synced') : t('profile.local')}
              />
              <AccountMetric
                icon={<CheckCircle2 size={17} />}
                label={t('profile.profileStatus')}
                value={profile ? t('profile.complete') : t('profile.incomplete')}
              />
              <AccountMetric
                icon={<Dumbbell size={17} />}
                label={t('profile.workouts')}
                value={summary.totalSessions}
              />
              <AccountMetric
                icon={<Award size={17} />}
                label={t('profile.unlocked')}
                value={`${unlockedCount}/${PROFILE_ACHIEVEMENTS.length}`}
              />
            </div>
          </div>
        </div>
      </div>

      <ProfileDetailsCard profile={profile} t={t} />

      <AchievementsCard unlockedIds={unlockedIds} t={t} />

      <PreferencesCard t={t} />

      <button
        onClick={handleSignOut}
        className="app-card app-card-hover w-full py-3.5 font-semibold text-red-500 hover:bg-red-500/10"
      >
        {t('profile.signOut')}
      </button>
    </div>
  );
}

function AccountMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="app-metric-tile">
      <div className="mb-2 text-emerald-500">{icon}</div>
      <p className="app-metric-value">{value}</p>
      <p className="app-metric-label">{label}</p>
    </div>
  );
}
