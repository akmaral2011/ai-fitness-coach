import { type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';

import { useThemeSync } from '@/components/ThemeToggle';
import BookIcon from '@/components/icons/BookIcon';
import ChartIcon from '@/components/icons/ChartIcon';
import DumbbellIcon from '@/components/icons/DumbbellIcon';
import HomeIcon from '@/components/icons/HomeIcon';
import ListIcon from '@/components/icons/ListIcon';
import UserIcon from '@/components/icons/UserIcon';
import { useAuthStore } from '@/features/auth/authStore';
import { useLearnStore } from '@/features/learn/learnStore';
import { useWorkoutReminder } from '@/features/notifications/useWorkoutReminder';
import { useAchievementStore } from '@/features/profile/achievementStore';
import { type ProgramEnrollment, useProgramStore } from '@/features/programs/programStore';
import { useProgressStore } from '@/features/progress/progressStore';
import type { CompletedSession } from '@/features/workout/types';
import { apiRequest } from '@/lib/api';

type NavItem = {
  to: string;
  labelKey: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { to: '/app/dashboard', labelKey: 'nav.dashboard', icon: <HomeIcon size={22} /> },
  { to: '/app/catalog', labelKey: 'nav.catalog', icon: <DumbbellIcon size={22} /> },
  { to: '/app/programs', labelKey: 'nav.programs', icon: <ListIcon size={22} /> },
  { to: '/app/learn', labelKey: 'nav.learn', icon: <BookIcon size={22} /> },
  { to: '/app/progress', labelKey: 'nav.progress', icon: <ChartIcon size={22} /> },
  { to: '/app/profile', labelKey: 'nav.profile', icon: <UserIcon size={22} /> },
];

type Props = {
  children: ReactNode;
};

export default function AppLayout({ children }: Props) {
  useThemeSync();
  useWorkoutReminder();
  const { t } = useTranslation();
  const location = useLocation();
  const token = useAuthStore(s => s.token);
  const setSessions = useProgressStore(s => s.setSessions);
  const setEnrollments = useProgramStore(s => s.setEnrollments);
  const setCompletedLessonIds = useLearnStore(s => s.setCompletedIds);
  const setUnlockedAchievementIds = useAchievementStore(s => s.setUnlockedIds);
  useEffect(() => {
    let cancelled = false;

    async function syncProgress() {
      if (!token) return;

      try {
        const [workoutsResponse, enrollmentsResponse, lessonsResponse, achievementsResponse] =
          await Promise.all([
            apiRequest<{ workouts: CompletedSession[] }>('/api/workouts?limit=100', { token }),
            apiRequest<{ enrollments: ProgramEnrollment[] }>('/api/programs/enrollments/me', {
              token,
            }),
            apiRequest<{ completedIds: string[] }>('/api/lessons/progress/me', { token }),
            apiRequest<{ achievements: Array<{ type: string }> }>('/api/achievements/me', {
              token,
            }),
          ]);
        if (!cancelled) {
          setSessions(workoutsResponse.workouts);
          setEnrollments(enrollmentsResponse.enrollments);
          setCompletedLessonIds(lessonsResponse.completedIds);
          setUnlockedAchievementIds(achievementsResponse.achievements.map(item => item.type));
        }
      } catch (error) {
        console.error('Failed to sync app data', error);
      }
    }

    syncProgress();

    return () => {
      cancelled = true;
    };
  }, [setCompletedLessonIds, setEnrollments, setSessions, setUnlockedAchievementIds, token]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main
        key={location.pathname}
        className="flex-1 pb-20 overflow-y-auto animate-in fade-in duration-200"
      >
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="flex items-stretch h-16 max-w-lg mx-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 gap-0.5 transition duration-200 min-w-0 px-0.5 ${
                  isActive ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] leading-none truncate w-full text-center">
                {t(item.labelKey)}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
