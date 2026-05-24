import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  picture?: string;
  emailVerified?: boolean;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  authModalOpen: boolean;
  setUser: (user: AuthUser) => void;
  setSession: (session: { user: AuthUser; token: string | null }) => void;
  signOut: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      authModalOpen: false,
      setUser: (user: AuthUser) => set({ user }),
      setSession: session => set({ user: session.user, token: session.token }),
      signOut: () => set({ user: null, token: null }),
      openAuthModal: () => set({ authModalOpen: true }),
      closeAuthModal: () => set({ authModalOpen: false }),
    }),
    {
      name: 'auth',
      partialize: state => ({ user: state.user, token: state.token }),
    }
  )
);
