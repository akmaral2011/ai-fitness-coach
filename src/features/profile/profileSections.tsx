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
    <div className="app-card mb-6 flex flex-col items-center p-5">
      <UserAvatar
        picture={picture || ''}
        name={name || ''}
        className="w-20 h-20 mb-3"
        textClassName="text-2xl"
      />
      <h2 className="text-lg font-semibold text-foreground">{name ?? '—'}</h2>
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
    <div className="app-card app-card-hover mb-5 p-4">
      <h3 className="app-section-title">{t('profile.editProfile')}</h3>
      <div className="grid grid-cols-2 gap-2">
        <InfoTile label={t('profile.goal')} value={t(`profile.goals.${profile.goal}`)} />
        <InfoTile
          label={t('profile.fitnessLevel')}
          value={t(`profile.levels.${profile.fitnessLevel}`)}
        />
        <InfoTile label={t('profile.height')} value={`${profile.heightCm} cm`} />
        <InfoTile label={t('profile.weight')} value={`${profile.weightKg} kg`} />
        <InfoTile label={t('profile.age')} value={`${profile.ageYears}`} />
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
  const unlockedCount = PROFILE_ACHIEVEMENTS.filter(achievement =>
    unlockedIds.has(achievement.id)
  ).length;

  return (
    <div className="app-card mb-5 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="app-section-title mb-0">{t('profile.achievements')}</h3>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
          {unlockedCount}/{PROFILE_ACHIEVEMENTS.length}
        </span>
      </div>
      {PROFILE_ACHIEVEMENTS.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('profile.noAchievements')}</p>
      ) : (
        <div className="grid gap-2">
          {PROFILE_ACHIEVEMENTS.map(achievement => {
            const unlocked = unlockedIds.has(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                  unlocked ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-border bg-muted/45'
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${
                    unlocked ? 'bg-emerald-500/15' : 'bg-background/70 grayscale'
                  }`}
                >
                  {achievement.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-semibold ${
                      unlocked ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {t(achievement.titleKey)}
                  </p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {t(achievement.descKey)}
                  </p>
                </div>
                {unlocked && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                    ✓
                  </span>
                )}
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
    <div className="app-card mb-5 overflow-visible">
      <h3 className="app-section-title px-4 pt-4">{t('common.settings')}</h3>
      <div className="divide-y divide-border">
        <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">{t('profile.theme')}</span>
          <ThemeToggle />
        </div>

        <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">{t('profile.language')}</span>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/80 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="mt-1 block text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
