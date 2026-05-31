import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useQuery } from '@tanstack/react-query';
import { Activity, Medal, Star, Trophy, Users } from 'lucide-react';

import UserAvatar from '@/components/UserAvatar';
import { useAuthStore } from '@/features/auth/authStore';
import { useProgressStore } from '@/features/progress/progressStore';
import { apiRequest } from '@/lib/api';
import { formatDuration } from '@/lib/utils';

type LeaderboardEntry = {
  userId: string;
  rank: number;
  name: string;
  pictureUrl?: string | null;
  totalXP: number;
  level: number;
  totalSessions: number;
  totalReps: number;
  totalWorkoutSeconds: number;
  averageScore: number;
  currentStreak: number;
  lastWorkoutAt: string | null;
  isCurrentUser: boolean;
};

type LeaderboardResponse = {
  leaderboard: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
  totalCompetitors: number;
};

function RankBadge({ rank }: { rank: number }) {
  const colors =
    rank === 1
      ? 'bg-yellow-500/15 text-yellow-500'
      : rank === 2
        ? 'bg-slate-400/15 text-slate-400'
        : rank === 3
          ? 'bg-orange-500/15 text-orange-500'
          : 'bg-muted text-muted-foreground';

  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black ${colors}`}
    >
      {rank <= 3 ? <Medal size={18} /> : rank}
    </span>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="app-metric-tile">
      <div className="mb-2 text-emerald-500">{icon}</div>
      <p className="app-metric-value">{value}</p>
      <p className="app-metric-label">{label}</p>
    </div>
  );
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const { t } = useTranslation();

  return (
    <div
      className={`app-card app-card-hover flex items-center gap-3 p-3 ${
        entry.isCurrentUser ? 'border-emerald-500/50 bg-emerald-500/5' : ''
      }`}
    >
      <RankBadge rank={entry.rank} />
      <UserAvatar
        picture={entry.pictureUrl ?? undefined}
        name={entry.name}
        className="h-10 w-10"
        textClassName="text-sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="app-card-title truncate">{entry.name}</p>
          {entry.isCurrentUser && (
            <span className="app-chip-label rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-500">
              {t('leaderboard.you')}
            </span>
          )}
        </div>
        <p className="app-card-meta mt-0.5 truncate">
          {t('leaderboard.rowMeta', {
            level: entry.level,
            sessions: entry.totalSessions,
            score: entry.averageScore,
          })}
        </p>
      </div>
      <div className="text-right">
        <p className="app-card-title text-right">{entry.totalXP}</p>
        <p className="app-card-meta text-[10px] uppercase">{t('leaderboard.xp')}</p>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const { t } = useTranslation();
  const token = useAuthStore(s => s.token);
  const user = useAuthStore(s => s.user);
  const sessions = useProgressStore(s => s.sessions);
  const getXPData = useProgressStore(s => s.getXPData);
  const getSummary = useProgressStore(s => s.getSummary);

  const fallbackCurrentUser = useMemo<LeaderboardEntry | null>(() => {
    if (!user || sessions.length === 0) return null;

    const xp = getXPData();
    const summary = getSummary();

    return {
      userId: user.id,
      rank: 1,
      name: user.name,
      pictureUrl: user.picture,
      totalXP: xp.totalXP,
      level: xp.level,
      totalSessions: summary.totalSessions,
      totalReps: summary.totalReps,
      totalWorkoutSeconds: summary.totalWorkoutSeconds,
      averageScore: summary.averageScore,
      currentStreak: summary.currentStreak,
      lastWorkoutAt: sessions[0]?.date ?? null,
      isCurrentUser: true,
    };
  }, [getSummary, getXPData, sessions, user]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => apiRequest<LeaderboardResponse>('/api/progress/leaderboard', { token }),
    enabled: Boolean(token),
  });

  const entries = data?.leaderboard ?? (fallbackCurrentUser ? [fallbackCurrentUser] : []);
  const currentUser = data?.currentUser ?? fallbackCurrentUser;
  const totalCompetitors = data?.totalCompetitors ?? entries.length;
  const topThree = entries.slice(0, 3);

  return (
    <div className="app-page app-page-flow">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="app-hero-eyebrow">{t('leaderboard.eyebrow')}</p>
          <h1 className="app-page-title">{t('leaderboard.title')}</h1>
        </div>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
          <Trophy size={22} />
        </span>
      </div>

      <div className="app-hero-panel mb-6">
        <div className="relative p-4">
          <div className="relative">
            <h2 className="app-hero-title mb-1">
              {currentUser
                ? t('leaderboard.heroRank', { rank: currentUser.rank })
                : t('leaderboard.heroEmpty')}
            </h2>
            <p className="app-hero-body mb-4">
              {currentUser ? t('leaderboard.heroActive') : t('leaderboard.heroInactive')}
            </p>

            <div className="grid grid-cols-3 gap-2">
              <Metric
                icon={<Star size={17} />}
                label={t('leaderboard.metrics.xp')}
                value={currentUser?.totalXP ?? 0}
              />
              <Metric
                icon={<Activity size={17} />}
                label={t('leaderboard.metrics.score')}
                value={`${currentUser?.averageScore ?? 0}%`}
              />
              <Metric
                icon={<Users size={17} />}
                label={t('leaderboard.metrics.players')}
                value={totalCompetitors}
              />
            </div>
          </div>
        </div>
      </div>

      {topThree.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-2">
          {topThree.map(entry => (
            <div key={entry.userId} className="app-card flex flex-col items-center p-3 text-center">
              <RankBadge rank={entry.rank} />
              <UserAvatar
                picture={entry.pictureUrl ?? undefined}
                name={entry.name}
                className="my-2 h-11 w-11"
                textClassName="text-sm"
              />
              <p className="app-card-title w-full truncate">{entry.name}</p>
              <p className="app-card-meta mt-0.5">{entry.totalXP} XP</p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="app-section-title mb-0">{t('leaderboard.rankings')}</h2>
        {currentUser?.lastWorkoutAt && (
          <span className="app-card-meta">
            {formatDuration(currentUser.totalWorkoutSeconds, t)}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="app-card-meta py-12 text-center">{t('common.loading')}</div>
      ) : entries.length > 0 ? (
        <div className="grid gap-2">
          {entries.map(entry => (
            <LeaderboardRow key={entry.userId} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="app-card p-5 text-center">
          <p className="app-card-title">{t('leaderboard.emptyTitle')}</p>
          <p className="app-hero-body mt-1">
            {isError ? t('leaderboard.error') : t('leaderboard.emptyDescription')}
          </p>
        </div>
      )}
    </div>
  );
}
