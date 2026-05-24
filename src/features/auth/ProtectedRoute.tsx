import { type ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router';

import { useAuthStore } from '@/features/auth/authStore';
import { useProfileStore } from '@/features/profile/profileStore';
import type { FitnessProfile } from '@/features/profile/types';
import { apiRequest } from '@/lib/api';

type Props = {
  children: ReactNode;
  requireProfile?: boolean;
};

export default function ProtectedRoute({ children, requireProfile = true }: Props) {
  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const isOnboardingComplete = useProfileStore(s => s.isOnboardingComplete);
  const setProfile = useProfileStore(s => s.setProfile);
  const clearProfile = useProfileStore(s => s.clearProfile);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!user || !token) {
        setProfileChecked(true);
        return;
      }

      try {
        const response = await apiRequest<{
          profile: (FitnessProfile & { completedAt: string }) | null;
        }>('/api/profile/me', { token });
        if (cancelled) return;

        if (response.profile) {
          setProfile(response.profile);
        } else {
          clearProfile();
        }
      } catch {
        if (!cancelled) clearProfile();
      } finally {
        if (!cancelled) setProfileChecked(true);
      }
    }

    setProfileChecked(false);
    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [clearProfile, setProfile, token, user]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!profileChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (requireProfile && !isOnboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
