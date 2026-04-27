import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import UserAvatar from '@/components/UserAvatar';
import { PROFILE_ACHIEVEMENTS } from '@/features/profile/profileAchievements';
import type { FitnessProfile } from '@/features/profile/types';

type TranslationFn = (key: string, opts?: Record<string, string | number>) => string;

export function ProfileHeaderCard({
  name,
  email,
  picture,
}: {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}) {
  return (
    <div className="flex flex-col items-center mb-6 p-5 bg-card border border-border rounded-2xl">
      <UserAvatar
        picture={picture || ''}
        name={name || ''}
        className="w-20 h-20 mb-3"
        textClassName="text-2xl"
      />
      <h2 className="text-lg font-bold text-foreground">{name ?? '—'}</h2>
      <p className="text-sm text-muted-foreground">{email ?? ''}</p>
    </div>
  );
}

export function ProfileDetailsCard({
  profile,
  t,
}: {
  profile: FitnessProfile | null;
  t: TranslationFn;
}) {
  if (!profile) return null;

  return (
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
  );
}

export function AchievementsCard({
  unlockedIds,
  t,
}: {
  unlockedIds: Set<string>;
  t: TranslationFn;
}) {
  return (
    <div className="mb-5 p-4 bg-card border border-border rounded-2xl">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {t('profile.achievements')}
      </h3>
      {PROFILE_ACHIEVEMENTS.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('profile.noAchievements')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {PROFILE_ACHIEVEMENTS.map(achievement => {
            const unlocked = unlockedIds.has(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  unlocked
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : 'bg-muted opacity-40'
                }`}
              >
                <span className="text-2xl">{achievement.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{t(achievement.titleKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(achievement.descKey)}</p>
                </div>
                {unlocked && <span className="ml-auto text-emerald-500">✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PreferencesCard({ t }: { t: TranslationFn }) {
  return (
    <>
      <div className="mb-5 p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{t('profile.theme')}</span>
        <ThemeToggle />
      </div>

      <div className="mb-5 p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{t('profile.language')}</span>
        <LanguageSwitcher />
      </div>
    </>
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
