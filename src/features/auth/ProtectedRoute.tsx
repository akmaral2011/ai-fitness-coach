import { type ReactNode } from 'react';
import { Navigate } from 'react-router';

import { useAuthStore } from '@/features/auth/authStore';
import { useProfileStore } from '@/features/profile/profileStore';

type Props = {
  children: ReactNode;
  requireProfile?: boolean;
};

export default function ProtectedRoute({ children, requireProfile = true }: Props) {
  const user = useAuthStore(s => s.user);
  const isOnboardingComplete = useProfileStore(s => s.isOnboardingComplete);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireProfile && !isOnboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
