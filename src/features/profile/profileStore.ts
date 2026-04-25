import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { FitnessProfile } from '@/features/profile/types';

type ProfileDraft = Partial<Omit<FitnessProfile, 'completedAt'>>;
type ProfilePayload = Omit<FitnessProfile, 'completedAt'>;

type ProfileState = {
  profile: FitnessProfile | null;
  onboardingDraft: ProfileDraft;
  isOnboardingComplete: boolean;
  saveDraft: (draft: ProfileDraft) => void;
  resetDraft: () => void;
  completeOnboarding: (profile: ProfilePayload) => void;
  setProfile: (profile: FitnessProfile) => void;
  updateProfile: (updates: Partial<ProfilePayload>) => void;
  clearProfile: () => void;
};

const EmptyDraft: ProfileDraft = {};

function buildProfile(profile: ProfilePayload): FitnessProfile {
  return {
    ...profile,
    completedAt: new Date().toISOString(),
  };
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      onboardingDraft: EmptyDraft,
      isOnboardingComplete: false,
      saveDraft: draft =>
        set(state => ({
          onboardingDraft: {
            ...state.onboardingDraft,
            ...draft,
          },
        })),
      resetDraft: () => set({ onboardingDraft: EmptyDraft }),
      completeOnboarding: profile =>
        set({
          profile: buildProfile(profile),
          onboardingDraft: EmptyDraft,
          isOnboardingComplete: true,
        }),
      setProfile: profile =>
        set({
          profile,
          onboardingDraft: EmptyDraft,
          isOnboardingComplete: true,
        }),
      updateProfile: updates => {
        const currentProfile = get().profile;
        if (!currentProfile) return;

        set({
          profile: {
            ...currentProfile,
            ...updates,
          },
        });
      },
      clearProfile: () =>
        set({
          profile: null,
          onboardingDraft: EmptyDraft,
          isOnboardingComplete: false,
        }),
    }),
    {
      name: 'fitness-profile',
    }
  )
);
