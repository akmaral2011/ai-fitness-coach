import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';

import OnboardingTour, { useTourDone } from '@/components/OnboardingTour';
import { useThemeSync } from '@/components/ThemeToggle';
import BookIcon from '@/components/icons/BookIcon';
import ChartIcon from '@/components/icons/ChartIcon';
import DumbbellIcon from '@/components/icons/DumbbellIcon';
import HomeIcon from '@/components/icons/HomeIcon';
import ListIcon from '@/components/icons/ListIcon';
import UserIcon from '@/components/icons/UserIcon';
import { useWorkoutReminder } from '@/features/notifications/useWorkoutReminder';

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
  const [tourVisible, setTourVisible] = useState(!useTourDone());

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main
        key={location.pathname}
        className="flex-1 pb-20 overflow-y-auto animate-in fade-in duration-200"
      >
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-stretch h-16 max-w-lg mx-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 gap-0.5 text-xs transition-colors ${
                  isActive ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {item.icon}
              <span className="leading-none">{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {tourVisible && <OnboardingTour onDone={() => setTourVisible(false)} />}
    </div>
  );
}
