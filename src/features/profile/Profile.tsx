import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { useAuthStore } from '@/features/auth/authStore';
import { PROFILE_ACHIEVEMENTS } from '@/features/profile/profileAchievements';
import {
  AchievementsCard,
  PreferencesCard,
  ProfileDetailsCard,
  ProfileHeaderCard,
} from '@/features/profile/profileSections';
import { useProfileStore } from '@/features/profile/profileStore';
import { useProgressStore } from '@/features/progress/progressStore';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { profile } = useProfileStore();
  const { getSummary, sessions } = useProgressStore();
  const summary = getSummary();

  const maxScore = sessions.length > 0 ? Math.max(...sessions.map(s => s.averageScore)) : 0;
  const unlockedIds = new Set(
    PROFILE_ACHIEVEMENTS.filter(achievement =>
      achievement.check(summary.totalSessions, summary.currentStreak, maxScore, summary.totalReps)
    ).map(achievement => achievement.id)
  );

  function handleSignOut() {
    signOut();
    navigate('/', { replace: true });
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-5">{t('profile.title')}</h1>

      <ProfileHeaderCard name={user?.name} email={user?.email} picture={user?.picture} />

      <ProfileDetailsCard profile={profile} t={t} />

      <AchievementsCard unlockedIds={unlockedIds} t={t} />

      <PreferencesCard t={t} />

      <button
        onClick={handleSignOut}
        className="w-full py-3.5 border border-red-500/40 text-red-500 rounded-2xl font-semibold hover:bg-red-500/10 transition-colors"
      >
        {t('profile.signOut')}
      </button>
    </div>
  );
}
